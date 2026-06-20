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
export interface ChangeRequestModel {
  id: string;
  requestCode: string;
  title: string;
  description: string;
  requirementId: string;
  requirementCode?: string;
  projectId: string;
  projectName?: string;
  requester: string;
  priority: string;
  status: string;
  impactDfd?: string;
  impactEr?: string;
  impactUi?: string;
  impactApi?: string;
  impactTest?: string;
  impactManday?: number;
  impactTimeline?: number;
  impactCost?: number;
  version: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt06Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      requestCode: [null, [Validators.required, Validators.maxLength(30)]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required, Validators.maxLength(2000)]],
      requirementId: [null, [Validators.required]],
      requirementCode: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      requester: [null, [Validators.maxLength(100)]],
      priority: ['Medium', [Validators.required]],
      status: ['Draft', [Validators.required]],
      impactDfd: [null, [Validators.maxLength(500)]],
      impactEr: [null, [Validators.maxLength(500)]],
      impactUi: [null, [Validators.maxLength(500)]],
      impactApi: [null, [Validators.maxLength(500)]],
      impactTest: [null, [Validators.maxLength(500)]],
      impactManday: [null, [Validators.min(0)]],
      impactTimeline: [null, [Validators.min(0)]],
      impactCost: [null, [Validators.min(0)]],
      version: ['v1.0', [Validators.maxLength(20)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt06Service {
  private mockChangeRequests: ChangeRequestModel[] = [
    {
      id: '1',
      requestCode: 'CR-001',
      title: 'เพิ่มฟิลด์เบอร์โทรในหน้าลูกค้า',
      description: 'ลูกค้าต้องการให้เพิ่มฟิลด์เบอร์โทรในหน้าจอจัดการข้อมูลลูกค้า',
      requirementId: '1',
      requirementCode: 'REQ-001',
      projectId: '1',
      projectName: 'ระบบ CRM',
      requester: 'สมชาย ใจดี',
      priority: 'Medium',
      status: 'Approved',
      impactDfd: 'กระทบ Process: P-002 (จัดการลูกค้า)',
      impactEr: 'เพิ่ม Column: customer.phone_number',
      impactUi: 'เพิ่มฟิลด์ใน Customer Form',
      impactApi: 'เพิ่ม field phoneNumber ใน API',
      impactTest: 'เพิ่ม Test Case สำหรับ phoneNumber',
      impactManday: 2,
      impactTimeline: 1,
      impactCost: 10000,
      version: 'v1.0',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/change-request/combobox-project';
  apiGetComboboxRequirement = '/api/change-request/combobox-requirement';
  apiGetLovPriority = '/api/change-request/lov-priority';
  apiGetLovStatus = '/api/change-request/lov-status';

  save(data: ChangeRequestModel): Observable<string> {
    console.log('📝 Saving change request:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getChangeRequest(id: string): Observable<ChangeRequestModel> {
    const found = this.mockChangeRequests.find((r) => r.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: ChangeRequestModel = {
      id: '',
      requestCode: '',
      title: '',
      description: '',
      requirementId: '',
      requirementCode: '',
      projectId: '',
      projectName: '',
      requester: '',
      priority: 'Medium',
      status: 'Draft',
      impactDfd: '',
      impactEr: '',
      impactUi: '',
      impactApi: '',
      impactTest: '',
      impactManday: 0,
      impactTimeline: 0,
      impactCost: 0,
      version: 'v1.0',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt06',
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
  templateUrl: './pmdt06.component.html',
  styles: [],
})
export class Pmdt06Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt06Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  crId: string | null = null;
  isLoading = false;

  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.crId = id;
        this.loadChangeRequest(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt06Form.createForm(this.fb);

    // เมื่อเปลี่ยน projectId ให้โหลด Requirement ของ project นั้น
    this.form.get('projectId')?.valueChanges.subscribe((projectId) => {
      // TODO: โหลด Requirement ที่เกี่ยวข้อง
      this.form.patchValue({ requirementId: null });
    });
  }

  loadChangeRequest(id: string) {
    this.isLoading = true;
    this.service.getChangeRequest(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Change Request สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Change Request รหัสนี้');
        this.router.navigate(['/feature/pm/change-request']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/change-request']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Change Request ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/change-request']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt06Component;