import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
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
    console.log('[Draw.io] iframe initialized');
  }

  /**
   * ส่งข้อความไปยัง iframe
   * force = true เพื่อข้ามการ queue (ใช้สำหรับ init/load ตอนเริ่มต้น)
   */
  postMessage(data: any, force = false): void {
    if (!this.iframe?.contentWindow) {
      console.warn('[Draw.io] No contentWindow, message queued:', data);
      this.pendingMessages.push(data);
      return;
    }

    if (!this.drawioReady && !force) {
      console.log('[Draw.io] Not ready, queued:', data);
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

  /**
   * ส่งคิว messages ที่ค้างอยู่
   */
  private flushQueue(): void {
    if (!this.drawioReady) {
      return;
    }

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

  /**
   * โหลด XML ลงใน Draw.io
   * @param xml - XML string (ถ้าไม่ระบุจะโหลด empty diagram)
   * @param force - ส่งทันทีโดยไม่รอ ready (ใช้สำหรับ init)
   */
  loadXml(xml?: string, force = false): void {
    if (!xml) {
      xml = `<mxfile>
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

    this.postMessage({
      action: 'load',
      xml: xml,
      autosave: false
    }, force);
  }

  /**
   * โหลด Mermaid (ยังไม่รองรับ)
   */
  loadMermaid(mermaid: string): void {
    console.warn('[Draw.io] Mermaid conversion not implemented yet.');
    this.errorSubject.next('Mermaid conversion not supported');
  }

  /**
   * ขอ XML ปัจจุบันจาก Draw.io
   */
  requestXml(): void {
    if (!this.drawioReady) {
      console.warn('[Draw.io] Cannot request XML, Draw.io not ready');
      this.errorSubject.next('Draw.io not ready to export');
      return;
    }
    this.postMessage({
      action: 'export',
      format: 'xml'
    });
  }

  /**
   * จัดการข้อความจาก Draw.io
   */
  handleMessage(event: MessageEvent): void {
    // ตรวจสอบว่าเป็น messages จาก diagrams.net หรือไม่
    if (!event.origin.includes('diagrams.net')) {
      return;
    }

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

    // ---------------------------
    // 1) configure
    // ---------------------------
    if (data.event === 'configure') {
      // ส่ง config ที่สมบูรณ์ยิ่งขึ้น
      const configPayload = {
        action: 'configure',
        config: {
          defaultLibraries: true,
          autosave: false,
          ui: 'dark',
          customLibraries: []
        }
      };
      try {
        this.iframe?.contentWindow?.postMessage(JSON.stringify(configPayload), '*');
        console.log('[Draw.io] SEND CONFIGURE (updated)');
      } catch (e) {
        console.error('[Draw.io] Configure error:', e);
      }
      return;
    }

    // ---------------------------
    // 2) init
    // ---------------------------
    if (data.event === 'init') {
      console.log('[Draw.io] INIT received, loading initial page');
      this.loadXml(undefined, true);
      return;
    }

    // ---------------------------
    // 3) ready
    // ---------------------------
    if (data.event === 'ready') {
      console.log('[Draw.io] READY');
      this.drawioReady = true;
      this.isReadySubject.next(true);
      this.flushQueue();
      return;
    }

    // ---------------------------
    // 4) export (xml)
    // ---------------------------
    if (data.event === 'export' && data.xml) {
      console.log('[Draw.io] XML export received');
      this.xmlSubject.next(data.xml);
      return;
    }

    // ---------------------------
    // 5) error / other events
    // ---------------------------
    if (data.event === 'error') {
      console.error('[Draw.io] Error event:', data);
      this.errorSubject.next(data.message || 'Unknown Draw.io error');
    }
  }

  /**
   * รีเซ็ตสถานะ (ใช้เมื่อ reload iframe หรือ logout)
   */
  reset(): void {
    this.drawioReady = false;
    this.isReadySubject.next(false);
    this.pendingMessages = [];
    this.xmlSubject = new Subject<string>();
    this.errorSubject = new Subject<string>();
    console.log('[Draw.io] Service reset');
  }
}