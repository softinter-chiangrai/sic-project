// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';  // ✅ แก้ไข import
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { environment } from '../../../../../../environments/environment';

// ===== Model =====
export interface ContractModel {
  id: string;
  contractNo: string;
  contractType: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  paymentTerms: string;
  scopeSummary: string;
  signStatus: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  renewalStatus: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmrt04AForm {
  static createForm(fb: FormBuilder) {
    return fb.group({
      id: [null],
      contractNo: [null, [Validators.required, Validators.maxLength(50)]],
      contractType: [null, [Validators.required, Validators.maxLength(50)]],
      customerId: [null, [Validators.required]],
      customerName: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      contractValue: [null, [Validators.required, Validators.min(0)]],
      paymentTerms: [null, [Validators.maxLength(500)]],
      scopeSummary: [null, [Validators.maxLength(1000)]],
      signStatus: ['Draft', [Validators.required]],
      renewalStatus: ['ยังไม่ต่อ'],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmrt04AService {
  private apiUrl = environment.apiBaseUrl + '/api/pm/contracts';

  constructor(private http: HttpClient) {}

  save(contract: ContractModel): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/save`, contract);
  }

  getContract(id: string): Observable<ContractModel> {
    return this.http.get<ContractModel>(`${this.apiUrl}/${id}`);
  }

  getComboboxCustomer(): string {
    return `${this.apiUrl}/combobox-customer`;
  }

  getComboboxProject(): string {
    return `${this.apiUrl}/combobox-project`;
  }

  getLovContractType(): string {
    return `${this.apiUrl}/lov-contract-type`;
  }

  getLovSignStatus(): string {
    return `${this.apiUrl}/lov-sign-status`;
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmrt04a',
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
  templateUrl: './pmrt04A.component.html',
  styles: [],
})
export class Pmrt04AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // ✅ เปลี่ยนเป็น public เพื่อให้ template ใช้ได้
  public service = inject(Pmrt04AService);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  contractId: string | null = null;
  isLoading = false;
  isSaving = false;

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.contractId = id;
        this.loadContract(id);
      }
    });

    this.form.get('customerId')?.valueChanges.subscribe(() => {
      this.form.patchValue({ projectId: null });
    });
  }

  initForm(): void {
    this.form = Pmrt04AForm.createForm(this.fb);
  }

  loadContract(id: string) {
    this.isLoading = true;
    this.service.getContract(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.form.patchValue(data);
          console.log('✅ โหลดข้อมูลสัญญาสำเร็จ:', data);
        },
        error: (error) => {
          console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสัญญารหัสนี้');
          this.router.navigate(['/feature/pm/pmrt04']);
        },
      });
  }

  onBack(): void {
    const customerId = this.form.get('customerId')?.value;
    if (customerId) {
      this.router.navigate(['/feature/pm/pmrt04'], {
        queryParams: { customerId },
      });
    } else {
      this.router.navigate(['/feature/pm/pmrt04']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.isSaving = true;
    const data = this.form.value;

    this.service.save(data)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลสัญญาถูกบันทึกเรียบร้อย').then(() => {
            this.form.markAsPristine();
            const customerId = this.form.get('customerId')?.value;
            if (customerId) {
              this.router.navigate(['/feature/pm/pmrt04'], {
                queryParams: { customerId },
              });
            } else {
              this.router.navigate(['/feature/pm/pmrt04']);
            }
          });
        },
        error: (error) => {
          this.dialog.error('บันทึกไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }
}