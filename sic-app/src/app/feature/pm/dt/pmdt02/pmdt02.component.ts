import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { DialogService } from '../../../../core/services/dialog.service';

// ===== Model =====
export interface ContractModel {
  id: string;
  contractNo: string;
  contractType: string;
  customerId: string;
  customerName?: string;
  projectId?: string;
  projectName?: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  paymentTerms: string;
  scopeSummary: string;
  contractFile?: string;
  signStatus: string;
  renewalStatus: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt02Form {
  static createForm(fb: FormBuilder) {
    return fb.group({
      id: [null],
      contractNo: [null, [Validators.required, Validators.maxLength(50)]],
      contractType: [null, [Validators.required, Validators.maxLength(50)]],
      customerId: [null, [Validators.required]],
      customerName: [null],
      projectId: [null],
      projectName: [null],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      contractValue: [null, [Validators.required, Validators.min(0)]],
      paymentTerms: [null, [Validators.maxLength(500)]],
      scopeSummary: [null, [Validators.maxLength(1000)]],
      contractFile: [null],
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
export class Pmdt02Service {
  private mockContracts: ContractModel[] = [
    {
      id: '1',
      contractNo: 'CT-001',
      contractType: 'Development Contract',
      customerId: '1',
      customerName: 'สมชาย ใจดี',
      projectId: '1',
      projectName: 'ระบบ CRM',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      contractValue: 500000,
      paymentTerms: 'จ่ายตามงวด 3 งวด',
      scopeSummary: 'พัฒนาระบบ CRM ครบวงจร',
      signStatus: 'Signed',
      renewalStatus: 'ยังไม่ต่อ',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
    {
      id: '2',
      contractNo: 'CT-002',
      contractType: 'Maintenance Contract',
      customerId: '1',
      customerName: 'สมชาย ใจดี',
      projectId: '1',
      projectName: 'ระบบ CRM',
      startDate: '2024-07-01',
      endDate: '2025-06-30',
      contractValue: 50000,
      paymentTerms: 'จ่ายรายเดือน',
      scopeSummary: 'ดูแลระบบ CRM หลังส่งมอบ',
      signStatus: 'Draft',
      renewalStatus: 'รอต่อ',
      isActive: false,
      state: 1,
      rowVersion: 0,
    },
  ];

  // ✅ API Endpoints
  apiGetComboboxCustomer = '/api/contract/combobox-customer';
  apiGetComboboxProject = '/api/contract/combobox-project';
  apiGetLovContractType = '/api/contract/lov-contract-type';
  apiGetLovSignStatus = '/api/contract/lov-sign-status';

  save(contract: ContractModel): Observable<string> {
    console.log('📝 Saving contract:', contract);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getContract(id: string): Observable<ContractModel> {
    const found = this.mockContracts.find((c) => c.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const emptyContract: ContractModel = {
      id: '',
      contractNo: '',
      contractType: '',
      customerId: '',
      customerName: '',
      projectId: '',
      projectName: '',
      startDate: '',
      endDate: '',
      contractValue: 0,
      paymentTerms: '',
      scopeSummary: '',
      signStatus: 'Draft',
      renewalStatus: 'ยังไม่ต่อ',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(emptyContract).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt02',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent, // ✅ ต้องมี
  ],
  templateUrl: './pmdt02.component.html',
  styles: [],
})
export class Pmdt02Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt02Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  formContractData!: SicFromData<ContractModel>;
  isEdit = false;
  contractId: string | null = null;
  isLoading = false;

  pageDirty = () => this.formContractData?.dirty ?? false;

  ngOnInit(): void {
    const form = Pmdt02Form.createForm(this.fb);
    this.formContractData = new SicFromData<ContractModel>(form);

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.contractId = id;
        this.loadContract(id);
      }
    });
  }

  loadContract(id: string) {
    this.isLoading = true;
    this.service.getContract(id).subscribe({
      next: (data) => {
        this.formContractData.formGroup.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลสัญญาสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสัญญารหัสนี้');
        this.router.navigate(['/feature/pm/contract']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/contract']);
  }

  submit() {
    this.formContractData.markAllAsTouched();
    if (this.formContractData.invalid) {
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.formContractData.value;
    this.service.save(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลสัญญาถูกบันทึกเรียบร้อย').then(() => {
          this.formContractData.markAsPristine();
          this.router.navigate(['/feature/pm/contract']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt02Component;
