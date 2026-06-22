import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';

// ===== Model =====
export interface PaymentModel {
  id: string;
  paymentNo: string;
  invoiceId: string;
  invoiceNo?: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNo?: string;
  receiptFile?: string;
  status: string;
  notes?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt21Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      paymentNo: [null, [Validators.required, Validators.maxLength(30)]],
      invoiceId: [null, [Validators.required]],
      invoiceNo: [null],
      customerId: [null],
      customerName: [null],
      projectId: [null],
      projectName: [null],
      amount: [null, [Validators.required, Validators.min(0)]],
      paymentDate: [null, [Validators.required]],
      paymentMethod: ['Bank Transfer', [Validators.required]],
      referenceNo: [null, [Validators.maxLength(50)]],
      receiptFile: [null],
      status: ['Pending', [Validators.required]],
      notes: [null, [Validators.maxLength(500)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt21Service {
  private mockPayments: PaymentModel[] = [
    {
      id: '1',
      paymentNo: 'PAY-001',
      invoiceId: '1',
      invoiceNo: 'INV-001',
      customerId: '1',
      customerName: 'สมชาย ใจดี',
      projectId: '1',
      projectName: 'ระบบ CRM',
      amount: 214000,
      paymentDate: '2024-03-10',
      paymentMethod: 'Bank Transfer',
      referenceNo: 'TRX-123456',
      receiptFile: 'receipt_001.pdf',
      status: 'Completed',
      notes: 'ชำระผ่านธนาคารกสิกรไทย',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxInvoice = '/api/payment/combobox-invoice';
  apiGetLovPaymentMethod = '/api/payment/lov-method';
  apiGetLovPaymentStatus = '/api/payment/lov-status';

  save(data: PaymentModel): Observable<string> {
    console.log('📝 Saving payment:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getPayment(id: string): Observable<PaymentModel> {
    const found = this.mockPayments.find((p) => p.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: PaymentModel = {
      id: '',
      paymentNo: '',
      invoiceId: '',
      invoiceNo: '',
      customerId: '',
      customerName: '',
      projectId: '',
      projectName: '',
      amount: 0,
      paymentDate: '',
      paymentMethod: 'Bank Transfer',
      referenceNo: '',
      receiptFile: '',
      status: 'Pending',
      notes: '',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt21',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
  ],
  templateUrl: './pmdt20A.component.html',
  styles: [],
})
export class Pmdt21Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt21Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  paymentId: string | null = null;
  isLoading = false;

  // ===== Options =====
  methodOptions = ['Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Other'];
  statusOptions = ['Pending', 'Completed', 'Failed', 'Refunded'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.paymentId = id;
        this.loadPayment(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt21Form.createForm(this.fb);
  }

  loadPayment(id: string) {
    this.isLoading = true;
    this.service.getPayment(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Payment สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Payment รหัสนี้');
        this.router.navigate(['/feature/pm/payment']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/payment']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Payment ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/payment']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Pending: 'รอดำเนินการ',
      Completed: 'สำเร็จ',
      Failed: 'ล้มเหลว',
      Refunded: 'คืนเงิน',
    };
    return map[status] || status;
  }
}

export default Pmdt21Component;