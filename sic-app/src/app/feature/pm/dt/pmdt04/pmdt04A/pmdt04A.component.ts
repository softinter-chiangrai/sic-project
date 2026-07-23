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
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { SicEntityState } from '../../../../../core/model/sic-entity-state';
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
  status?: string;
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
    SicNumberComponent,
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
  priorityApiUrl = `${environment.apiBaseUrl}/api/pm/requirement/lov-priority`;
  businessValueApiUrl = `${environment.apiBaseUrl}/api/pm/requirement/lov-business-value`;
  documenttypeapiUrl = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/REQUIREMENT`;

  // User combobox
  userApiUrl = '';
  businessId: string | null = null;

  readonly ENTITY_STATE = SicEntityState;

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
      version: [{ value: 'v1.0', disabled: true }],
      // ✅ ไม่มี status แล้ว
      isActive: [true],
      state: [null],
      rowVersion: [null],
      approvalFlowId: [null],
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
      },
    });
  }

  loadRequirement(id: string) {
    this.isLoading = true;
    this.http
      .get<Requirement>(`${environment.apiBaseUrl}/api/pm/requirement/${id}`)
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

          if (!data.version) {
            this.form.patchValue({ version: 'v1.0' });
          }

          this.loadApprovalFlowForRequirement(id);
          this.cdr.detectChanges();
        },
        error: () => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Requirement');
          this.router.navigate(['/feature/pm/requirement']);
        },
      });
  }

  loadApprovalFlowForRequirement(requirementId: string) {
    this.approvalService.getDocumentStatus('REQUIREMENT', requirementId).subscribe({
      next: (approval) => {
        let flowId: string | null = null;
        if (approval && (approval as any).flowId) {
          flowId = (approval as any).flowId;
        } else if (approval && (approval as any).flow?.id) {
          flowId = (approval as any).flow.id;
        }
        if (flowId) {
          this.selectedFlowId = flowId;
          this.form.patchValue({ approvalFlowId: flowId });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // ไม่มี approval หรือ error – ไม่ต้องทำอะไร
      }
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
          if (flows.length === 1) {
            this.selectedFlowId = flows[0].id;
            this.form.patchValue({ approvalFlowId: flows[0].id });
          }
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

    if (this.isEdit) {
      data.state = this.ENTITY_STATE.Modified;
    } else {
      data.state = this.ENTITY_STATE.Added;
      data.rowVersion = 0;
    }

    delete data.projectName;

    const url = `${environment.apiBaseUrl}/api/pm/requirement/save`;

    this.http
      .post(url, data)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: any) => {
          const id = (typeof res === 'string' ? res : res?.id || res?.data?.id) || data.id || this.reqId;
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Requirement ถูกบันทึกเรียบร้อย');
          this.form.markAsPristine();
          this.navigateBackToRequirementList();
        },
        error: (err) => {
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  private navigateBackToRequirementList() {
    const projectId = this.projectId;
    if (projectId) {
      this.router.navigate(['/feature/pm/requirement'], {
        queryParams: { projectId },
      });
    } else {
      this.router.navigate(['/feature/pm/requirement']);
    }
  }

  onBack() {
    this.navigateBackToRequirementList();
  }
}