// src/app/feature/pm/dt/pmdt06/pmdt06.component.ts

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DiagramService } from './diagram.service';
import { DrawioConnectorService } from './drawio-connector.service';
import { pmdt06AComponent } from './pmdt06A/pmdt06A.component';

@Component({
  selector: 'app-pmdt06',
  standalone: true,
  imports: [CommonModule, FormsModule, pmdt06AComponent],
  templateUrl: './pmdt06.component.html',
  styleUrls: ['./pmdt06.component.css'],
})
export class Pmdt06Component implements AfterViewInit, OnDestroy {
  @ViewChild('drawioIframe') iframe!: ElementRef<HTMLIFrameElement>;

  private destroy$ = new Subject<void>();
  private drawioService = inject(DrawioConnectorService);
  private diagramService = inject(DiagramService);
  private route = inject(ActivatedRoute);

  isLoading = false;
  currentTabId: string | null = null;
  projectId: string | null = null;
  drawioReady = false;
  projectName = '';

  chatOpen = signal(false);
  unreadCount = 0;
  currentDiagram: any = null;

  // ✅ State สำหรับ Import Dialog
  showImportDialog = signal(false);
  pendingMermaid: { script: string; name?: string; type?: string } | null = null;

  ngAfterViewInit(): void {
    this.drawioService.init(this.iframe.nativeElement);

    this.drawioService.isReady$.pipe(takeUntil(this.destroy$)).subscribe((ready) => {
      this.drawioReady = ready;
      console.log('Draw.io ready status:', ready);
      if (ready && this.currentTabId) {
        this.loadExistingDiagram();
      }
    });

    // fallback 7 วินาที
    setTimeout(() => {
      if (!this.drawioReady) {
        console.warn('[Draw.io] Fallback: force ready after 7s');
        this.drawioReady = true;
        if (this.currentTabId) {
          this.loadExistingDiagram();
        }
      }
    }, 7000);

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.currentTabId = params['tabId'] || params['diagramId'] || null;
      this.projectId = params['projectId'] || null;
      if (this.projectId) {
        this.loadProjectName();
        if (!this.currentTabId) {
          this.diagramService.getTabs(this.projectId).subscribe({
            next: (tabs) => {
              if (tabs && tabs.length > 0) {
                this.currentTabId = tabs[0].id;
                if (this.drawioReady) this.loadExistingDiagram();
              }
            },
          });
        }
      }
      if (this.currentTabId && this.drawioReady) {
        this.loadExistingDiagram();
      }
    });
  }

  loadProjectName(): void {
    if (!this.projectId) return;
    this.diagramService.getProjectName(this.projectId).subscribe({
      next: (name) => (this.projectName = name),
      error: () => (this.projectName = 'Unknown Project'),
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    this.drawioService.handleMessage(event);
  }

  toggleChat(): void {
    this.chatOpen.update((v) => !v);
    if (this.chatOpen()) this.unreadCount = 0;
  }

  /**
   * รับ Event จาก Child Component (pmdt06A)
   * เมื่อ AI สร้าง Mermaid script แล้วจะส่ง action 'update' พร้อม script, name, type
   */
  handleAiResponse(response: { action: string; script?: string; name?: string; type?: string }): void {
    console.log('AI Response from chat:', response);

    if (response.action === 'update' && response.script) {
      // ✅ แทนที่จะทำงานทันที ให้เก็บไว้และเปิด Dialog ให้ผู้ใช้กด Import
      this.pendingMermaid = {
        script: response.script,
        name: response.name || 'AI Generated Diagram',
        type: response.type || 'Flowchart',
      };
      this.showImportDialog.set(true);
    }
    // ถ้า action เป็น 'message' จะไม่ทำอะไร (แค่แสดงข้อความใน Chat)
  }

  /**
   * ผู้ใช้กดปุ่ม Import → โหลด Mermaid ลง Draw.io และบันทึกฐานข้อมูล
   */
  importMermaid(): void {
    if (!this.pendingMermaid) return;

    const { script, name, type } = this.pendingMermaid;

    // 1. โหลด Mermaid ลงใน Draw.io (เป็น Text Box)
    this.loadMermaidAsDrawioPage(script, name || 'AI Diagram');

    // 2. อัปเดตฐานข้อมูล (บันทึก Mermaid script ลงใน currentTab)
    this.applyMermaidScript(script, name, type);

    // 3. ปิด Dialog และล้าง pending
    this.showImportDialog.set(false);
    this.pendingMermaid = null;
  }

  /**
   * ผู้ใช้กด Cancel → ปิด Dialog โดยไม่ทำอะไร
   */
  cancelImport(): void {
    this.showImportDialog.set(false);
    this.pendingMermaid = null;
  }

  /**
   * สร้าง XML ที่แสดง Mermaid script เป็นข้อความแบบ Preformatted
   * แล้วส่งให้ Draw.io โหลด (แทนที่หน้าจอปัจจุบัน)
   */
  private loadMermaidAsDrawioPage(mermaidScript: string, pageName: string): void {
    // Escape ข้อความเพื่อป้องกัน XML พัง
    const escaped = mermaidScript
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    // สร้าง XML ที่มีกล่องข้อความขนาดใหญ่ แสดงโค้ด Mermaid
    const mermaidXml = `
      <mxfile>
        <diagram id="ai_mermaid_${Date.now()}" name="${pageName}">
          <mxGraphModel>
            <root>
              <mxCell id="0"/>
              <mxCell id="1" parent="0"/>
              <mxCell id="mermaid_code" 
                value="&lt;pre style=&quot;font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 13px;&quot;&gt;${escaped}&lt;/pre&gt;" 
                style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8f9fa;strokeColor=#1a73e8;fontFamily=monospace;fontSize=13;align=left;verticalAlign=top;" 
                vertex="1" parent="1">
                <mxGeometry x="40" y="40" width="800" height="600" as="geometry"/>
              </mxCell>
            </root>
          </mxGraphModel>
        </diagram>
      </mxfile>
    `.trim();

    // ตรวจสอบว่า Draw.io พร้อมแล้วหรือยัง ถ้ายังให้รอ
    if (!this.drawioReady) {
      console.warn('Draw.io not ready, will retry...');
      const checkReady = setInterval(() => {
        if (this.drawioReady) {
          clearInterval(checkReady);
          this.drawioService.postMessage({ action: 'load', xml: mermaidXml, autosave: false });
        }
      }, 500);
      return;
    }

    // ส่ง XML ไปให้ Draw.io โหลด
    this.drawioService.postMessage({ action: 'load', xml: mermaidXml, autosave: false });
  }

  /**
   * บันทึก Mermaid script ลงในฐานข้อมูล (เฉพาะ currentTab)
   */
  private applyMermaidScript(script: string, name?: string, type?: string): void {
    if (!this.currentTabId) {
      console.warn('No tab ID to update');
      return;
    }

    this.isLoading = true;
    const updatedTab = {
      ...this.currentDiagram,
      id: this.currentTabId,
      name: name || this.currentDiagram?.name || 'AI Diagram',
      diagramType: type || this.currentDiagram?.diagramType || 'Flowchart',
      mermaidScript: script,
      projectId: this.projectId || this.currentDiagram?.projectId,
      graphData: null, // ไม่ต้องเปลี่ยน XML (เรายังเก็บ Mermaid ไว้ต่างหาก)
    };

    this.diagramService.updateTab(updatedTab).subscribe({
      next: (res) => {
        this.currentDiagram = res;
        this.isLoading = false;
        console.log('Mermaid script saved successfully.');
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.isLoading = false;
        alert('❌ ไม่สามารถบันทึก Mermaid script ได้ กรุณาลองอีกครั้ง');
      },
    });
  }

  /**
   * โหลด Diagram จากฐานข้อมูล (XML) มาแสดงใน Draw.io
   */
  loadExistingDiagram(): void {
    if (!this.currentTabId) return;
    this.isLoading = true;
    this.diagramService.getDiagram(this.currentTabId).subscribe({
      next: (diagram) => {
        if (this.projectId && diagram.projectId !== this.projectId) {
          alert('❌ ไดอะแกรมนี้ไม่ใช่ของโปรเจกต์ที่เลือก');
          this.isLoading = false;
          this.drawioService.loadXml('');
          return;
        }
        this.currentDiagram = diagram;
        const xml = diagram.graphData?.xml || '';
        this.drawioService.loadXml(xml);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.drawioService.loadXml('');
      },
    });
  }

  /**
   * บันทึก XML ปัจจุบันจาก Draw.io ลงฐานข้อมูล
   */
  saveDiagram(): void {
    if (!this.currentTabId) {
      alert('❌ ไม่มี Diagram ID ให้บันทึก');
      return;
    }

    this.drawioService.requestXml();

    this.drawioService.xml$.pipe(takeUntil(this.destroy$)).subscribe((xml) => {
      if (xml && this.currentTabId) {
        const name = this.currentDiagram?.name || 'Drawio Diagram';
        const diagramType = this.currentDiagram?.diagramType || 'Flowchart';
        const projectId = this.currentDiagram?.projectId || this.projectId;

        if (!projectId) {
          alert('❌ ขาด Project ID ไม่สามารถบันทึกได้');
          return;
        }

        const updatedTab = {
          ...this.currentDiagram,
          id: this.currentTabId,
          name,
          diagramType,
          projectId,
          graphData: { xml },
          mermaidScript: this.currentDiagram?.mermaidScript || null,
        };

        this.diagramService.updateTab(updatedTab as any).subscribe({
          next: (res) => {
            this.currentDiagram = res;
            alert('✅ บันทึกสำเร็จ!');
          },
          error: (err) => {
            console.error('Save failed:', err);
            alert('❌ บันทึกไม่สำเร็จ!');
          },
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}