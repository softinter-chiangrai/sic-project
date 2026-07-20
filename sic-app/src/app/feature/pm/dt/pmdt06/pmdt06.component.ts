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
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { DiagramService } from './diagram.service';
import { DrawioConnectorService } from './drawio-connector.service';
import { pmdt06AComponent } from './pmdt06A/pmdt06A.component';
import { DialogService } from '../../../../core/services/dialog.service';
import { SqlExportDialogComponent } from './sql-export-dialog.component';

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
  private router = inject(Router);
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

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

  // ✅ ป้องกันการเรียก loadExistingDiagram ซ้ำ
  private isLoadingDiagram = false;

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

      // ✅ ถ้าไม่มี projectId → เปลี่ยนเส้นทางไปเลือกโปรเจกต์
      if (!this.projectId) {
        console.warn('No projectId provided, redirecting to project selection');
        this.router.navigate(['/projects']); // ปรับ path ตามโครงสร้างของคุณ
        return;
      }

      // มี projectId
      this.loadProjectName();

      if (!this.currentTabId) {
        // โหลดรายการ tabs
        this.diagramService.getTabs(this.projectId).subscribe({
          next: (tabs) => {
            if (tabs && tabs.length > 0) {
              this.currentTabId = tabs[0].id;
              if (this.drawioReady) {
                this.loadExistingDiagram();
              }
            } else {
              // ✅ ไม่มี diagram → ปิด loading และโหลดแผนภาพเปล่า
              this.isLoading = false;
              this.drawioService.loadXml(''); // โหลด empty diagram
            }
          },
          error: () => {
            this.isLoading = false;
            this.drawioService.loadXml(''); // กรณี error ก็โหลดเปล่า
          },
        });
      } else {
        // มี currentTabId จาก URL
        if (this.drawioReady) {
          this.loadExistingDiagram();
        }
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
      // ✅ เก็บ Mermaid ไว้ใน pending และเปิด Dialog ให้ผู้ใช้กด Import
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
   * ผู้ใช้กดปุ่ม Import → ดึง XML ปัจจุบัน, เพิ่มหน้าใหม่, บันทึกฐานข้อมูล
   */
  importMermaid(): void {
    if (!this.pendingMermaid) return;

    const { script, name, type } = this.pendingMermaid;

    // ✅ ขั้นตอนที่ 1: ดึง XML ปัจจุบันจาก Draw.io (ถ้ามี)
    this.isLoading = true;
    this.drawioService.requestXml();

    this.drawioService.xml$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (currentXml) => {
          // ✅ ขั้นตอนที่ 2: สร้าง XML สำหรับหน้าใหม่
          const newPageXml = this.createMermaidPageXml(script, name || 'AI Diagram');

          // ✅ ขั้นตอนที่ 3: รวม XML (เพิ่มหน้าใหม่ต่อท้าย)
          const mergedXml = this.appendDiagramPage(currentXml, newPageXml);

          // ✅ ขั้นตอนที่ 4: โหลด XML ที่รวมแล้วกลับเข้าไป
          this.drawioService.postMessage({ action: 'load', xml: mergedXml, autosave: false });

          // ✅ ขั้นตอนที่ 5: บันทึก Mermaid script ลงฐานข้อมูล
          this.applyMermaidScript(script, name, type);

          this.isLoading = false;
          this.showImportDialog.set(false);
          this.pendingMermaid = null;
          alert('✅ นำเข้าไดอะแกรมสำเร็จ (เพิ่มเป็นหน้าใหม่)');
        },
        error: (err) => {
          console.error('Failed to get current XML:', err);
          this.isLoading = false;
          // ถ้าดึง XML ไม่ได้ ให้โหลดเป็นหน้าใหม่เลย (ไม่ต้องรวม)
          const newPageXml = this.createMermaidPageXml(script, name || 'AI Diagram');
          const fallbackXml = `<mxfile>${newPageXml}</mxfile>`;
          this.drawioService.postMessage({ action: 'load', xml: fallbackXml, autosave: false });
          this.applyMermaidScript(script, name, type);
          this.showImportDialog.set(false);
          this.pendingMermaid = null;
          alert('⚠️ ไม่สามารถดึงหน้าปัจจุบันได้ แต่ได้สร้างหน้าใหม่แทน');
        }
      });
  }

  /**
   * สร้าง XML สำหรับ Mermaid Page ใหม่ (เฉพาะ <diagram>)
   */
  private createMermaidPageXml(script: string, pageName: string): string {
    const escaped = script
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return `
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
    `;
  }

  /**
   * รวม XML เดิม + หน้าใหม่ (แทรกก่อน </mxfile>)
   */
  private appendDiagramPage(existingXml: string, newPageXml: string): string {
    const closingTag = '</mxfile>';
    const index = existingXml.lastIndexOf(closingTag);
    if (index === -1) {
      // ถ้าไม่มี </mxfile> ให้สร้างใหม่
      return `<mxfile>${newPageXml}</mxfile>`;
    }
    return existingXml.slice(0, index) + newPageXml + closingTag;
  }

  /**
   * ผู้ใช้กด Cancel → ปิด Dialog โดยไม่ทำอะไร
   */
  cancelImport(): void {
    this.showImportDialog.set(false);
    this.pendingMermaid = null;
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
        console.log('✅ Mermaid script saved successfully.');
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
    if (!this.currentTabId || this.isLoadingDiagram) return;
    this.isLoadingDiagram = true;
    this.isLoading = true;

    this.diagramService.getDiagram(this.currentTabId).subscribe({
      next: (diagram) => {
        if (this.projectId && diagram.projectId !== this.projectId) {
          alert('❌ ไดอะแกรมนี้ไม่ใช่ของโปรเจกต์ที่เลือก');
          this.isLoading = false;
          this.isLoadingDiagram = false;
          this.drawioService.loadXml('');
          return;
        }
        this.currentDiagram = diagram;
        const xml = diagram.graphData?.xml || '';
        this.drawioService.loadXml(xml);
        this.isLoading = false;
        this.isLoadingDiagram = false;
      },
      error: () => {
        this.isLoading = false;
        this.isLoadingDiagram = false;
        this.drawioService.loadXml('');
      },
    });
  }

  /**
   * บันทึก XML ปัจจุบันจาก Draw.io ลงฐานข้อมูล
   * ถ้ายังไม่มี currentTabId ให้สร้างแท็บใหม่ก่อน
   */
  saveDiagram(): void {
    // ถ้าไม่มี currentTabId แต่มี projectId ให้สร้างแท็บใหม่ก่อน
    if (!this.currentTabId && this.projectId) {
      // สร้างแท็บใหม่ด้วยชื่อเริ่มต้น
      this.diagramService.createTab(this.projectId, 'New Diagram', 'Flowchart', '').subscribe({
        next: (newTab) => {
          this.currentTabId = newTab.id;
          this.currentDiagram = newTab;
          // หลังจากสร้างแล้ว ให้บันทึกต่อ
          this.saveDiagramInternal();
        },
        error: (err) => {
          alert('❌ ไม่สามารถสร้างแท็บใหม่ได้');
          console.error(err);
        }
      });
      return;
    }

    if (!this.currentTabId) {
      alert('❌ ไม่มี Diagram ID ให้บันทึก');
      return;
    }

    this.saveDiagramInternal();
  }

  /**
   * บันทึก Diagram หลังจากมั่นใจว่ามี currentTabId แล้ว
   */
  private saveDiagramInternal(): void {
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

  // ============================================================
  // ✅ NEW: Generate SQL from ER Diagram
  // ============================================================
 generateSql(): void {
  if (!this.currentTabId) {
    this.dialogService.warn('No Diagram', 'Please open a diagram first.');
    return;
  }

  this.isLoading = true;
  this.drawioService.requestXml();

  this.drawioService.xml$
    .pipe(take(1), takeUntil(this.destroy$))
    .subscribe({
      next: (xml) => {
        this.isLoading = false;
        if (!xml || xml.trim().length === 0) {
          this.dialogService.warn('Empty Diagram', 'The diagram is empty. Please draw an ER diagram first.');
          return;
        }

        // เปิด Dialog พร้อมส่ง xml
        this.dialogService.open({
          type: 'confirm',
          component: SqlExportDialogComponent,
          componentInputs: {
            xml: xml,  // ส่ง xml ไปให้ dialog
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.dialogService.error('Error', 'Failed to get diagram XML.');
      }
    });
}

  private showSqlDialog(sql: string): void {
    // แต่เพื่อความรวดเร็ว ขอใช้ alert และให้ดาวน์โหลดไฟล์
    const confirmResult = confirm('SQL generated successfully. Click OK to download .sql file, Cancel to view in console.');
    if (confirmResult) {
      this.downloadSqlFile(sql);
    } else {
      console.log('Generated SQL:\n', sql);
      this.dialogService.info('SQL Generated', 'Check the browser console for the SQL script.');
    }
  }

  private downloadSqlFile(sql: string): void {
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema_${new Date().toISOString().slice(0,10)}.sql`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}