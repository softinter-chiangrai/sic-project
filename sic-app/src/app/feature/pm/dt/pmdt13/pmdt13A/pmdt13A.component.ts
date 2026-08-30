import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-entity-state';
import { ToForm } from '../../../../../core/types/form.type';

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
  static createForm(fb: FormBuilder): FormGroup<ToForm<BugModel>> {
    return fb.group<ToForm<BugModel>>({
      id: fb.control(null),
      bugCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      title: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      description: fb.control(null, [Validators.required, Validators.maxLength(2000)]),
      severity: fb.control('Medium', [Validators.required]),
      priority: fb.control('High', [Validators.required]),
      foundBy: fb.control(null, [Validators.maxLength(100)]),
      assignedTo: fb.control(null, [Validators.maxLength(100)]),
      relatedTestCase: fb.control(null),
      relatedTestCaseName: fb.control(null),
      relatedTask: fb.control(null),
      relatedTaskName: fb.control(null),
      relatedSpec: fb.control(null),
      relatedSpecName: fb.control(null),
      foundDate: fb.control(null, [Validators.required]),
      fixDueDate: fb.control(null, [Validators.required]),
      fixedDate: fb.control(null),
      status: fb.control('Open', [Validators.required]),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control(null),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt13AService {
  private mockBugs: BugModel[] = [
    {
      id: '1',
      bugCode: 'BUG-001',
      title: 'Tax ID บันทึกค่าซ้ำได้',
      description: 'เมื่อกรอกเลข Tax ID ซ้ำกับที่มีในระบบ ระบบยอมให้บันทึกได้ ไม่มีการแจ้งเตือน',
      severity: 'High',
      priority: 'Critical',
      foundBy: 'สมชาย ใจดี',
      assignedTo: 'วิชัย พัฒนาชัย',
      relatedTestCase: 'TC-002',
      relatedTestCaseName: 'ทดสอบ Tax ID ซ้ำ',
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
      relatedTask: '',
      relatedSpec: '',
      foundDate: '',
      fixDueDate: '',
      fixedDate: '',
      status: 'Open',
      projectId: '',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt13a',
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
  templateUrl: './pmdt13A.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [],
})
export class Pmdt13AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt13AService);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  formData!: SicFromData<BugModel>;
  isEdit = false;
  bugId: string | null = null;
  isLoading = false;

  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  // ===== Options =====
  severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  statusOptions = ['Open', 'Fixing', 'Fixed', 'Retest', 'Closed', 'Reopen'];

  pageDirty = () => this.formData?.isChanged ?? false;

  ngOnInit(): void {
    const rawForm = Pmdt17Form.createForm(this.fb);
    this.formData = new SicFromData<BugModel>(rawForm);

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.bugId = id;
        this.loadBug(id);
      }
    });
  }

  loadBug(id: string) {
    this.isLoading = true;
    this.service.getBug(id).subscribe({
      next: (data) => {
        this.formData.formGroup.patchValue(data);
        this.formData.markAsPristine();
        this.isLoading = false;
        this.cdr.detectChanges();
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
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.formData.value;
    data.state = this.isEdit ? SicEntityState.Modified : SicEntityState.Added;

    this.service.save(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Bug ถูกบันทึกเรียบร้อย').then(() => {
          this.formData.markAsPristine();
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

export default Pmdt13AComponent;