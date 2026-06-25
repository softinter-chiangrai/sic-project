// business-join.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessJoinService } from './business-join.service';
import { BusinessJoinFormData, JoinModel } from './business-join.model';
import { DialogService } from '../../../core/services/dialog.service';
import { SicInputComponent } from '../../../core/component/sic-input/sic-input.component';
import { SicButtonComponent } from '../../../core/component/sic-button/sic-button.component';
import { CanComponentDeactivate } from '../../../core/guard/can-deactivate.guard';
import { ToForm } from '../../../core/types/form.type';

@Component({
  selector: 'app-business-join',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicInputComponent,
    SicButtonComponent,
  ],
  templateUrl: './business-join.component.html',
  styleUrl: './business-join.component.css',
})
export class BusinessJoinComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly service = inject(BusinessJoinService);
  readonly dialog = inject(DialogService);
  readonly router = inject(Router);

  loading = signal(false);
  isAutoSubmit = signal(false);

  tokenForm!: FormGroup<ToForm<JoinModel>>;

  pageDirty = () => this.tokenForm.dirty;

  ngOnInit(): void {
    const data: BusinessJoinFormData = this.route.snapshot.data['form'];
    this.tokenForm = data.joinForm;

    // ✅ อ่าน Token จาก Query Parameter (?token=xxx)
    const tokenFromQuery = this.route.snapshot.queryParams['token'];
    
    // ✅ หรืออ่านจาก Path Parameter (/join/xxx)
    const tokenFromPath = this.route.snapshot.params['token'];

    const token = tokenFromQuery || tokenFromPath;

    if (token) {
      // ✅ เติม Token ลงในฟอร์มอัตโนมัติ
      this.tokenForm.patchValue({ token: token });
      
      // ✅ (Optional) Submit อัตโนมัติหลังจาก 500ms
      this.isAutoSubmit.set(true);
      setTimeout(() => {
        if (this.tokenForm.valid) {
          this.submit();
        }
      }, 500);
    }
  }

  submit(): void {
    if (this.tokenForm.invalid) {
      this.tokenForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.service.join(this.tokenForm.value.token!).subscribe({
      next: async () => {
        this.loading.set(false);
        await this.dialog.success('เข้าร่วมสำเร็จ', 'คุณได้เข้าร่วมธุรกิจเรียบร้อยแล้ว');
        this.router.navigate(['/management/business']);
      },
      error: async (err) => {
        this.loading.set(false);
        const msg = err?.error?.detail ?? err?.error?.message ?? 'ไม่สามารถเข้าร่วมธุรกิจได้';
        await this.dialog.error('เกิดข้อผิดพลาด', msg);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/management/business']);
  }
}