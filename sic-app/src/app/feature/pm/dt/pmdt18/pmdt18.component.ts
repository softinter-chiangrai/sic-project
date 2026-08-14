import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicDatepickerComponent } from '../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicUploadComponent } from '../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../core/model/sic-base-model';

import { Pmdt18Form } from './pmdt18.form';
import { Pmdt18Service } from './pmdt18.service';
import { PmDeliveryModel, PmDeliveryChecklistModel, PmDeliveryGateCheckResponse } from './pmdt18.model';

@Component({
  selector: 'app-pmdt18',
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
  templateUrl: './pmdt18.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt18Component implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt18Service);
  private readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

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
    const rawForm = Pmdt18Form.createForm(this.fb);
    this.formData = new SicFromData<PmDeliveryModel>(rawForm);

    const nav = this.router.getCurrentNavigation();
    const queryProj = this.route.snapshot.queryParams['projectId'];
    if (queryProj) {
      this.formData.form.controls['projectId']?.setValue(queryProj);
    }

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.isEdit.set(true);
      this.id.set(paramId);
      this.loadData(paramId);
    } else {
      // Default initial checklist
      this.initDefaultChecklist();
      this.runGateCheck();
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
      { itemName: 'Requirement Appraisals & Approval', itemCategory: 'REQUIREMENT', isChecked: false, sortOrder: 1 },
      { itemName: 'Specification Approval', itemCategory: 'SPECIFICATION', isChecked: false, sortOrder: 2 },
      { itemName: 'Unit / Integration / System Test Cases Passed', itemCategory: 'TEST', isChecked: false, sortOrder: 3 },
      { itemName: 'Critical & High Severity Bugs Resolved', itemCategory: 'BUG', isChecked: false, sortOrder: 4 },
      { itemName: 'User Manual & Release Notes Attached', itemCategory: 'MANUAL', isChecked: false, sortOrder: 5 },
      { itemName: 'UAT Sign-off Completed', itemCategory: 'UAT', isChecked: false, sortOrder: 6 },
    ];
    this.checklists.set(defaults);
  }

  addChecklistItem(): void {
    const current = [...this.checklists()];
    current.push({
      itemName: 'รายการใหม่',
      itemCategory: 'MANUAL',
      isChecked: false,
      sortOrder: current.length + 1,
      state: SicEntityState.Added,
    });
    this.checklists.set(current);
    this.formData.markAsDirty();
  }

  removeChecklistItem(index: number): void {
    const current = [...this.checklists()];
    const item = current[index];
    if (item.id) {
      item.state = SicEntityState.Deleted;
    } else {
      current.splice(index, 1);
    }
    this.checklists.set(current);
    this.formData.markAsDirty();
  }

  toggleChecklist(index: number): void {
    const current = [...this.checklists()];
    current[index].isChecked = !current[index].isChecked;
    if (current[index].id) {
      current[index].state = SicEntityState.Modified;
    }
    this.checklists.set(current);
    this.formData.markAsDirty();
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('คำเตือน', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    const payload = {
      ...this.formData.value,
      state: this.isEdit() ? SicEntityState.Modified : SicEntityState.Added,
      checklists: this.checklists(),
    };

    this.isSaving.set(true);
    this.service.save(payload).subscribe({
      next: () => {
        this.dialog.success('สำเร็จ', 'บันทึกเอกสารส่งมอบเรียบร้อย');
        this.formData.markAsPristine();
        this.router.navigate(['/feature/pm/delivery']);
      },
      error: (err) => {
        this.dialog.error('ข้อผิดพลาด', err.message || 'บันทึกข้อมูลไม่สำเร็จ');
      },
      complete: () => this.isSaving.set(false),
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/delivery']);
  }
}

export default Pmdt18Component;