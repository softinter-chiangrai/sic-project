// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { environment } from '../../../../../../environments/environment';


interface Requirement {
  id?: string;
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

@Component({
  selector: 'app-pmdt04a',
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
  templateUrl: './pmdt04A.component.html',
})
export class Pmdt04AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private approvalService = inject(ApprovalService);

  form!: FormGroup;
  isEdit = false;
  reqId: string | null = null;
  isLoading = false;
  isSaving = false;

  // Approval
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // Combobox URLs
  projectApiUrl = `${environment.apiBaseUrl}/api/requirement/combobox-project`;
  typeApiUrl = `${environment.apiBaseUrl}/api/requirement/lov-type`;
  priorityApiUrl = `${environment.apiBaseUrl}/api/requirement/lov-priority`;
  statusApiUrl = `${environment.apiBaseUrl}/api/requirement/lov-status`;

  sourceOptions = ['ลูกค้า', 'BA', 'เอกสาร', 'ประชุม'];

  ngOnInit(): void {
    this.initForm();
    this.loadFlows();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.reqId = id;
        this.loadRequirement(id);
      }
    });
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      requirementCode: [null, [Validators.required, Validators.maxLength(30)]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required, Validators.maxLength(2000)]],
      requirementType: [null, [Validators.required]],
      source: [null],
      priority: ['Must', [Validators.required]],
      businessValue: [null],
      acceptanceCriteria: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      createdBy: [null],
      baConfirmStatus: ['Pending'],
      customerConfirmStatus: ['Pending'],
      version: ['v1.0'],
      status: ['Draft', [Validators.required]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }

  loadRequirement(id: string) {
    this.isLoading = true;
    this.http
      .get<Requirement>(`${environment.apiBaseUrl}/api/requirement/${id}`)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.form.patchValue(data);
        },
        error: () => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Requirement');
          this.router.navigate(['/feature/pm/requirement']);
        },
      });
  }

  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService
      .getFlowsByDocumentType('REQUIREMENT')
      .pipe(finalize(() => (this.isLoadingFlows = false)))
      .subscribe({
        next: (flows) => {
          this.flows = flows;
          if (flows.length === 1) this.selectedFlowId = flows[0].id;
        },
        error: () => console.warn('ไม่สามารถโหลด Approval Flow'),
      });
  }

  submitForApproval() {
    if (!this.selectedFlowId) {
      this.dialog.warn('กรุณาเลือก Approval Flow', 'คุณต้องเลือกกระบวนการอนุมัติก่อนส่ง');
      return;
    }
    const data = this.form.value as Requirement;
    if (!data.id) {
      this.dialog.warn('ยังไม่ได้บันทึก', 'กรุณาบันทึก Requirement ก่อนส่งขออนุมัติ');
      return;
    }

    this.isSaving = true;
    this.approvalService
      .submitForApproval({
        documentType: 'REQUIREMENT',
        documentId: data.id,
        documentCode: data.requirementCode,
        documentTitle: data.title,
        version: data.version,
        flowId: this.selectedFlowId,
        comment: 'ส่งขออนุมัติ',
      })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.dialog.success('ส่งขออนุมัติสำเร็จ', 'Requirement ถูกส่งเข้าสู่กระบวนการอนุมัติแล้ว');
          this.form.patchValue({ status: 'In Review' });
        },
        error: (err) => this.dialog.error('ส่งไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด'),
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const data = this.form.value;
    const url = `${environment.apiBaseUrl}/api/requirement/save`;

    this.http
      .post(url, data)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: any) => {
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Requirement ถูกบันทึกเรียบร้อย');
          this.form.markAsPristine();
          if (!this.isEdit && res.id) {
            this.reqId = res.id;
            this.form.patchValue({ id: res.id });
            this.isEdit = true;
          } else {
            this.router.navigate(['/feature/pm/requirement']);
          }
        },
        error: (err) => this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด'),
      });
  }

  onBack() {
    this.router.navigate(['/feature/pm/requirement']);
  }
}