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
export interface InvoiceModel {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  contractId: string;
  contractNo?: string;
  milestone: string;
  amount: number;
  vat: number;
  totalAmount: number;
  dueDate: string;
  paymentStatus: string;
  paymentDate?: string;
  receiptFile?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt20Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      invoiceNo: [null, [Validators.required, Validators.maxLength(30)]],
      customerId: [null, [Validators.required]],
      customerName: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      contractId: [null, [Validators.required]],
      contractNo: [null],
      milestone: [null, [Validators.maxLength(255)]],
      amount: [null, [Validators.required, Validators.min(0)]],
      vat: [0, [Validators.min(0)]],
      totalAmount: [null],
      dueDate: [null, [Validators.required]],
      paymentStatus: ['Unpaid', [Validators.required]],
      paymentDate: [null],
      receiptFile: [null],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt20Service {
  private mockInvoices: InvoiceModel[] = [
    {
      id: '1',
      invoiceNo: 'INV-001',
      customerId: '1',
      customerName: 'สมชาย ใจดี',
      projectId: '1',
      projectName: 'ระบบ CRM',
      contractId: '1',
      contractNo: 'CT-001',
      milestone: 'งวดที่ 1 (เริ่มงาน)',
      amount: 200000,
      vat: 14000,
      totalAmount: 214000,
      dueDate: '2024-03-15',
      paymentStatus: 'Paid',
      paymentDate: '2024-03-10',
      receiptFile: 'receipt_001.pdf',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxCustomer = '/api/invoice/combobox-customer';
  apiGetComboboxProject = '/api/invoice/combobox-project';
  apiGetComboboxContract = '/api/invoice/combobox-contract';
  apiGetLovPaymentStatus = '/api/invoice/lov-payment-status';

  save(data: InvoiceModel): Observable<string> {
    console.log('📝 Saving invoice:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getInvoice(id: string): Observable<InvoiceModel> {
    const found = this.mockInvoices.find((inv) => inv.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: InvoiceModel = {
      id: '',
      invoiceNo: '',
      customerId: '',
      customerName: '',
      projectId: '',
      projectName: '',
      contractId: '',
      contractNo: '',
      milestone: '',
      amount: 0,
      vat: 0,
      totalAmount: 0,
      dueDate: '',
      paymentStatus: 'Unpaid',
      paymentDate: '',
      receiptFile: '',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt20',
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
  templateUrl: './pmdt20.component.html',
  styles: [],
})
export class Pmdt20Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt20Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  invoiceId: string | null = null;
  isLoading = false;

  // ===== Options =====
  statusOptions = ['Unpaid', 'Partial', 'Paid', 'Overdue'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.invoiceId = id;
        this.loadInvoice(id);
      }
    });

    // เปลี่ยน VAT ตาม Amount
    this.form.get('amount')?.valueChanges.subscribe((amount) => {
      this.calculateTotal(amount);
    });

    // เปลี่ยน VAT rate
    this.form.get('vat')?.valueChanges.subscribe(() => {
      const amount = this.form.get('amount')?.value || 0;
      this.calculateTotal(amount);
    });
  }

  initForm(): void {
    this.form = Pmdt20Form.createForm(this.fb);
  }

  calculateTotal(amount: number) {
    const vat = this.form.get('vat')?.value || 0;
    const total = amount + vat;
    this.form.patchValue({ totalAmount: total }, { emitEvent: false });
  }

  loadInvoice(id: string) {
    this.isLoading = true;
    this.service.getInvoice(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Invoice สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Invoice รหัสนี้');
        this.router.navigate(['/feature/pm/invoice']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/invoice']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Invoice ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/invoice']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Unpaid: 'ค้างชำระ',
      Partial: 'ชำระบางส่วน',
      Paid: 'ชำระแล้ว',
      Overdue: 'เลยกำหนด',
    };
    return map[status] || status;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(value);
  }
}

export default Pmdt20Component;