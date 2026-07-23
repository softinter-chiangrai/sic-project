// src/app/feature/pm/dt/pmdt05/pmdt05.component.ts

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
import type { ApprovalFlow } from '../pmdt03/approval.model';
import { ApprovalService } from '../pmdt03/approval.service';

// ===== Model =====
export interface RequirementModel {
  id: string;
  requirementCode: string;
  title: string;
  description: string;
  requirementType: string;
  source: string;
  priority: string;
  businessValue: string;
  acceptanceCriteria: string;
  projectId: string;
  projectName?: string;
  createdBy: string;
  baConfirmStatus: string;
  customerConfirmStatus: string;
  version: string;
  status: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt05Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      requirementCode: [null, [Validators.required, Validators.maxLength(30)]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required, Validators.maxLength(2000)]],
      requirementType: [null, [Validators.required]],
      source: [null, [Validators.maxLength(100)]],
      priority: ['Must', [Validators.required]],
      businessValue: [null, [Validators.maxLength(255)]],
      acceptanceCriteria: [null, [Validators.maxLength(2000)]],
      projectId: [null, [Validators.required]],
      projectName: [null],
      createdBy: [null, [Validators.maxLength(100)]],
      baConfirmStatus: ['Pending'],
      customerConfirmStatus: ['Pending'],
      version: ['v1.0', [Validators.maxLength(20)]],
      status: ['Draft', [Validators.required]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service (Mock) =====
@Injectable({ providedIn: 'root' })
export class Pmdt05Service {
  private mockRequirements: RequirementModel[] = [
    {
      id: '1',
      requirementCode: 'REQ-001',
      title: 'ระบบ Login',
      description: 'ผู้ใช้สามารถเข้าสู่ระบบด้วย Username และ Password',
      requirementType: 'Functional Requirement',
      source: 'ลูกค้า',
      priority: 'Must',
      businessValue: 'สูง',
      acceptanceCriteria: 'ผู้ใช้กรอก Username/Password ถูกต้องแล้วเข้าสู่ระบบได้',
      projectId: '1',
      projectName: 'ระบบ CRM',
      createdBy: 'สมหญิง รักเรียน',
      baConfirmStatus: 'Confirmed',
      customerConfirmStatus: 'Confirmed',
      version: 'v1.0',
      status: 'Approved',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/pm/requirement/combobox-project';
  apiGetLovRequirementType = '/api/pm/requirement/lov-type';
  apiGetLovPriority = '/api/pm/requirement/lov-priority';
  apiGetLovStatus = '/api/pm/requirement/lov-status';

  save(req: RequirementModel): Observable<string> {
    console.log('📝 Saving requirement:', req);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getRequirement(id: string): Observable<RequirementModel> {
    const found = this.mockRequirements.find((r) => r.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const emptyReq: RequirementModel = {
      id: '',
      requirementCode: '',
      title: '',
      description: '',
      requirementType: '',
      source: '',
      priority: 'Must',
      businessValue: '',
      acceptanceCriteria: '',
      projectId: '',
      projectName: '',
      createdBy: '',
      baConfirmStatus: 'Pending',
      customerConfirmStatus: 'Pending',
      version: 'v1.0',
      status: 'Draft',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(emptyReq).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt05',
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
  templateUrl: './pmdt05.component.html',
  styles: [],
})
export class Pmdt05Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt05Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly approvalService = inject(ApprovalService);

  form!: FormGroup;
  isEdit = false;
  reqId: string | null = null;
  isLoading = false;

  // ✅ สำหรับ Approval Flow
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // ✅ ตัวแปรสำหรับแหล่งที่มา (คงเดิม)
  sourceOptions = ['ลูกค้า', 'BA', 'เอกสาร', 'ประชุม'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();
    this.loadFlows(); // โหลด approval flow

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.reqId = id;
        this.loadRequirement(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt05Form.createForm(this.fb);
  }

  loadRequirement(id: string) {
    this.isLoading = true;
    this.service.getRequirement(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Requirement สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Requirement รหัสนี้');
        this.router.navigate(['/feature/pm/requirement']);
      },
    });
  }

  // ✅ โหลด Approval Flow ที่ใช้ได้
  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService.getFlowsByDocumentType('REQUIREMENT').subscribe({
      next: (flows) => {
        this.flows = flows;
        this.isLoadingFlows = false;
        // ถ้ามี flow เดียว เลือกให้อัตโนมัติ
        if (flows.length === 1) {
          this.selectedFlowId = flows[0].id;
        }
      },
      error: () => {
        this.isLoadingFlows = false;
        console.warn('ไม่สามารถโหลด Approval Flow ได้');
      },
    });
  }

  // ✅ ส่งขออนุมัติ
  submitForApproval() {
    if (!this.selectedFlowId) {
      this.dialog.warn('กรุณาเลือก Approval Flow', 'ต้องเลือกกระบวนการอนุมัติก่อนส่ง');
      return;
    }

    const data = this.form.value as RequirementModel;
    if (!data.id) {
      this.dialog.warn('ยังไม่ได้บันทึกข้อมูล', 'กรุณาบันทึก Requirement ก่อนส่งขออนุมัติ');
      return;
    }

    this.approvalService
      .submitForApproval({
        documentType: 'REQUIREMENT',
        documentId: data.id,
        documentCode: data.requirementCode,
        documentTitle: data.title,
        version: data.version,
        flowId: this.selectedFlowId,
        comment: 'ส่งขออนุมัติ Requirement',
      })
      .subscribe({
        next: () => {
          this.dialog.success(
            'ส่งขออนุมัติสำเร็จ',
            'Requirement ถูกส่งเข้าสู่กระบวนการอนุมัติแล้ว',
          );
          // อัปเดตสถานะเอกสาร (ถ้าต้องการ)
          this.form.patchValue({ status: 'Pending Approval' });
          // อาจ redirect ไปยังหน้า approval detail
        },
        error: (err) => {
          this.dialog.error('ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/requirement']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Requirement ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/requirement']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt05Component;
