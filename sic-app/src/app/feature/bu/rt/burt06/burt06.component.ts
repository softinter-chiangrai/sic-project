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

@Component({
  selector: 'app-burt06',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicButtonComponent, SicComboboxComponent, SicStripHtmlPipe, SicGridPanelComponent, SicGridPanelTemplate],
  templateUrl: './burt06.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './burt06.component.css',
})
export class Burt06Component implements OnInit {
  private service = inject(Burt06Service);
  private dialog = inject(DialogService);
  private router = inject(Router);

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

  readonly statusSelectOptions = [
    { value: 'active', text: 'ใช้งาน (Active)' },
    { value: 'inactive', text: 'ไม่ใช้งาน (Inactive)' },
  ];

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

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    selectable: false,
    showToolbar: false,
    pageSize: this.pageSize(),
    column: [
      { label: 'รหัส Flow', name: 'flowCode', type: 'flowCode', sortable: true, minWidth: 150 },
      { label: 'ชื่อ Flow', name: 'flowName', type: 'flowName', sortable: true, minWidth: 180 },
      { label: 'ประเภทเอกสาร', name: 'documentType', type: 'docType', sortable: true, minWidth: 130 },
      { label: 'โหมด', name: 'approvalMode', type: 'approvalMode', minWidth: 100 },
      { label: 'Steps', name: 'steps', type: 'stepsCount', align: 'center', minWidth: 60 },
      { label: 'สถานะ', name: 'active', type: 'statusBadge', sortable: true, minWidth: 80 },
      { label: 'จัดการ', name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 110 },
    ],
  };

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
    this.loadFlows();
  }

  loadFlows(): void {
    this.isLoading.set(true);
    this.service.getFlows()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.flows.set(data),
        error: () => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Approval Flow'),
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
      'ยืนยันการลบ',
      `คุณต้องการลบ Approval Flow "${flow.flowName}" (${flow.flowCode}) ใช่หรือไม่?`
    ).then((confirmed) => {
      if (confirmed && flow.id) {
        this.isLoading.set(true);
        this.service.deleteFlow(flow.id)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: () => {
              this.flows.update((list) => list.filter((f) => f.id !== flow.id));
              this.dialog.success('ลบสำเร็จ', `ลบ Flow "${flow.flowName}" เรียบร้อย`);
              grid.reload();
            },
            error: (err) => {
              this.dialog.error('ลบไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
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
      CHAIN: 'เรียงลำดับ',
      PARALLEL: 'พร้อมกัน',
      ANY: 'ใครก็ได้',
      SINGLE: 'คนเดียว',
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
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }
}