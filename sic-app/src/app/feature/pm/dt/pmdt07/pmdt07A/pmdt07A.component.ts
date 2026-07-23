// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicCardComponent } from '../../../../../core/component/sic-card/sic-card.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';


interface ChangeRequest {
  id?: string;
  requirementId: string;
  changeDescription: string;
  impactSummary?: string;
  estimatedManday?: number;
  status: string;
  projectId?: string;
  rowVersion?: number;
}

@Component({
  selector: 'app-pmdt07a',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicComboboxComponent,
    SicNumberComponent,
    SicCardComponent,
  ],
  templateUrl: './pmdt07A.component.html',
})
export class Pmdt07AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private approvalService = inject(ApprovalService);
  private baseUrl = environment.apiBaseUrl + '/api/pm/change-requests';

  // สำหรับใช้ใน template
  environment = environment;
  readonly Math = Math;

  isEdit = false;
  changeRequestId: string | null = null;
  isLoading = false;
  isSaving = false;
  projectId: string | null = null;

  // ✅ Approval Flow
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // ฟอร์มหลัก
  form: FormGroup = this.fb.group({
    id: [null],
    requirementId: [null, Validators.required],
    changeDescription: [null, Validators.required],
    impactSummary: [null],
    estimatedManday: [null, [Validators.min(0)]],
    status: ['Draft', Validators.required],
    projectId: [null],
    rowVersion: [null],
  });

  // Combobox URL
  requirementApiUrl = environment.apiBaseUrl + '/api/pm/requirement/combobox';
  documenttypeapiUrl = environment.apiBaseUrl + '/api/pm/approvals/flows/document-type/CHANGE_REQUEST';

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.changeRequestId = id;
        this.loadChangeRequest(id);
      }
    });

    // รับ projectId จาก queryParams (ใช้กับกรณีสร้างใหม่)
    this.route.queryParams.subscribe((qParams) => {
      if (qParams['projectId']) {
        this.projectId = qParams['projectId'];
        this.form.patchValue({ projectId: this.projectId });
      }
    });

    // ✅ โหลด Approval Flow
    this.loadFlows();
  }

  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService
      .getFlowsByDocumentType('CHANGE_REQUEST')
      .pipe(finalize(() => (this.isLoadingFlows = false)))
      .subscribe({
        next: (flows) => {
          this.flows = flows;
          // ถ้ามี flow เดียว เลือกให้อัตโนมัติ
          if (flows.length === 1) {
            this.selectedFlowId = flows[0].id;
          }
        },
        error: () => {
          console.warn('ไม่สามารถโหลด Approval Flow สำหรับ Change Request');
        },
      });
  }

  loadChangeRequest(id: string) {
    this.isLoading = true;
    this.http
      .get<ChangeRequest>(`${this.baseUrl}/${id}`)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.form.patchValue(data);
          if (data.projectId) {
            this.projectId = data.projectId;
          }

          // ✅ โหลด approval flow ที่เลือกไว้ (ถ้ามี)
          this.loadApprovalFlowForChangeRequest(id);

          this.isLoading = false;
        },
        error: () => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Change Request นี้');
          this.navigation.navigate(['/feature/pm/pmdt07']);
        },
      });
  }

  // ✅ โหลด approval flow ที่เคยใช้
  loadApprovalFlowForChangeRequest(changeRequestId: string) {
    this.approvalService.getDocumentStatus('CHANGE_REQUEST', changeRequestId).subscribe({
      next: (approval) => {
        if (approval && (approval as any).flowId) {
          this.selectedFlowId = (approval as any).flowId;
        } else if (approval && (approval as any).flow?.id) {
          this.selectedFlowId = (approval as any).flow.id;
        }
      },
      error: () => {
        // ไม่มี approval หรือ error – ไม่ต้องทำอะไร
      }
    });
  }

  // ✅ บันทึก Change Request
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const data = this.form.value;

    // ตรวจสอบว่ามี projectId หรือไม่ (ถ้าไม่มีให้ใช้จาก query)
    if (!data.projectId && this.projectId) {
      data.projectId = this.projectId;
    }

    // กำหนด state
    if (this.isEdit && this.changeRequestId) {
      data.state = 3; // Modified
    } else {
      data.state = 4; // Added
      data.rowVersion = 0;
    }

    const request = this.isEdit && this.changeRequestId
      ? this.http.put(`${this.baseUrl}/${this.changeRequestId}`, data)
      : this.http.post(this.baseUrl, data);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: (res: any) => {
        const id = res?.id || this.changeRequestId;
        this.dialog.success('บันทึกสำเร็จ', 'Change Request ถูกบันทึกเรียบร้อย');

        // ✅ ถ้ามีการเลือก Approval Flow ให้ส่งขออนุมัติอัตโนมัติ
        if (this.selectedFlowId && id) {
          this.submitForApproval(id);
        } else {
          // ถ้าไม่มี flow ให้กลับไปหน้ารายการ
          this.navigateBack();
        }
      },
      error: (err) => {
        this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  // ✅ ส่งขออนุมัติ
  submitForApproval(changeRequestId: string) {
    if (!this.selectedFlowId) {
      this.dialog.warn('กรุณาเลือก Approval Flow', 'คุณต้องเลือกกระบวนการอนุมัติก่อนส่ง');
      return;
    }

    const data = this.form.value;
    this.isSaving = true;

    this.approvalService
      .submitForApproval({
        documentType: 'CHANGE_REQUEST',
        documentId: changeRequestId,
        documentCode: `CR-${changeRequestId.slice(0, 8)}`,
        documentTitle: data.changeDescription?.slice(0, 100) || 'Change Request',
        version: 'v1.0',
        flowId: this.selectedFlowId,
        comment: 'ส่งขออนุมัติ Change Request',
      })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.dialog.success('ส่งขออนุมัติสำเร็จ', 'Change Request ถูกส่งเข้าสู่กระบวนการอนุมัติแล้ว');
          this.form.patchValue({ status: 'Submitted' });
          this.navigateBack();
        },
        error: (err) => {
          this.dialog.error('ส่งไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  private navigateBack() {
    if (this.projectId) {
      this.navigation.navigate(['/feature/pm/pmdt07'], {
        queryParams: { projectId: this.projectId }
      });
    } else {
      this.navigation.navigate(['/feature/pm/pmdt07']);
    }
  }

  cancel() {
    this.navigateBack();
  }
}