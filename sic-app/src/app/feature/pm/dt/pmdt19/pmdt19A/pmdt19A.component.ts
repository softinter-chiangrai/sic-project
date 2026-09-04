import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';

import { Pmdt19AForm } from './pmdt19A.form';
import { Pmdt19AService } from './pmdt19A.service';
import { DocumentVersionModel } from './pmdt19A.model';

@Component({
  selector: 'app-pmdt19a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicUploadComponent,
  ],
  templateUrl: './pmdt19A.component.html',
  styleUrls: ['./pmdt19A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt19AComponent implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt19AService);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);
  private readonly fb = inject(FormBuilder);

  formData!: SicFromData<DocumentVersionModel>;
  id = signal<string | null>(null);
  isEdit = signal(false);
  isSaving = signal(false);

  docTypeOptions = [
    { label: 'Requirement (ข้อกำหนดระบบ)', value: 'REQUIREMENT' },
    { label: 'DFD Diagram (Data Flow Diagram)', value: 'DFD' },
    { label: 'ER Diagram (Entity Relationship)', value: 'ER' },
    { label: 'Specification (ข้อกำหนดเชิงเทคนิค)', value: 'SPEC' },
    { label: 'Test Case (รายการทดสอบ)', value: 'TEST_CASE' },
    { label: 'Delivery Document (เอกสารส่งมอบ)', value: 'DELIVERY' },
    { label: 'Contract (สัญญา)', value: 'CONTRACT' },
    { label: 'Change Request (คำขอเปลี่ยนแปลง)', value: 'CHANGE_REQUEST' },
    { label: 'User Manual (คู่มือการใช้งาน)', value: 'MANUAL' },
  ];

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit(): void {
    const rawForm = Pmdt19AForm.createForm(this.fb);
    this.formData = new SicFromData<DocumentVersionModel>(rawForm);

    const projId = this.customerState.getProjectId();
    const qType = this.route.snapshot.queryParams['documentType'];
    const qId = this.route.snapshot.queryParams['documentId'];
    const qCode = this.route.snapshot.queryParams['documentCode'];

    if (projId || qType || qId || qCode) {
      this.formData.patchValue({
        ...(projId ? { projectId: projId } : {}),
        ...(qType ? { documentType: qType } : {}),
        ...(qId ? { documentId: qId } : {}),
        ...(qCode ? { documentCode: qCode } : {}),
      } as any);
    }

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.isEdit.set(true);
      this.id.set(paramId);
      this.loadData(paramId);
    }
  }

  loadData(id: string): void {
    this.service.getVersion(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        this.formData.resetModel(this.formData.form.getRawValue() as any);
      },
      error: (err) => {
        this.dialog.error('Error', err.message || 'ไม่สามารถโหลดข้อมูลเวอร์ชันได้');
      },
    });
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('คำเตือน', 'กรุณากรอกข้อมูลเวอร์ชันให้ครบถ้วน');
      return;
    }

    const rawVal = this.formData.form.getRawValue();
    const targetId = this.id() || rawVal.id;
    const isEditMode = !!targetId || this.isEdit();
    const payload = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
    };

    this.isSaving.set(true);
    this.service.saveVersion(payload).subscribe({
      next: () => {
        this.isSaved = true;
        this.dialog.success('สำเร็จ', 'บันทึกเวอร์ชันเอกสารเรียบร้อยแล้ว');
        this.formData.markAsPristine();
        this.router.navigate(['/feature/pm/version'], {
          queryParams: { projectId: this.customerState.getProjectId() || undefined }
        });
      },
      error: (err) => {
        this.dialog.error('ข้อผิดพลาด', err.message || 'บันทึกไม่สำเร็จ');
      },
      complete: () => this.isSaving.set(false),
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/version'], {
      queryParams: { projectId: this.customerState.getProjectId() || undefined }
    });
  }
}

export default Pmdt19AComponent;