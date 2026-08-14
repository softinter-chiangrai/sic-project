import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../core/model/sic-base-model';

import { Pmdt21Service } from './pmdt21.service';
import { Pmdt21Form } from './pmdt21.form';
import { PmMaTicketModel } from './pmdt21.model';
import { apiBaseUrl } from '../../../../core/config/api.config';

@Component({
  selector: 'app-pmdt21',
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
  templateUrl: './pmdt21.component.html',
})
export class Pmdt21Component implements OnInit, CanComponentDeactivate {
  private service = inject(Pmdt21Service);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);

  formData!: SicFromData<PmMaTicketModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);

  ticketTypeOptions = [
    { value: 'BUG_SUPPORT', label: 'Bug Support (แจ้งปัญหาระบบ)' },
    { value: 'DATA_ISSUE', label: 'Data Issue (ข้อมูลผิดพลาด)' },
    { value: 'USER_SUPPORT', label: 'User Support (การใช้งานผู้ใช้)' },
    { value: 'CHANGE_REQUEST', label: 'Change Request (ขอปรับเปลี่ยน)' },
    { value: 'PERFORMANCE', label: 'Performance Issue (ระบบช้า)' },
    { value: 'SECURITY', label: 'Security Issue (ความปลอดภัย)' },
    { value: 'INFRA', label: 'Server / Infra Issue (โครงสร้างพื้นฐาน)' },
  ];

  severityOptions = [
    { value: 'LOW', label: 'Low (ต่ำ - ภายใน 48 ชม.)' },
    { value: 'MEDIUM', label: 'Medium (ปานกลาง - ภายใน 24 ชม.)' },
    { value: 'HIGH', label: 'High (สูง - ภายใน 8 ชม.)' },
    { value: 'CRITICAL', label: 'Critical (วิกฤต - ภายใน 4 ชม.)' },
  ];

  statusOptions = [
    { value: 'OPEN', label: 'Open (เปิด Ticket)' },
    { value: 'IN_PROGRESS', label: 'In Progress (กำลังดำเนินการ)' },
    { value: 'WAITING_CUSTOMER', label: 'Waiting Customer (รอลูกค้าตอบกลับ)' },
    { value: 'RESOLVED', label: 'Resolved (แก้ไขเสร็จแล้ว)' },
    { value: 'CLOSED', label: 'Closed (ปิดตั๋วเรียบร้อย)' },
  ];

  apiCustomerCombobox = `${apiBaseUrl}/api/pm/customers/combobox`;
  apiProjectCombobox = `${apiBaseUrl}/api/pm/customer-projects/combobox`;

  dataResource = httpResource<PmMaTicketModel>(() =>
    this.id() ? `${apiBaseUrl}/api/pm/ma-tickets/${this.id()}` : undefined
  );

  pageDirty = () => this.formData?.dirty ?? false;

  constructor() {
    effect(() => {
      const data = this.dataResource.value();
      if (data) {
        this.formData.form.patchValue(data);
      }
    });
  }

  ngOnInit(): void {
    this.formData = new SicFromData<PmMaTicketModel>(Pmdt21Form.createForm(this.fb));

    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id.set(idParam);
    } else {
      this.formData.form.patchValue({ state: SicEntityState.Added });
    }
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/ma-ticket']);
  }

  submit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving.set(true);
    const val = this.formData.value;
    if (!val.state) {
      val.state = this.id() ? SicEntityState.Modified : SicEntityState.Added;
    }

    this.service.save(val).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูล Ticket MA เรียบร้อย');
        this.formData.form.markAsPristine();
        this.router.navigate(['/feature/pm/ma-ticket']);
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'บันทึกข้อมูลไม่สำเร็จ');
      },
      complete: () => this.isSaving.set(false),
    });
  }
}

export default Pmdt21Component;
