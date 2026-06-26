// src/app/feature/pm/rt/pmrt29/pmrt29.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { Pmrt29Service, type TeamMember } from './pmrt29.service';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { DialogService } from '../../../../core/services/dialog.service';

interface MemberWithUI extends TeamMember {
  userName: string;
  userEmail: string;
  roleNames: string[];
  isDefault: boolean;
}

@Component({
  selector: 'app-pmrt29',
  standalone: true,
  imports: [CommonModule, RouterModule, SicButtonComponent],
  templateUrl: './pmrt29.component.html',
})
export class Pmrt29Component implements OnInit {
  private router = inject(Router);
  private pmrt29Service = inject(Pmrt29Service);
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

  filteredMembers = computed(() => {
    let list = this.members();
    const term = this.searchTerm().toLowerCase();
    if (term) {
      list = list.filter(
        (m) => m.userName.toLowerCase().includes(term) || m.userEmail.toLowerCase().includes(term)
      );
    }
    const status = this.filterStatus();
    if (status === 'active') list = list.filter((m) => m.isActive);
    if (status === 'inactive') list = list.filter((m) => !m.isActive);

    const role = this.filterRole();
    if (role !== 'all') {
      list = list.filter((m) => m.roleNames && m.roleNames.includes(role));
    }

    const by = this.sortBy();
    const dir = this.sortDir();
    list.sort((a, b) => {
      const va = String(a[by as keyof MemberWithUI] ?? '');
      const vb = String(b[by as keyof MemberWithUI] ?? '');
      return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  });

  paginatedMembers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredMembers().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  hasPrevious = computed(() => this.currentPage() > 1);
  hasNext = computed(() => this.currentPage() < this.totalPages());

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const range = 5;
    let start = Math.max(1, current - Math.floor(range / 2));
    let end = Math.min(total, start + range - 1);
    if (end - start < range - 1) {
      start = Math.max(1, end - range + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  Math = Math;

  ngOnInit() {
    this.loadBusinessId();
  }

  loadBusinessId() {
    let id = this.pmrt29Service.getBusinessId();
    if (id) {
      this.businessId = id;
      this.loadMembers();
      this.loadRoleOptions();
      return;
    }

    this.pmrt29Service.getMyBusinesses().subscribe({
      next: (businesses) => {
        if (businesses && businesses.length > 0) {
          const defaultBiz = businesses.find((b) => b.isDefault) || businesses[0];
          this.businessId = defaultBiz.id;
          this.pmrt29Service.setBusinessId(this.businessId);
          this.loadMembers();
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
  this.pmrt29Service.getComboboxRoles().subscribe({
    next: (roles) => {
      this.roleOptions.set(roles.map(r => r.text));  // ✅ ดึง role_name_local จาก Database
    },
    error: (err) => console.error('Load role options error', err)
  });
}

  loadMembers() {
    if (!this.businessId) {
      console.warn('No businessId, cannot load members');
      return;
    }
    this.isLoading.set(true);
    this.pmrt29Service
      .getMembers(this.businessId, this.currentPage() - 1, this.pageSize())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (page) => {
          const mapped = page.content.map((m) => ({
            ...m,
            userName: m.userName || m.userId,
            userEmail: m.userEmail || '',
            roleNames: m.roleNames || [],   // ✅ ใช้ roleNames array จาก API
            isDefault: m.isDefault || false,
          }));
          this.members.set(mapped);
          this.totalItems.set(page.totalElements);
        },
        error: (err) => {
          console.error('Load members error', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายชื่อสมาชิกได้');
        },
      });
  }

  // ===== Actions =====

  goToAdd() {
    this.router.navigate(['/management/business/invite']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/pmrt29', id, 'edit']);
  }

  toggleActive(member: MemberWithUI) {
    const updated = { ...member, isActive: !member.isActive };
    const roleIds = member.roleIds || [];
    this.pmrt29Service.updateMember(member.id, roleIds, updated.isActive).subscribe({
      next: () => {
        this.members.update((list) => list.map((m) => (m.id === member.id ? updated : m)));
        this.dialog.success('อัปเดตสถานะ', 'สถานะสมาชิกถูกเปลี่ยนเรียบร้อย');
      },
      error: (err) => {
        console.error('Toggle error', err);
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้');
      },
    });
  }

  removeMember(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบสมาชิกรายนี้ออกจากทีมใช่หรือไม่?').then((confirmed) => {
      if (confirmed) {
        this.pmrt29Service.deleteMember(id).subscribe({
          next: () => {
            this.members.update((list) => list.filter((m) => m.id !== id));
            this.totalItems.update((v) => v - 1);
            this.dialog.success('ลบสำเร็จ', 'สมาชิกถูกลบออกจากทีมเรียบร้อย');
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

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadMembers();
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadMembers();
  }

  onRoleFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterRole.set(select.value);
    this.currentPage.set(1);
  }
}