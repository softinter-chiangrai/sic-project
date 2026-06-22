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
export interface ApprovalDetailModel {
  id: string;
  documentType: string;
  documentCode: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  requester: string;
  requestedDate: string;
  dueDate?: string;
  approver: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Need Revision' | 'Cancelled';
  comment?: string;
  attachments?: string[];
  isActive: boolean;
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt23Service {
  private mockApproval: ApprovalDetailModel = {
    id: '1',
    documentType: 'Requirement',
    documentCode: 'REQ-002',
    title: 'จัดการข้อมูลลูกค้า',
    description: 'เพิ่ม/แก้ไข/ลบ/ค้นหา ข้อมูลลูกค้า',
    projectId: '1',
    projectName: 'ระบบ CRM',
    requester: 'สมหญิง รักเรียน',
    requestedDate: '2024-02-20 10:30:00',
    dueDate: '2024-02-27',
    approver: 'BA, Customer',
    status: 'Pending',
    comment: '',
    attachments: ['requirement_v1.pdf'],
    isActive: true,
  };

  getApproval(id: string): Observable<ApprovalDetailModel> {
    const found = { ...this.mockApproval, id: id };
    return of(found).pipe(delay(300));
  }

  approve(data: any): Observable<string> {
    console.log('✅ Approving:', data);
    return of('อนุมัติสำเร็จ').pipe(delay(500));
  }

  reject(data: any): Observable<string> {
    console.log('❌ Rejecting:', data);
    return of('ปฏิเสธสำเร็จ').pipe(delay(500));
  }

  requestRevision(data: any): Observable<string> {
    console.log('🔄 Requesting revision:', data);
    return of('ขอแก้ไขสำเร็จ').pipe(delay(500));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt23',
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
  templateUrl: './pmdt23.component.html',
  styles: [],
})
export class Pmdt23Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt23Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  approvalId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  approvalData!: ApprovalDetailModel;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.approvalId = id;
        this.loadApproval(id);
      } else {
        this.router.navigate(['/feature/pm/approval']);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      documentType: [null],
      documentCode: [null],
      title: [null],
      description: [null],
      projectName: [null],
      requester: [null],
      requestedDate: [null],
      dueDate: [null],
      approver: [null],
      status: [null],
      comment: ['', Validators.maxLength(500)],
      attachments: [[]],
      isActive: [true],
    });
  }

  loadApproval(id: string) {
    this.isLoading = true;
    this.service.getApproval(id).subscribe({
      next: (data) => {
        this.approvalData = data;
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลอนุมัติสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลการอนุมัตินี้');
        this.router.navigate(['/feature/pm/approval']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/approval']);
  }

  // ✅ แก้ไขใช้ confirm() ของ JavaScript แทน (รับ 1 argument)
  approve() {
    const confirmed = confirm('คุณต้องการอนุมัติรายการนี้ใช่หรือไม่?');
    if (confirmed) {
      this.isSubmitting = true;
      const data = {
        id: this.approvalId,
        status: 'Approved',
        comment: this.form.value.comment,
      };
      this.service.approve(data).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialog.success('อนุมัติสำเร็จ', 'รายการได้รับการอนุมัติแล้ว').then(() => {
            this.router.navigate(['/feature/pm/approval']);
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.dialog.error('อนุมัติไม่สำเร็จ', error);
        },
      });
    }
  }

  // ✅ แก้ไขใช้ confirm() ของ JavaScript แทน
  reject() {
    const confirmed = confirm('คุณต้องการปฏิเสธรายการนี้ใช่หรือไม่?');
    if (confirmed) {
      this.isSubmitting = true;
      const data = {
        id: this.approvalId,
        status: 'Rejected',
        comment: this.form.value.comment,
      };
      this.service.reject(data).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialog.success('ปฏิเสธสำเร็จ', 'รายการถูกปฏิเสธแล้ว').then(() => {
            this.router.navigate(['/feature/pm/approval']);
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.dialog.error('ปฏิเสธไม่สำเร็จ', error);
        },
      });
    }
  }

  // ✅ แก้ไขใช้ confirm() ของ JavaScript แทน
  requestRevision() {
    if (!this.form.value.comment) {
      this.dialog.warn('กรุณาใส่ข้อความ', 'ต้องระบุข้อความเพื่อขอแก้ไข');
      return;
    }
    const confirmed = confirm('คุณต้องการขอให้แก้ไขรายการนี้ใช่หรือไม่?');
    if (confirmed) {
      this.isSubmitting = true;
      const data = {
        id: this.approvalId,
        status: 'Need Revision',
        comment: this.form.value.comment,
      };
      this.service.requestRevision(data).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialog.success('ขอแก้ไขสำเร็จ', 'ได้แจ้งให้ผู้ขอแก้ไขแล้ว').then(() => {
            this.router.navigate(['/feature/pm/approval']);
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.dialog.error('ขอแก้ไขไม่สำเร็จ', error);
        },
      });
    }
  }

  // ✅ เพิ่ม getStatusClass
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Need Revision': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || map['Pending'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Pending: 'รอดำเนินการ',
      Approved: 'อนุมัติ',
      Rejected: 'ไม่อนุมัติ',
      'Need Revision': 'ต้องแก้ไข',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  pageDirty = () => this.form?.dirty ?? false;
}

export default Pmdt23Component;