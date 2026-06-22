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
export interface RenewalModel {
  id: string;
  originalContractId: string;
  originalContractNo: string;
  newContractNo: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  renewalType: 'Extension' | 'Renewal';
  renewalStatus: string;
  notes: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt22Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      originalContractId: [null, [Validators.required]],
      originalContractNo: [null],
      newContractNo: [null, [Validators.required, Validators.maxLength(30)]],
      customerId: [null, [Validators.required]],
      customerName: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      contractValue: [null, [Validators.required, Validators.min(0)]],
      renewalType: ['Renewal', [Validators.required]],
      renewalStatus: ['รอต่อ', [Validators.required]],
      notes: [null, [Validators.maxLength(1000)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt22Service {
  private mockRenewals: RenewalModel[] = [
    {
      id: '1',
      originalContractId: '1',
      originalContractNo: 'CT-001',
      newContractNo: 'CT-006',
      customerId: '1',
      customerName: 'สมชาย ใจดี',
      projectId: '1',
      projectName: 'ระบบ CRM',
      startDate: '2024-07-01',
      endDate: '2025-06-30',
      contractValue: 50000,
      renewalType: 'Renewal',
      renewalStatus: 'รอต่อ',
      notes: 'ต่ออายุสัญญา MA',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxCustomer = '/api/renewal/combobox-customer';
  apiGetComboboxProject = '/api/renewal/combobox-project';
  apiGetComboboxContract = '/api/renewal/combobox-contract';
  apiGetLovRenewalType = '/api/renewal/lov-type';
  apiGetLovRenewalStatus = '/api/renewal/lov-status';

  save(data: RenewalModel): Observable<string> {
    console.log('📝 Saving renewal:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getRenewal(id: string): Observable<RenewalModel> {
    const found = this.mockRenewals.find((r) => r.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: RenewalModel = {
      id: '',
      originalContractId: '',
      originalContractNo: '',
      newContractNo: '',
      customerId: '',
      customerName: '',
      projectId: '',
      projectName: '',
      startDate: '',
      endDate: '',
      contractValue: 0,
      renewalType: 'Renewal',
      renewalStatus: 'รอต่อ',
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
  selector: 'app-pmdt22',
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
  templateUrl: './pmdt22.component.html',
  styles: [],
})
export class Pmdt22Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt22Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  renewalId: string | null = null;
  isLoading = false;
  originalContractNo = '';

  // ===== Options =====
  renewalTypeOptions = ['Renewal', 'Extension'];
  renewalStatusOptions = ['ยังไม่ต่อ', 'รอต่อ', 'ต่อแล้ว'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.renewalId = id;
        this.loadRenewal(id);
      }
    });

    // เมื่อเลือก original contract ให้ดึงข้อมูลอัตโนมัติ
    this.form.get('originalContractId')?.valueChanges.subscribe((contractId) => {
      if (contractId) {
        // TODO: ดึงข้อมูลสัญญาเดิม (customer, project, etc.)
        // this.loadContractData(contractId);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt22Form.createForm(this.fb);
  }

  loadRenewal(id: string) {
    this.isLoading = true;
    this.service.getRenewal(id).subscribe({
      next: (data) => {
        this.originalContractNo = data.originalContractNo || '';
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลการต่ออายุสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลการต่ออายุรหัสนี้');
        this.router.navigate(['/feature/pm/renewal']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/renewal']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลการต่ออายุถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/renewal']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt22Component;