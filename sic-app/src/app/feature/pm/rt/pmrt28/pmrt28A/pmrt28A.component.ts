import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
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
export interface RoleModel {
  id: string;
  roleCode: string;
  roleNameEn: string;
  roleNameLocal: string;
  roleLevel: string;
  businessId: string;
  businessName?: string;
  parentRoleId?: string;
  parentRoleName?: string;
  sortOrder: number;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmrt28AForm {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      roleCode: [null, [Validators.required, Validators.maxLength(50)]],
      roleNameEn: [null, [Validators.required, Validators.maxLength(255)]],
      roleNameLocal: [null, [Validators.required, Validators.maxLength(255)]],
      roleLevel: [null, [Validators.maxLength(50)]],
      businessId: [null, [Validators.required]],
      businessName: [null],
      parentRoleId: [null],
      parentRoleName: [null],
      sortOrder: [0],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmrt28AService {
  // ✅ เปลี่ยนเป็นตัวพิมพ์ใหญ่
  private mockRoles: RoleModel[] = [
    {
      id: 'role-001',
      roleCode: 'ADMIN',
      roleNameEn: 'Administrator',
      roleNameLocal: 'ผู้ดูแลระบบ',
      roleLevel: '1',
      businessId: 'biz-001',
      businessName: 'SoftFlow',
      sortOrder: 1,
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxBusiness = '/api/role/combobox-business';
  apiGetComboboxParentRole = '/api/role/combobox-parent-role';

  save(data: RoleModel): Observable<string> {
    console.log('📝 Saving role:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getRole(id: string): Observable<RoleModel> {
    const found = this.mockRoles.find((r) => r.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: RoleModel = {
      id: '',
      roleCode: '',
      roleNameEn: '',
      roleNameLocal: '',
      roleLevel: '',
      businessId: '',
      businessName: '',
      parentRoleId: '',
      parentRoleName: '',
      sortOrder: 0,
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmrt28A', // ✅ selector ตรงกับชื่อ
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
  ],
  templateUrl: './pmrt28A.component.html',
  styles: [],
})
export class Pmrt28AComponent implements OnInit, CanComponentDeactivate {
  // ✅ เปลี่ยนเป็นตัวพิมพ์ใหญ่
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmrt28AService); // ✅ เปลี่ยนเป็นตัวพิมพ์ใหญ่
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  roleId: string | null = null;
  isLoading = false;

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.roleId = id;
        this.loadRole(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmrt28AForm.createForm(this.fb); // ✅ เปลี่ยนเป็นตัวพิมพ์ใหญ่
  }

  loadRole(id: string) {
    this.isLoading = true;
    this.service.getRole(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลบทบาทสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลบทบาทรหัสนี้');
        this.router.navigate(['/feature/pm/pmrt28']); // ✅ แก้ Path
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/pmrt28']); // ✅ แก้ Path
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.form.value;
    this.service.save(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลบทบาทถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/pmrt28']); // ✅ แก้ Path
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmrt28AComponent; // ✅ เปลี่ยนเป็นตัวพิมพ์ใหญ่
