import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { skip } from 'rxjs';

import { Pmdt19AService } from './pmdt19A/pmdt19A.service';
import { DocumentVersionModel } from './pmdt19A/pmdt19A.model';
import { Pmdt19PageData } from './pmdt19.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { NavigationService } from '../../../../core/services/navigation.service';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';

import { Pmdt19ViewDialogComponent } from './pmdt19-view-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmdt19',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicDatePipe, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './pmdt19.component.html',
  styleUrls: ['./pmdt19.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt19Component implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(Pmdt19AService);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);
  private readonly navigation = inject(NavigationService);
  private readonly translate = inject(TranslateService);

  // projectId ที่ active อยู่ในขณะนี้ (required)
  activeProjectId = signal<string | null>(null);

  versions = signal<DocumentVersionModel[]>([]);
  isLoading = signal(false);

  filterType = signal<string>('ALL');
  filterDocId = signal<string>('');

  get docTypeOptions() {
    return [
      { text: this.translate.instant('PMDT19_DOCTYPE_ALL'), value: 'ALL' },
      { text: 'Requirement', value: 'REQUIREMENT' },
      { text: 'Specification', value: 'SPECIFICATION' },
      { text: 'Diagram', value: 'DIAGRAM' },
      { text: 'Design Review', value: 'DESIGN_REVIEW' },
      { text: 'Change Request', value: 'CHANGE_REQUEST' },
      { text: 'Delivery Document', value: 'DELIVERY' },
      { text: 'Contract', value: 'CONTRACT' },
      { text: 'Invoice', value: 'INVOICE' },
      { text: 'MA Ticket', value: 'MA_TICKET' },
      { text: 'MA Renewal', value: 'MA_RENEWAL' },
      { text: 'User Manual', value: 'USER_MANUAL' },
      { text: 'Project', value: 'PROJECT' },
    ];
  }

  // ===== Navbar context filter (client-side) =====
  // The resolver/loadVersions now always fetch ALL projects' versions; the navbar
  // project-context selection filters what's shown, client-side, exactly like pmdt01.
  readonly selectedProjectIds = this.customerState.currentSelectedProjectIds;

  filteredVersions = computed(() => {
    const term = (this.filterDocId() || '').trim().toLowerCase();
    let list = this.versions();

    if (term) {
      list = list.filter((v) =>
        (v.documentCode && v.documentCode.toLowerCase().includes(term)) ||
        (v.versionNo && v.versionNo.toLowerCase().includes(term)) ||
        (v.changeSummary && v.changeSummary.toLowerCase().includes(term)) ||
        (v.documentId && v.documentId.toLowerCase().includes(term)) ||
        (v.createdBy && v.createdBy.toLowerCase().includes(term))
      );
    }

    const ids = this.selectedProjectIds();
    if (ids && ids.length > 0) {
      const idSet = new Set(ids);
      list = list.filter((v) => v.projectId && idSet.has(v.projectId));
    }

    return list;
  });

  // ===== Pagination State =====
  currentPage = signal(0);
  pageSize = signal(10);
  get pageSizeOptions() {
    return [
      { text: '10 ' + this.translate.instant('PMDT19_ITEMS_PER_PAGE'), value: 10 },
      { text: '20 ' + this.translate.instant('PMDT19_ITEMS_PER_PAGE'), value: 20 },
      { text: '50 ' + this.translate.instant('PMDT19_ITEMS_PER_PAGE'), value: 50 },
      { text: '100 ' + this.translate.instant('PMDT19_ITEMS_PER_PAGE'), value: 100 },
    ];
  }

  totalItems = computed(() => this.filteredVersions().length);

  @ViewChild('grid') gridRef?: SicGridPanelComponent;

  get gridConfig(): SicGridPanelConfig {
    return {
      id: 'id',
      lazy: false,
      selectable: false,
      showToolbar: false,
      pageSizeOptions: [10, 20, 50, 100],
      column: [
        { label: this.translate.instant('PMDT19_COL_VERSION'), name: 'versionNo', type: 'versionInfo', minWidth: 100 },
        { label: this.translate.instant('PMDT19_COL_DOC_TYPE'), name: 'documentType', type: 'docTypeTag', minWidth: 130 },
        { label: this.translate.instant('PMDT19_COL_DOC_CODE'), name: 'documentCode', type: 'text', minWidth: 130 },
        { label: this.translate.instant('PMDT19_COL_CHANGE_SUMMARY'), name: 'changeSummary', type: 'summaryText', minWidth: 180 },
        { label: this.translate.instant('PMDT19_COL_CREATED_BY'), name: 'createdBy', type: 'createdByInfo', minWidth: 120 },
        { label: this.translate.instant('PMDT19_COL_CREATED_DATE'), name: 'createdDate', type: 'dateText', minWidth: 140 },
        { label: this.translate.instant('PMDT19_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 110 },
      ],
    };
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    const list = this.filteredVersions();
    grid.setRows(list as unknown as SicGridRowData[], { totalElements: list.length }, request.requestId);
  }

  constructor() {
    // Keep the grid in sync whenever the navbar project selection changes,
    // without refetching from the server.
    effect(() => {
      this.selectedProjectIds();
      if (!this.gridRef) return;
      if (this.gridRef.currentPage === 1) {
        this.gridRef.reload();
      } else {
        this.gridRef.goToPage(1);
      }
    });
  }

  ngOnInit(): void {
    // Initial data comes from the resolver (real service call) — no fetch here.
    const page = this.route.snapshot.data['pageData'] as Pmdt19PageData;
    this.activeProjectId.set(page.projectId);
    this.filterType.set(page.filterType || 'ALL');
    this.filterDocId.set(page.filterDocId || '');
    this.versions.set(page.items || []);
    this.applyFilter();

    // Subsequent navigations to the same route instance (e.g. documentType/documentId
    // query param changes) are handled reactively; skip(1) avoids re-fetching the data
    // the resolver already loaded. projectId is kept only to preselect the project when
    // creating a new version from context / for goBack() — it no longer triggers a
    // server refetch (the navbar context-switcher filters client-side instead).
    this.route.queryParams.pipe(skip(1)).subscribe((params) => {
      const projectId = params['projectId'] || null;
      this.activeProjectId.set(projectId);

      const qType = params['documentType'];
      const qId = params['documentId'];
      let needsReload = false;
      if (qType && qType !== this.filterType()) {
        this.filterType.set(qType);
        needsReload = true;
      }
      if (qId && qId !== this.filterDocId()) {
        this.filterDocId.set(qId);
        needsReload = true;
      }

      if (needsReload) {
        this.loadVersions();
      }
    });
  }

  loadVersions(): void {
    this.isLoading.set(true);
    const docType = this.filterType();
    const docId = this.filterDocId() || undefined;

    // Always fetch ALL projects' versions; the navbar context-switcher filters
    // client-side via filteredVersions().
    this.service.getVersions(docType, docId).subscribe({
      next: (list) => {
        this.versions.set(list || []);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(): void {
    this.currentPage.set(0);
    if (this.gridRef?.currentPage === 1) {
      this.gridRef?.reload();
    } else {
      this.gridRef?.goToPage(1);
    }
  }

  onTypeChange(type: any): void {
    const val = type !== undefined && type !== null ? (typeof type === 'object' && type.target ? type.target.value : type) : 'ALL';
    this.filterType.set(val || 'ALL');
    this.currentPage.set(0);
    this.loadVersions();
  }

  onDocIdChange(docId: string): void {
    this.filterDocId.set(docId);
    this.applyFilter();
  }

  onViewContent(ver: DocumentVersionModel): void {
    this.dialog.open({
      type: 'info',
      title: this.translate.instant('PMDT19_VIEW_CONTENT_TITLE') + ' ' + ver.versionNo,
      component: Pmdt19ViewDialogComponent,
      componentInputs: {
        version: ver,
      },
    });
  }

  onActivate(id: string): void {
    this.dialog.confirm(this.translate.instant('PMDT19_CONFIRM_TITLE'), this.translate.instant('PMDT19_CONFIRM_ACTIVATE_MSG')).then((confirmed: boolean) => {
      if (confirmed) {
        this.service.activateVersion(id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT19_SUCCESS_TITLE'), this.translate.instant('PMDT19_ACTIVATE_SUCCESS_MSG'));
            this.loadVersions();
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT19_ERROR_TITLE'), err.message || this.translate.instant('PMDT19_ACTIVATE_ERROR_MSG'));
          },
        });
      }
    });
  }

  onDelete(id: string): void {
    this.dialog.confirm(this.translate.instant('PMDT19_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT19_CONFIRM_DELETE_MSG')).then((confirmed: boolean) => {
      if (confirmed) {
        this.service.deleteVersion(id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT19_SUCCESS_TITLE'), this.translate.instant('PMDT19_DELETE_SUCCESS_MSG'));
            this.loadVersions();
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT19_ERROR_TITLE'), err.message || this.translate.instant('PMDT19_DELETE_ERROR_MSG'));
          },
        });
      }
    });
  }

  goToAdd(): void {
    const projectId = this.activeProjectId();
    this.router.navigate(['/feature/pm/version/new'], {
      queryParams: {
        documentType: this.filterType(),
        documentId: this.filterDocId(),
        ...(projectId ? { projectId } : {}),
      },
    });
  }

  goBack(): void {
    const projectId = this.activeProjectId() || this.customerState.getProjectId();
    this.router.navigate(['/feature/pm/project-dashboard'], {
      queryParams: { projectId: projectId || undefined }
    });
  }
}

export default Pmdt19Component;