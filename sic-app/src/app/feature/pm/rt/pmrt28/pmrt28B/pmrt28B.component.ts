import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Injectable, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';

// ===== Models =====
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface RoleAssignment {
  roleId: string;
  roleName: string;
  userIds: string[];
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmrt28BService {
  private allUsers: User[] = [
    { id: 'u1', name: 'สมชาย ใจดี', email: 'somchai@example.com', isActive: true },
    { id: 'u2', name: 'สมหญิง รักเรียน', email: 'somying@example.com', isActive: true },
    { id: 'u3', name: 'วิชัย มากมี', email: 'vichai@example.com', isActive: false },
    { id: 'u4', name: 'นารี วัฒนา', email: 'naree@example.com', isActive: true },
    { id: 'u5', name: 'ประวิทย์ สุขสันต์', email: 'prawit@example.com', isActive: true },
    { id: 'u6', name: 'จันทร์จิรา ใจดี', email: 'janjira@example.com', isActive: true },
  ];

  private roleUserMap: Record<string, string[]> = {
    'role-001': ['u1', 'u4'],
    'role-002': ['u1', 'u5'],
    'role-003': ['u2', 'u5', 'u6'],
    'role-004': ['u3'],
    'role-005': ['u4'],
    'role-006': ['u5'],
    'role-007': [],
    'role-008': ['u6'],
  };

  private roleNames: Record<string, string> = {
    'role-001': 'Administrator',
    'role-002': 'Project Manager',
    'role-003': 'Developer',
    'role-004': 'QA Tester',
    'role-005': 'Business Analyst',
    'role-006': 'System Analyst',
    'role-007': 'Finance',
    'role-008': 'Customer',
  };

  getUsers(): Observable<User[]> {
    return of(this.allUsers).pipe(delay(300));
  }

  getRoleAssignment(roleId: string): Observable<RoleAssignment> {
    const userIds = this.roleUserMap[roleId] || [];
    const roleName = this.roleNames[roleId] || 'ไม่พบชื่อบทบาท';
    return of({ roleId, roleName, userIds }).pipe(delay(400));
  }

  saveRoleAssignment(roleId: string, userIds: string[]): Observable<string> {
    console.log(`📝 Saving role ${roleId} assignment:`, userIds);
    this.roleUserMap[roleId] = userIds;
    return of('บันทึกสำเร็จ').pipe(delay(600));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmrt28b',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
  ],
  templateUrl: './pmrt28B.component.html',
  styles: [],
})
export class Pmrt28BComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmrt28BService);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  protected Math = Math;

  // ===== Form =====
  form!: FormGroup;

  // ===== State =====
  roleId: string | null = null;
  roleName = '';
  isLoading = false;
  isSaving = false;

  // ===== Data Signals =====
  allUsers = signal<User[]>([]);
  selectedUserIds = signal<string[]>([]);

  // ===== UI State =====
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(5);

  // ===== Computed =====
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allUsers();
    return this.allUsers().filter(
      (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    );
  });

  totalItems = computed(() => this.filteredUsers().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsers().slice(start, start + this.pageSize());
  });

  selectedCount = computed(() => this.selectedUserIds().length);

  isAllSelected = computed(() => {
    const filtered = this.filteredUsers();
    if (filtered.length === 0) return false;
    return filtered.every((u) => this.selectedUserIds().includes(u.id));
  });

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.roleId = id;
        this.loadData(id);
      } else {
        this.router.navigate(['/feature/pm/pmrt28']);
      }
    });

    // เมื่อมีการเปลี่ยนแปลง selectedUserIds ให้ mark form as dirty
    effect(() => {
      const ids = this.selectedUserIds();
      this.form.patchValue({ selectedUserIds: ids }, { emitEvent: false });
      if (this.form) this.form.markAsDirty();
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      selectedUserIds: [[], Validators.required],
    });
  }

  // ===== Data Loading =====
  loadData(roleId: string) {
    this.isLoading = true;
    this.service.getUsers().subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.loadAssignment(roleId);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ โหลดผู้ใช้ไม่สำเร็จ:', err);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลผู้ใช้');
      },
    });
  }

  loadAssignment(roleId: string) {
    this.service.getRoleAssignment(roleId).subscribe({
      next: (data) => {
        this.roleName = data.roleName;
        this.selectedUserIds.set(data.userIds);
        this.form.patchValue({ selectedUserIds: data.userIds });
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลบทบาทสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลบทบาท');
        this.router.navigate(['/feature/pm/pmrt28']);
      },
    });
  }

  // ===== User Selection =====
  toggleUser(userId: string) {
    const current = this.selectedUserIds();
    if (current.includes(userId)) {
      this.selectedUserIds.set(current.filter((id) => id !== userId));
    } else {
      this.selectedUserIds.set([...current, userId]);
    }
  }

  toggleAllUsers() {
    const filtered = this.filteredUsers();
    const allSelected = this.isAllSelected();
    if (allSelected) {
      // Unselect all in current page
      const filteredIds = filtered.map((u) => u.id);
      this.selectedUserIds.set(this.selectedUserIds().filter((id) => !filteredIds.includes(id)));
    } else {
      // Select all in current page
      const filteredIds = filtered.map((u) => u.id);
      const newSelected = [...this.selectedUserIds()];
      filteredIds.forEach((id) => {
        if (!newSelected.includes(id)) newSelected.push(id);
      });
      this.selectedUserIds.set(newSelected);
    }
  }

  isUserChecked(userId: string): boolean {
    return this.selectedUserIds().includes(userId);
  }

  // ===== Pagination =====
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  // ===== Search =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  // ===== Navigation =====
  onBack(): void {
    if (this.form.dirty) {
      this.dialog
        .confirm('ยืนยัน', 'คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้ใช่หรือไม่?')
        .then((ok) => {
          if (ok) this.router.navigate(['/feature/pm/pmrt28']);
        });
    } else {
      this.router.navigate(['/feature/pm/pmrt28']);
    }
  }

  // ===== Submit =====
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('กรุณาเลือกผู้ใช้', 'คุณต้องเลือกผู้ใช้อย่างน้อย 1 คน');
      return;
    }

    this.isSaving = true;
    const userIds = this.selectedUserIds();

    this.service.saveRoleAssignment(this.roleId!, userIds).subscribe({
      next: () => {
        this.isSaving = false;
        this.form.markAsPristine();
        this.dialog.success('บันทึกสำเร็จ', 'กำหนดผู้ใช้ให้บทบาทเรียบร้อย').then(() => {
          this.router.navigate(['/feature/pm/pmrt28']);
        });
      },
      error: (error) => {
        this.isSaving = false;
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  // ===== Guard =====
  pageDirty = () => this.form?.dirty ?? false;
}

export default Pmrt28BComponent;
