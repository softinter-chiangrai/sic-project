// src/app/core/component/sic-drawio/drawio-connector.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DrawioConnectorService {
  private iframe: HTMLIFrameElement | null = null;
  private pendingMessages: any[] = [];
  private drawioReady = false;

  private isReadySubject = new BehaviorSubject<boolean>(false);
  isReady$ = this.isReadySubject.asObservable();

  private xmlSubject = new Subject<string>();
  xml$ = this.xmlSubject.asObservable();

  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();

  init(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
    this.drawioReady = false;
    this.isReadySubject.next(false);
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
      console.log('[Draw.io] SEND:', data);
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
        console.log('[Draw.io] SEND QUEUE:', msg);
      } catch (e) {
        console.error('[Draw.io] flushQueue error:', e);
      }
    }
  }

  loadXml(xml?: string, force = false): void {
    if (!xml || xml.trim() === '') {
      xml = this.getEmptyDiagramXml();
    }
    this.postMessage({ action: 'load', xml, autosave: false }, force);
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

  // ✅ ใช้ action: 'mermaid' เพื่อแทรก Mermaid เป็น Page ใหม่
  insertMermaid(mermaidScript: string, pageName?: string): void {
    if (!this.drawioReady) {
      console.warn('[Draw.io] Cannot insert Mermaid, Draw.io not ready');
      this.pendingMessages.push({
        action: 'mermaid',
        mermaid: mermaidScript,
        title: pageName || 'AI Generated Diagram'
      });
      return;
    }
    this.postMessage({
      action: 'mermaid',
      mermaid: mermaidScript,
      title: pageName || 'AI Generated Diagram'
    });
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

    console.log('[Draw.io] EVENT:', data);

    if (data.event === 'configure') {
      const reply = { action: 'configure', config: { defaultFonts: [], defaultLibraries: true } };
      try {
        event.source?.postMessage(JSON.stringify(reply), { targetOrigin: event.origin });
        console.log('[Draw.io] SEND CONFIGURE RESPONSE (ok)');
      } catch (e) {
        console.error('[Draw.io] Configure response error:', e);
      }
      return;
    }

    if (data.event === 'init' || data.event === 'ready') {
      console.log('[Draw.io] READY received');
      this.drawioReady = true;
      this.isReadySubject.next(true);
      this.flushQueue();
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
    this.xmlSubject = new Subject<string>();
    this.errorSubject = new Subject<string>();
    console.log('[Draw.io] Service reset');
  }
}