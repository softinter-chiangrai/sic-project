// src/app/feature/pm/dt/pmdt06/pmdt06.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  Injector,
  OnDestroy,
  signal,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Subject, take, takeUntil, interval, Observable, firstValueFrom } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../core/services/dialog.service';
import { DiagramService } from './diagram.service';
import { DrawioConnectorService, MermaidInsertResult } from './drawio-connector.service';
import { Pmdt05AComponent } from './pmdt05A/pmdt05A.component';
import { SqlExportDialogComponent } from './sql-export-dialog.component';
import { NewDiagramDialogComponent, DiagramEditData } from './new-diagram-dialog.component';
import { ApprovalService } from '../pmdt03/approval.service';
import { DiagramModel } from './diagram.model';
import { Pmdt05PageData } from './pmdt05.model';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { TraceLinkService, TraceRelationshipType } from '../../../../core/services/trace-link.service';
import { Pmrt02Service } from '../../rt/pmrt02/pmrt02.service';
import { PmCustomerProject } from '../../rt/pmrt02/pmrt02.model';

@Component({
  selector: 'app-pmdt05',
  standalone: true,
  imports: [CommonModule, Pmdt05AComponent, TranslateModule],
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
  private traceLinkService = inject(TraceLinkService);
  private pmrt02Service = inject(Pmrt02Service);
  private translate = inject(TranslateService);
  private injector = inject(Injector);
  private isCreateDialogOpened = false;

  /** draw.io ที่ host เอง (docker/drawio) พร้อมปลั๊กอิน sicMermaid */
  readonly drawioSrc: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    `${environment.drawioUrl}/?embed=1&proto=json&ui=dark&saveAndExit=0&noSaveBtn=1&noExitBtn=1&autosave=1&p=sicMermaid`,
  );

  // ===== Global project context (navbar sic-context-switcher) =====
  readonly selectedProjectIds = this.customerState.currentSelectedProjectIds;
  readonly activeProjectId = computed(() => {
    const ids = this.selectedProjectIds();
    return ids.length === 1 ? ids[0] : null;
  });

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

  // ===== Projects List =====
  readonly projects = signal<PmCustomerProject[]>([]);
  readonly noProjectsAvailable = signal<boolean>(false);

  // ===== Tabs =====
  tabs = signal<DiagramModel[]>([]);
  isLoadingTabs = false;

  get currentTab(): DiagramModel | undefined {
    return this.tabs().find((t) => t.id === this.currentTabId) || this.currentDiagram || undefined;
  }

  get currentTabLocked(): boolean {
    const tab = this.currentTab;
    return !!(tab?.isApproved || tab?.approvalStatus === 'APPROVED');
  }

  /** Mermaid จากแชท AI: ให้ draw.io แปลง (mode merge) แล้วรับ XML กลับมา merge เข้าแผนภาพที่เปิดอยู่ ดู onMermaidResult */
  insertAiMermaid(code: string): void {
    if (this.currentTabLocked) {
      this.dialogService.warn(
        this.translate.instant('PMDT05_INSERT_MERMAID_FAIL_TITLE'),
        this.translate.instant('PMDT05_LOCKED_MSG'),
      );
      return;
    }
    this.drawioService.insertMermaid(code, 'merge');
  }

  private onMermaidResult(res: MermaidInsertResult): void {
    if (res.stage === 'inserted') {
      // diagram ที่สร้างจาก Mermaid (เช่น จาก AI pipeline) เพิ่งถูกวาด → ขอ XML ไปให้ auto-save บันทึกกลับ
      this.drawioService.requestXml();
    } else if (res.stage === 'parsed' && res.xml) {
      this.drawioService.mergeXml(res.xml);
      this.dialogService.success(
        this.translate.instant('PMDT05_INSERT_MERMAID_SUCCESS_TITLE'),
        this.translate.instant('PMDT05_INSERT_MERMAID_SUCCESS_MSG'),
      );
    } else {
      this.dialogService.warn(
        this.translate.instant('PMDT05_INSERT_MERMAID_FAIL_TITLE'),
        res.message || this.translate.instant('PMDT05_INSERT_MERMAID_FAIL_MSG'),
      );
    }
  }

  private isLoadingDiagram = false;
  private diagramLoadToken = 0;
  private pendingCreate: { requirementId: string; requirementTitle: string } | null = null;

  // Preloaded by the resolver for the first getTabs() call only — cleared after use.
  private resolvedTabs: DiagramModel[] | null = null;
  private resolvedTabsProjectId: string | null = null;

  // เก็บ requirementId/requirementTitle ไว้ใช้เสมอ (แม้ URL จะถูกลบเพื่อความสะอาด)
  private requirementId: string | null = null;
  private requirementTitle: string = '';

  private pendingTabIdFromUrl: string | null = null;

  // ===== Auto‑Save =====
  private lastSavedXml: string | null = null;
  autoSaveStatus = '';
  private saving = false;

  // ===== Lifecycle =====
  ngAfterViewInit(): void {
    const page: Pmdt05PageData = this.route.snapshot.data['form'];
    if (page?.initialTabs) {
      this.resolvedTabs = page.initialTabs;
      this.resolvedTabsProjectId = page.projectId;
    }

    this.drawioService.init(this.iframe.nativeElement);
    this.drawioService.mermaid$.pipe(takeUntil(this.destroy$)).subscribe((res) => this.onMermaidResult(res));

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

    // โหลดรายชื่อโครงการทั้งหมด
    this.loadProjectsList();

    // ===== Global project & customer context (navbar) =====
    effect(() => {
      const pids = this.selectedProjectIds();
      const cid = this.customerState.currentCustomerId();
      this.handleNavbarContextChange(pids, cid);
    }, { injector: this.injector });

    // รับ query params
    // IMPORTANT: this subscription must NOT drive project switching — that is the
    // effect() above's job (single source of truth: CustomerStateService). This
    // handler only deals with: which diagram tab the URL wants open, and the
    // create-from-requirement flow. Mixing the two used to cause two independent
    // state machines racing each other (the "โครงการไม่ตรงกัน" / project-mismatch
    // dialog firing spuriously, and the navbar's project checkboxes appearing stuck).
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const tabIdFromUrl = params['tabId'] || params['diagramId'] || null;
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

      if (shouldOpenCreate && this.requirementId) {
        this.pendingCreate = { requirementId: this.requirementId, requirementTitle: this.requirementTitle };
      }

      // เคลียร์ query params ที่ยาวเทอะทะออกจาก URL เพื่อให้ path สะอาด
      // (ไม่รวม projectId/projectIds/customerId ซึ่งเป็นของ context-switcher)
      const hasLongParams = !!(params['requirementTitle'] || params['requirementId'] || params['openCreate']);
      if (hasLongParams) {
        this.cleanUpUrl(tabIdFromUrl || this.currentTabId);
      }

      if (!tabIdFromUrl) return;

      if (tabIdFromUrl === this.currentTabId) return;

      if (this.tabs().some((t) => t.id === tabIdFromUrl)) {
        // Tab already loaded — switch to it.
        this.currentTabId = tabIdFromUrl;
        this.currentDiagram = null;
        this.loadedDiagramTabId = null;
        this.cleanUpUrl(tabIdFromUrl);
        if (this.drawioReady) this.loadExistingDiagram();
      } else {
        // Tabs may still be loading — remember the requested tabId for applyLoadedTabs.
        this.pendingTabIdFromUrl = tabIdFromUrl;
        if (!this.isLoadingTabs && this.tabs().length === 0) {
          this.loadTabs(tabIdFromUrl);
        }
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
    // Preserve the navbar context-switcher's own query params (projectId/projectIds/
    // customerId) — this method only strips the legacy long-form deep-link params
    // (requirementId/requirementTitle/openCreate), it must not fight the global
    // project/customer selection managed by sic-context-switcher.component.ts.
    const current = this.route.snapshot.queryParams;
    const queryParams: Record<string, any> = {};
    if (tabId) {
      queryParams['tabId'] = tabId;
    }
    if (current['projectId']) queryParams['projectId'] = current['projectId'];
    if (current['projectIds']) queryParams['projectIds'] = current['projectIds'];
    if (current['customerId']) queryParams['customerId'] = current['customerId'];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  // ===== Tabs Management =====
  private tabsLoadToken = 0;
  loadTabs(preferredTabId?: string | null, openCreateAfterLoad: boolean = false): void {
    const myToken = ++this.tabsLoadToken;

    if (this.resolvedTabs && this.resolvedTabsProjectId === this.projectId) {
      const tabs = this.resolvedTabs;
      this.resolvedTabs = null;
      this.resolvedTabsProjectId = null;
      this.applyLoadedTabs(tabs, preferredTabId, openCreateAfterLoad);
      return;
    }

    this.isLoadingTabs = true;
    const filterPids = this.selectedProjectIds();
    const custId = this.customerState.getCustomerId();
    const singleProjectId = filterPids.length === 1 ? filterPids[0] : null;

    this.diagramService.getTabs(singleProjectId).subscribe({
      next: (tabs) => {
        if (myToken !== this.tabsLoadToken) return; // superseded by a newer request
        this.isLoadingTabs = false;
        let list = tabs || [];
        if (filterPids.length > 1) {
          list = list.filter((t) => t.projectId && filterPids.includes(t.projectId));
        } else if (filterPids.length === 0 && custId) {
          const customerProjectIds = this.projects()
            .filter((p) => p.customerId === custId)
            .map((p) => p.id);
          if (customerProjectIds.length > 0) {
            list = list.filter((t) => t.projectId && customerProjectIds.includes(t.projectId));
          }
        }
        this.applyLoadedTabs(list, preferredTabId, openCreateAfterLoad);
      },
      error: () => {
        if (myToken !== this.tabsLoadToken) return;
        this.isLoadingTabs = false;
        this.tabs.set([]);
        this.applyLoadedTabs([], preferredTabId, openCreateAfterLoad);
      },
    });
  }

  private applyLoadedTabs(tabs: DiagramModel[], preferredTabId?: string | null, openCreateAfterLoad: boolean = false): void {
    this.tabs.set(tabs);

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
      this.currentDiagram = null;
      this.loadedDiagramTabId = null;
      this.cleanUpUrl(null);
      if (this.drawioReady) {
        this.drawioService.loadXml('');
      }
      if (openCreateAfterLoad || this.pendingCreate) {
        const reqId = this.pendingCreate?.requirementId || this.requirementId || '';
        const reqTitle = this.pendingCreate?.requirementTitle || this.requirementTitle || '';
        this.openCreateDialogWithRequirement(reqId, reqTitle);
        this.pendingCreate = null;
      }
    }
  }

  createDefaultTab(): void {
    const targetProjId = this.projectId || (this.projects().length > 0 ? this.projects()[0].id : null);
    if (!targetProjId) return;
    const reqId = this.requirementId || this.route.snapshot.queryParams['requirementId'] || '';
    const reqTitle = this.requirementTitle || this.route.snapshot.queryParams['requirementTitle'] || '';

    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: targetProjId,
        editData: null,
        selectedRequirementId: reqId,
        requirementTitle: reqTitle,
        onSave: (name: string, type: string, editData: DiagramEditData | undefined, reqId: string, flowId?: string, diagramCode?: string, attachmentGroupId?: string) => {
          this.diagramService.createTab(targetProjId, name, type as any, '', reqId, diagramCode, attachmentGroupId).subscribe({
            next: (newTab) => {
              this.tabs.update((t) => [...t, newTab]);
              this.switchTab(newTab.id);
              this.dialogService.success(this.translate.instant('PMDT05_CREATE_SUCCESS_TITLE'), this.translate.instant('PMDT05_CREATE_SUCCESS_MSG').replace('{0}', name));
            },
            error: (err) => {
              this.dialogService.error(this.translate.instant('PMDT05_CREATE_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT05_GENERIC_ERROR'));
            },
          });
        },
      },
    });
  }

  createNewTab(): void {
    const targetProjId = this.projectId || (this.projects().length > 0 ? this.projects()[0].id : null);
    if (!targetProjId) {
      this.dialogService.warn(
        this.translate.instant('PMDT05_NO_PROJECT_TITLE') || 'แจ้งเตือน',
        this.translate.instant('PMDT05_NO_PROJECT_DESC') || 'กรุณาสร้างหรือเลือกโครงการก่อนสร้างไดอะแกรม'
      );
      return;
    }
    const reqId = this.requirementId || this.route.snapshot.queryParams['requirementId'] || '';
    const reqTitle = this.requirementTitle || this.route.snapshot.queryParams['requirementTitle'] || '';

    this.dialogService.open({
      type: 'confirm',
      component: NewDiagramDialogComponent,
      componentInputs: {
        projectId: targetProjId,
        editData: null,
        selectedRequirementId: reqId,
        requirementTitle: reqTitle,
        onSave: (name: string, type: string, editData: DiagramEditData | undefined, reqId: string, flowId?: string, diagramCode?: string, attachmentGroupId?: string) => {
          this.diagramService.createTab(targetProjId, name, type as any, '', reqId, diagramCode, attachmentGroupId).subscribe({
            next: (newTab) => {
              this.tabs.update((t) => [...t, newTab]);
              this.switchTab(newTab.id);
              this.dialogService.success(this.translate.instant('PMDT05_CREATE_SUCCESS_TITLE'), this.translate.instant('PMDT05_CREATE_SUCCESS_MSG').replace('{0}', name));
            },
            error: (err) => {
              this.dialogService.error(this.translate.instant('PMDT05_CREATE_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT05_GENERIC_ERROR'));
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
        onSave: (name: string, type: string, editData: DiagramEditData | undefined, reqId: string, flowId?: string, diagramCode?: string, attachmentGroupId?: string) => {
          this.diagramService.createTab(this.projectId!, name, type as any, '', reqId, diagramCode, attachmentGroupId).subscribe({
            next: (newTab) => {
              this.tabs.update((t) => [...t, newTab]);
              this.switchTab(newTab.id);
              this.dialogService.success(this.translate.instant('PMDT05_CREATE_SUCCESS_TITLE'), this.translate.instant('PMDT05_CREATE_SUCCESS_MSG').replace('{0}', name));
            },
            error: (err) => {
              this.dialogService.error(this.translate.instant('PMDT05_CREATE_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT05_GENERIC_ERROR'));
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
      diagramCode: tab.diagramCode,
      attachmentGroupId: tab.attachmentGroupId,
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
        // Fall back to the tab's own projectId when showing "all" diagrams (no navbar
        // project selected), since this.projectId may be null in that state.
        projectId: this.projectId || tab.projectId,
        editData: editData,
        selectedRequirementId: tab.requirementId || '',
        requirementTitle: tab.requirementTitle || '',
        onSave: (name: string, type: string, data: DiagramEditData | undefined, reqId: string, flowId?: string, diagramCode?: string, attachmentGroupId?: string) => {
          if (!data) return;
          const updatedTab = {
            ...tab,
            attachmentGroupId: attachmentGroupId || tab.attachmentGroupId,
            name: name,
            diagramType: type,
            diagramCode: diagramCode || undefined,
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
                    documentCode: res.diagramCode || ('DIAG-' + res.id.substring(0, 8).toUpperCase()),
                    documentTitle: res.name || 'Diagram Document',
                    version: res.version || tab.version || 'v1.0.0',
                    flowId: flowId,
                    comment: this.translate.instant('PMDT05_SUBMIT_APPROVAL_COMMENT'),
                  })
                  .subscribe({
                    next: () => {
                      this.dialogService.success(this.translate.instant('PMDT05_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT05_UPDATE_SUCCESS_MSG').replace('{0}', res.name));
                      this.loadTabs();
                    },
                    error: (err) => {
                      this.dialogService.success(this.translate.instant('PMDT05_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT05_UPDATE_SUCCESS_MSG').replace('{0}', res.name));
                      this.loadTabs();
                    }
                  });
              } else {
                this.tabs.update((t) => t.map((item) => (item.id === res.id ? res : item)));
                if (this.currentTabId === tabId) this.currentDiagram = res;
                this.dialogService.success(this.translate.instant('PMDT05_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT05_UPDATE_SUCCESS_MSG').replace('{0}', res.name));
              }
            },
            error: (err) => {
              this.dialogService.error(this.translate.instant('PMDT05_SAVE_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT05_GENERIC_ERROR'));
            },
          });
        },
      },
    });
  }

  private parsePagesFromXml(xml: string): { pageIndex: number; pageName: string }[] {
    if (!xml) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const diagramEls = doc.getElementsByTagName('diagram');
      const pages: { pageIndex: number; pageName: string }[] = [];
      for (let i = 0; i < diagramEls.length; i++) {
        const name = diagramEls[i].getAttribute('name') || `Page ${i + 1}`;
        pages.push({ pageIndex: i, pageName: name });
      }
      return pages;
    } catch {
      return [];
    }
  }

  private async captureAllPages(xml: string, scale = 2): Promise<{ pageIndex: number; pageName: string; png: string }[]> {
    const pagesInfo = this.parsePagesFromXml(xml);
    if (pagesInfo.length <= 1) {
      const png = await this.drawioService.exportPagePng(0, scale, 3500);
      return [{ pageIndex: 0, pageName: pagesInfo[0]?.pageName || 'Page-1', png: png || '' }];
    }
    const results: { pageIndex: number; pageName: string; png: string }[] = [];
    for (const p of pagesInfo) {
      const png = await this.drawioService.exportPagePng(p.pageIndex, scale, 3500);
      results.push({ pageIndex: p.pageIndex, pageName: p.pageName, png: png || '' });
    }
    return results;
  }

  async exportPdf(): Promise<void> {
    const id = this.currentTabId;
    if (!id) return;
    const tab = this.tabs().find((t) => t.id === id);
    const xml = this.lastSavedXml || tab?.graphData?.xml || '';
    const pagesInfo = this.parsePagesFromXml(xml);

    let capturedPages: { pageIndex: number; pageName: string; png: string }[] = [];
    let singleImage: string | null = null;

    if (pagesInfo.length > 1) {
      capturedPages = await this.captureAllPages(xml, 2);
      singleImage = capturedPages[0]?.png || null;
    } else {
      singleImage = await this.drawioService.exportPagePng(0, 2, 3500);
    }

    this.diagramService.exportPdf(id, singleImage, capturedPages.length > 1 ? capturedPages : undefined).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        if (!window.open(url, '_blank')) {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.click();
        }
      },
      error: () =>
        this.dialogService.error(this.translate.instant('PMDT06_PRINT_FAIL_TITLE'), this.translate.instant('PMDT05_GENERIC_ERROR')),
    });
  }


  isRenderingAll = false;
  renderingProgress = '';

  private waitEvent<T>(obs$: Observable<T>, timeoutMs: number, predicate?: (val: T) => boolean): Promise<T | null> {
    return new Promise((resolve) => {
      let resolved = false;
      const sub = obs$.subscribe({
        next: (val) => {
          if (!resolved && (!predicate || predicate(val))) {
            resolved = true;
            clearTimeout(timer);
            sub.unsubscribe();
            resolve(val);
          }
        },
        error: () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            sub.unsubscribe();
            resolve(null);
          }
        },
      });
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          sub.unsubscribe();
          resolve(null);
        }
      }, timeoutMs);
    });
  }

  private async renderDiagramTab(
    tab: DiagramModel
  ): Promise<{ xml?: string; png?: string; pages?: { pageIndex: number; pageName: string; png: string }[] } | null> {
    const hasXml = !!(tab.graphData?.xml && tab.graphData.xml.trim().length > 0);
    const hasMermaid = !!(tab.mermaidScript && tab.mermaidScript.trim().length > 0);

    if (!hasXml && !hasMermaid) {
      return null;
    }

    if (hasXml) {
      const loadedPromise = this.waitEvent(this.drawioService.loaded$, 2500);
      this.drawioService.loadXml(tab.graphData.xml, true);
      await loadedPromise;
    } else if (hasMermaid) {
      const loadedPromise = this.waitEvent(this.drawioService.loaded$, 2500);
      this.drawioService.loadXml(this.drawioService.getEmptyDiagramXml(), true);
      await loadedPromise;

      const mermaidPromise = this.waitEvent(
        this.drawioService.mermaid$,
        4000,
        (res: any) => res?.stage === 'inserted' || res?.stage === 'error'
      );
      this.drawioService.insertMermaid(tab.mermaidScript, 'replace');
      await mermaidPromise;
    }

    await new Promise((r) => setTimeout(r, 300));

    const xmlContent = (hasXml ? tab.graphData.xml : await this.waitEvent(this.drawioService.xml$, 2500)) || this.drawioService.getEmptyDiagramXml();
    const pagesInfo = this.parsePagesFromXml(xmlContent);
    let pagesList: { pageIndex: number; pageName: string; png: string }[] | undefined = undefined;
    let png: string | null = null;
    if (pagesInfo.length > 1) {
      pagesList = await this.captureAllPages(xmlContent, 2);
      png = pagesList[0]?.png || null;
    } else {
      png = await this.drawioService.exportPagePng(0, 2, 3500);
    }

    if (!png && (!pagesList || pagesList.length === 0)) return null;

    return {
      xml: xmlContent,
      png: png || (pagesList ? pagesList[0].png : ''),
      pages: pagesList,
    };
  }

  async exportAllPdf(): Promise<void> {
    if (this.isRenderingAll) return;

    const projId = this.projectId || this.activeProjectId() || this.currentTab?.projectId;
    if (!projId) {
      this.dialogService.warn(
        this.translate.instant('PMDT06_PRINT_FAIL_TITLE'),
        this.translate.instant('PMDT05_SELECT_PROJECT_WARNING') || 'กรุณาเลือกโครงการก่อนพิมพ์รายงาน'
      );
      return;
    }

    const allTabs = this.tabs();
    if (allTabs.length === 0) return;

    const originalTabId = this.currentTabId;

    // หาแท็บอื่นที่ยังไม่มีรูปภาพ PNG ใน DB (ไม่รวมแท็บที่เปิดอยู่ ซึ่ง Draw.io จะ capture สดได้เลย)
    const missingTabs = allTabs.filter(
      (t) => (!t.graphData?.png || t.graphData.png.trim().length === 0) && t.id !== originalTabId
    );

    if (missingTabs.length > 0) {
      this.isRenderingAll = true;
      try {
        for (let i = 0; i < missingTabs.length; i++) {
          const tab = missingTabs[i];
          this.renderingProgress =
            this.translate.instant('PMDT05_RENDERING_DIAGRAM_PROGRESS', {
              current: i + 1,
              total: missingTabs.length,
              name: tab.name,
            }) || `กำลังเตรียมรูปภาพ (${i + 1}/${missingTabs.length}): ${tab.name}`;

          try {
            const res = await this.renderDiagramTab(tab);
            if (res && res.png) {
              const updatedTab = {
                ...tab,
                graphData: { xml: res.xml, png: res.png, ...(res.pages ? { pages: res.pages } : {}) },
                state: 3,
                rowVersion: tab.rowVersion ?? null,
              };
              const saved = await firstValueFrom(this.diagramService.updateTab(updatedTab as any));
              this.tabs.update((items) => items.map((item) => (item.id === saved.id ? saved : item)));
            }
          } catch (e) {
            console.warn(`[BatchRender] Error rendering tab ${tab.name}:`, e);
          }
        }
      } finally {
        this.isRenderingAll = false;
        this.renderingProgress = '';
        if (originalTabId) {
          this.loadedDiagramTabId = null;
          this.currentTabId = originalTabId;
          this.loadExistingDiagram();
        }
      }
    }

    const currentTabId = this.currentTabId || undefined;
    const currentXml = this.lastSavedXml || this.currentDiagram?.graphData?.xml || '';
    const currentPages = this.parsePagesFromXml(currentXml);
    const captureCurrent = currentPages.length > 1
      ? this.captureAllPages(currentXml, 2)
      : this.drawioService.exportPagePng(0, 2, 3500).then((p) => (p ? [{ pageIndex: 0, pageName: 'Page-1', png: p }] : []));

    captureCurrent.then(async (pagesRes) => {
      const firstPng = pagesRes[0]?.png || null;
      if (pagesRes.length > 1 && this.currentDiagram) {
        try {
          const updatedCurrent = {
            ...this.currentDiagram,
            graphData: { ...this.currentDiagram.graphData, pages: pagesRes, png: firstPng },
            state: 3,
            rowVersion: this.currentDiagram.rowVersion ?? null,
          };
          const saved = await firstValueFrom(this.diagramService.updateTab(updatedCurrent as any));
          this.tabs.update((items) => items.map((item) => (item.id === saved.id ? saved : item)));
        } catch (e) {
          console.warn('[ExportAll] Could not update current diagram pages:', e);
        }
      }

      this.diagramService.exportAllPdf(projId, currentTabId, firstPng).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          if (!window.open(url, '_blank')) {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.click();
          }
        },
        error: () =>
          this.dialogService.error(
            this.translate.instant('PMDT06_PRINT_FAIL_TITLE'),
            this.translate.instant('PMDT05_GENERIC_ERROR')
          ),
      });
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
      this.dialogService.warn(this.translate.instant('PMDT05_LOCKED_TITLE'), this.translate.instant('PMDT05_LOCKED_DELETE_MSG'));
      return;
    }
    this.dialogService
      .confirm(this.translate.instant('PMDT05_DELETE_TAB_CONFIRM_TITLE'), this.translate.instant('PMDT05_DELETE_TAB_CONFIRM_MSG').replace('{0}', tab.name))
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
            this.dialogService.success(this.translate.instant('PMDT05_DELETED_TITLE'), this.translate.instant('PMDT05_TAB_DELETED_MSG').replace('{0}', tab.name));
          },
          error: (err) => {
            console.error('Failed to delete tab:', err);
            this.dialogService.error(this.translate.instant('PMDT05_FAILED_TITLE'), err.error?.message || this.translate.instant('PMDT05_DELETE_TAB_FAIL_MSG'));
          },
        });
      });
  }

  requestChangeForCurrentTab(): void {
    const tab = this.tabs().find((t) => t.id === this.currentTabId);
    if (!tab) return;
    let title = tab.name;
    if (tab.diagramCode) {
      title = `[${tab.diagramCode}] ${tab.name}`;
    }
    if (tab.diagramType) {
      title += ` (${tab.diagramType})`;
    }
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        // Fall back to the tab's own projectId when showing "all" diagrams (no navbar
        // project selected), since this.projectId may be null in that state.
        projectId: this.projectId || tab.projectId,
        targetType: 'DIAGRAM',
        targetId: tab.id,
        targetTitle: title,
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
      error: () => (this.projectName = this.translate.instant('PMDT05_UNKNOWN_PROJECT')),
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
      if (this.drawioReady) {
        this.drawioService.loadXml('');
      }
      return;
    }

    const myToken = ++this.diagramLoadToken;
    this.isLoadingDiagram = true;
    this.isLoading = true;
    const tabIdToLoad = this.currentTabId;
    console.log('[Diagram] Loading diagram:', tabIdToLoad);

    this.diagramService.getDiagram(tabIdToLoad).subscribe({
      next: (diagram) => {
        if (myToken !== this.diagramLoadToken) return;
        this.isLoading = false;
        this.isLoadingDiagram = false;

        if (this.currentTabId !== tabIdToLoad) {
          if (this.currentTabId && this.loadedDiagramTabId !== this.currentTabId) {
            this.loadExistingDiagram();
          }
          return;
        }

        this.currentDiagram = diagram;
        this.loadedDiagramTabId = tabIdToLoad;
        let xml = diagram.graphData?.xml || this.drawioService.getEmptyDiagramXml();
        xml = this.ensureValidDrawioXml(xml);
        console.log('[Diagram] XML length after validation:', xml.length);
        this.lastSavedXml = xml;
        // diagram ที่มีแต่ Mermaid (ยังไม่เคยมี XML เช่น สร้างจาก AI pipeline) → รอ draw.io โหลดหน้าเปล่าเสร็จ แล้วให้มันแปลง Mermaid วาดให้เอง
        if (!diagram.graphData?.xml && diagram.mermaidScript?.trim()) {
          this.drawioService.loaded$
            .pipe(take(1), takeUntil(this.destroy$))
            .subscribe(() => this.drawioService.insertMermaid(diagram.mermaidScript, 'replace'));
        }
        this.drawioService.loadXml(xml, true);
      },
      error: (err) => {
        if (myToken !== this.diagramLoadToken) return;
        console.error('[Diagram] Failed to load diagram:', err);
        this.isLoading = false;
        this.isLoadingDiagram = false;
        if (this.currentTabId !== tabIdToLoad) {
          if (this.currentTabId && this.loadedDiagramTabId !== this.currentTabId) {
            this.loadExistingDiagram();
          }
          return;
        }
        this.drawioService.loadXml(this.drawioService.getEmptyDiagramXml(), true);
        this.dialogService.error(this.translate.instant('PMDT05_LOAD_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT05_GENERIC_ERROR'));
      },
    });
  }

  // ===== Save (Manual) =====
  saveDiagram(): void {
    if (!this.currentTabId) {
      this.dialogService.warn(this.translate.instant('PMDT05_NO_DIAGRAM_TITLE'), this.translate.instant('PMDT05_NO_DIAGRAM_SAVE_MSG'));
      return;
    }
    // ขอ XML ล่าสุดจาก Draw.io
    this.drawioService.requestXml();
    // รอ XML แล้วบันทึกทันที (ใช้ take(1) เพื่อรับครั้งเดียว)
    this.drawioService.xml$.pipe(take(1), takeUntil(this.destroy$)).subscribe((xml: string) => {
      if (!xml || xml.trim().length === 0) {
        this.dialogService.warn(this.translate.instant('PMDT05_EMPTY_DIAGRAM_TITLE'), this.translate.instant('PMDT05_EMPTY_DIAGRAM_MSG'));
        return;
      }
      const normalized = this.ensureValidDrawioXml(xml);
      // บันทึกทันทีโดยไม่รอ auto-save
      this.autoSaveDiagram(normalized, true); // ส่ง flag manual=true
    });
  }

  // ===== Auto‑Save (Internal) =====
  private autoSaveDiagram(xml: string, manual: boolean = false): void {
    if (this.isRenderingAll) return;
    if (this.saving) {
      if (manual) {
        this.dialogService.warn(this.translate.instant('PMDT05_SAVING_TITLE'), this.translate.instant('PMDT05_SAVING_MSG'));
      }
      return;
    }

    if (!this.currentTabId) {
      return;
    }

    if (this.currentTabLocked) {
      if (manual) {
        this.dialogService.warn(this.translate.instant('PMDT05_LOCKED_TITLE'), this.translate.instant('PMDT05_LOCKED_SAVE_MSG'));
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

    // ถ้ายังไม่มี requirementId ให้แจ้งเตือนและไม่บันทึก (ยกเว้น diagram ระดับระบบที่สร้างจาก Mermaid/AI pipeline ซึ่งผูกกับ requirement ผ่าน related ids อยู่แล้ว)
    if (!requirementId && !this.currentDiagram?.mermaidScript?.trim()) {
      console.warn('[AutoSave] No requirementId found for this diagram, cannot save.');
      if (manual) {
        this.dialogService.warn(this.translate.instant('PMDT05_MISSING_REQ_TITLE'), this.translate.instant('PMDT05_MISSING_REQ_MSG'));
      }
      return;
    }

    this.saving = true;
    const pagesInfo = this.parsePagesFromXml(xml);
    if (pagesInfo.length > 1) {
      this.captureAllPages(xml, 1).then((pages) => {
        this.persistDiagram(diagram, xml, pages[0]?.png || null, requirementId, manual, pages);
      });
    } else {
      this.capturePng(1, (png) => this.persistDiagram(diagram, xml, png, requirementId, manual));
    }
  }

  /** ขอ PNG จาก draw.io (รอสูงสุด 3 วิ ไม่ตอบ = null) */
  private capturePng(scale: number, cb: (png: string | null) => void): void {
    let done = false;
    const finish = (png: string | null) => {
      if (done) return;
      done = true;
      sub.unsubscribe();
      clearTimeout(timer);
      cb(png);
    };
    const sub = this.drawioService.png$.pipe(take(1)).subscribe((png) => finish(png));
    const timer = setTimeout(() => finish(null), 3000);
    this.drawioService.requestPng(scale);
  }

  private persistDiagram(diagram: any, xml: string, png: string | null, requirementId: string, manual: boolean, pages?: any[]): void {
    const graphData: any = { xml, png: png ?? diagram.graphData?.png };
    if (pages && pages.length > 0) {
      graphData.pages = pages;
    } else if (diagram.graphData?.pages) {
      graphData.pages = diagram.graphData.pages;
    }
    const updatedTab = {
      ...diagram,
      graphData,
      requirementId: requirementId || undefined, // ส่ง requirementId ไปด้วย
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
        this.autoSaveStatus = manual ? this.translate.instant('PMDT05_SAVED_MANUALLY').replace('{0}', now) : this.translate.instant('PMDT05_AUTO_SAVED').replace('{0}', now);
        this.saving = false;
        if (manual) {
          this.dialogService.success(this.translate.instant('PMDT05_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT05_SAVE_SUCCESS_MSG'));
        }
      },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.message || this.translate.instant('PMDT05_GENERIC_ERROR');
        this.autoSaveStatus = this.translate.instant('PMDT05_SAVE_FAILED_STATUS');
        if (manual) {
          this.dialogService.error(this.translate.instant('PMDT05_SAVE_FAIL_TITLE'), msg);
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
      this.dialogService.warn(this.translate.instant('PMDT05_NO_DIAGRAM_TITLE'), this.translate.instant('PMDT05_OPEN_DIAGRAM_FIRST_MSG'));
      return;
    }
    this.isLoading = true;
    this.drawioService.requestXml();
    this.drawioService.xml$.pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (xml: any) => {
        this.isLoading = false;
        if (!xml || xml.trim().length === 0) {
          this.dialogService.warn(this.translate.instant('PMDT05_EMPTY_DIAGRAM_TITLE'), this.translate.instant('PMDT05_DRAW_ER_FIRST_MSG'));
          return;
        }
        this.dialogService.open({
          type: 'confirm',
          component: SqlExportDialogComponent,
          componentInputs: { 
            xml,
            tabId: this.currentTabId 
          },
        });
      },
      error: () => {
        this.isLoading = false;
        this.dialogService.error(this.translate.instant('PMDT05_ERROR_TITLE'), this.translate.instant('PMDT05_GET_XML_FAIL_MSG'));
      },
    });
  }

  createTraceLink(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    relationshipType: TraceRelationshipType
  ): void {
    if (!this.projectId) {
      console.warn('No projectId, cannot create trace link');
      return;
    }
    this.traceLinkService
      .createLink({
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

  // ===== Projects Management =====
  loadProjectsList(): void {
    this.pmrt02Service.getProjects({ page: 0, size: 50, sortBy: 'createdDate', sortDir: 'desc' }).subscribe({
      next: (res: any) => {
        const list: PmCustomerProject[] = res?.data || [];
        this.projects.set(list);
        if (list.length === 0) {
          this.noProjectsAvailable.set(true);
          return;
        }
        this.noProjectsAvailable.set(false);

        // อัปเดตชื่อโครงการปัจจุบัน (ถ้ามีโครงการที่ active อยู่แล้ว จาก URL หรือ navbar)
        if (this.projectId) {
          const curr = list.find((p) => p.id === this.projectId);
          if (curr) {
            this.projectName = curr.projectName;
          }
        }
      },
      error: (err: any) => {
        console.error('Failed to load projects list for diagram:', err);
      },
    });
  }

  // Called whenever the navbar's selected projects or customer changes.
  // When no customer or projects are selected: shows ALL diagrams across all projects.
  // When customer is selected: filters to that customer's projects/diagrams.
  // When specific projects are selected: filters to those projects.
  private lastContextKey = '';
  private navProjectInitialized = false;

  private handleNavbarContextChange(pids: string[], customerId: string | null): void {
    const currentKey = `${customerId || ''}__${JSON.stringify(pids)}`;
    if (this.navProjectInitialized && currentKey === this.lastContextKey) return;
    this.navProjectInitialized = true;
    this.lastContextKey = currentKey;

    const singleProjectId = pids.length === 1 ? pids[0] : null;
    this.projectId = singleProjectId;

    const custName = this.customerState.getCustomerName();

    if (pids.length === 1) {
      const proj = this.projects().find((p) => p.id === singleProjectId);
      if (proj) {
        this.projectName = proj.projectName;
      } else {
        this.loadProjectName();
      }
    } else if (pids.length > 1) {
      this.projectName = custName ? `${custName} (${pids.length} โครงการ)` : `${pids.length} ${this.translate.instant('PMDT05_PROJECTS_SELECTED') || 'โครงการที่เลือก'}`;
    } else if (customerId && custName) {
      this.projectName = `ลูกค้า: ${custName}`;
    } else {
      this.projectName = this.translate.instant('PMDT05_ALL_PROJECTS') || 'ทุกโครงการ (ทั้งหมด)';
    }

    this.currentTabId = null;
    this.currentDiagram = null;
    this.loadedDiagramTabId = null;
    this.isLoadingDiagram = false;
    this.tabs.set([]);

    const preferredTabId = this.pendingTabIdFromUrl;
    this.pendingTabIdFromUrl = null;
    this.loadTabs(preferredTabId, false);
  }
}