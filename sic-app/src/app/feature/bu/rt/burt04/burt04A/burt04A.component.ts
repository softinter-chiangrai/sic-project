// src/app/feature/bu/rt/burt04/burt04A/burt04A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
// ✅ แก้ไข: เปลี่ยนจาก Pmrt29Service เป็น burt04Service
import { ComboboxRole, burt04Service } from '../burt04.service';

@Component({
  selector: 'app-burt04A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicComboboxComponent,
  ],
  templateUrl: './burt04A.component.html',
})
export class Burt04AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // ✅ แก้ไข: เปลี่ยนจาก Pmrt29Service เป็น burt04Service
  private service = inject(burt04Service);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);

  @ViewChild('roleCombobox') roleCombobox!: SicComboboxComponent;

  isEdit = false;
  memberId: string | null = null;
  isLoading = signal(false);
  isSaving = signal(false);
  businessId = this.service.getBusinessId() || '';
  allRoles = signal<ComboboxRole[]>([]);

  form: FormGroup = this.fb.group({
    id: [null],
    userId: [{ value: null, disabled: true }],
    userName: [{ value: '', disabled: true }],
    userEmail: [{ value: '', disabled: true }],
    roleIds: [[], Validators.required],
    isActive: [true],
  });

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit() {
    if (!this.businessId) {
      this.dialog.error('ไม่พบธุรกิจ', 'กรุณาเลือกธุรกิจก่อน');
      this.router.navigate(['/feature/bu/burt04']);
      return;
    }
    this.loadRoles();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.memberId = id;
        this.loadMember(id);
      }
    });
  }

  // ✅ เพิ่ม type ให้กับ callback parameters
  loadRoles() {
    this.service.getComboboxRoles().subscribe({
      next: (roles: ComboboxRole[]) => {
        this.allRoles.set(roles);
      },
      error: (err: any) => console.error('Load roles error', err),
    });
  }

  loadMember(id: string) {
    this.isLoading.set(true);
    this.service
      .getMemberById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (member: any) => {
          this.form.patchValue({
            id: member.id,
            userId: member.userId,
            userName: member.userName,
            userEmail: member.userEmail,
            roleIds: member.roleIds || [],
            isActive: member.isActive,
          });
        },
        error: (err: any) => {
          console.error('Load member error', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสมาชิก');
          this.router.navigate(['/feature/bu/burt04']);
        },
      });
  }

  onRoleSelect(item: ComboboxRole | null) {
    if (!item) return;

    const roleId = item.value;
    if (!roleId) return;

    const current = this.form.get('roleIds')?.value || [];
    if (current.includes(roleId)) {
      this.dialog.warn('ซ้ำ', 'บทบาทนี้ถูกเลือกแล้ว');
      this.roleCombobox.clearSelection();
      return;
    }

    const newList = [...current, roleId];
    this.form.patchValue({ roleIds: newList });
    this.form.markAsDirty();
    this.roleCombobox.clearSelection();
  }

  removeRole(roleId: string) {
    const current = this.form.get('roleIds')?.value || [];
    const newList = current.filter((id: string) => id !== roleId);
    this.form.patchValue({ roleIds: newList });
    this.form.markAsDirty();
  }

  onBack() {
    if (this.form.dirty) {
      this.dialog.confirm('ยืนยัน', 'ข้อมูลยังไม่บันทึก ต้องการออก?').then((ok) => {
        if (ok) this.router.navigate(['/feature/bu/burt04']);
      });
    } else {
      this.router.navigate(['/feature/bu/burt04']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่สมบูรณ์', 'กรุณาเลือกบทบาทอย่างน้อย 1 บทบาท');
      return;
    }

    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    this.service
      .updateMember(raw.id, raw.roleIds, raw.isActive)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'แก้ไขข้อมูลสมาชิกเรียบร้อย');
          this.router.navigate(['/feature/bu/burt04']);
        },
        error: (err: any) => {
          this.dialog.error('ผิดพลาด', err.message || 'ไม่สามารถบันทึกได้');
          console.error('Update error', err);
        },
      });
  }

  getRoleName(roleId: string): string {
    const role = this.allRoles().find((r) => r.value === roleId);
    return role ? role.text : roleId;
  }
}