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
export interface BugModel {
  id: string;
  bugCode: string;
  title: string;
  description: string;
  severity: string;
  priority: string;
  foundBy: string;
  assignedTo: string;
  relatedTestCase: string;
  relatedTestCaseName?: string;
  relatedTask: string;
  relatedTaskName?: string;
  relatedSpec: string;
  relatedSpecName?: string;
  foundDate: string;
  fixDueDate: string;
  fixedDate?: string;
  status: string;
  projectId: string;
  projectName?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt17Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      bugCode: [null, [Validators.required, Validators.maxLength(30)]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required, Validators.maxLength(2000)]],
      severity: ['Medium', [Validators.required]],
      priority: ['High', [Validators.required]],
      foundBy: [null, [Validators.maxLength(100)]],
      assignedTo: [null, [Validators.maxLength(100)]],
      relatedTestCase: [null],
      relatedTestCaseName: [null],
      relatedTask: [null],
      relatedTaskName: [null],
      relatedSpec: [null],
      relatedSpecName: [null],
      foundDate: [null, [Validators.required]],
      fixDueDate: [null, [Validators.required]],
      fixedDate: [null],
      status: ['Open', [Validators.required]],
      projectId: [null, [Validators.required]],
      projectName: [null],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt17Service {
  private mockBugs: BugModel[] = [
    {
      id: '1',
      bugCode: 'BUG-001',
      title: 'Tax ID ซ้ำแล้วไม่แจ้ง Error',
      description: 'กรณีกรอก Tax ID ซ้ำ ระบบไม่แจ้ง Error แต่บันทึกข้อมูลสำเร็จ',
      severity: 'High',
      priority: 'Urgent',
      foundBy: 'สมศักดิ์ รุ่งเรือง',
      assignedTo: 'สมชาย ใจดี',
      relatedTestCase: 'TC-CUS-002',
      relatedTestCaseName: 'กรอก Tax ID ซ้ำ',
      relatedTask: 'TASK-002',
      relatedTaskName: 'พัฒนา Customer API',
      relatedSpec: 'SPEC-001',
      relatedSpecName: 'Customer Management',
      foundDate: '2024-02-20 10:30:00',
      fixDueDate: '2024-02-23',
      fixedDate: '',
      status: 'Fixing',
      projectId: '1',
      projectName: 'ระบบ CRM',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/bug/combobox-project';
  apiGetComboboxTestCase = '/api/bug/combobox-testcase';
  apiGetComboboxTask = '/api/bug/combobox-task';
  apiGetComboboxSpec = '/api/bug/combobox-spec';
  apiGetLovSeverity = '/api/bug/lov-severity';
  apiGetLovPriority = '/api/bug/lov-priority';
  apiGetLovStatus = '/api/bug/lov-status';

  save(data: BugModel): Observable<string> {
    console.log('📝 Saving bug:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getBug(id: string): Observable<BugModel> {
    const found = this.mockBugs.find((b) => b.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: BugModel = {
      id: '',
      bugCode: '',
      title: '',
      description: '',
      severity: 'Medium',
      priority: 'High',
      foundBy: '',
      assignedTo: '',
      relatedTestCase: '',
      relatedTestCaseName: '',
      relatedTask: '',
      relatedTaskName: '',
      relatedSpec: '',
      relatedSpecName: '',
      foundDate: '',
      fixDueDate: '',
      fixedDate: '',
      status: 'Open',
      projectId: '',
      projectName: '',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt17',
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
  templateUrl: './pmdt17.component.html',
  styles: [],
})
export class Pmdt17Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt17Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  bugId: string | null = null;
  isLoading = false;

  // ===== Options =====
  severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  statusOptions = ['Open', 'Fixing', 'Fixed', 'Retest', 'Closed', 'Reopen'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.bugId = id;
        this.loadBug(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt17Form.createForm(this.fb);
  }

  loadBug(id: string) {
    this.isLoading = true;
    this.service.getBug(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Bug สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Bug รหัสนี้');
        this.router.navigate(['/feature/pm/bug']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/bug']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Bug ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/bug']);
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
      Fixing: 'กำลังแก้ไข',
      Fixed: 'แก้ไขแล้ว',
      Retest: 'รอทดสอบซ้ำ',
      Closed: 'ปิด',
      Reopen: 'เปิดใหม่',
    };
    return map[status] || status;
  }
}

export default Pmdt17Component;