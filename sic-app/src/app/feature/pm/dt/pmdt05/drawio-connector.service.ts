// src/app/core/component/sic-drawio/drawio-connector.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';

/** ผลจากปลั๊กอิน sicMermaid ใน draw.io (docker/drawio/sicMermaid.js) */
export interface MermaidInsertResult {
  stage: 'inserted' | 'parsed' | 'error';
  id?: string;
  xml?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DrawioConnectorService {
  private iframe: HTMLIFrameElement | null = null;
  private pendingMessages: any[] = [];
  private drawioReady = false;
  private lastLoadedXml: string | null = null;

  private isReadySubject = new BehaviorSubject<boolean>(false);
  isReady$ = this.isReadySubject.asObservable();

  private xmlSubject = new Subject<string>();
  xml$ = this.xmlSubject.asObservable();

  /** PNG (data URI) ที่ draw.io export จากแผนภาพที่เปิดอยู่ */
  private pngSubject = new Subject<string>();
  png$ = this.pngSubject.asObservable();

  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();

  private mermaidSubject = new Subject<MermaidInsertResult>();
  mermaid$ = this.mermaidSubject.asObservable();

  /** draw.io โหลดแผนภาพ (action load) เสร็จแล้ว */
  private loadedSubject = new Subject<void>();
  loaded$ = this.loadedSubject.asObservable();

  private readonly drawioOrigin = new URL(environment.drawioUrl).origin;

  init(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
    this.pendingMessages = [];
  }

  postMessage(data: any, force = false): void {
    if (!this.iframe?.contentWindow) {
      this.pendingMessages.push(data);
      return;
    }
    if (!this.drawioReady && !force) {
      this.pendingMessages.push(data);
      return;
    }
    try {
      this.iframe.contentWindow.postMessage(JSON.stringify(data), '*');
      console.log('[Draw.io] SEND:', data.action || data);
    } catch (e) {
      console.error('[Draw.io] postMessage error:', e);
      this.errorSubject.next('Failed to send message to Draw.io');
    }
  }

  private flushQueue(): void {
    if (!this.drawioReady) return;
    while (this.pendingMessages.length > 0) {
      const msg = this.pendingMessages.shift();
      try {
        this.iframe?.contentWindow?.postMessage(JSON.stringify(msg), '*');
        console.log('[Draw.io] SEND QUEUE:', msg.action || msg);
      } catch (e) {
        console.error('[Draw.io] flushQueue error:', e);
      }
    }
  }

  loadXml(xml?: string, force = false): void {
    if (!xml || xml.trim() === '') {
      xml = this.getEmptyDiagramXml();
    }
    this.lastLoadedXml = xml;
    const msg = { action: 'load', xml, autosave: 1 };

    if (!this.drawioReady && !force) {
      console.log('[Draw.io] Not ready yet, queuing loadXml...');
      this.pendingMessages = this.pendingMessages.filter((m) => m.action !== 'load');
      this.pendingMessages.push(msg);
      return;
    }

    this.postMessage(msg, true);
  }

  getEmptyDiagramXml(): string {
    return `<mxfile>
<diagram id="page1" name="Page-1">
<mxGraphModel>
<root>
<mxCell id="0"/>
<mxCell id="1" parent="0"/>
</root>
</mxGraphModel>
</diagram>
</mxfile>`;
  }

  requestXml(): void {
    if (!this.drawioReady) {
      console.warn('[Draw.io] Cannot request XML, Draw.io not ready');
      this.errorSubject.next('Draw.io not ready to export');
      return;
    }
    this.postMessage({ action: 'export', format: 'xml' });
  }

  requestPng(scale = 2): void {
    this.postMessage({ action: 'export', format: 'png', scale, border: 10, background: '#ffffff' });
  }

  /**
   * ให้ draw.io แปลง Mermaid ด้วยตัวแปลงของมันเอง (ผ่านปลั๊กอิน sicMermaid) ผลมาทาง mermaid$
   * replace = แทนที่แผนภาพที่เปิดอยู่ (stage 'inserted'), merge = คืน XML (stage 'parsed') ให้ผู้เรียกไป mergeXml เอง
   */
  insertMermaid(mermaidScript: string, mode: 'replace' | 'merge' = 'replace'): void {
    this.postMessage({ sicAction: 'mermaid', mermaid: mermaidScript, mode });
  }

  /** เติมเนื้อหา XML เข้าแผนภาพที่เปิดอยู่ด้วยคำสั่ง merge (คำสั่งมาตรฐานของ draw.io embed) โดยไม่ลบของเดิม */
  mergeXml(xml: string): void {
    const msg = { action: 'merge', xml };
    if (!this.drawioReady) {
      this.pendingMessages.push(msg);
      return;
    }
    this.postMessage(msg);
  }

  handleMessage(event: MessageEvent): void {
    if (event.origin !== this.drawioOrigin) return;

    let data: any;
    try {
      if (typeof event.data === 'string') {
        if (event.data === 'ready') {
          data = { event: 'ready' };
        } else {
          data = JSON.parse(event.data);
        }
      } else {
        data = event.data;
      }
    } catch (e) {
      console.warn('[Draw.io] Failed to parse message:', event.data);
      return;
    }

    console.log('[Draw.io] EVENT:', data.event || data);

    if (data.event === 'configure') {
      const reply = {
        action: 'configure',
        config: {
          defaultFonts: [],
          defaultLibraries: true,
          autosave: true,
        },
      };
      try {
        (event.source as Window)?.postMessage(JSON.stringify(reply), '*');
        console.log('[Draw.io] SEND CONFIGURE RESPONSE (ok) with autosave: true');
      } catch (e) {
        console.error('[Draw.io] Configure response error:', e);
      }
      return;
    }

    if (data.event === 'init' || data.event === 'ready') {
      console.log('[Draw.io] READY/INIT received');
      this.drawioReady = true;
      this.isReadySubject.next(true);

      // Flush queue or send last loaded XML / empty diagram
      if (this.pendingMessages.length > 0) {
        this.flushQueue();
      } else if (this.lastLoadedXml) {
        this.postMessage({ action: 'load', xml: this.lastLoadedXml, autosave: 1 }, true);
      }
      return;
    }

    if (data.event === 'save') {
      console.log('[Draw.io] SAVE event received – requesting XML for auto‑save...');
      this.requestXml();
      return;
    }

    if (data.event === 'export' && data.format === 'png' && data.data) {
      this.pngSubject.next(data.data);
      return;
    }

    if (data.event === 'export' && data.xml) {
      console.log('[Draw.io] XML export received');
      this.xmlSubject.next(data.xml);
      return;
    }

    if (data.event === 'load') {
      this.loadedSubject.next();
      return;
    }

    if (data.event === 'sicMermaid') {
      this.mermaidSubject.next(data);
      return;
    }

    if (data.event === 'error') {
      console.error('[Draw.io] Error event:', data);
      this.errorSubject.next(data.message || 'Unknown Draw.io error');
    }
  }

  reset(): void {
    this.drawioReady = false;
    this.isReadySubject.next(false);
    this.pendingMessages = [];
    this.lastLoadedXml = null;
    this.xmlSubject = new Subject<string>();
    this.errorSubject = new Subject<string>();
    this.mermaidSubject = new Subject<MermaidInsertResult>();
    this.loadedSubject = new Subject<void>();
    console.log('[Draw.io] Service reset');
  }
}