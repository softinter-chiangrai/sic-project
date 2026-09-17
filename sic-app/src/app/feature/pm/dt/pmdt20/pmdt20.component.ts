import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  description: string;
  targetType?: string;
  targetId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  details?: string;
}

import { FormsModule } from '@angular/forms';
import { AuditLogService } from './audit-log.service';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';

@Component({
  selector: 'app-pmdt20',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate],
  templateUrl: './pmdt20.component.html',
  styleUrls: ['./pmdt20.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt20Component implements OnInit {
  private router = inject(Router);
  private auditLogService = inject(AuditLogService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterModule = signal('all');
  protected filterStatus = signal('all');
  protected filterUser = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected isLoading = signal(false);

  // ===== Data =====
  protected logs = signal<AuditLog[]>([]);

  // ===== Options =====
  protected moduleSelectOptions = signal<{ value: string; text: string }[]>([]);
  protected userSelectOptions = signal<{ value: string; text: string }[]>([]);

  readonly statusSelectOptions = [
    { value: 'Success', text: 'Success' },
    { value: 'Failed', text: 'Failed' },
  ];

  ngOnInit() {
    this.loadFilterOptions();
  }

  loadFilterOptions() {
    this.auditLogService.getModules().subscribe({
      next: (modules) => {
        if (modules && modules.length > 0) {
          this.moduleSelectOptions.set(modules.map((m) => ({ value: m, text: m })));
        }
      },
      error: (err) => {
        console.warn('Failed to load audit modules from backend:', err);
      },
    });

    this.auditLogService.getUsers().subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          this.userSelectOptions.set(
            users.map((u) => {
              const val = u.userId || u.username || u.userFullname || '';
              const text = u.userFullname || u.username || u.userId || '';
              return { value: val, text };
            })
          );
        }
      },
      error: (err) => {
        console.warn('Failed to load audit users from backend:', err);
      },
    });
  }

  // ===== Server Pagination State =====
  protected totalItems = signal(0);

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    selectable: false,
    showToolbar: false,
    defaultSortField: 'createdDate',
    defaultSortDescending: true,
    pageSize: this.pageSize(),
    column: [
      { label: 'ผู้ใช้', name: 'user', type: 'userInfo', sortable: true, minWidth: 100 },
      { label: 'การกระทำ', name: 'action', type: 'text', sortable: true, minWidth: 120 },
      { label: 'โมดูล', name: 'module', type: 'text', sortable: true, minWidth: 130 },
      { label: 'รายละเอียด', name: 'description', type: 'descText', minWidth: 200 },
      { label: 'วันที่-เวลา', name: 'timestamp', type: 'dateText', sortable: true, minWidth: 150 },
      { label: 'สถานะ', name: 'status', type: 'statusBadge', sortable: true, minWidth: 80 },
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

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent) {
    this.isLoading.set(true);
    this.currentPage.set(request.pageNumber);
    this.auditLogService.getLogs({
      searchTerm: this.searchTerm(),
      module: this.filterModule(),
      status: this.filterStatus(),
      username: this.filterUser(),
      page: request.pageNumber,
      size: request.pageSize,
      sortBy: request.sortField ?? 'createdDate',
      sortDir: request.sortDescending ? 'desc' : 'asc',
    }).subscribe({
      next: (res) => {
        let totalElements = 0;
        if (res && res.content) {
          const mappedLogs: AuditLog[] = res.content.map(item => ({
            id: item.id,
            user: item.userFullname || item.username || 'System',
            action: item.action,
            module: item.module,
            description: item.description,
            targetType: item.targetType,
            targetId: item.targetId,
            oldValue: item.oldValue,
            newValue: item.newValue,
            ipAddress: item.ipAddress || '-',
            userAgent: item.userAgent,
            timestamp: item.createdDate ? item.createdDate : new Date().toISOString(),
            status: String(item.status).toUpperCase() === 'FAILED' ? 'Failed' : 'Success',
            details: item.details,
          }));
          this.logs.set(mappedLogs);
          totalElements = res.totalElements ?? mappedLogs.length;
          this.totalItems.set(totalElements);
          grid.setRows(mappedLogs as unknown as SicGridRowData[], { totalElements }, request.requestId);
        } else {
          this.logs.set([]);
          this.totalItems.set(0);
          grid.setRows([], { totalElements: 0 }, request.requestId);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Backend AuditLog API error:', err);
        this.isLoading.set(false);
        this.logs.set([]);
        this.totalItems.set(0);
        grid.setLoadError('โหลดข้อมูลไม่สำเร็จ', request.requestId);
      }
    });
  }

  // ===== Actions =====
  onSearch(event: Event, grid: SicGridPanelComponent) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.reloadFromPage1(grid);
  }

  onModuleChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterModule.set(val || 'all');
    this.reloadFromPage1(grid);
  }

  onStatusChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.reloadFromPage1(grid);
  }

  onUserChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterUser.set(val || 'all');
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent) {
    this.searchTerm.set('');
    this.reloadFromPage1(grid);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Success'];
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  goToDetail(id: string) {
    // Audit Log ไม่มีหน้า Detail (ดูอย่างเดียว)
    // อาจแสดง Dialog หรือไม่ก็ได้
  }
}

export default Pmdt20Component;