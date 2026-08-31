import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';

import { Pmdt17AService } from './pmdt17A.service';
import { Pmdt17AForm } from './pmdt17A.form';
import { PmMaTicketModel } from './pmdt17A.model';
import { apiBaseUrl } from '../../../../../core/config/api.config';

@Component({
  selector: 'app-pmdt17a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmdt17A.component.html',
  styleUrls: ['./pmdt17A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt17AComponent implements OnInit, CanComponentDeactivate {
  private service = inject(Pmdt17AService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);

  formData!: SicFromData<PmMaTicketModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);
  isEdit = signal(false);

  ticketTypeOptions = [
    { value: 'BUG_SUPPORT', label: 'Bug Support (แจ้งปัญหาระบบ)' },
    { value: 'DATA_ISSUE', label: 'Data Issue (ข้อมูลผิดพลาด)' },
    { value: 'USER_SUPPORT', label: 'User Support (การใช้งานผู้ใช้)' },
    { value: 'CHANGE_REQUEST', label: 'Change Request (ขอปรับเปลี่ยน)' },
  ];

  severityOptions = [
    { value: 'LOW', label: 'Low (ต่ำ - ภายใน 48 ชม.)' },
    { value: 'MEDIUM', label: 'Medium (ปานกลาง - ภายใน 24 ชม.)' },
    { value: 'HIGH', label: 'High (สูง - ภายใน 8 ชม.)' },
    { value: 'CRITICAL', label: 'Critical (วิกฤต - ภายใน 2 ชม.)' },
  ];

  statusOptions = [
    { value: 'OPEN', label: 'Open (เปิดรับเรื่อง)' },
    { value: 'IN_PROGRESS', label: 'In Progress (กำลังดำเนินการ)' },
    { value: 'WAITING_CUSTOMER', label: 'Waiting for Customer (รอลูกค้า)' },
    { value: 'RESOLVED', label: 'Resolved (แก้ไขเรียบร้อย)' },
    { value: 'CLOSED', label: 'Closed (ปิดตั๋ว)' },
  ];

  apiCustomerCombobox = `${apiBaseUrl}/api/pm/customers/lov`;
  apiProjectCombobox = `${apiBaseUrl}/api/pm/projects/lov`;

  pageDirty = () => this.formData?.isChanged ?? false;

  ngOnInit() {
    const rawForm = Pmdt17AForm.createForm(this.fb);
    this.formData = new SicFromData<PmMaTicketModel>(rawForm);

    const projId = this.customerState.getProjectId();
    if (projId) {
      this.formData.form.controls['projectId']?.setValue(projId);
    }
    const custId = this.customerState.getCustomerId();
    if (custId) {
      this.formData.form.controls['customerId']?.setValue(custId);
    }

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.id.set(paramId);
      this.isEdit.set(true);
      this.loadData(paramId);
    }
  }

  loadData(id: string) {
    this.service.getById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        this.formData.resetModel(this.formData.form.getRawValue() as any);
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถโหลดข้อมูลตั๋วได้');
      },
    });
  }

  submit() {
    this.formData.form.markAllAsTouched();
    if (this.formData.invalid) {
      this.dialog.warn('กรุณากรอกข้อมูล', 'โปรดตรวจสอบข้อมูลในฟอร์มให้ครบถ้วน');
      return;
    }

    this.isSaving.set(true);
    this.service.save(this.formData.form.getRawValue()).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.formData.markAsPristine();
        this.dialog.success('สำเร็จ', 'บันทึกข้อมูลตั๋วแจ้งปัญหา MA เรียบร้อย');
        this.router.navigate(['/feature/pm/ma-ticket']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกข้อมูลได้');
      },
    });
  }

  onBack() {
    this.router.navigate(['/feature/pm/ma-ticket']);
  }
}
