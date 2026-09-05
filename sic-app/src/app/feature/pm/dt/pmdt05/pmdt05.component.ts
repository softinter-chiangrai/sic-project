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
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil, interval } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DialogService } from '../../../../core/services/dialog.service';
import { DiagramService } from './diagram.service';
import { DrawioConnectorService } from './drawio-connector.service';
import { Pmdt05AComponent } from './pmdt05A/pmdt05A.component';
import { SqlExportDialogComponent } from './sql-export-dialog.component';
import { NewDiagramDialogComponent, DiagramEditData } from './new-diagram-dialog.component';
import { ApprovalService } from '../pmdt03/approval.service';
import { DiagramModel } from './diagram.model';
import { CustomerStateService } from '../../../../core/services/customer-state.service';

@Component({
  selector: 'app-pmdt05',
  standalone: true,
  imports: [CommonModule, FormsModule, Pmdt05AComponent],
  templateUrl: './pmdt05.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./pmdt05.component.css'],
})
export class Pmdt05Component implements AfterViewInit, OnDestroy {
  @ViewChild('drawioIframe') iframe!: ElementRef<HTMLIFrameElement>;

  private destroy$ = new Subject<void>();
  private drawioService = inject(DrawioConnectorService);
  private diagramService = inject(DiagramService);
  private approvalService = inject(ApprovalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);
  private customerState = inject(CustomerStateService);
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
  private loadedDiagramTabId: string | null = null;

  // ===== Tabs =====
  tabs = signal<DiagramModel[]>([]);
  isLoadingTabs = false;

  get currentTabLocked(): boolean {
    const tab = this.tabs().find((t) => t.id === this.currentTabId);
    return !!(tab?.isApproved || tab?.approvalStatus === 'APPROVED');
  }

  private isLoadingDiagram = false;
  private pendingCreate: { requirementId: string; requirementTitle: string } | null = null;

  // เก็บ requirementId/requirementTitle ไว้ใช้เสมอ (แม้ URL จะถูกลบเพื่อความสะอาด)
  private requirementId: string | null = null;
  private requirementTitle: string = '';

  // ===== Auto‑Save =====
  private lastSavedXml: string | null = null;
  autoSaveStatus = '';
  private saving = false;

  // ===== Lifecycle =====
  ngAfterViewInit(): void {
    this.drawioService.init(this.iframe.nativeElement);

    this.drawioService.isReady$.pipe(takeUntil(this.destroy$)).subscribe((ready: any) => {
      this.drawioReady = ready;
      console.log('[Draw.io] Ready status:', ready);
      if (ready && this.currentTabId && this.loadedDiagramTabId !== this.currentTabId) {
        this.loadExistingDiagram();
      }
    });

    setTimeout(() => {
      if (!this.drawioReady) {
        console.warn('[Draw.io] Fallback: force ready after 5s');
        this.drawioReady = true;
        if (this.currentTabId && this.loadedDiagramTabId !== this.currentTabId) {
          this.loadExistingDiagram();
        }
      }
    }, 5000);

    // รับ query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const tabIdFromUrl = params['tabId'] || params['diagramId'] || null;
      let projectIdFromUrl = params['projectId'] || null;
      const shouldOpenCreate = params['openCreate'] === 'true';
      const reqIdFromUrl = params['requirementId'] || null;
      const reqTitleFromUrl = params['requirementTitle'] || '';

      // เก็บ requirementId/Title ไว้ใน state และ component
      if (reqIdFromUrl) {
        this.requirementId = reqIdFromUrl;
        this.requirementTitle = reqTitleFromUrl;
        this.customerState.setRequirement(reqIdFromUrl, reqTitleFromUrl);
      } else if (!this.requirementId) {
        this.requirementId = this.customerState.getRequirementId();
        this.requirementTitle = this.customerState.getRequirementTitle();
      }

      if (!projectIdFromUrl) {
        projectIdFromUrl = this.customerState.getProjectId();
      }

      if (!projectIdFromUrl) {
        this.router.navigate(['/feature/pm/project']);
        return;
      }

      const isNewProject = projectIdFromUrl !== this.projectId;
      this.projectId = projectIdFromUrl;
      this.customerState.setProject(projectIdFromUrl);

      // เคลียร์ query params ที่ยาวเทอะทะออกจาก URL เพื่อให้ path สะอาด
      const hasLongParams = !!(params['requirementTitle'] || params['requirementId'] || params['openCreate'] || (params['projectId'] && tabIdFromUrl));
      if (hasLongParams) {
        this.cleanUpUrl(tabIdFromUrl || this.currentTabId);
      }

      if (shouldOpenCreate && this.requirementId) {
        this.pendingCreate = { requirementId: this.requirementId, requirementTitle: this.requirementTitle };
      }

      if (isNewProject) {
        this.currentTabId = tabIdFromUrl;
        this.currentDiagram = null;
        this.loadedDiagramTabId = null;
        this.loadProjectName();
        this.loadTabs(tabIdFromUrl, shouldOpenCreate);
        return;
      }

      if (tabIdFromUrl && tabIdFromUrl !== this.currentTabId) {
        this.currentTabId = tabIdFromUrl;
        this.currentDiagram = null;
        this.loadedDiagramTabId = null;
        if (this.drawioReady) {
          this.loadExistingDiagram();
        }
      } else if (!this.currentTabId && this.tabs().length > 0) {
        this.switchTab(this.tabs()[0].id);
      }
    });

    // ===== Auto‑Save: Poll XML ทุก 10 วินาที =====
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (
          this.drawioReady &&
          this.currentTabId &&
          !this.isLoading &&
          !this.isLoadingDiagram &&
          !this.currentTabLocked
        ) {
          // ขอ XML จาก Draw.io เพื่อตรวจสอบการเปลี่ยนแปลง
          this.drawioService.requestXml();
        }
      });

    // ===== Auto‑Save: เมื่อได้รับ XML จาก Draw.io =====
    this.drawioService.xml$
      .pipe(
        debounceTime(300), // หน่วงเล็กน้อยเพื่อป้องกันการยิงซ้ำ
        takeUntil(this.destroy$)
      )
      .subscribe((xml: string) => {
        if (!this.currentTabId) return;
        if (!xml || xml.trim().length === 0) return;

        const normalized = this.ensureValidDrawioXml(xml);

        // ไม่มีการเปลี่ยนแปลง
        if (normalized === this.lastSavedXml) {
          return;
        }

        this.lastSavedXml = normalized;
        console.log('[AutoSave] Diagram changed, saving...');

        this.autoSaveDiagram(normalized);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== URL Cleanup Helper =====
  private cleanUpUrl(tabId: string | null): void {
    const queryParams: Record<string, any> = {};
    if (tabId) {
      queryParams['tabId'] = tabId;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  // ===== Tabs Management =====
  loadTabs(preferredTabId?: string | null, openCreateAfterLoad: boolean = false): void {
    if (!this.projectId) return;
    this.isLoadingTabs = true;

    this.diagramService.getTabs(this.projectId).subscribe({
      next: (tabs) => {
        this.tabs.set(tabs);
        this.isLoadingTabs = false;

        if (tabs.length > 0) {
          const targetTabId = (preferredTabId && tabs.some((t) => t.id === preferredTabId))
            ? preferredTabId
            : tabs[0].id;

          this.currentTabId = targetTabId;
          this.cleanUpUrl(this.currentTabId);

          if (this.drawioReady && this.loadedDiagramTabId !== this.currentTabId) {
            this.loadExistingDiagram();
          }
        } else {
          this.currentTabId = null;
          if (openCreateAfterLoad || this.pendingCreate) {
            const reqId = this.pendingCreate?.requirementId || this.requirementId || '';
            const reqTitle = this.pendingCreate?.requirementTitle || this.requirementTitle || '';
            this.openCreateDialogWithRequirement(reqId, reqTitle);
            this.pendingCreate = null;
          } else {
            this.createDefaultTab();
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
    const reqId = this.requirementId || this.route.snapshot.queryParams['requirementId'] || '';
    const reqTitle = this.requirementTitle || this.route.snapshot.queryParams['requirementTitle'] || '';

    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: this.projectId,
        editData: null,
        selectedRequirementId: reqId,
        requirementTitle: reqTitle,
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
    const reqId = this.requirementId || this.route.snapshot.queryParams['requirementId'] || '';
    const reqTitle = this.requirementTitle || this.route.snapshot.queryParams['requirementTitle'] || '';

    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: this.projectId,
        editData: null,
        selectedRequirementId: reqId,
        requirementTitle: reqTitle,
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
      requirementId: tab.requirementId,
      requirementTitle: tab.requirementTitle,
      approvalStatus: tab.approvalStatus,
      isApproved: tab.isApproved,
    };
    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: this.projectId,
        editData: editData,
        selectedRequirementId: tab.requirementId || '',
        requirementTitle: tab.requirementTitle || '',
        onSave: (name: string, type: string, data: DiagramEditData | undefined, reqId: string, flowId?: string) => {
          if (!data) return;
          const updatedTab = {
            ...tab,
            name: name,
            diagramType: type,
            requirementId: reqId || undefined,
            state: 3,
            rowVersion: data.rowVersion || 0,
          };
          this.diagramService.updateTab(updatedTab as any).subscribe({
            next: (res) => {
              if (flowId && res.id) {
                this.approvalService
                  .submitForApproval({
                    documentType: 'DIAGRAM',
                    documentId: res.id,
                    documentCode: 'DIAG-' + res.id.substring(0, 8).toUpperCase(),
                    documentTitle: res.name || 'Diagram Document',
                    flowId: flowId,
                    comment: 'ส่งขออนุมัติ Diagram จากการแก้ไขข้อมูล',
                  })
                  .subscribe({
                    next: () => {
                      this.dialogService.success('บันทึกสำเร็จ', `อัปเดต Diagram "${res.name}" เรียบร้อย`);
                      this.loadTabs();
                    },
                    error: (err) => {
                      this.dialogService.success('บันทึกสำเร็จ', `อัปเดต Diagram "${res.name}" เรียบร้อย`);
                      this.loadTabs();
                    }
                  });
              } else {
                this.tabs.update((t) => t.map((item) => (item.id === res.id ? res : item)));
                if (this.currentTabId === tabId) this.currentDiagram = res;
                this.dialogService.success('บันทึกสำเร็จ', `อัปเดต Diagram "${res.name}" เรียบร้อย`);
              }
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
    if (this.currentTabId === tabId && this.loadedDiagramTabId === tabId) return;
    this.currentTabId = tabId;
    this.currentDiagram = null;
    this.loadedDiagramTabId = null;
    this.cleanUpUrl(tabId);
    if (this.drawioReady) {
      this.loadExistingDiagram();
    }
  }

  deleteTab(tabId: string, event: Event): void {
    event.stopPropagation();
    const tab = this.tabs().find((t) => t.id === tabId);
    if (!tab) return;
    if (tab.isApproved || tab.approvalStatus === 'APPROVED') {
      this.dialogService.warn('เอกสารถูกล็อค', 'Diagram นี้ผ่านการอนุมัติแล้ว ไม่สามารถลบได้ กรุณาใช้ปุ่ม "ขอแก้ไข" เพื่อดำเนินการผ่าน Change Request');
      return;
    }
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

  requestChangeForCurrentTab(): void {
    const tab = this.tabs().find((t) => t.id === this.currentTabId);
    if (!tab) return;
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: this.projectId,
        targetType: 'DIAGRAM',
        targetId: tab.id,
        targetTitle: tab.name,
      },
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
    const tabIdToLoad = this.currentTabId;
    console.log('[Diagram] Loading diagram:', tabIdToLoad);

    this.diagramService.getDiagram(tabIdToLoad).subscribe({
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

        if (this.currentTabId !== tabIdToLoad) {
          this.isLoading = false;
          this.isLoadingDiagram = false;
          return;
        }

        this.currentDiagram = diagram;
        this.loadedDiagramTabId = tabIdToLoad;
        let xml = diagram.graphData?.xml || this.drawioService.getEmptyDiagramXml();
        xml = this.ensureValidDrawioXml(xml);
        console.log('[Diagram] XML length after validation:', xml.length);
        // ตั้งค่า lastSavedXml เป็น XML ที่โหลดมา เพื่อป้องกัน auto‑save ซ้ำ
        this.lastSavedXml = xml;
        this.drawioService.loadXml(xml, true);
        this.isLoading = false;
        this.isLoadingDiagram = false;
      },
      error: (err) => {
        console.error('[Diagram] Failed to load diagram:', err);
        this.isLoading = false;
        this.isLoadingDiagram = false;
        this.drawioService.loadXml(this.drawioService.getEmptyDiagramXml(), true);
        this.dialogService.error('โหลด Diagram ไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  // ===== Save (Manual) =====
  saveDiagram(): void {
    if (!this.currentTabId) {
      this.dialogService.warn('No Diagram', 'ไม่พบ Diagram ที่จะบันทึก');
      return;
    }
    // ขอ XML ล่าสุดจาก Draw.io
    this.drawioService.requestXml();
    // รอ XML แล้วบันทึกทันที (ใช้ take(1) เพื่อรับครั้งเดียว)
    this.drawioService.xml$.pipe(take(1), takeUntil(this.destroy$)).subscribe((xml: string) => {
      if (!xml || xml.trim().length === 0) {
        this.dialogService.warn('Empty Diagram', 'ไม่พบข้อมูล Diagram');
        return;
      }
      const normalized = this.ensureValidDrawioXml(xml);
      // บันทึกทันทีโดยไม่รอ auto-save
      this.autoSaveDiagram(normalized, true); // ส่ง flag manual=true
    });
  }

  // ===== Auto‑Save (Internal) =====
  private autoSaveDiagram(xml: string, manual: boolean = false): void {
    if (this.saving) {
      if (manual) {
        this.dialogService.warn('กำลังบันทึก', 'ระบบกำลังบันทึกอยู่ กรุณารอสักครู่');
      }
      return;
    }

    if (!this.currentTabId) {
      return;
    }

    if (this.currentTabLocked) {
      if (manual) {
        this.dialogService.warn('เอกสารถูกล็อค', 'Diagram นี้ผ่านการอนุมัติแล้ว กรุณาใช้ปุ่ม "ขอแก้ไข" เพื่อดำเนินการผ่าน Change Request');
      }
      return;
    }

    const diagram = this.tabs().find(t => t.id === this.currentTabId);
    if (!diagram) {
      console.warn('[AutoSave] No diagram found for current tab');
      return;
    }

    // ตรวจสอบว่ามี requirementId หรือไม่ (ถ้าไม่มี ให้ใช้จาก currentDiagram หรือจาก query param)
    let requirementId = diagram['requirementId'] || this.requirementId || this.route.snapshot.queryParams['requirementId'] || '';
    if (!requirementId) {
      // ถ้าไม่มี requirementId ให้ดึงจาก currentDiagram ที่โหลดไว้
      if (this.currentDiagram && this.currentDiagram['requirementId']) {
        requirementId = this.currentDiagram['requirementId'];
      }
    }

    // ถ้ายังไม่มี requirementId ให้แจ้งเตือนและไม่บันทึก
    if (!requirementId) {
      console.warn('[AutoSave] No requirementId found for this diagram, cannot save.');
      if (manual) {
        this.dialogService.warn('Missing Requirement', 'ไม่พบ Requirement ID ที่เชื่อมโยง กรุณาสร้าง Diagram ใหม่ผ่าน Requirement');
      }
      return;
    }

    this.saving = true;

    const updatedTab = {
      ...diagram,
      graphData: { xml },
      requirementId: requirementId, // ส่ง requirementId ไปด้วย
      state: 3,
      rowVersion: this.currentDiagram?.rowVersion ?? diagram.rowVersion ?? null
    };

    this.diagramService.updateTab(updatedTab as any).subscribe({
      next: (res) => {
        this.currentDiagram = res;
        this.tabs.update(items =>
          items.map(i => i.id === res.id ? res : i)
        );
        this.lastSavedXml = res.graphData?.xml ?? xml;
        const now = new Date().toLocaleTimeString();
        this.autoSaveStatus = manual ? `✅ Saved manually at ${now}` : `✅ Auto-saved at ${now}`;
        this.saving = false;
        if (manual) {
          this.dialogService.success('บันทึกสำเร็จ', 'Diagram ถูกบันทึกเรียบร้อย');
        }
      },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.message || 'เกิดข้อผิดพลาด';
        this.autoSaveStatus = `❌ Save failed`;
        if (manual) {
          this.dialogService.error('บันทึกไม่สำเร็จ', msg);
        } else {
          console.error('[AutoSave] Failed:', err);
        }
        // ดึงข้อมูล Diagram ล่าสุดเพื่ออัปเดต rowVersion สำหรับการบันทึกครั้งถัดไป
        if (this.currentTabId) {
          this.diagramService.getDiagram(this.currentTabId).subscribe({
            next: (latest) => {
              this.currentDiagram = latest;
              this.tabs.update(items =>
                items.map(i => i.id === latest.id ? latest : i)
              );
            }
          });
        }
      }
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
      next: (xml: any) => {
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