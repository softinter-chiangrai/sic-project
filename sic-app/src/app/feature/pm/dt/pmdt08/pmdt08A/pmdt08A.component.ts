// src/app/feature/pm/dt/pmdt08A/pmdt08A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { ApprovalFlow } from '../../pmdt03/approval.model';
import { ApprovalService } from '../../pmdt03/approval.service';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicCheckboxComponent } from '../../../../../core/component/sic-checkbox/sic-checkbox.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';

import { SicFromData } from '../../../../../core/model/sic-from-data';
import { Pmdt08Service } from '../pmdt08.service';
import { Pmdt08FormData, SpecificationModel } from '../pmdt08.model';
import { environment } from '../../../../../../environments/environment';
import { Pmdt08Form } from '../pmdt08.form';


@Component({
  selector: 'app-pmdt08a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicInputComponent,
    SicInputAreaComponent,
    SicComboboxComponent,
    SicNumberComponent,
    SicButtonComponent,
    SicCheckboxComponent,
  ],
  templateUrl: './pmdt08A.component.html',
})
export class Pmdt08AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Pmdt08Service);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private fb = inject(FormBuilder);
  private approvalService = inject(ApprovalService);
  private customerState = inject(CustomerStateService);

  // ✅ เพิ่ม apiBaseUrl สำหรับใช้ใน template
  public apiBaseUrl = environment.apiBaseUrl;

  // ให้ service เข้าถึงใน template ได้
  public servicePublic = this.service;

  formData!: SicFromData<SpecificationModel>;
  isEdit = false;
  specId: string | null = null;
  isLoading = false;
  isSaving = false;
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;

  pageDirty = () => this.formData?.dirty ?? false;

  ngOnInit(): void {
    const resolved: Pmdt08FormData = this.route.snapshot.data['form'];
    if (resolved && resolved.specification) {
      this.formData = resolved.specification;
      if (this.formData.value.id) {
        this.isEdit = true;
        this.specId = this.formData.value.id;
      }
    } else {
      const form = Pmdt08Form.createForm(this.fb);
      this.formData = new SicFromData<SpecificationModel>(form);
    }

    // รับ projectId จาก queryParams (กรณีสร้างใหม่)
    this.route.queryParams.subscribe(params => {
      if (params['projectId'] && !this.isEdit) {
        this.formData.formGroup.patchValue({ projectId: params['projectId'] });
        this.loadProjectName(params['projectId']);
      }
    });

    // ถ้าเป็นแก้ไขและมี projectId ให้โหลดชื่อโครงการ
    if (this.isEdit && this.formData.value.projectId) {
      this.loadProjectName(this.formData.value.projectId);
    }

    this.loadFlows();
  }

  loadProjectName(projectId: string): void {
    // TODO: ดึงชื่อโครงการจาก API หรือจาก state
    this.formData.formGroup.patchValue({ projectName: 'กำลังโหลด...' });
  }

  loadFlows(): void {
    this.approvalService.getFlowsByDocumentType('SPECIFICATION')
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (flows) => {
          this.flows = flows;
          if (flows.length === 1) this.selectedFlowId = flows[0].id;
        },
        error: () => console.warn('Could not load approval flows'),
      });
  }

  onBack(): void {
    if (this.formData.dirty) {
      this.dialog.confirm('ยืนยัน', 'ข้อมูลยังไม่ได้บันทึก ต้องการออกใช่หรือไม่?')
        .then((ok) => ok && this.navigateToList());
    } else {
      this.navigateToList();
    }
  }

  navigateToList(): void {
    const projectId = this.formData.value.projectId;
    if (projectId) {
      this.navigation.navigate(['/feature/pm/pmdt08'], { queryParams: { projectId } });
    } else {
      this.navigation.navigate(['/feature/pm/pmdt08']);
    }
  }

  submit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const data = this.formData.value;
    data.state = this.isEdit ? 3 : 4;
    if (!this.isEdit) data.rowVersion = 0;

    this.service.save(data)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: (id) => {
          this.dialog.success('บันทึกสำเร็จ', 'Specification ถูกบันทึกเรียบร้อย');
          this.formData.markAsPristine();
          if (this.selectedFlowId && id) {
            this.submitForApproval(id);
          } else {
            this.navigateToList();
          }
        },
        error: (err) => {
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  submitForApproval(specId: string): void {
    const data = this.formData.value;
    this.approvalService.submitForApproval({
      documentType: 'SPECIFICATION',
      documentId: specId,
      documentCode: data.specCode,
      documentTitle: data.title,
      version: data.version,
      flowId: this.selectedFlowId!,
      comment: 'ส่งขออนุมัติ Specification',
    }).subscribe({
      next: () => {
        this.dialog.success('ส่งขออนุมัติสำเร็จ', 'Specification ถูกส่งเข้าสู่กระบวนการอนุมัติ');
        this.navigateToList();
      },
      error: (err) => {
        this.dialog.error('ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  onRequirementSelect(item: any): void {
    if (item) {
      this.formData.formGroup.patchValue({
        requirementId: item.value,
        requirementName: item.text,
      });
    } else {
      this.formData.formGroup.patchValue({
        requirementId: null,
        requirementName: null,
      });
    }
  }
}