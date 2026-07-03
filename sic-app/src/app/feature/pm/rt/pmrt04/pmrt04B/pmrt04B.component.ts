// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';

import { ContractModel, Pmrt04AService } from '../pmrt04A/pmrt04A.component';

@Component({
  selector: 'app-pmrt04-renew',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicDatepickerComponent,
    SicInputAreaComponent,
  ],
  templateUrl: './pmrt04B.component.html',
})
export class pmrt04BComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private service = inject(Pmrt04AService);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone); // ✅ ใช้ NgZone เพื่อบังคับ Change Detection

  form!: FormGroup;
  contractId: string | null = null;
  isLoading = false;
  isSaving = false;
  originalContract: ContractModel | null = null;

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.contractId = id;
        this.loadContract(id);
      } else {
        this.dialog.error('ไม่พบรหัสสัญญา', 'กรุณาระบุรหัสสัญญา');
        this.navigation.navigate(['/feature/pm/pmrt04']);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group(
      {
        newStartDate: [null, Validators.required],
        newEndDate: [null, Validators.required],
        newContractValue: [null, [Validators.required, Validators.min(0)]],
        renewalRemark: [''],
        renewalStatus: ['ต่อแล้ว'],
      },
      { validators: this.dateRangeValidator.bind(this) },
    );
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const start = group.get('newStartDate')?.value;
    const end = group.get('newEndDate')?.value;
    if (start && end && new Date(start) >= new Date(end)) {
      return { endDateInvalid: 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่ม' };
    }
    return null;
  }

  loadContract(id: string): void {
    this.isLoading = true;
    this.service
      .getContract(id)
      .pipe(
        finalize(() => {
          // ✅ ใช้ NgZone.run() เพื่อให้ Angular รับรู้การเปลี่ยนแปลงทันที
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
        next: (data) => {
          this.originalContract = data;

          const currentEndDate = new Date(data.endDate);
          const newStartDate = new Date(currentEndDate);
          newStartDate.setDate(newStartDate.getDate() + 1);
          const newEndDate = new Date(newStartDate);
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);

          this.form.patchValue({
            newStartDate: newStartDate.toISOString().split('T')[0],
            newEndDate: newEndDate.toISOString().split('T')[0],
            newContractValue: data.contractValue,
            renewalStatus: 'ต่อแล้ว',
          });

          this.form.markAsPristine();
          // ✅ อัปเดต View หลังจาก patchValue
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Load contract error:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสัญญา');
          this.navigation.navigate(['/feature/pm/pmrt04']);
        },
      });
  }

  // ✅ เมธอดสำหรับนำทางกลับไปหน้ารายการสัญญา โดยใช้ projectId จากข้อมูลสัญญา
  private navigateBack(): void {
    const projectId = this.originalContract?.projectId;
    if (projectId) {
      // ส่ง projectId กลับไปเพื่อให้หน้ารายการแสดงสัญญาของโครงการนั้น
      this.navigation.navigate(['/feature/pm/pmrt04'], { queryParams: { projectId } });
    } else {
      // ถ้าไม่มี projectId ไปหน้า list ทั่วไป
      this.navigation.navigate(['/feature/pm/pmrt04']);
    }
  }

  onBack(): void {
    if (this.form.dirty) {
      this.dialog
        .confirm('ยืนยัน', 'คุณยังไม่ได้บันทึกข้อมูล ต้องการออกจากหน้านี้ใช่หรือไม่?')
        .then((confirmed) => {
          if (confirmed) {
            this.navigateBack();
          }
        });
    } else {
      this.navigateBack();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const formValue = this.form.value;
    const original = this.originalContract;
    if (!original) return;

    const startDateStr =
      formValue.newStartDate instanceof Date
        ? formValue.newStartDate.toISOString().split('T')[0]
        : formValue.newStartDate;
    const endDateStr =
      formValue.newEndDate instanceof Date
        ? formValue.newEndDate.toISOString().split('T')[0]
        : formValue.newEndDate;

    const newContract: ContractModel = {
      ...original,
      id: undefined,
      contractNo: `${original.contractNo}-R`,
      startDate: startDateStr,
      endDate: endDateStr,
      contractValue: formValue.newContractValue,
      renewalStatus: formValue.renewalStatus,
      isActive: true,
    };

    if (formValue.renewalRemark) {
      newContract.scopeSummary = original.scopeSummary
        ? `${original.scopeSummary}\n[ต่อสัญญา] ${formValue.renewalRemark}`
        : `[ต่อสัญญา] ${formValue.renewalRemark}`;
    }

    this.dialog
      .confirm(
        'ยืนยันการต่อสัญญา',
        `คุณต้องการต่อสัญญา ${original.contractNo} ตั้งแต่วันที่ ${this.formatDate(startDateStr)} ถึง ${this.formatDate(endDateStr)} มูลค่า ${this.formatCurrency(formValue.newContractValue)} ใช่หรือไม่?`,
      )
      .then((confirmed) => {
        if (confirmed) {
          this.isSaving = true;
          this.service
            .save(newContract)
            .pipe(
              finalize(() => {
                // ✅ ใช้ NgZone.run() เพื่ออัปเดต isSaving และ View
                this.ngZone.run(() => {
                  this.isSaving = false;
                  this.cdr.detectChanges();
                });
              }),
            )
            .subscribe({
              next: () => {
                this.dialog
                  .success('ต่อสัญญาสำเร็จ', `สัญญา ${original.contractNo} ถูกต่ออายุเรียบร้อย`)
                  .then(() => {
                    this.form.markAsPristine();
                    this.navigateBack(); // ✅ กลับไปหน้ารายการสัญญา
                  });
              },
              error: (error) => {
                this.dialog.error('ต่อสัญญาไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาด');
              },
            });
        }
      });
  }

  formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return '-';
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return typeof dateStr === 'string' ? dateStr : '-';
    }
  }

  formatCurrency(value: number | undefined): string {
    if (!value) return '0.00';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(value);
  }
}