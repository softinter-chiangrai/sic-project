// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { Pmrt02Service } from '../../pmrt02/pmrt02.service';

// ===== Model =====
// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.component.ts

export interface ContractModel {
  id?: string;
  contractNo: string;
  contractType: string;
  customerId?: string;
  projectId: string;
  startDate: string | Date;
  endDate: string | Date;
  contractValue: number;
  paymentTerms: string;
  scopeSummary: string;
  signStatus: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  renewalStatus: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
  // ✅ เพิ่มตรงนี้
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ===== Form =====
class Pmrt04AForm {
  static createForm(fb: FormBuilder) {
    return fb.group({
      id: [null],
      contractNo: [null, [Validators.required, Validators.maxLength(50)]],
      contractType: [null, [Validators.required, Validators.maxLength(50)]],
      projectId: [null, [Validators.required]], // ✅ เพิ่ม projectId
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

  getLovContractType(): string {
    return `${this.apiUrl}/lov-contract-type`;
  }

  getLovSignStatus(): string {
    return `${this.apiUrl}/lov-sign-status`;
  }

  // ✅ Combobox Project (กรองตาม customerId)
  getComboboxProject(customerId: string | null): string {
    if (!customerId) {
      return `${this.apiUrl}/combobox-project`;
    }
    return `${this.apiUrl}/combobox-project?customerId=${customerId}`;
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
    SicDatepickerComponent, // ✅ เพิ่มตรงนี้
  ],
  templateUrl: './pmrt04A.component.html',
  styles: [],
})
export class Pmrt04AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public service = inject(Pmrt04AService);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);
   private navigation = inject(NavigationService);
   private projectService = inject(Pmrt02Service); 
    private cdr = inject(ChangeDetectorRef); 

  form!: FormGroup;
  isEdit = false;
  contractId: string | null = null;
  isLoading = false;
  isSaving = false;

  // ✅ เก็บ customerId และ projectId จาก Query Parameter
  customerId: string | null = null;
  projectId: string | null = null;

  pageDirty = () => this.form?.dirty ?? false;

 // pmrt04A.component.ts
ngOnInit(): void {
  this.initForm();

  this.route.queryParams.subscribe((params) => {
    const projectId = params['projectId'];

    if (!projectId) {
      this.dialog.warn('ไม่พบรหัสโครงการ', 'กรุณาระบุรหัสโครงการ');
      this.navigation.navigate(['/feature/pm/pmrt04']);
      return;
    }

    this.projectId = projectId;

    this.projectService.getProject(projectId).subscribe({
      next: (project) => {
        this.customerId = project.customerId;
        this.form.patchValue({
          projectId: projectId,
          customerId: project.customerId
        });
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบโครงการที่ระบุ');
        this.navigation.navigate(['/feature/pm/pmrt04']);
      }
    });
  });

  this.route.params.subscribe((params) => {
    const id = params['id'];
    if (id) {
      this.isEdit = true;
      this.contractId = id;
      this.loadContract(id);
    }
  });
}
  initForm(): void {
    this.form = Pmrt04AForm.createForm(this.fb);
  }

 loadContract(id: string) {
    this.isLoading = true;
    this.service
      .getContract(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ บังคับให้อัปเดต View
      }))
      .subscribe({
        next: (data) => {
          if (data.customerId) {
            this.customerId = data.customerId;
          }
          if (data.projectId) {
            this.projectId = data.projectId;
          }
          this.form.patchValue(data);
          this.form.markAsPristine();
          console.log('✅ โหลดข้อมูลสัญญาสำเร็จ:', data);
          this.cdr.detectChanges(); // ✅ อัปเดต View ทันที
        },
        error: (error) => {
          console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสัญญารหัสนี้');
          this.navigation.navigate(['/feature/pm/pmrt04']);
        },
      });
  }

  onBack(): void {
    if (this.projectId) {
      this.navigation.navigate(['/feature/pm/pmrt04'], {
        queryParams: { projectId: this.projectId },
      });
    } else if (this.customerId) {
      this.navigation.navigate(['/feature/pm/pmrt04'], {
        queryParams: { customerId: this.customerId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/pmrt04']);
    }
  }

  submit() {
    // ✅ เพิ่ม log เพื่อดูค่าฟอร์ม
    console.log('📋 Form Value:', this.form.value);
    console.log('✅ Form Valid?', this.form.valid);
    console.log('❌ Form Errors:', this.form.errors);

    // ✅ แสดง error ของแต่ละฟิลด์
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control?.invalid) {
        console.log(`❌ Field "${key}" is invalid:`, control.errors);
        console.log(`   Value:`, control.value);
      }
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.isSaving = true;

    // ✅ ดึงค่าจากฟอร์ม
    const data = this.form.value as ContractModel;

    // ✅ สำคัญ: เพิ่ม customerId จาก queryParams ลงในข้อมูลที่ส่ง
    if (this.customerId) {
      data.customerId = this.customerId;
    } else {
      // ถ้าไม่มี customerId ให้แจ้งเตือน
      this.dialog.warn('ไม่พบข้อมูลลูกค้า', 'กรุณาเลือกลูกค้าก่อน');
      this.isSaving = false;
      return;
    }

    console.log('📤 Sending data with customerId:', data);

    this.service
      .save(data)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลสัญญาถูกบันทึกเรียบร้อย').then(() => {
            this.form.markAsPristine();
            // ✅ กลับไปหน้ารายการสัญญาพร้อม projectId หรือ customerId
            if (this.projectId) {
              this.navigation.navigate(['/feature/pm/pmrt04'], {
                queryParams: { projectId: this.projectId },
              });
            } else {
              this.navigation.navigate(['/feature/pm/pmrt04'], {
                queryParams: { customerId: this.customerId },
              });
            }
          });
        },
        error: (error) => {
          this.dialog.error('บันทึกไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }
}
