// business-join.component.ts

import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessJoinService } from './business-join.service';
import { BusinessJoinFormData, JoinModel } from './business-join.model';
import { DialogService } from '../../../core/services/dialog.service';
import { SicInputComponent } from 'sic-ng';
import { SicButtonComponent } from 'sic-ng';
import { CanComponentDeactivate } from '../../../core/guard/can-deactivate.guard';
import { ToForm } from '../../../core/types/form.type';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-business-join',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicInputComponent,
    SicButtonComponent,
    TranslateModule,
  ],
  templateUrl: './business-join.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './business-join.component.css',
})
export class BusinessJoinComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly service = inject(BusinessJoinService);
  readonly dialog = inject(DialogService);
  readonly router = inject(Router);
  readonly translate = inject(TranslateService);

  loading = signal(false);
  isAutoSubmit = signal(false);

  tokenForm!: FormGroup<ToForm<JoinModel>>;

  isSaved = false;
  pageDirty = () => this.isSaved ? false : this.tokenForm.dirty;

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
        this.isSaved = true;
        this.tokenForm.markAsPristine();
        await this.dialog.success(this.translate.instant('BUSINESS_JOIN_SUCCESS_TITLE'), this.translate.instant('BUSINESS_JOIN_SUCCESS_MSG'));
        this.router.navigate(['/management/business']);
      },
      error: async (err) => {
        this.loading.set(false);
        const msg = err?.error?.detail ?? err?.error?.message ?? this.translate.instant('BUSINESS_JOIN_FAIL_MSG');
        await this.dialog.error(this.translate.instant('BUSINESS_JOIN_ERROR_TITLE'), msg);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/management/business']);
  }
}