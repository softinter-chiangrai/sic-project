import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { Pmdt19AService } from './pmdt19A/pmdt19A.service';
import { DocumentVersionModel } from './pmdt19A/pmdt19A.model';
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

  filteredVersions = signal<DocumentVersionModel[]>([]);

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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const projectId = params['projectId'] || this.customerState.getProjectId() || null;

      if (projectId) {
        this.activeProjectId.set(projectId);
        this.customerState.setProject(projectId);
      } else {
        this.activeProjectId.set(null);
      }

      const qType = params['documentType'];
      const qId = params['documentId'];
      if (qType) this.filterType.set(qType);
      if (qId) this.filterDocId.set(qId);

      if (projectId) {
        this.loadVersions();
      }
    });
  }

  loadVersions(): void {
    const projectId = this.activeProjectId();
    if (!projectId) return; // guard: ต้องมี projectId เสมอ

    this.isLoading.set(true);
    const docType = this.filterType();
    const docId = this.filterDocId() || undefined;

    this.service.getVersions(docType, docId, projectId).subscribe({
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
    const term = (this.filterDocId() || '').trim().toLowerCase();
    if (!term) {
      this.filteredVersions.set(this.versions());
    } else {
      const filtered = this.versions().filter((v) =>
        (v.documentCode && v.documentCode.toLowerCase().includes(term)) ||
        (v.versionNo && v.versionNo.toLowerCase().includes(term)) ||
        (v.changeSummary && v.changeSummary.toLowerCase().includes(term)) ||
        (v.documentId && v.documentId.toLowerCase().includes(term))
      );
      this.filteredVersions.set(filtered);
    }
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