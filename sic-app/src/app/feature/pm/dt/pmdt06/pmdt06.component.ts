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
import type { DiagramModel } from './diagram.model';
import { DiagramService } from './diagram.service';
import { DrawioConnectorService } from './drawio-connector.service';
import { pmdt06AComponent } from './pmdt06A/pmdt06A.component';
import { SqlExportDialogComponent } from './sql-export-dialog.component';
import { NewDiagramDialogComponent, DiagramEditData } from './new-diagram-dialog.component';

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
  private isCreateDialogOpened = false;

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
  private pendingCreate: { requirementId: string; requirementTitle: string } | null = null;

  // ===== Lifecycle =====
  ngAfterViewInit(): void {
    this.drawioService.init(this.iframe.nativeElement);

    let isFirstReady = true;

    this.drawioService.isReady$.pipe(takeUntil(this.destroy$)).subscribe((ready) => {
      this.drawioReady = ready;
      console.log('[Draw.io] Ready status:', ready);
      if (ready && this.currentTabId && isFirstReady) {
        isFirstReady = false;
        this.loadExistingDiagram();
      }
    });

    setTimeout(() => {
      if (!this.drawioReady) {
        console.warn('[Draw.io] Fallback: force ready after 7s');
        this.drawioReady = true;
        if (this.currentTabId) {
          this.loadExistingDiagram();
        }
      }
    }, 7000);

    // รับ query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
    const newTabId = params['tabId'] || params['diagramId'] || null;
    const newProjectId = params['projectId'] || null;
    const shouldOpenCreate = params['openCreate'] === 'true';
    const requirementId = params['requirementId'] || null;
    const requirementTitle = params['requirementTitle'] || '';

    if (!newProjectId) {
      this.router.navigate(['/projects']);
      return;
    }

    // ถ้า projectId เปลี่ยน ให้โหลดใหม่
    if (newProjectId !== this.projectId) {
      this.projectId = newProjectId;
      this.currentTabId = null;
      this.currentDiagram = null;
      this.loadProjectName();
      this.loadTabs();
      // ถ้ามี openCreate และ requirementId ให้เก็บไว้เปิดทีหลัง
      if (shouldOpenCreate && requirementId) {
        this.pendingCreate = { requirementId, requirementTitle };
        // ลบ query params ทันที
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { openCreate: null, requirementId: null, requirementTitle: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
      return;
    }

    // ถ้ามี tabId ให้โหลด diagram
    if (newTabId) {
      if (newTabId !== this.currentTabId) {
        this.currentTabId = newTabId;
        this.currentDiagram = null;
        if (this.drawioReady) {
          this.loadExistingDiagram();
        }
      }
      // ถ้ามี openCreate และ requirementId แต่มี tabId อยู่แล้ว -> ไม่ต้องเปิด dialog
      if (shouldOpenCreate && requirementId) {
        // ลบ query params ทิ้ง
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { openCreate: null, requirementId: null, requirementTitle: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    } else {
      // ถ้าไม่มี tabId ให้โหลด tabs
      this.loadTabs();
      // ถ้ามี openCreate และ requirementId และยังไม่มี tabs ให้เปิด dialog
      if (shouldOpenCreate && requirementId && !this.isCreateDialogOpened) {
        // ตรวจสอบว่ามี tabs หรือยัง ถ้ายังไม่มีให้เปิด
        if (this.tabs().length === 0) {
          this.isCreateDialogOpened = true;
          this.openCreateDialogWithRequirement(requirementId, requirementTitle);
          // ลบ query params
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { openCreate: null, requirementId: null, requirementTitle: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        } else {
          // ถ้ามี tabs อยู่แล้ว ไม่ต้องเปิด
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { openCreate: null, requirementId: null, requirementTitle: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      }
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

        if (!this.currentTabId && tabs.length > 0) {
          this.currentTabId = tabs[0].id;
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tabId: this.currentTabId, projectId: this.projectId },
            queryParamsHandling: 'merge',
          });
          if (this.drawioReady) {
            this.loadExistingDiagram();
          }
        }

        if (tabs.length === 0) {
          // ถ้าไม่มี tab และมี pendingCreate ให้เปิด dialog
          if (this.pendingCreate) {
            this.openCreateDialogWithRequirement(
              this.pendingCreate.requirementId,
              this.pendingCreate.requirementTitle
            );
            this.pendingCreate = null;
          } else {
            // ถ้าไม่มี pendingCreate ให้สร้าง default
            this.createDefaultTab();
          }
        } else {
          // ถ้ามี tab อยู่แล้ว และมี pendingCreate ให้ยกเลิก pending (ไม่ต้องเปิด)
          if (this.pendingCreate) {
            console.log('[Diagram] Tabs already exist, skip create dialog');
            this.pendingCreate = null;
          }
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
    const requirementId = this.route.snapshot.queryParams['requirementId'] || '';
    const requirementTitle = this.route.snapshot.queryParams['requirementTitle'] || '';

    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: this.projectId,
        editData: null,
        selectedRequirementId: requirementId,
        requirementTitle: requirementTitle,
        onSave: (name: string, type: string, editData: DiagramEditData | undefined, reqId: string) => {
          this.diagramService.createTab(this.projectId!, name, type as any, '', reqId).subscribe({
            next: (newTab) => {
              this.tabs.update((t) => [...t, newTab]);
              this.switchTab(newTab.id);
              this.dialogService.success('สร้างสำเร็จ', `สร้าง Diagram "${name}" เรียบร้อย`);
            },
            error: (err) => {
              this.dialogService.error('สร้างไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
        },
      },
    });
  }

  createNewTab(): void {
    if (!this.projectId) return;
    const requirementId = this.route.snapshot.queryParams['requirementId'] || '';
    const requirementTitle = this.route.snapshot.queryParams['requirementTitle'] || '';

    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: this.projectId,
        editData: null,
        selectedRequirementId: requirementId,
        requirementTitle: requirementTitle,
        onSave: (name: string, type: string, editData: DiagramEditData | undefined, reqId: string) => {
          this.diagramService.createTab(this.projectId!, name, type as any, '', reqId).subscribe({
            next: (newTab) => {
              this.tabs.update((t) => [...t, newTab]);
              this.switchTab(newTab.id);
              this.dialogService.success('สร้างสำเร็จ', `สร้าง Diagram "${name}" เรียบร้อย`);
            },
            error: (err) => {
              this.dialogService.error('สร้างไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
        },
      },
    });
  }

 private openCreateDialogWithRequirement(requirementId: string, requirementTitle: string): void {
  if (!this.projectId || !requirementId) return;

  // เปิด dialog และรับ Promise
  const promise = this.dialogService.open({
    type: 'confirm',
    component: NewDiagramDialogComponent,
    componentInputs: {
      projectId: this.projectId,
      editData: null,
      selectedRequirementId: requirementId,
      requirementTitle: requirementTitle,
      onSave: (name: string, type: string, editData: DiagramEditData | undefined, reqId: string) => {
        this.diagramService.createTab(this.projectId!, name, type as any, '', reqId).subscribe({
          next: (newTab) => {
            this.tabs.update((t) => [...t, newTab]);
            this.switchTab(newTab.id);
            this.dialogService.success('สร้างสำเร็จ', `สร้าง Diagram "${name}" เรียบร้อย`);
          },
          error: (err) => {
            this.dialogService.error('สร้างไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
          },
        });
      },
    },
  });

  // เมื่อ dialog ปิด (ไม่ว่า success หรือ cancel) ให้รีเซ็ต pendingCreate
  promise.finally(() => {
    this.pendingCreate = null;
  });
}

  editTab(tabId: string): void {
    const tab = this.tabs().find((t) => t.id === tabId);
    if (!tab) return;
    const editData: DiagramEditData = {
      id: tab.id,
      name: tab.name,
      type: tab.diagramType,
      rowVersion: tab.rowVersion || 0,
    };
    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: this.projectId,
        editData: editData,
        selectedRequirementId: '', // ไม่ต้องใช้
        requirementTitle: '',
        onSave: (name: string, type: string, data: DiagramEditData | undefined, reqId: string) => {
          if (!data) return;
          const updatedTab = {
            ...tab,
            name: name,
            diagramType: type,
            state: 3,
            rowVersion: data.rowVersion || 0,
          };
          this.diagramService.updateTab(updatedTab as any).subscribe({
            next: (res) => {
              this.tabs.update((t) => t.map((item) => (item.id === res.id ? res : item)));
              if (this.currentTabId === tabId) this.currentDiagram = res;
              this.dialogService.success('บันทึกสำเร็จ', `อัปเดต Diagram "${res.name}" เรียบร้อย`);
            },
            error: (err) => {
              this.dialogService.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
        },
      },
    });
  }

  switchTab(tabId: string): void {
    if (this.currentTabId === tabId) return;
    this.currentTabId = tabId;
    this.currentDiagram = null;
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
    const tab = this.tabs().find((t) => t.id === tabId);
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

  // ===== Helpers =====
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
      'Use Case': 'bi-people',
    };
    return map[type] || 'bi-file-earmark';
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

  // ===== Chat =====
  toggleChat(): void {
    this.chatOpen.update((v) => !v);
    if (this.chatOpen()) this.unreadCount = 0;
  }

  handleAiResponse(response: { action: string; script?: string; name?: string; type?: string }): void {
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
    if (!this.pendingMermaid || !this.projectId) return;
    const { script, name, type } = this.pendingMermaid;
    const requirementId = this.route.snapshot.queryParams['requirementId'] || '';
    const requirementTitle = this.route.snapshot.queryParams['requirementTitle'] || '';

    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: this.projectId,
        editData: null,
        selectedRequirementId: requirementId,
        requirementTitle: requirementTitle,
        onSave: (diagramName: string, diagramType: string, editData: DiagramEditData | undefined, reqId: string) => {
          const tabName = diagramName || name || 'AI Diagram';
          const tabType = diagramType || type || 'Flowchart';
          this.diagramService.createTab(this.projectId!, tabName, tabType as any, script, reqId).subscribe({
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
        },
      },
    });
  }

  cancelImport(): void {
    this.showImportDialog.set(false);
    this.pendingMermaid = null;
  }

  // ===== Diagram CRUD =====
  private ensureValidDrawioXml(xml: string): string {
    if (!xml || xml.trim().length === 0) {
      return this.drawioService.getEmptyDiagramXml();
    }
    const trimmed = xml.trim();
    if (!trimmed.includes('<mxfile') && !trimmed.includes('<mxGraphModel')) {
      return this.drawioService.getEmptyDiagramXml();
    }
    if (trimmed.includes('<mxGraphModel') && !trimmed.includes('<root>')) {
      const empty = this.drawioService.getEmptyDiagramXml();
      const diagramMatch = trimmed.match(/<diagram[^>]*>([\s\S]*?)<\/diagram>/);
      if (diagramMatch) {
        return empty.replace(
          /(<diagram[^>]*>)([\s\S]*?)(<\/diagram>)/,
          `$1${diagramMatch[1]}$3`
        );
      }
      return empty;
    }
    return trimmed;
  }

  loadExistingDiagram(): void {
    if (!this.currentTabId) {
      console.warn('[Diagram] No tabId to load');
      return;
    }
    if (this.isLoadingDiagram) {
      console.warn('[Diagram] Already loading, skip');
      return;
    }
    this.isLoadingDiagram = true;
    this.isLoading = true;
    console.log('[Diagram] Loading diagram:', this.currentTabId);

    this.diagramService.getDiagram(this.currentTabId).subscribe({
      next: (diagram) => {
        console.log('[Diagram] Loaded diagram data:', diagram);
        if (this.projectId && diagram.projectId !== this.projectId) {
          console.warn('[Diagram] Project mismatch');
          this.dialogService.warn('Project mismatch', 'This diagram does not belong to the selected project.');
          this.isLoading = false;
          this.isLoadingDiagram = false;
          this.drawioService.loadXml('');
          return;
        }
        this.currentDiagram = diagram;
        let xml = diagram.graphData?.xml || this.drawioService.getEmptyDiagramXml();
        xml = this.ensureValidDrawioXml(xml);
        console.log('[Diagram] XML length after validation:', xml.length);
        setTimeout(() => {
          this.drawioService.loadXml(xml, true);
        }, 300);
        this.isLoading = false;
        this.isLoadingDiagram = false;
      },
      error: (err) => {
        console.error('[Diagram] Failed to load diagram:', err);
        this.isLoading = false;
        this.isLoadingDiagram = false;
        setTimeout(() => {
          this.drawioService.loadXml(this.drawioService.getEmptyDiagramXml(), true);
        }, 300);
        this.dialogService.error('โหลด Diagram ไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  saveDiagram(): void {
    if (!this.currentTabId) {
      if (this.projectId) {
        this.createNewTab();
      }
      return;
    }
    this.saveDiagramInternal();
  }

  private saveDiagramInternal(): void {
    if (!this.currentTabId) {
      this.dialogService.warn('ไม่มี Diagram', 'ไม่พบ Diagram ที่จะบันทึก');
      return;
    }
    this.drawioService.requestXml();
    this.drawioService.xml$.pipe(take(1)).subscribe((xml) => {
      if (!xml || !this.currentTabId) return;
      const name = this.currentDiagram?.name || 'Drawio Diagram';
      const diagramType = this.currentDiagram?.diagramType || 'Flowchart';
      const projectId = this.currentDiagram?.projectId || this.projectId;
      if (!projectId) {
        this.dialogService.warn('Missing Project ID', 'ไม่พบ Project ID');
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
        state: 3,
        rowVersion: this.currentDiagram?.rowVersion || 0,
      };
      this.diagramService.updateTab(updatedTab as any).subscribe({
        next: (res) => {
          this.currentDiagram = res;
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

  // ===== Trace Links (keep for compatibility) =====
  createDfdTab(name: string, relatedRequirementIds: string[]): void {
    // ไม่ใช้แล้ว
  }

  createTraceLink(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    relationshipType: string
  ): void {
    if (!this.projectId) {
      console.warn('No projectId, cannot create trace link');
      return;
    }
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
          console.log(
            `✅ Trace link created: ${sourceType}(${sourceId}) → ${targetType}(${targetId})`
          );
        },
        error: (err) => {
          console.error('Failed to create trace link:', err);
        },
      });
  }
}