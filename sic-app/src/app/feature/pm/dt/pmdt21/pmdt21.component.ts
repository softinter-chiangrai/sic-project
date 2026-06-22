import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';

// ===== Model =====
export interface MATicketModel {
  id: string;
  ticketNo: string;
  ticketType: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  contractId: string;
  contractNo?: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  assignedTo: string;
  sla: string;
  reportedDate: string;
  dueDate: string;
  resolvedDate?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt21Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      ticketNo: [null, [Validators.required, Validators.maxLength(30)]],
      ticketType: [null, [Validators.required]],
      customerId: [null, [Validators.required]],
      customerName: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      contractId: [null, [Validators.required]],
      contractNo: [null],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required, Validators.maxLength(2000)]],
      severity: ['Medium', [Validators.required]],
      status: ['Open', [Validators.required]],
      assignedTo: [null, [Validators.maxLength(100)]],
      sla: [null, [Validators.maxLength(50)]],
      reportedDate: [null, [Validators.required]],
      dueDate: [null, [Validators.required]],
      resolvedDate: [null],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt21Service {
  private mockTickets: MATicketModel[] = [
    {
      id: '1',
      ticketNo: 'MA-001',
      ticketType: 'Bug Support',
      customerId: '1',
      customerName: 'สมชาย ใจดี',
      projectId: '1',
      projectName: 'ระบบ CRM',
      contractId: '2',
      contractNo: 'CT-002',
      title: 'ระบบไม่สามารถส่งอีเมลแจ้งเตือนได้',
      description: 'ลูกค้าแจ้งว่าระบบไม่สามารถส่งอีเมลแจ้งเตือนเมื่อมีงานใหม่',
      severity: 'High',
      status: 'In Progress',
      assignedTo: 'วิชัย พัฒนาชัย',
      sla: '48 ชั่วโมง',
      reportedDate: '2024-03-01 09:00:00',
      dueDate: '2024-03-03 09:00:00',
      resolvedDate: '',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxCustomer = '/api/ma-ticket/combobox-customer';
  apiGetComboboxProject = '/api/ma-ticket/combobox-project';
  apiGetComboboxContract = '/api/ma-ticket/combobox-contract';
  apiGetLovTicketType = '/api/ma-ticket/lov-type';
  apiGetLovSeverity = '/api/ma-ticket/lov-severity';
  apiGetLovStatus = '/api/ma-ticket/lov-status';

  save(data: MATicketModel): Observable<string> {
    console.log('📝 Saving MA ticket:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getTicket(id: string): Observable<MATicketModel> {
    const found = this.mockTickets.find((t) => t.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: MATicketModel = {
      id: '',
      ticketNo: '',
      ticketType: '',
      customerId: '',
      customerName: '',
      projectId: '',
      projectName: '',
      contractId: '',
      contractNo: '',
      title: '',
      description: '',
      severity: 'Medium',
      status: 'Open',
      assignedTo: '',
      sla: '',
      reportedDate: '',
      dueDate: '',
      resolvedDate: '',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
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
  styles: [],
})
export class Pmdt21Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt21Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  ticketId: string | null = null;
  isLoading = false;

  // ===== Options =====
  ticketTypeOptions = [
    'Bug Support',
    'Data Issue',
    'User Support',
    'Change Request',
    'Performance Issue',
    'Security Issue',
    'Server / Infra Issue',
  ];
  severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  statusOptions = ['Open', 'In Progress', 'Waiting Customer', 'Resolved', 'Closed'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.ticketId = id;
        this.loadTicket(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt21Form.createForm(this.fb);
  }

  loadTicket(id: string) {
    this.isLoading = true;
    this.service.getTicket(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล MA Ticket สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล MA Ticket รหัสนี้');
        this.router.navigate(['/feature/pm/ma-ticket']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/ma-ticket']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.form.value;
    this.service.save(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล MA Ticket ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/ma-ticket']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Open: 'เปิด',
      'In Progress': 'กำลังดำเนินการ',
      'Waiting Customer': 'รอลูกค้า',
      Resolved: 'แก้ไขแล้ว',
      Closed: 'ปิด',
    };
    return map[status] || status;
  }
}

export default Pmdt21Component;
