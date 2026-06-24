import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { Pmrt29Service, type User } from '../pmrt29.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
  selector: 'app-pmrt29A',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SicButtonComponent, SicComboboxComponent, SicInputComponent],
  templateUrl: './pmrt29A.component.html',
})
export class Pmrt29AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pmrt29Service = inject(Pmrt29Service);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  memberId: string | null = null;
  isLoading = false;
  isSaving = false;
  businessId = this.pmrt29Service.getBusinessId() || '';

  users = signal<User[]>([]);

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit() {
    this.initForm();
    this.loadUsers();

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.memberId = id;
        this.loadMember(id);
      }
    });
  }

  initForm() {
    this.form = this.fb.group({
      userId: [null, Validators.required],
      roleId: [null, Validators.required],
      isActive: [true]
    });
  }

  loadUsers() {
    this.pmrt29Service.getAvailableUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('Load users error', err)
    });
  }

  loadMember(id: string) {
    this.isLoading = true;
    this.pmrt29Service.getMemberById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (member) => {
          this.form.patchValue({
            userId: member.userId,
            roleId: member.roleCode,
            isActive: member.isActive
          });
          this.form.get('userId')?.disable();
        },
        error: (err) => {
          console.error('Load member error', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสมาชิก');
          this.router.navigate(['/feature/pm/pmrt29']);
        }
      });
  }

  onBack() {
    if (this.form.dirty) {
      this.dialog.confirm('ยืนยัน', 'ข้อมูลยังไม่บันทึก ต้องการออก?').then(ok => {
        if (ok) this.router.navigate(['/feature/pm/pmrt29']);
      });
    } else {
      this.router.navigate(['/feature/pm/pmrt29']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่สมบูรณ์', 'กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    this.isSaving = true;
    const raw = this.form.getRawValue();

    if (this.isEdit && this.memberId) {
      this.pmrt29Service.updateMember(this.memberId, raw.roleId, raw.isActive)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'แก้ไขข้อมูลสมาชิกเรียบร้อย').then(() => this.router.navigate(['/feature/pm/pmrt29']));
          },
          error: (err) => {
            this.dialog.error('ผิดพลาด', 'ไม่สามารถบันทึกได้');
            console.error('Update error', err);
          }
        });
    } else {
      this.pmrt29Service.addMember(this.businessId, raw.userId, raw.roleId)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'เพิ่มสมาชิกเรียบร้อย').then(() => this.router.navigate(['/feature/pm/pmrt29']));
          },
          error: (err) => {
            this.dialog.error('ผิดพลาด', 'ไม่สามารถเพิ่มสมาชิกได้');
            console.error('Add error', err);
          }
        });
    }
  }

  getUserDisplay(user: User) {
    return user ? `${user.name} (${user.email})` : '';
  }
}