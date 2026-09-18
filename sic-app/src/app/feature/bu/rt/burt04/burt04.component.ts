// src/app/feature/bu/rt/burt04/burt04.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SicButtonComponent, SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { DialogService } from '../../../../core/services/dialog.service';
import { burt04Service } from './burt04.service';
import { MemberWithUI, TeamMember } from './burt04.model';


import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
  selector: 'app-burt04',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicButtonComponent, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './burt04.component.html',
})
export class Burt04AComponent implements OnInit {
  private router = inject(Router);
  private burt04Service = inject(burt04Service);
  private dialog = inject(DialogService);

  businessId = '';

  isLoading = signal(false);
  members = signal<MemberWithUI[]>([]);
  totalItems = signal(0);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');
  filterRole = signal('all');
  sortBy = signal('userName');
  sortDir = signal<'asc' | 'desc'>('asc');

  // ✅ รายการบทบาททั้งหมดสำหรับ filter dropdown
  roleOptions = signal<string[]>([]);
  roleSelectOptions = computed(() => {
    return this.roleOptions().map((r) => ({ value: r, text: r }));
  });

  readonly statusSelectOptions = [
    { value: 'active', text: 'ใช้งาน (Active)' },
    { value: 'inactive', text: 'ไม่ใช้งาน (Inactive)' },
  ];

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    selectable: false,
    showToolbar: false,
    defaultSortField: 'userName',
    pageSize: this.pageSize(),
    column: [
      { label: 'ชื่อ-นามสกุล', name: 'userName', type: 'memberName', sortable: true, minWidth: 150 },
      { label: 'อีเมล', name: 'userEmail', type: 'text', sortable: true, minWidth: 200 },
      { label: 'บทบาท', name: 'roleNames', type: 'roleBadges', minWidth: 150 },
      { label: 'สถานะ', name: 'isActive', type: 'statusBadge', sortable: true, minWidth: 90 },
      { label: 'จัดการ', name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 120 },
    ],
  };

  ngOnInit() {
    this.loadBusinessId();
  }

  loadBusinessId() {
    let id = this.burt04Service.getBusinessId();
    if (id) {
      this.businessId = id;
      this.loadRoleOptions();
      return;
    }

    this.burt04Service.getMyBusinesses().subscribe({
      next: (businesses) => {
        if (businesses && businesses.length > 0) {
          const defaultBiz = businesses.find((b) => b.isDefault) || businesses[0];
          this.businessId = defaultBiz.id;
          this.burt04Service.setBusinessId(this.businessId);
          this.loadRoleOptions();
        } else {
          this.router.navigate(['/management/business']);
        }
      },
      error: () => {
        this.router.navigate(['/management/business']);
      },
    });
  }

  loadRoleOptions() {
    this.burt04Service.getComboboxRoles().subscribe({
      next: (roles) => {
        this.roleOptions.set(roles.map((r) => r.text)); // ✅ ดึง role_name_local จาก Database
      },
      error: (err) => console.error('Load role options error', err),
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

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    if (!this.businessId) {
      grid.setRows([], { totalElements: 0 }, request.requestId);
      return;
    }

    this.isLoading.set(true);
    this.burt04Service
      .getMembers(this.businessId, request.pageNumber - 1, request.pageSize)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const membersList = res?.data || [];
          const mapped: MemberWithUI[] = membersList.map((m) => ({
            ...m,
            userName: m.userName || m.userId,
            userEmail: m.userEmail || '',
            roleNames: m.roleNames || [], // ✅ ใช้ roleNames array จาก API
            isDefault: m.isDefault || false,
          }));
          this.members.set(mapped);

          // filter/sort ภายในหน้าที่ดึงมา (ตาม logic เดิม — server ไม่รองรับ filter/sort param)
          let list = mapped;
          const term = this.searchTerm().toLowerCase();
          if (term) {
            list = list.filter(
              (m) => m.userName.toLowerCase().includes(term) || m.userEmail.toLowerCase().includes(term),
            );
          }
          const status = this.filterStatus();
          if (status === 'active') list = list.filter((m) => m.isActive);
          if (status === 'inactive') list = list.filter((m) => !m.isActive);
          const role = this.filterRole();
          if (role !== 'all') {
            list = list.filter((m) => m.roleNames && m.roleNames.includes(role));
          }

          const by = (request.sortField ?? this.sortBy()) as keyof MemberWithUI;
          const desc = request.sortDescending;
          list = [...list].sort((a, b) => {
            const va = String(a[by] ?? '');
            const vb = String(b[by] ?? '');
            return desc ? vb.localeCompare(va) : va.localeCompare(vb);
          });

          const totalElements = res?.pageable?.totalElements ?? membersList.length;
          this.totalItems.set(totalElements);
          grid.setRows(list as unknown as SicGridRowData[], { totalElements }, request.requestId);
        },
        error: (err) => {
          console.error('Load members error', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายชื่อสมาชิกได้');
          grid.setLoadError('โหลดข้อมูลไม่สำเร็จ', request.requestId);
        },
      });
  }

  // ===== Actions =====

  goToAdd() {
    this.router.navigate(['/management/business/invite']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/bu/team', id, 'edit']);
  }

  toggleActive(member: MemberWithUI, grid: SicGridPanelComponent) {
    const updated = { ...member, isActive: !member.isActive };
    const roleIds = member.roleIds || [];
    this.burt04Service.updateMember(member.id, roleIds, updated.isActive).subscribe({
      next: () => {
        this.members.update((list) => list.map((m) => (m.id === member.id ? updated : m)));
        this.dialog.success('อัปเดตสถานะ', 'สถานะสมาชิกถูกเปลี่ยนเรียบร้อย');
        grid.reload();
      },
      error: (err) => {
        console.error('Toggle error', err);
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้');
      },
    });
  }

  removeMember(id: string, grid: SicGridPanelComponent) {
    this.dialog
      .confirm('ยืนยันการลบ', 'คุณต้องการลบสมาชิกรายนี้ออกจากทีมใช่หรือไม่?')
      .then((confirmed) => {
        if (confirmed) {
          this.burt04Service.deleteMember(id).subscribe({
            next: () => {
              this.dialog.success('ลบสำเร็จ', 'สมาชิกถูกลบออกจากทีมเรียบร้อย');
              grid.reload();
            },
            error: (err) => {
              console.error('Delete error', err);
              this.dialog.error('ลบไม่สำเร็จ', 'ไม่สามารถลบสมาชิกได้');
            },
          });
        }
      });
  }

  // ===== Utility =====

  getStatusClass(active: boolean) {
    return active
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(active: boolean) {
    return active ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }

  // ===== Event Handlers =====

  onSearch(event: Event, grid: SicGridPanelComponent) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent) {
    this.searchTerm.set('');
    this.reloadFromPage1(grid);
  }

  onFilterChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.reloadFromPage1(grid);
  }

  onRoleFilterChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterRole.set(val || 'all');
    this.reloadFromPage1(grid);
  }
}
