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
export interface DeliveryModel {
  id: string;
  deliveryCode: string;
  projectId: string;
  projectName?: string;
  customerId: string;
  customerName?: string;
  deliveryDate: string;
  status: string;
  checklistPassed: boolean;
  requirementConfirmed: boolean;
  specificationConfirmed: boolean;
  tasksCompleted: boolean;
  testCasesPassed: boolean;
  criticalBugsClosed: boolean;
  userManualReady: boolean;
  releaseNoteReady: boolean;
  pmApproved: boolean;
  attachment?: string;
  notes?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt18Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      deliveryCode: [null, [Validators.required, Validators.maxLength(30)]],
      projectId: [null, [Validators.required]],
      projectName: [null],
      customerId: [null, [Validators.required]],
      customerName: [null],
      deliveryDate: [null, [Validators.required]],
      status: ['Draft', [Validators.required]],
      checklistPassed: [false],
      requirementConfirmed: [false],
      specificationConfirmed: [false],
      tasksCompleted: [false],
      testCasesPassed: [false],
      criticalBugsClosed: [false],
      userManualReady: [false],
      releaseNoteReady: [false],
      pmApproved: [false],
      attachment: [null],
      notes: [null, [Validators.maxLength(500)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt18Service {
  private mockDeliveries: DeliveryModel[] = [
    {
      id: '1',
      deliveryCode: 'DEL-001',
      projectId: '1',
      projectName: 'ระบบ CRM',
      customerId: '1',
      customerName: 'สมชาย ใจดี',
      deliveryDate: '2024-06-30',
      status: 'Approved',
      checklistPassed: true,
      requirementConfirmed: true,
      specificationConfirmed: true,
      tasksCompleted: true,
      testCasesPassed: true,
      criticalBugsClosed: true,
      userManualReady: true,
      releaseNoteReady: true,
      pmApproved: true,
      attachment: 'Delivery_CRM_v1.0.pdf',
      notes: 'ส่งมอบตามข้อกำหนดในสัญญา CT-001',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/delivery/combobox-project';
  apiGetComboboxCustomer = '/api/delivery/combobox-customer';
  apiGetLovStatus = '/api/delivery/lov-status';

  save(data: DeliveryModel): Observable<string> {
    console.log('📝 Saving delivery:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getDelivery(id: string): Observable<DeliveryModel> {
    const found = this.mockDeliveries.find((d) => d.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: DeliveryModel = {
      id: '',
      deliveryCode: '',
      projectId: '',
      projectName: '',
      customerId: '',
      customerName: '',
      deliveryDate: '',
      status: 'Draft',
      checklistPassed: false,
      requirementConfirmed: false,
      specificationConfirmed: false,
      tasksCompleted: false,
      testCasesPassed: false,
      criticalBugsClosed: false,
      userManualReady: false,
      releaseNoteReady: false,
      pmApproved: false,
      attachment: '',
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
  selector: 'app-pmdt18',
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
  templateUrl: './pmdt18.component.html',
  styles: [],
})
export class Pmdt18Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt18Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  deliveryId: string | null = null;
  isLoading = false;

  // ===== Options =====
  statusOptions = ['Draft', 'Pending', 'Approved', 'Delivered', 'Rejected'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.deliveryId = id;
        this.loadDelivery(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt18Form.createForm(this.fb);
  }

  loadDelivery(id: string) {
    this.isLoading = true;
    this.service.getDelivery(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Delivery สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Delivery รหัสนี้');
        this.router.navigate(['/feature/pm/delivery']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/delivery']);
  }

  // ตรวจสอบ Checklist ว่า Pass หรือยัง
  checkChecklist(): void {
    const formValues = this.form.value;
    const allPassed =
      formValues.requirementConfirmed &&
      formValues.specificationConfirmed &&
      formValues.tasksCompleted &&
      formValues.testCasesPassed &&
      formValues.criticalBugsClosed &&
      formValues.userManualReady &&
      formValues.releaseNoteReady &&
      formValues.pmApproved;

    this.form.patchValue({ checklistPassed: allPassed });
  }

  // เรียกเมื่อ checkbox ตัวใดตัวหนึ่งเปลี่ยนแปลง
  onChecklistChange(): void {
    this.checkChecklist();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    // บันทึกข้อมูล
    const data = this.form.value;
    // ตรวจสอบ Checklist ก่อนบันทึก
    this.checkChecklist();
    data.checklistPassed = this.form.value.checklistPassed;

    this.service.save(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Delivery ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/delivery']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      Pending: 'รออนุมัติ',
      Approved: 'อนุมัติ',
      Delivered: 'ส่งมอบแล้ว',
      Rejected: 'ปฏิเสธ',
    };
    return map[status] || status;
  }
}

export default Pmdt18Component;