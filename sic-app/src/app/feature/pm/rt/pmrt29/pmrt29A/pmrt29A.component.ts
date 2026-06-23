import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';

// ===== Model =====
interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface TeamMemberFormData {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  isActive: boolean;
  isDefault: boolean;
  roleIds: string[];
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class pmrt29AService {
  private mockUsers: UserOption[] = [
    { id: 'user-001', name: 'สมชาย ใจดี', email: 'somchai@example.com' },
    { id: 'user-002', name: 'สมหญิง รักเรียน', email: 'somying@example.com' },
    { id: 'user-003', name: 'วิชัย พัฒนาชัย', email: 'vichai@example.com' },
    { id: 'user-004', name: 'มานี มีทรัพย์', email: 'manee@example.com' },
    { id: 'user-005', name: 'สมศักดิ์ รุ่งเรือง', email: 'somsak@example.com' },
  ];

  private mockRoles = [
    { id: 'role-001', name: 'Administrator', code: 'ADMIN' },
    { id: 'role-002', name: 'Project Manager', code: 'PM' },
    { id: 'role-003', name: 'Developer', code: 'DEV' },
    { id: 'role-004', name: 'QA Tester', code: 'QA' },
  ];

  apiGetComboboxUser = '/api/team/combobox-user';
  apiGetComboboxRole = '/api/team/combobox-role';

  getAvailableUsers(): Observable<UserOption[]> {
    return of(this.mockUsers).pipe(delay(300));
  }

  getRoles(): Observable<any[]> {
    return of(this.mockRoles).pipe(delay(200));
  }

  addMember(data: TeamMemberFormData): Observable<string> {
    console.log('📝 Adding team member:', data);
    return of('เพิ่มสมาชิกสำเร็จ').pipe(delay(500));
  }

  getMember(id: string): Observable<TeamMemberFormData> {
    // Mock: ดึงข้อมูลสมาชิก (สำหรับแก้ไข)
    return of({
      id: id,
      userId: 'user-002',
      userName: 'สมหญิง รักเรียน',
      userEmail: 'somying@example.com',
      isActive: true,
      isDefault: false,
      roleIds: ['role-003'],
    }).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmrt29A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
  ],
  templateUrl: './pmrt29A.component.html',
  styles: [],
})
export class Pmrt29AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(pmrt29AService);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  memberId: string | null = null;
  isLoading = false;
  isSaving = false;

  // ===== Data =====
  availableUsers = signal<UserOption[]>([]);
  roles = signal<any[]>([]);

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();
    this.loadData();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.memberId = id;
        this.loadMember(id);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      userId: [null, [Validators.required]],
      userName: [null],
      userEmail: [null],
      roleIds: [[], [Validators.required]],
      isActive: [true],
      isDefault: [false],
    });

    // เมื่อเลือก user ให้ auto-fill ชื่อและอีเมล
    this.form.get('userId')?.valueChanges.subscribe((userId) => {
      const user = this.availableUsers().find((u) => u.id === userId);
      if (user) {
        this.form.patchValue({
          userName: user.name,
          userEmail: user.email,
        });
      }
    });
  }

  loadData() {
    this.isLoading = true;
    this.service.getAvailableUsers().subscribe({
      next: (users) => {
        this.availableUsers.set(users);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลผู้ใช้ไม่สำเร็จ:', err);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลผู้ใช้');
      },
    });

    // โหลด roles สำหรับแสดงใน checkbox
    this.service.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
      },
      error: (err) => {
        console.error('❌ โหลด roles ไม่สำเร็จ:', err);
      },
    });
  }

  loadMember(id: string) {
    this.isLoading = true;
    this.service.getMember(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลสมาชิกสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสมาชิก');
        this.router.navigate(['/feature/pm/team']);
      },
    });
  }

  toggleRole(roleId: string) {
    const current = this.form.get('roleIds')?.value || [];
    if (current.includes(roleId)) {
      this.form.patchValue({ roleIds: current.filter((id: string) => id !== roleId) });
    } else {
      this.form.patchValue({ roleIds: [...current, roleId] });
    }
  }

  isRoleChecked(roleId: string): boolean {
    return (this.form.get('roleIds')?.value || []).includes(roleId);
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/team']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const data = this.form.value;
    this.service.addMember(data).subscribe({
      next: () => {
        this.isSaving = false;
        this.dialog.success('บันทึกสำเร็จ', 'เพิ่มสมาชิกในทีมเรียบร้อย').then(() => {
          this.router.navigate(['/feature/pm/team']);
        });
      },
      error: (error) => {
        this.isSaving = false;
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmrt29AComponent;
