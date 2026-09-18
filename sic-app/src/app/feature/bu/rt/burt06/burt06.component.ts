import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { SicButtonComponent, SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { DialogService } from '../../../../core/services/dialog.service';
import { ApprovalFlow } from './burt06.model';
import { Burt06Service } from './burt06.service';


import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicStripHtmlPipe } from '../../../../core/pipes/sic-strip-html.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-burt06',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicButtonComponent, SicComboboxComponent, SicStripHtmlPipe, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './burt06.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './burt06.component.css',
})
export class Burt06Component implements OnInit {
  private service = inject(Burt06Service);
  private dialog = inject(DialogService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  isLoading = signal(false);
  flows = signal<ApprovalFlow[]>([]);

  // Pagination & Filtering state
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');
  filterDocumentType = signal('all');

  documentTypeMap: Record<string, string> = {
    REQUIREMENT: 'Requirement',
    SPECIFICATION: 'Specification',
    DFD: 'DFD',
    ER: 'ER Diagram',
    DELIVERY: 'Delivery',
    INVOICE: 'Invoice',
    MA_RENEWAL: 'MA Renewal',
    CONTRACT: 'Contract',
    CHANGE_REQUEST: 'Change Request',
    TEST_PLAN: 'Test Plan',
    UAT: 'UAT',
    USER_MANUAL: 'User Manual',
  };

  statusSelectOptions: { value: string; text: string }[] = [];

  docTypeSelectOptions = computed(() => {
    return Object.entries(this.documentTypeMap).map(([key, label]) => ({
      value: key,
      text: label,
    }));
  });

  // Filtered list
  filteredFlows = computed(() => {
    let list = this.flows();
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(
        (f) =>
          f.flowCode.toLowerCase().includes(term) ||
          f.flowName.toLowerCase().includes(term) ||
          (f.description && f.description.toLowerCase().includes(term)),
      );
    }

    const status = this.filterStatus();
    if (status === 'active') list = list.filter((f) => f.active);
    if (status === 'inactive') list = list.filter((f) => !f.active);

    const docType = this.filterDocumentType();
    if (docType !== 'all') {
      list = list.filter((f) => f.documentType === docType);
    }

    return list;
  });

  // Total items
  totalItems = computed(() => this.filteredFlows().length);

  gridConfig!: SicGridPanelConfig;

  private buildGridConfig(): SicGridPanelConfig {
    return {
      id: 'id',
      lazy: false,
      selectable: false,
      showToolbar: false,
      pageSize: this.pageSize(),
      column: [
        { label: this.translate.instant('BURT06_COL_FLOWCODE'), name: 'flowCode', type: 'flowCode', sortable: true, minWidth: 150 },
        { label: this.translate.instant('BURT06_COL_FLOWNAME'), name: 'flowName', type: 'flowName', sortable: true, minWidth: 180 },
        { label: this.translate.instant('BURT06_COL_DOCTYPE'), name: 'documentType', type: 'docType', sortable: true, minWidth: 130 },
        { label: this.translate.instant('BURT06_COL_MODE'), name: 'approvalMode', type: 'approvalMode', minWidth: 100 },
        { label: 'Steps', name: 'steps', type: 'stepsCount', align: 'center', minWidth: 60 },
        { label: this.translate.instant('BURT06_COL_STATUS'), name: 'active', type: 'statusBadge', sortable: true, minWidth: 80 },
        { label: this.translate.instant('BURT06_COL_ACTION'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 110 },
      ],
    };
  }

  // goToPage(1) no-op เงียบๆ ถ้า grid อยู่หน้า 1 อยู่แล้ว
  private reloadFromPage1(grid: SicGridPanelComponent): void {
    if (grid.currentPage === 1) {
      grid.reload();
    } else {
      grid.goToPage(1);
    }
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    const list = this.filteredFlows();
    grid.setRows(list as unknown as SicGridRowData[], { totalElements: list.length }, request.requestId);
  }

  ngOnInit(): void {
    this.statusSelectOptions = [
      { value: 'active', text: this.translate.instant('BURT06_ACTIVE_OPT') },
      { value: 'inactive', text: this.translate.instant('BURT06_INACTIVE_OPT') },
    ];
    this.gridConfig = this.buildGridConfig();
    this.loadFlows();
  }

  loadFlows(): void {
    this.isLoading.set(true);
    this.service.getFlows()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.flows.set(data),
        error: () => this.dialog.error(this.translate.instant('BURT06_LOAD_FAILED_TITLE'), this.translate.instant('BURT06_LOAD_FAILED_MSG')),
      });
  }

  openCreateForm(): void {
    this.router.navigate(['/feature/bu/approval-flow/new']);
  }

  openEditForm(flow: ApprovalFlow): void {
    this.router.navigate(['/feature/bu/approval-flow', flow.id, 'edit']);
  }

  deleteFlow(flow: ApprovalFlow, grid: SicGridPanelComponent): void {
    this.dialog.confirm(
      this.translate.instant('BURT06_CONFIRM_DELETE_TITLE'),
      this.translate.instant('BURT06_CONFIRM_DELETE_MSG', { name: flow.flowName, code: flow.flowCode })
    ).then((confirmed) => {
      if (confirmed && flow.id) {
        this.isLoading.set(true);
        this.service.deleteFlow(flow.id)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: () => {
              this.flows.update((list) => list.filter((f) => f.id !== flow.id));
              this.dialog.success(this.translate.instant('BURT06_DELETE_SUCCESS_TITLE'), this.translate.instant('BURT06_DELETE_SUCCESS_MSG', { name: flow.flowName }));
              grid.reload();
            },
            error: (err) => {
              this.dialog.error(this.translate.instant('BURT06_DELETE_FAILED_TITLE'), err.error?.message || this.translate.instant('BURT06_GENERIC_ERROR_MSG'));
            },
          });
      }
    });
  }

  // ===== Search & Filter Handlers =====
  onSearch(event: Event, grid: SicGridPanelComponent): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent): void {
    this.searchTerm.set('');
    this.reloadFromPage1(grid);
  }

  onFilterStatusChange(value: any, grid: SicGridPanelComponent): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.reloadFromPage1(grid);
  }

  onFilterDocTypeChange(value: any, grid: SicGridPanelComponent): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterDocumentType.set(val || 'all');
    this.reloadFromPage1(grid);
  }

  getApprovalModeText(mode: string): string {
    const map: Record<string, string> = {
      CHAIN: this.translate.instant('BURT06_MODE_CHAIN'),
      PARALLEL: this.translate.instant('BURT06_MODE_PARALLEL'),
      ANY: this.translate.instant('BURT06_MODE_ANY'),
      SINGLE: this.translate.instant('BURT06_MODE_SINGLE'),
    };
    return map[mode] || mode;
  }

  getDocumentTypeText(type: string): string {
    return this.documentTypeMap[type] || type;
  }

  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? this.translate.instant('BURT06_ACTIVE_TEXT') : this.translate.instant('BURT06_INACTIVE_TEXT');
  }
}