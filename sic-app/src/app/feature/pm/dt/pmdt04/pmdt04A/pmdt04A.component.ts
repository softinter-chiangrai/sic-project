// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { BusinessService } from '../../../../../core/services/business.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmrt02Service } from '../../../rt/pmrt02/pmrt02.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { ApprovalService } from '../../pmdt03/approval.service';

interface Requirement {
  id?: string;
  requirementCode: string;
  title: string;
  description: string;
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
  private businessService = inject(BusinessService);
  private projectService = inject(Pmrt02Service);
  private cdr = inject(ChangeDetectorRef);
  apiBaseUrl = environment.apiBaseUrl;

  form!: FormGroup;
  isEdit = false;
  reqId: string | null = null;
  isLoading = false;
  isSaving = false;
  projectId: string | null = null;
  projectName = '';

  // Approval
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // Combobox URLs
  priorityApiUrl = `${environment.apiBaseUrl}/api/requirement/lov-priority`;
  statusApiUrl = `${environment.apiBaseUrl}/api/requirement/lov-status`;
  businessValueApiUrl = `${environment.apiBaseUrl}/api/requirement/lov-business-value`;
  documenttypeapiUrl=`${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/REQUIREMENT`;
 

  // User combobox
  userApiUrl = '';
  businessId: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadFlows();

    // Load business id for user combobox
    this.businessId = this.businessService.getCurrentBusinessId();
    if (this.businessId) {
      this.userApiUrl = `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${this.businessId}`;
    } else {
      const stored = localStorage.getItem('businessId');
      if (stored) {
        this.businessId = stored;
        this.userApiUrl = `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${stored}`;
      }
    }

    // รับ projectId จาก queryParams (กรณีสร้างใหม่)
    this.route.queryParams.subscribe((params) => {
  const projectId = params['projectId'];
  if (projectId) {   
    this.projectId = projectId;
    this.loadProjectName(projectId);
    this.form.patchValue({ projectId });
  }
});

    // รับ id สำหรับแก้ไข
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
      priority: ['Must', [Validators.required]],
      businessValue: [null],
      acceptanceCriteria: [null],
      projectId: [null, [Validators.required]],
      projectName: [{ value: null, disabled: true }],
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

  loadProjectName(projectId: string) {
    this.projectService.getProject(projectId).subscribe({
      next: (project) => {
        this.projectName = project.projectName;
        this.form.patchValue({ projectName: this.projectName });
        this.cdr.detectChanges();
      },
      error: () => {
        this.dialog.warn('ไม่พบโครงการ', 'ไม่สามารถโหลดชื่อโครงการได้');
      }
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
        this.projectId = data.projectId;
        if (data.projectId) {
          this.loadProjectName(data.projectId);
        }
        if (data.projectName) {
          this.projectName = data.projectName;
          this.form.patchValue({ projectName: data.projectName });
        }
        this.cdr.detectChanges();
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

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.isSaving = true;
    const data = this.form.value;
    // เอา projectName ออกจาก data (disabled ไม่ถูกส่ง)
    delete data.projectName;
    const url = `${environment.apiBaseUrl}/api/requirement/save`;

    this.http
      .post(url, data)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: any) => {
          const id = res.id || res.data?.id;
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Requirement ถูกบันทึกเรียบร้อย');
          this.form.markAsPristine();

          if (!this.isEdit && id) {
            this.reqId = id;
            this.form.patchValue({ id: id });
            this.isEdit = true;

            // ส่งขออนุมัติอัตโนมัติ
            if (this.selectedFlowId) {
              this.submitForApproval(id);
            } else {
              this.dialog.warn('ไม่พบ Approval Flow', 'ไม่สามารถส่งขออนุมัติได้ กรุณาติดต่อผู้ดูแลระบบ');
              this.router.navigate(['/feature/pm/requirement']);
            }
          } else {
            this.router.navigate(['/feature/pm/requirement']);
          }
        },
        error: (err) => {
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  submitForApproval(requirementId: string) {
    if (!this.selectedFlowId) {
      this.dialog.warn('กรุณาเลือก Approval Flow', 'คุณต้องเลือกกระบวนการอนุมัติก่อนส่ง');
      return;
    }

    const data = this.form.value as Requirement;
    if (!requirementId) {
      this.dialog.warn('ยังไม่ได้บันทึก', 'กรุณาบันทึก Requirement ก่อนส่งขออนุมัติ');
      return;
    }

    this.isSaving = true;
    this.approvalService
      .submitForApproval({
        documentType: 'REQUIREMENT',
        documentId: requirementId,
        documentCode: data.requirementCode,
        documentTitle: data.title,
        version: data.version,
        flowId: this.selectedFlowId,
        comment: 'ส่งขออนุมัติอัตโนมัติ',
      })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.dialog.success('ส่งขออนุมัติสำเร็จ', 'Requirement ถูกส่งเข้าสู่กระบวนการอนุมัติแล้ว');
          this.form.patchValue({ status: 'In Review' });
          this.router.navigate(['/feature/pm/requirement']);
        },
        error: (err) => {
          this.dialog.error('ส่งไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  onBack() {
    this.router.navigate(['/feature/pm/requirement']);
  }
}