// src/app/feature/pm/rt/pmrt04/pmrt04.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { ApprovalService } from '../../dt/pmdt03/approval.service';
import { Pmrt02Service } from '../pmrt02/pmrt02.service';
import { Pmrt04Service } from './pmrt04.service';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { Contract } from './pmrt04.model';
import { NavigationService } from '../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { RecentItemsService } from '../../../../core/services/recent-items.service';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDrawerComponent } from '../../../../core/component/sic-drawer/sic-drawer.component';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';

@Component({
  selector: 'app-pmrt04',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, SicDrawerComponent],
  templateUrl: './pmrt04.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt04Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private dialog = inject(DialogService);
  private projectService = inject(Pmrt02Service);
  private contractService = inject(Pmrt04Service);
  private approvalService = inject(ApprovalService);
  private navigation = inject(NavigationService);
  private customerState = inject(CustomerStateService);
  private recentItems = inject(RecentItemsService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected filterCustomerId = signal<string | null>(null);
  protected filterCustomerName = signal<string>('');
  protected filterProjectId = signal<string | null>(null);
  protected filterProjectName = signal<string>('');
  protected filterProjectCode = signal<string>('');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('contractNo');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected contracts = signal<Contract[]>([]);
  protected totalItems = signal(0);
  protected contractTypes = signal<string[]>([]);

  private apiUrl = environment.apiBaseUrl + '/api/pm/contracts';

  // guard: ป้องกัน handleGridLoad ยิงซ้ำซ้อนเมื่อ navigation เกิดจาก syncFiltersToUrl() เอง
  private syncingUrl = false;

  // ===== Quick View Drawer =====
  protected showDrawer = signal(false);
  protected selectedContract = signal<Contract | null>(null);

  // ===== Preset Filter Tabs =====
  protected activePreset = signal<'all' | 'expiring'>('all');

  // ===== Bulk Selection — ใช้ selection ในตัวของ grid =====

  // ===== Column Visibility =====
  private readonly COLUMN_STORAGE_KEY = 'pmrt04.visibleColumns';
  protected readonly allColumns: { key: string; label: string }[] = [
    { key: 'contractType', label: 'ประเภท' },
    { key: 'customerName', label: 'ลูกค้า' },
    { key: 'projectName', label: 'โครงการ' },
    { key: 'contractValue', label: 'มูลค่า' },
    { key: 'duration', label: 'ระยะเวลา' },
    { key: 'approvalStatus', label: 'อนุมัติ' },
  ];
  protected visibleColumns = signal<Set<string>>(this.loadVisibleColumns());
  protected showColumnMenu = signal(false);

  @ViewChild('grid') gridRef?: SicGridPanelComponent;

  gridConfig = computed<SicGridPanelConfig>(() => {
    const visible = this.visibleColumns();
    return {
      id: 'id',
      selectable: true,
      showToolbar: false,
      defaultSortField: 'contractNo',
      pageSize: this.pageSize(),
      column: [
        { label: 'เลขสัญญา', name: 'contractNo', type: 'code', sortable: true, minWidth: 120 },
        { label: 'ประเภท', name: 'contractType', type: 'text', hidden: !visible.has('contractType'), sortable: true, minWidth: 140 },
        { label: 'ลูกค้า', name: 'customerName', type: 'text', hidden: !visible.has('customerName'), sortable: true, minWidth: 150 },
        { label: 'โครงการ', name: 'projectName', type: 'projectLink', hidden: !visible.has('projectName'), sortable: true, minWidth: 130 },
        { label: 'มูลค่า', name: 'contractValue', type: 'currencyText', hidden: !visible.has('contractValue'), sortable: true, minWidth: 120 },
        { label: 'ระยะเวลา', name: 'startDate', type: 'dateRangeText', hidden: !visible.has('duration'), minWidth: 140 },
        { label: 'สถานะ', name: 'signStatus', type: 'statusBadge', sortable: true, minWidth: 100 },
        { label: 'อนุมัติ', name: 'approvalStatus', type: 'approvalBadge', hidden: !visible.has('approvalStatus'), minWidth: 100 },
        { label: 'จัดการ', name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 180 },
      ],
    };
  });

  readonly statusSelectOptions = [
    { value: 'Draft', text: 'ฉบับร่าง' },
    { value: 'Sent', text: 'ส่งแล้ว' },
    { value: 'Signed', text: 'ลงนามแล้ว' },
    { value: 'Expired', text: 'หมดอายุ' },
  ];

  typeSelectOptions = computed(() => {
    return this.contractTypes().map((t) => ({ value: t, text: t }));
  });

  statusOptions = ['Draft', 'Sent', 'Signed', 'Changed', 'Expired'];
  signStatusOptions = ['Draft', 'Sent', 'Signed', 'Changed', 'Expired'];

  // resolver อาจ preload โครงการ+สัญญาหน้าแรกมาให้แล้ว — ใช้แทนการยิง HTTP รอบแรกใน handleGridLoad()
  private initialResolverContracts: { data: Contract[]; totalElements: number } | null = null;
  // true เมื่อรู้ customerId/ชื่อโครงการของ projectId นี้แล้ว (จาก resolver หรือ fetch เอง) — ป้องกันการยิง contracts ก่อนรู้ customerId
  private projectResolved = false;

  // ===== Lifecycle =====
  ngOnInit() {
    this.loadContractTypes();

    const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
    if (resolved && resolved.project) {
      const project = resolved.project;
      const contractsRes = resolved.contracts;
      this.filterCustomerId.set(project.customerId);
      this.filterCustomerName.set(project.customerName);
      this.filterProjectId.set(project.id);
      this.filterProjectName.set(project.projectName || '');
      this.filterProjectCode.set(project.projectCode || '');
      this.projectResolved = true;
      if (contractsRes) {
        const items = contractsRes.data || [];
        this.initialResolverContracts = { data: items, totalElements: contractsRes.pageable?.totalElements || items.length || 0 };
      }
    }

    this.route.queryParams.subscribe((params) => {
      if (this.syncingUrl) {
        this.syncingUrl = false;
        return;
      }

      if (params['q'] !== undefined) this.searchTerm.set(params['q']);
      if (params['status'] !== undefined) this.filterStatus.set(params['status']);
      if (params['type'] !== undefined) this.filterType.set(params['type']);
      if (params['page'] !== undefined) this.currentPage.set(+params['page'] || 1);
      if (params['preset'] !== undefined) this.activePreset.set(params['preset'] === 'expiring' ? 'expiring' : 'all');

      const projectId = params['projectId'] || this.customerState.getProjectId();

      if (projectId) {
        this.filterProjectId.set(projectId);
        this.customerState.setProject(projectId);
        if (!resolved || !resolved.project) {
          this.projectResolved = false;
        }
      } else {
        this.filterProjectId.set(null);
        this.projectResolved = true;
      }

      // ข้ามรอบแรก: grid จะ mount และยิง loadData เองอัตโนมัติ — รอบถัดไปจาก URL เปลี่ยนต้อง reload เอง
      if (this.gridRef) {
        this.gridRef.reload();
      }
    });
  }

  // ===== Load Data =====
  loadContractTypes() {
    this.contractTypes.set([
      'Development Contract',
      'Maintenance Contract',
      'Support Contract',
      'Change Request Contract',
      'Extension Contract',
    ]);
  }

  loadApprovalStatuses(contracts: Contract[], grid: SicGridPanelComponent, requestId: number): void {
    contracts.forEach((contract) => {
      if (!contract.id) return;
      this.approvalService.getDocumentStatus('CONTRACT', contract.id).subscribe({
        next: (approval) => {
          this.contracts.update((list) =>
            list.map((item) =>
              item.id === contract.id ? { ...item, approvalStatus: approval.status } : item,
            ),
          );
          grid.setRows(this.contracts() as unknown as SicGridRowData[], { totalElements: this.totalItems() }, requestId);
        },
        error: () => {
          // ไม่มีสถานะอนุมัติ ปล่อย null
        },
      });
    });
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    const projectId = this.filterProjectId();

    // ยังไม่รู้ customerId ของโครงการนี้ — ต้อง fetch project ก่อนค่อยโหลด contracts (customerId เป็น query param)
    if (!this.projectResolved && projectId) {
      this.isLoading.set(true);
      this.projectService.getProject(projectId).subscribe({
        next: (project) => {
          this.filterCustomerId.set(project.customerId);
          this.filterCustomerName.set(project.customerName);
          this.filterProjectName.set(project.projectName || '');
          this.filterProjectCode.set(project.projectCode || '');
          this.projectResolved = true;
          this.fetchContracts(request, grid, 1);
        },
        error: (err) => {
          console.error('Error loading project:', err);
          this.projectResolved = true;
          this.fetchContracts(request, grid);
        },
      });
      return;
    }

    if (this.initialResolverContracts) {
      const { data, totalElements } = this.initialResolverContracts;
      this.initialResolverContracts = null;
      this.contracts.set(data);
      this.totalItems.set(totalElements);
      grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
      this.loadApprovalStatuses(data, grid, request.requestId);
      return;
    }

    this.fetchContracts(request, grid);
  }

  private fetchContracts(request: SicGridLoadRequest, grid: SicGridPanelComponent, forcePage?: number): void {
    this.isLoading.set(true);
    const pageNumber = forcePage ?? request.pageNumber;
    this.currentPage.set(pageNumber);
    this.syncFiltersToUrl();

    let params = new HttpParams()
      .set('page', pageNumber.toString())
      .set('size', request.pageSize.toString());

    const projectId = this.filterProjectId();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    const customerId = this.filterCustomerId();
    if (customerId) {
      params = params.set('customerId', customerId);
    }

    const keyword = this.searchTerm();
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    const status = this.filterStatus();
    if (status !== 'all') {
      params = params.set('status', status);
    }

    const type = this.filterType();
    if (type !== 'all') {
      params = params.set('contractType', type);
    }

    if (this.activePreset() === 'expiring') {
      params = params.set('expiringWithinDays', '30');
    }

    const sortField = request.sortField ?? 'contractNo';
    params = params.set('sortBy', sortField).set('sortDirection', request.sortDescending ? 'desc' : 'asc');

    this.http
      .get<PaginationResponse<Contract>>(this.apiUrl, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const items = response.data || (response as any).content || [];
          const total = response.pageable?.totalElements ?? (response as any).totalElements ?? 0;
          this.contracts.set(items);
          this.totalItems.set(total);
          grid.setRows(items as unknown as SicGridRowData[], { totalElements: total }, request.requestId);
          this.loadApprovalStatuses(items, grid, request.requestId);

          if (this.filterCustomerId() && !this.filterCustomerName()) {
            const firstContract = items[0];
            if (firstContract?.customerName) {
              this.filterCustomerName.set(firstContract.customerName);
            }
          }
          if (this.filterProjectId() && !this.filterProjectName()) {
            const firstContract = items.find((c: Contract) => c.projectName);
            if (firstContract?.projectName) {
              this.filterProjectName.set(firstContract.projectName);
            }
          }
        },
        error: (error) => {
          console.error('Load contracts error:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการสัญญาได้');
          this.contracts.set([]);
          this.totalItems.set(0);
          grid.setLoadError('โหลดข้อมูลไม่สำเร็จ', request.requestId);
        },
      });
  }

  // goToPage(1) no-op เงียบๆ ถ้า grid อยู่หน้า 1 อยู่แล้ว
  private reloadFromPage1(grid: SicGridPanelComponent): void {
    if (grid.currentPage === 1) {
      grid.reload();
    } else {
      grid.goToPage(1);
    }
  }

  // ===== URL State Sync =====
  private syncFiltersToUrl(): void {
    this.syncingUrl = true;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm() || null,
        status: this.filterStatus() !== 'all' ? this.filterStatus() : null,
        type: this.filterType() !== 'all' ? this.filterType() : null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
        preset: this.activePreset() !== 'all' ? this.activePreset() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // ===== Actions =====
  onSearch(event: Event, grid: SicGridPanelComponent) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent) {
    this.searchTerm.set('');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  onFilterChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  onTypeChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterType.set(val || 'all');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  // ===== Preset Tabs =====
  setPreset(preset: 'all' | 'expiring', grid: SicGridPanelComponent): void {
    this.activePreset.set(preset);
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  // ===== Bulk Export (ใช้ selection ในตัวของ grid) =====
  bulkExportPdf(grid: SicGridPanelComponent): void {
    const ids = Array.from(grid.selectedRowIds);
    if (ids.length === 0) return;

    this.isLoading.set(true);
    let remaining = ids.length;
    ids.forEach((id) => {
      this.contractService.exportContractPdf(id).subscribe({
        next: (blob) => {
          const pdfUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = `contract-${id}.pdf`;
          a.click();
          URL.revokeObjectURL(pdfUrl);
        },
        error: () => {
          this.dialog.error('ส่งออกไม่สำเร็จ', `ไม่สามารถส่งออกเอกสารสัญญารหัส ${id} ได้`);
        },
        complete: () => {
          remaining -= 1;
          if (remaining === 0) {
            this.isLoading.set(false);
            grid.selectedRowIds.clear();
          }
        },
      });
    });
  }

  // ===== Column Visibility =====
  private loadVisibleColumns(): Set<string> {
    try {
      const raw = localStorage.getItem(this.COLUMN_STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch { /* ignore */ }
    return new Set(this.allColumns.map((c) => c.key));
  }

  toggleColumn(key: string): void {
    this.visibleColumns.update((set) => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    try {
      localStorage.setItem(this.COLUMN_STORAGE_KEY, JSON.stringify(Array.from(this.visibleColumns())));
    } catch { /* ignore */ }
  }

  isColumnVisible(key: string): boolean {
    return this.visibleColumns().has(key);
  }

  // ===== Export CSV (ตามตัวกรองปัจจุบันทั้งหมด ไม่ใช่แค่หน้าปัจจุบัน) =====
  exportCsv(): void {
    this.isLoading.set(true);

    let params = new HttpParams().set('page', '1').set('size', '1000');
    const projectId = this.filterProjectId();
    if (projectId) params = params.set('projectId', projectId);
    const customerId = this.filterCustomerId();
    if (customerId) params = params.set('customerId', customerId);
    const keyword = this.searchTerm();
    if (keyword) params = params.set('keyword', keyword);
    const status = this.filterStatus();
    if (status !== 'all') params = params.set('status', status);
    const type = this.filterType();
    if (type !== 'all') params = params.set('contractType', type);
    if (this.activePreset() === 'expiring') params = params.set('expiringWithinDays', '30');

    this.http
      .get<PaginationResponse<Contract>>(this.apiUrl, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.downloadCsv(res.data || []),
        error: () => this.dialog.error('ส่งออกไม่สำเร็จ', 'ไม่สามารถส่งออกรายการสัญญาได้'),
      });
  }

  private downloadCsv(items: Contract[]): void {
    const headers = ['เลขสัญญา', 'ประเภท', 'ลูกค้า', 'โครงการ', 'มูลค่า', 'วันที่เริ่ม', 'วันที่สิ้นสุด', 'สถานะ'];
    const rows = items.map((c) => [
      c.contractNo,
      c.contractType,
      c.customerName,
      c.projectName || '',
      String(c.contractValue ?? ''),
      c.startDate,
      c.endDate,
      this.getStatusText(c.signStatus),
    ]);
    const csvLines = [headers, ...rows].map((r) =>
      r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','),
    );
    const csvContent = '﻿' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contracts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Navigation =====
  goToAdd() {
    const customerId = this.filterCustomerId() || this.customerState.getCustomerId();
    const projectId = this.filterProjectId() || this.customerState.getProjectId();
    const queryParams: any = {};
    if (customerId) queryParams.customerId = customerId;
    if (projectId) queryParams.projectId = projectId;
    this.navigation.navigate(['/feature/pm/contract/new'], {
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }

  goToEdit(id: string) {
    this.navigation.navigate(['/feature/pm/contract', id, 'edit']);
  }

  goToView(id: string) {
    const contract = this.contracts().find((c) => c.id === id) || this.selectedContract();
    if (contract) {
      this.recentItems.record({
        id: contract.id,
        label: contract.contractNo,
        type: 'contract',
        path: `/feature/pm/contract/${id}/view`,
        icon: 'bi-file-earmark-text',
      });
    }
    this.navigation.navigate(['/feature/pm/contract', id, 'view']);
  }

  goToRenew(contractId: string) {
    this.navigation.navigate(['/feature/pm/contract/renew', contractId]);
  }

  printContract(contract: Contract) {
    if (!contract.id) {
      this.dialog.warn('ไม่พบรหัสสัญญา', 'ไม่สามารถส่งออกเอกสารได้');
      return;
    }

    this.isLoading.set(true);
    this.contractService
      .exportContractPdf(contract.id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            a.download = `contract-${contract.contractNo || contract.id}.pdf`;
            a.click();
          }
        },
        error: (error) => {
          console.error('Export contract PDF error:', error);
          this.dialog.error(
            'ส่งออกเอกสารไม่สำเร็จ',
            error.error?.message || 'เกิดข้อผิดพลาดในการสร้างเอกสาร PDF'
          );
        },
      });
  }

  goBackToCustomer() {
    const customerId = this.filterCustomerId();
    if (customerId) {
      this.navigation.navigate(['/feature/pm/project'], {
        queryParams: { customerId: customerId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/project']);
    }
  }

  openQuickView(contract: Contract): void {
    this.selectedContract.set(contract);
    this.showDrawer.set(true);
  }

  closeQuickView(): void {
    this.showDrawer.set(false);
  }

  goToProject(projectId: string) {
    this.navigation.navigate(['/feature/pm/project-dashboard'], {
      queryParams: { projectId: projectId },
    });
  }

  // ✅ เพิ่ม method ลบสัญญา (อ้างอิงจาก pmrt01)
  deleteContract(contract: Contract, grid: SicGridPanelComponent) {
    if (!contract.id) {
      this.dialog.warn('ไม่พบรหัสสัญญา', 'ไม่สามารถลบข้อมูลได้');
      return;
    }

    this.dialog.confirm(
    'ยืนยันการลบสัญญา',
    `คุณต้องการลบสัญญา ${contract.contractNo} (${contract.contractType}) ของ ${contract.customerName} ใช่หรือไม่?\n⚠️ การดำเนินการนี้ไม่สามารถกู้คืนได้`
    )
      .then((confirmed) => {
        if (confirmed) {
          this.isLoading.set(true);
          this.http
            .delete(`${this.apiUrl}/${contract.id}`)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
              next: () => {
                this.dialog.success('ลบสำเร็จ', `สัญญา ${contract.contractNo} ถูกลบเรียบร้อย`);
                grid.reload();
              },
              error: (error) => {
                console.error('Delete contract error:', error);
                this.dialog.error(
                  'ลบไม่สำเร็จ',
                  error.error?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล'
                );
              },
            });
        }
      });
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Signed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Changed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Draft'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      Sent: 'ส่งแล้ว',
      Signed: 'ลงนามแล้ว',
      Changed: 'แก้ไขหลังลงนาม',
      Expired: 'หมดอายุ',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  formatCurrency(value: number): string {
    if (!value) return '0.00';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(value);
  }

  getApprovalStatusClass(status?: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      NEED_REVISION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return status ? map[status] || 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-600';
  }

  getApprovalStatusText(status?: string): string {
    const map: Record<string, string> = {
      PENDING: 'รออนุมัติ',
      APPROVED: 'อนุมัติแล้ว',
      REJECTED: 'ปฏิเสธ',
      NEED_REVISION: 'ต้องแก้ไข',
      CANCELLED: 'ยกเลิก',
    };
    return status ? map[status] || '-' : '-';
  }
}