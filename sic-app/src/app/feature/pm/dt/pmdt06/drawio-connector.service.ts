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

  init(iframe: HTMLIFrameElement): void {

    this.iframe = iframe;

    this.drawioReady = false;

    this.isReadySubject.next(false);

    console.log('Draw.io iframe initialized');

  }

  /**
   * ส่งข้อความ
   * ปรับเพิ่ม parameter force เพื่อให้สามารถสั่งส่งข้อความออกไปได้ทันทีในจังหวะ init
   */
  postMessage(data: any, force = false): void {

    if (!this.iframe?.contentWindow || (!this.drawioReady && !force)) {

      console.log('QUEUE:', data);

      this.pendingMessages.push(data);

      return;

    }

    this.iframe.contentWindow.postMessage(
      JSON.stringify(data),
      '*'
    );

    console.log('SEND:', data);

  }

  /**
   * ส่ง Queue
   */
  private flushQueue(): void {

    if (!this.drawioReady) {
      return;
    }

    while (this.pendingMessages.length > 0) {

      const msg = this.pendingMessages.shift();

      this.iframe?.contentWindow?.postMessage(
        JSON.stringify(msg),
        '*'
      );

      console.log('SEND QUEUE:', msg);

    }

  }

  /**
   * โหลด XML
   * ปรับเพิ่ม parameter force เพื่อส่งต่อไปยัง postMessage
   */
  loadXml(xml?: string, force = false): void {

    if (!xml) {

      xml = `
<mxfile>
<diagram id="page1" name="Page-1">
<mxGraphModel>
<root>
<mxCell id="0"/>
<mxCell id="1" parent="0"/>
</root>
</mxGraphModel>
</diagram>
</mxfile>
`;

    }

    this.postMessage({

      action: 'load',

      xml,

      autosave: false

    }, force);

  }

  loadMermaid(mermaid: string): void {

    console.warn(
      'Convert Mermaid -> XML first'
    );

  }

  requestXml(): void {

    this.postMessage({

      action: 'export',

      format: 'xml'

    });

  }

  handleMessage(event: MessageEvent): void {

    if (!event.origin.includes('diagrams.net')) {
      return;
    }

    let data: any;

    try {

      if (typeof event.data === 'string') {

        if (event.data === 'ready') {

          data = {
            event: 'ready'
          };

        } else {

          data = JSON.parse(event.data);

        }

      } else {

        data = event.data;

      }

    } catch {

      return;

    }

    console.log('DRAWIO EVENT:', data);

    /**
     * configure
     */
    if (data.event === 'configure') {

      this.iframe?.contentWindow?.postMessage(

        JSON.stringify({

          action: 'configure',

          config: {

            defaultLibraries: true

          }

        }),

        '*'

      );

      console.log('SEND CONFIGURE');

      return;

    }

    /**
     * init
     * แก้ไขจุดนี้: สั่ง loadXml แบบ force เพื่อเจาะทะลุ Queue ไปสั่งให้ Draw.io เปิดหน้ากระดาษ
     */
    if (data.event === 'init') {

      console.log('DRAWIO INIT -> LOADING INITIAL PAGE');

      this.loadXml(undefined, true);

      return;

    }

    /**
     * ready
     */
    if (data.event === 'ready') {

      console.log('DRAWIO READY');

      this.drawioReady = true;

      this.isReadySubject.next(true);

      this.flushQueue();

      return;

    }

    /**
     * export
     */
    if (

      data.event === 'export' &&

      data.xml

    ) {

      this.xmlSubject.next(data.xml);

    }

  }

}