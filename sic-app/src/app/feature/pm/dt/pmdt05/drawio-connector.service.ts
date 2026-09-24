// src/app/core/component/sic-drawio/drawio-connector.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

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

  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();

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

  insertMermaid(mermaidScript: string, pageName?: string): void {
    const msg = {
      action: 'mermaid',
      mermaid: mermaidScript,
      title: pageName || 'AI Generated Diagram',
    };
    if (!this.drawioReady) {
      console.warn('[Draw.io] Cannot insert Mermaid, Draw.io not ready; queuing...');
      this.pendingMessages.push(msg);
      return;
    }
    this.postMessage(msg);
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
    if (!event.origin.includes('diagrams.net')) return;

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

    if (data.event === 'export' && data.xml) {
      console.log('[Draw.io] XML export received');
      this.xmlSubject.next(data.xml);
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
    console.log('[Draw.io] Service reset');
  }
}