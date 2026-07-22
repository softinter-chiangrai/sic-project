// src/app/feature/pm/dt/pmdt06/pmdt06.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
import { Subject, take, takeUntil } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { DiagramService } from './diagram.service';
import { DrawioConnectorService } from './drawio-connector.service';
import { pmdt06AComponent } from './pmdt06A/pmdt06A.component';
import { SqlExportDialogComponent } from './sql-export-dialog.component';
import type { DiagramModel } from './diagram.model';

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

  // ===== State =====
  isLoading = false;
  currentTabId: string | null = null;
  projectId: string | null = null;
  drawioReady = false;
  projectName = '';
  chatOpen = signal(false);
  unreadCount = 0;
  currentDiagram: DiagramModel | null = null;

  // ===== Tabs =====
  tabs = signal<DiagramModel[]>([]);
  isLoadingTabs = false;

  // ===== Import Dialog =====
  showImportDialog = signal(false);
  pendingMermaid: { script: string; name?: string; type?: string } | null = null;

  private isLoadingDiagram = false;

  // ===== Lifecycle =====
  ngAfterViewInit(): void {
    this.drawioService.init(this.iframe.nativeElement);

    this.drawioService.isReady$.pipe(takeUntil(this.destroy$)).subscribe((ready) => {
      this.drawioReady = ready;
      console.log('Draw.io ready status:', ready);
      if (ready && this.currentTabId) {
        this.loadExistingDiagram();
      }
    });

    // Fallback 7 วินาที
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

      if (!this.projectId) {
        console.warn('No projectId provided, redirecting to project selection');
        this.router.navigate(['/projects']);
        return;
      }

      this.loadProjectName();

      // ✅ โหลด Tabs ทั้งหมด
      this.loadTabs();

      // ✅ ถ้ามี currentTabId และ Draw.io พร้อม → โหลด diagram
      if (this.currentTabId && this.drawioReady) {
        this.loadExistingDiagram();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Tabs Management =====
  loadTabs(): void {
    if (!this.projectId) return;
    this.isLoadingTabs = true;

    this.diagramService.getTabs(this.projectId).subscribe({
      next: (tabs) => {
        this.tabs.set(tabs);
        this.isLoadingTabs = false;

        // ถ้าไม่มี currentTabId → เลือก Tab แรก
        if (!this.currentTabId && tabs.length > 0) {
          this.currentTabId = tabs[0].id;
          if (this.drawioReady) {
            this.loadExistingDiagram();
          }
        }

        // ถ้าไม่มี Tab เลย → สร้าง DFD เริ่มต้น?
        if (tabs.length === 0) {
          this.createDefaultTab();
        }
      },
      error: () => {
        this.isLoadingTabs = false;
        this.tabs.set([]);
      },
    });
  }

  createDefaultTab(): void {
    if (!this.projectId) return;
    this.diagramService
      .createTab(this.projectId, 'DFD - Main', 'DFD', 'graph TD\n  A[Start] --> B[Process]\n  B --> C[End]')
      .subscribe({
        next: (newTab) => {
          this.tabs.update((t) => [...t, newTab]);
          this.currentTabId = newTab.id;
          if (this.drawioReady) {
            this.loadExistingDiagram();
          }
        },
        error: (err) => {
          console.error('Failed to create default tab:', err);
        },
      });
  }

  createNewTab(): void {
    if (!this.projectId) return;

    // ใช้ Dialog แทน prompt (สวยกว่า)
    const name = prompt('Enter diagram name:', 'New Diagram');
    if (!name) return;

    // ให้เลือกประเภท
    const typeOptions = ['DFD', 'ER', 'Flowchart', 'Sequence', 'Class', 'State', 'Gantt'];
    const type = prompt(
      'Enter diagram type (DFD, ER, Flowchart, Sequence, Class, State, Gantt):',
      'DFD'
    );
    if (!type) return;

    const selectedType = typeOptions.find(t => t.toLowerCase() === type.toLowerCase()) || 'DFD';

    this.diagramService
      .createTab(this.projectId, name, selectedType as any, '')
      .subscribe({
        next: (newTab) => {
          this.tabs.update((t) => [...t, newTab]);
          this.switchTab(newTab.id);
          this.dialogService.success('Created', `Tab "${name}" created successfully.`);
        },
        error: (err) => {
          console.error('Failed to create tab:', err);
          this.dialogService.error('Failed', err.error?.message || 'Could not create tab.');
        },
      });
  }

  switchTab(tabId: string): void {
    if (this.currentTabId === tabId) return;
    this.currentTabId = tabId;
    this.currentDiagram = null;

    // อัปเดต URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tabId: tabId, projectId: this.projectId },
      queryParamsHandling: 'merge',
    });

    if (this.drawioReady) {
      this.loadExistingDiagram();
    }
  }

  deleteTab(tabId: string, event: Event): void {
    event.stopPropagation();
    const tab = this.tabs().find(t => t.id === tabId);
    if (!tab) return;

    this.dialogService
      .confirm('Delete Tab', `Delete diagram "${tab.name}"? This cannot be undone.`)
      .then((confirmed) => {
        if (!confirmed) return;
        this.diagramService.deleteTab(tabId).subscribe({
          next: () => {
            this.tabs.update((t) => t.filter((item) => item.id !== tabId));
            if (this.currentTabId === tabId) {
              const remaining = this.tabs();
              if (remaining.length > 0) {
                this.switchTab(remaining[0].id);
              } else {
                this.currentTabId = null;
                this.drawioService.loadXml('');
              }
            }
            this.dialogService.success('Deleted', `Tab "${tab.name}" deleted.`);
          },
          error: (err) => {
            console.error('Failed to delete tab:', err);
            this.dialogService.error('Failed', err.error?.message || 'Could not delete tab.');
          },
        });
      });
  }

  getTabIcon(type: string): string {
    const map: Record<string, string> = {
      DFD: 'bi-diagram-3',
      ER: 'bi-table',
      Flowchart: 'bi-diagram-2',
      Sequence: 'bi-arrow-left-right',
      Class: 'bi-boxes',
      State: 'bi-arrow-repeat',
      Gantt: 'bi-bar-chart',
      Mindmap: 'bi-diagram-2',
      Journey: 'bi-map',
      Pie: 'bi-pie-chart',
      C4: 'bi-box',
    };
    return map[type] || 'bi-file-earmark';
  }

  getTabTypeColor(type: string): string {
    const map: Record<string, string> = {
      DFD: 'text-blue-500',
      ER: 'text-emerald-500',
      Flowchart: 'text-purple-500',
      Sequence: 'text-amber-500',
      Class: 'text-rose-500',
      State: 'text-cyan-500',
      Gantt: 'text-indigo-500',
    };
    return map[type] || 'text-gray-500';
  }

  // ===== Project Name =====
  loadProjectName(): void {
    if (!this.projectId) return;
    this.diagramService.getProjectName(this.projectId).subscribe({
      next: (name) => (this.projectName = name),
      error: () => (this.projectName = 'Unknown Project'),
    });
  }

  // ===== Draw.io Integration =====
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    this.drawioService.handleMessage(event);
  }

  // ===== Chat =====
  toggleChat(): void {
    this.chatOpen.update((v) => !v);
    if (this.chatOpen()) this.unreadCount = 0;
  }

  handleAiResponse(response: {
    action: string;
    script?: string;
    name?: string;
    type?: string;
  }): void {
    console.log('AI Response from chat:', response);

    if (response.action === 'update' && response.script) {
      this.pendingMermaid = {
        script: response.script,
        name: response.name || 'AI Generated Diagram',
        type: response.type || 'Flowchart',
      };
      this.showImportDialog.set(true);
    }
  }

  importMermaid(): void {
    if (!this.pendingMermaid) return;
    const { script, name, type } = this.pendingMermaid;

    // ✅ สร้าง Tab ใหม่สำหรับ AI Diagram แทนที่จะเพิ่มหน้าในไฟล์เดิม
    if (this.projectId) {
      const tabName = name || 'AI Diagram';
      const tabType = type || 'Flowchart';
      this.diagramService
        .createTab(this.projectId, tabName, tabType as any, script)
        .subscribe({
          next: (newTab) => {
            this.tabs.update((t) => [...t, newTab]);
            this.switchTab(newTab.id);
            this.showImportDialog.set(false);
            this.pendingMermaid = null;
            this.dialogService.success('Imported', `Diagram "${tabName}" created.`);
          },
          error: (err) => {
            console.error('Failed to create AI diagram tab:', err);
            this.dialogService.error('Failed', err.error?.message || 'Could not create diagram.');
            this.showImportDialog.set(false);
            this.pendingMermaid = null;
          },
        });
    } else {
      this.showImportDialog.set(false);
      this.pendingMermaid = null;
    }
  }

  cancelImport(): void {
    this.showImportDialog.set(false);
    this.pendingMermaid = null;
  }

  // ===== Diagram CRUD =====
  loadExistingDiagram(): void {
    if (!this.currentTabId || this.isLoadingDiagram) return;
    this.isLoadingDiagram = true;
    this.isLoading = true;

    this.diagramService.getDiagram(this.currentTabId).subscribe({
      next: (diagram) => {
        if (this.projectId && diagram.projectId !== this.projectId) {
          alert('❌ This diagram does not belong to the selected project.');
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
      error: (err) => {
        console.error('Failed to load diagram:', err);
        this.isLoading = false;
        this.isLoadingDiagram = false;
        this.drawioService.loadXml('');
      },
    });
  }

  saveDiagram(): void {
    if (!this.currentTabId) {
      // ถ้าไม่มี Tab → สร้างใหม่
      if (this.projectId) {
        this.diagramService
          .createTab(this.projectId, 'New Diagram', 'Flowchart', '')
          .subscribe({
            next: (newTab) => {
              this.tabs.update((t) => [...t, newTab]);
              this.currentTabId = newTab.id;
              this.currentDiagram = newTab;
              this.saveDiagramInternal();
            },
            error: (err) => {
              alert('❌ Could not create new tab.');
              console.error(err);
            },
          });
      }
      return;
    }

    this.saveDiagramInternal();
  }

  private saveDiagramInternal(): void {
    if (!this.currentTabId) {
      alert('❌ No diagram ID to save.');
      return;
    }

    this.drawioService.requestXml();

    this.drawioService.xml$.pipe(take(1)).subscribe((xml) => {
      if (!xml || !this.currentTabId) return;

      const name = this.currentDiagram?.name || 'Drawio Diagram';
      const diagramType = this.currentDiagram?.diagramType || 'Flowchart';
      const projectId = this.currentDiagram?.projectId || this.projectId;

      if (!projectId) {
        alert('❌ Missing Project ID.');
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
        state: 3, // MODIFIED
        rowVersion: this.currentDiagram?.rowVersion || 0,
      };

      this.diagramService.updateTab(updatedTab as any).subscribe({
        next: (res) => {
          this.currentDiagram = res;
          // อัปเดตใน tabs list
          this.tabs.update((t) => t.map((item) => (item.id === res.id ? res : item)));
          this.dialogService.success('Saved', 'Diagram saved successfully.');
        },
        error: (err) => {
          console.error('Save failed:', err);
          this.dialogService.error('Save Failed', err.error?.message || 'Could not save diagram.');
        },
      });
    });
  }

  // ===== Generate SQL =====
  generateSql(): void {
    if (!this.currentTabId) {
      this.dialogService.warn('No Diagram', 'Please open a diagram first.');
      return;
    }

    this.isLoading = true;
    this.drawioService.requestXml();

    this.drawioService.xml$.pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (xml) => {
        this.isLoading = false;
        if (!xml || xml.trim().length === 0) {
          this.dialogService.warn('Empty Diagram', 'Please draw an ER diagram first.');
          return;
        }

        this.dialogService.open({
          type: 'confirm',
          component: SqlExportDialogComponent,
          componentInputs: { xml },
        });
      },
      error: () => {
        this.isLoading = false;
        this.dialogService.error('Error', 'Failed to get diagram XML.');
      },
    });
  }

  // ===== Trace Links for DFD/ER =====
  /**
   * เรียกใช้เมื่อสร้าง DFD Tab ใหม่
   * Frontend จะส่ง relatedRequirementIds ไปให้ Backend สร้าง Trace Link
   */
  createDfdTab(name: string, relatedRequirementIds: string[]): void {
    if (!this.projectId) return;

    this.diagramService
      .createTab(this.projectId, name, 'DFD', '')
      .subscribe({
        next: (newTab) => {
          // ✅ หลังจากได้ tabId แล้ว สร้าง Trace Link ผ่าน Backend (ทำใน createTab อยู่แล้ว)
          // แต่ถ้าต้องการส่ง relatedRequirementIds ไปด้วย ต้องแก้ createTab ให้รับ parameter
          // หรือเรียก API แยกเพื่อสร้าง Trace Link
          this.tabs.update((t) => [...t, newTab]);
          this.switchTab(newTab.id);

          // ถ้าต้องการสร้าง Trace Link แยก (กรณี createTab ไม่รองรับ)
          this.createTraceLinksForTab(newTab.id, 'DFD', relatedRequirementIds);
        },
        error: (err) => {
          console.error('Failed to create DFD tab:', err);
          this.dialogService.error('Failed', err.error?.message || 'Could not create DFD.');
        },
      });
  }

  /**
   * สร้าง Trace Links แยก (กรณี Backend ไม่รองรับ)
   */
  createTraceLinksForTab(tabId: string, type: string, relatedIds: string[]): void {
    if (!this.projectId || !tabId || !relatedIds.length) return;

    // TODO: เรียก API /api/trace/create แยก
    // หรือใช้ endpoint ที่มีอยู่แล้วใน PmDiagramTabService
    // ตัวอย่าง: POST /api/diagram/tabs/{tabId}/trace-links
    this.http
      .post(`/api/diagram/tabs/${tabId}/trace-links`, {
        sourceType: type === 'DFD' ? 'REQUIREMENT' : 'DFD',
        targetType: type,
        relatedIds: relatedIds,
        projectId: this.projectId,
      })
      .subscribe({
        next: () => {
          console.log(`✅ Trace links created for ${type} tab: ${tabId}`);
        },
        error: (err) => {
          console.error('Failed to create trace links:', err);
        },
      });
  }

  // ============================================================
  // ⭐ NEW: API for Trace Links from Frontend
  // ============================================================
  /**
   * สร้าง Trace Link จาก DFD/ER ไปยัง Requirement หรือ DFD
   */
  createTraceLink(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    relationshipType: string
  ): void {
    this.http
      .post('/api/trace/links', {
        projectId: this.projectId,
        sourceType,
        sourceId,
        targetType,
        targetId,
        relationshipType,
      })
      .subscribe({
        next: () => {
          console.log(`✅ Trace link created: ${sourceType}(${sourceId}) → ${targetType}(${targetId})`);
        },
        error: (err) => {
          console.error('Failed to create trace link:', err);
        },
      });
  }
}