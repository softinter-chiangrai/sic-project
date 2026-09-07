// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { ApprovalService } from '../../../dt/pmdt03/approval.service';
import type { ApprovalFlow } from '../../../dt/pmdt03/approval.model';
import { Pmrt02AService } from './pmrt02A.service';
import { NavigationService } from '../../../../../core/services/navigation.service';

import { ProjectModel } from './pmrt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';


@Component({
  selector: 'app-pmrt02a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicDatepickerComponent,
    SicNumberComponent,
    SicComboboxComponent,
    SicTiptapEditorComponent,
    SicVersionBadgeComponent,
  ],
  templateUrl: './pmrt02A.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [],
})
export class Pmrt02AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private projectService = inject(Pmrt02AService);
  private customerState = inject(CustomerStateService);
  private approvalService = inject(ApprovalService);
  private navigation = inject(NavigationService);
  private cdr = inject(ChangeDetectorRef);

  formData!: SicFromData<any>;
  get form(): FormGroup {
    return this.formData?.formGroup;
  }
  isEdit = false;
  isViewOnly = false;
  isLocked = false;
  projectId: string | null = null;
  isLoading = false;
  isSaving = false;

  customerName = signal<string>('');

  // ===== Approval Flow =====
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;
  documenttypeapiUrl = environment.apiBaseUrl + '/api/pm/approvals/flows/document-type/PROJECT';

  isSaved = false;
  pageDirty = () => (this.isViewOnly || this.isLocked) ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

  statusOptions = [
    { value: 'Prospect', text: 'Prospect' },
    { value: 'Contract Drafting', text: 'Contract Drafting' },
    { value: 'Contract Signed', text: 'Contract Signed' },
    { value: 'Requirement Gathering', text: 'Requirement Gathering' },
    { value: 'Requirement Approval', text: 'Requirement Approval' },
    { value: 'System Analysis', text: 'System Analysis' },
    { value: 'DFD Design', text: 'DFD Design' },
    { value: 'ER Design', text: 'ER Design' },
    { value: 'Specification Design', text: 'Specification Design' },
    { value: 'Specification Approval', text: 'Specification Approval' },
    { value: 'Planning', text: 'Planning' },
    { value: 'Development', text: 'Development' },
    { value: 'Internal Testing', text: 'Internal Testing' },
    { value: 'UAT', text: 'UAT' },
    { value: 'Bug Fixing', text: 'Bug Fixing' },
    { value: 'Ready for Delivery', text: 'Ready for Delivery' },
    { value: 'Delivered', text: 'Delivered' },
    { value: 'Invoicing', text: 'Invoicing' },
    { value: 'Closed', text: 'Closed' },
    { value: 'MA Active', text: 'MA Active' },
  ];
  priorityOptions = [
    { value: 'Low', text: 'Low' },
    { value: 'Medium', text: 'Medium' },
    { value: 'High', text: 'High' },
    { value: 'Critical', text: 'Critical' },
  ];

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      if (mode === 'view') {
        this.isViewOnly = true;
      }
      const customerId = params['customerId'];
      const customerName = params['customerName'] || '';
      if (customerId) {
        this.formData.patchValue({ customerId: customerId });
        if (customerName) {
          this.customerName.set(customerName);
        }
      }
    });

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.projectId = id;
        this.loadProject(id);
      }
    });

    this.loadFlows();
  }

  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService
      .getFlowsByDocumentType('PROJECT')
      .pipe(finalize(() => (this.isLoadingFlows = false)))
      .subscribe({
        next: (flows) => {
          this.flows = flows || [];
          if (!this.selectedFlowId && this.flows.length > 0 && !this.projectId) {
            this.selectedFlowId = this.flows[0].id;
            this.form.patchValue({ approvalFlowId: this.selectedFlowId });
          }
          this.cdr.detectChanges();
        },
        error: () => {
          console.warn('ไม่สามารถโหลด Approval Flow สำหรับ Project');
        },
      });
  }

  onFlowChange(event: any) {
    const flowId = event?.id ?? event?.value ?? event ?? null;
    this.selectedFlowId = flowId;
    this.form.patchValue({ approvalFlowId: flowId });
    this.cdr.detectChanges();
  }

  loadApprovalFlowForProject(prjId: string) {
    this.approvalService.getDocumentStatus('PROJECT', prjId).subscribe({
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
        // ไม่มี approval หรือ error
      }
    });
  }

  initForm(): void {
    this.formData = new SicFromData<any>(this.fb.group({
      id: [null],
      projectCode: [null, [Validators.required, Validators.maxLength(30)]],
      projectName: [null, [Validators.required, Validators.maxLength(255)]],
      customerId: [null],
      contractId: [null],
      contractNo: [null],
      startDate: [null, [Validators.required]],
      plannedEndDate: [null, [Validators.required]],
      actualEndDate: [null],
      budgetManday: [null, [Validators.required, Validators.min(0)]],
      usedManday: [0, [Validators.min(0)]],
      status: ['Prospect', [Validators.required]],
      priority: ['Medium', [Validators.required]],
      description: [null],
      isActive: [true],
      approvalFlowId: [null],
    }));
  }

  loadProject(id: string) {
    this.isLoading = true;
    this.projectService
      .getById(id)
      .pipe(finalize(() => {
      this.isLoading = false;
      if (this.isViewOnly || this.isLocked) {
        this.form.disable();
      }
      this.formData.resetModel(this.form.getRawValue());
      this.cdr.detectChanges(); // ✅ บังคับอัปเดต View ทันที
    }))
      .subscribe({
        next: (data: ProjectModel) => {
          this.formData.patchValue(data);
          if (data.customerName) {
            this.customerName.set(data.customerName);
          }
          if (data.isApproved || data.isLocked || data.approvalStatus === 'APPROVED') {
            this.isLocked = true;
            this.isViewOnly = true;
          }
          this.loadApprovalFlowForProject(id);
        },
        error: (err) => {
          console.error('Load project error:', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบโครงการ');
          this.navigation.navigate(['/feature/pm/project']);
        },
      });
  }

  onBack(): void {
    const customerId = this.form.get('customerId')?.value;
    if (customerId) {
      this.customerState.setCustomer(customerId);
      this.navigation.navigate(['/feature/pm/project']);
    } else {
      this.navigation.navigate(['/feature/pm/project']);
    }
  }

  requestChange(): void {
    this.navigation.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: this.projectId,
        targetType: 'PROJECT',
        targetId: this.projectId,
        targetTitle: this.form.get('projectName')?.value || this.form.get('projectCode')?.value,
      },
    });
  }

  submit() {
    if (this.isViewOnly || this.isLocked) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const data = this.form.getRawValue() as ProjectModel;

    // ✅ ตรวจสอบ before call
    let request$;
    if (this.isEdit && this.projectId) {
      request$ = this.projectService.update(this.projectId, data);
    } else {
      request$ = this.projectService.create(data);
    }

    request$.subscribe({
      next: (res: any) => {
        const id = res?.id || (typeof res === 'string' ? res : null) || this.projectId;

        if (this.selectedFlowId && id) {
          this.approvalService
            .submitForApproval({
              documentType: 'PROJECT',
              documentId: id,
              documentCode: data.projectCode || ('PRJ-' + id.substring(0, 8).toUpperCase()),
              documentTitle: data.projectName || 'โครงการใหม่',
              flowId: this.selectedFlowId,
              comment: 'ส่งขออนุมัติโครงการใหม่',
            })
            .pipe(finalize(() => (this.isSaving = false)))
            .subscribe({
              next: () => {
                this.isSaved = true;
                this.formData.markAsPristine();
                this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลโครงการและรายการขออนุมัติถูกบันทึกเรียบร้อย').then(() => {
                  const customerId = this.form.get('customerId')?.value;
                  if (customerId) this.customerState.setCustomer(customerId);
                  this.navigation.navigate(['/feature/pm/project']);
                });
              },
              error: () => {
                this.isSaved = true;
                this.formData.markAsPristine();
                this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลโครงการถูกบันทึกเรียบร้อย').then(() => {
                  const customerId = this.form.get('customerId')?.value;
                  if (customerId) this.customerState.setCustomer(customerId);
                  this.navigation.navigate(['/feature/pm/project']);
                });
              },
            });
        } else {
          this.isSaving = false;
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลโครงการถูกบันทึกเรียบร้อย').then(() => {
            const customerId = this.form.get('customerId')?.value;
            if (customerId) this.customerState.setCustomer(customerId);
            this.navigation.navigate(['/feature/pm/project']);
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }
}

