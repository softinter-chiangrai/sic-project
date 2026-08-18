import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';

import { Pmdt18AForm } from './pmdt18A.form';
import { Pmdt18AService } from './pmdt18A.service';
import { PmDeliveryModel, PmDeliveryChecklistModel, PmDeliveryGateCheckResponse } from './pmdt18A.model';

@Component({
  selector: 'app-pmdt18a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicDatepickerComponent,
    SicUploadComponent,
  ],
  templateUrl: './pmdt18A.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt18AComponent implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt18AService);
  private readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly customerState = inject(CustomerStateService);

  formData!: SicFromData<PmDeliveryModel>;
  id = signal<string | null>(null);
  isEdit = signal(false);
  isSaving = signal(false);

  gateCheckData = signal<PmDeliveryGateCheckResponse | null>(null);
  isLoadingGateCheck = signal(false);

  checklists = signal<PmDeliveryChecklistModel[]>([]);

  // Delivery options
  typeOptions = [
    { label: 'Final Delivery (ส่งมอบงวดสุดท้าย)', value: 'FINAL' },
    { label: 'Partial Delivery (ส่งมอบบางส่วน)', value: 'PARTIAL' },
    { label: 'Milestone Delivery (ส่งมอบตามงวดงาน)', value: 'MILESTONE' },
  ];

  statusOptions = [
    { label: 'Draft (ฉบับร่าง)', value: 'DRAFT' },
    { label: 'Preparing (กำลังเตรียมเอกสาร)', value: 'PREPARING' },
    { label: 'Ready (พร้อมส่งมอบ)', value: 'READY' },
    { label: 'Delivered (ส่งมอบแล้ว)', value: 'DELIVERED' },
    { label: 'Confirmed (ลูกค้ายืนยันรับมอบ)', value: 'CONFIRMED' },
  ];

  pageDirty = () => this.formData?.dirty ?? false;

  ngOnInit(): void {
    const rawForm = Pmdt18AForm.createForm(this.fb);
    this.formData = new SicFromData<PmDeliveryModel>(rawForm);

    const projId = this.customerState.getProjectId();
    if (projId) {
      this.formData.form.controls['projectId']?.setValue(projId);
    }

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.isEdit.set(true);
      this.id.set(paramId);
      this.loadData(paramId);
    } else {
      this.initDefaultChecklist();
      if (projId) {
        this.runGateCheck(projId);
      }
    }
  }

  loadData(id: string): void {
    this.service.getById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        if (data.checklists) {
          this.checklists.set(data.checklists);
        }
        this.formData.markAsPristine();
        if (data.projectId) {
          this.runGateCheck(data.projectId, id);
        }
      },
      error: (err) => {
        this.dialog.error('Error', err.message || 'ไม่สามารถโหลดข้อมูลได้');
      },
    });
  }

  runGateCheck(projectId?: string, deliveryId?: string): void {
    const projId = projectId || this.formData.form.controls['projectId']?.value;
    if (!projId) return;

    this.isLoadingGateCheck.set(true);
    this.service.getGateCheck(projId, deliveryId).subscribe({
      next: (res) => {
        this.gateCheckData.set(res);
        this.isLoadingGateCheck.set(false);
      },
      error: () => {
        this.isLoadingGateCheck.set(false);
      },
    });
  }

  initDefaultChecklist(): void {
    const defaults: PmDeliveryChecklistModel[] = [
      { itemName: 'Source Code Package & Git Repository Handover', isChecked: false, sortOrder: 1 },
      { itemName: 'Database Migration Script & DDL/DML Package', isChecked: false, sortOrder: 2 },
      { itemName: 'User Manual & Admin Manual (PDF Attached below)', isChecked: false, sortOrder: 3 },
      { itemName: 'Installation Guide & Deployment Architecture Documentation', isChecked: false, sortOrder: 4 },
      { itemName: 'UAT Sign-Off Certificate & Test Execution Summary Report', isChecked: false, sortOrder: 5 },
      { itemName: 'System Credential Sheet & Security Handover Form', isChecked: false, sortOrder: 6 },
    ];
    this.checklists.set(defaults);
  }

  toggleChecklist(index: number): void {
    const list = [...this.checklists()];
    const item = list[index];
    if (item) {
      item.isChecked = !item.isChecked;
      if (item.state !== SicEntityState.Added) {
        item.state = SicEntityState.Modified;
      }
      this.checklists.set(list);
      this.formData.markAsDirty();
    }
  }

  addChecklistItem(): void {
    const list = [...this.checklists()];
    list.push({
      itemName: 'เอกสาร/รายการส่งมอบเพิ่มเติม',
      isChecked: false,
      sortOrder: list.length + 1,
      state: SicEntityState.Added,
    });
    this.checklists.set(list);
    this.formData.markAsDirty();
  }

  removeChecklistItem(index: number): void {
    const list = [...this.checklists()];
    const item = list[index];
    if (item) {
      if (item.id) {
        item.state = SicEntityState.Deleted;
      } else {
        list.splice(index, 1);
      }
      this.checklists.set(list);
      this.formData.markAsDirty();
    }
  }

  onSubmit(): void {
    this.formData.form.markAllAsTouched();
    if (this.formData.invalid) {
      this.dialog.warn('กรุณากรอกข้อมูล', 'โปรดตรวจสอบความถูกต้องของฟอร์มส่งมอบ');
      return;
    }

    this.isSaving.set(true);
    const payload: Partial<PmDeliveryModel> = {
      ...this.formData.form.getRawValue(),
      checklists: this.checklists(),
    };

    this.service.save(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.formData.markAsPristine();
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกเอกสารการส่งมอบเรียบร้อย');
        this.router.navigate(['/feature/pm/delivery']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกเอกสารได้');
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/delivery']);
  }
}
