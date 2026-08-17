// src/app/feature/pm/dt/pmdt13/pmdt13A/pmdt13A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmdt13AForm } from './pmdt13A.form';
import { PmTestCaseModel } from './pmdt13A.model';
import { Pmdt13AService } from './pmdt13A.service';

@Component({
  selector: 'app-pmdt13A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicComboboxComponent,
    SicDatepickerComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmdt13A.component.html',
  styleUrls: ['./pmdt13A.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Pmdt13AComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt13AService);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);

  formData!: SicFromData<PmTestCaseModel>;
  isEdit = signal(false);
  isView = signal(false);
  isExecution = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  testCaseId: string | null = null;
  taskOptions = signal<{ value: string; text: string }[]>([]);
  taskLoading = signal(false);

  // Multi-tester support
  businessId = signal<string | null>(null);
  testerValues = signal<string[]>([]);
  testerApiUrl = computed(() => {
    const bId = this.businessId();
    return bId
      ? `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${bId}`
      : `${environment.apiBaseUrl}/api/business/combobox-members`;
  });

  pageDirty = () => this.formData?.dirty ?? false;

  priorityOptions = [
    { value: 'High', text: 'High' },
    { value: 'Medium', text: 'Medium' },
    { value: 'Low', text: 'Low' },
  ];

  statusOptions = [
    { value: 'Pending', text: 'Pending (รอทดสอบ)' },
    { value: 'Pass', text: 'Pass (ผ่าน)' },
    { value: 'Fail', text: 'Fail (ไม่ผ่าน)' },
    { value: 'Blocked', text: 'Blocked (ติดปัญหา)' },
  ];

  ngOnInit(): void {
    this.formData = new SicFromData<PmTestCaseModel>(Pmdt13AForm.createForm(this.fb));

    const currentUrl = this.router.url;
    if (currentUrl.includes('/view')) {
      this.isView.set(true);
    } else if (currentUrl.includes('/test-execution')) {
      this.isExecution.set(true);
    }

    const bId = localStorage.getItem('businessId');
    if (bId) {
      this.businessId.set(bId);
    }

    const pId = this.customerState.getProjectId();
    if (pId) {
      this.formData.form.patchValue({ projectId: pId });
      this.loadTasks(pId);
    } else {
      this.loadTasks();
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.testCaseId = id;
        this.isEdit.set(!this.isView() && !this.isExecution());
        this.loadTestCase(id);
      }
    });
  }

  onTesterChange(selected: any): void {
    if (Array.isArray(selected)) {
      const names = selected.map((item: any) => {
        if (typeof item === 'string') return item;
        return item.text || item.userName || item.name || item.value || '';
      }).filter((n: string) => !!n).join(', ');
      this.formData.form.patchValue({ tester: names || null });
    } else if (selected) {
      const name = selected.text || selected.userName || selected.name || selected.value || (typeof selected === 'string' ? selected : '');
      this.formData.form.patchValue({ tester: name || null });
    } else {
      this.formData.form.patchValue({ tester: null });
    }
  }

  loadTasks(projectId?: string): void {
    this.taskLoading.set(true);
    this.service.getTasksCombobox(projectId).subscribe({
      next: (tasks) => {
        const list = (tasks || []).map((t: any) => ({
          value: t.value || t.id,
          text: t.text || `${t.taskCode} - ${t.taskName}`,
        }));
        this.taskOptions.set(list);
        this.taskLoading.set(false);
      },
      error: () => {
        this.taskLoading.set(false);
      },
    });
  }

  onTaskChange(taskId: string | null): void {
    if (!taskId) {
      this.formData.form.patchValue({
        taskId: null,
        relatedTask: null,
        taskCode: null,
        taskName: null,
      });
      return;
    }

    const selectedTaskOption = this.taskOptions().find((o) => o.value === taskId);
    const taskLabel = selectedTaskOption ? selectedTaskOption.text : '';

    this.formData.form.patchValue({
      taskId: taskId,
      relatedTask: taskLabel,
    });

    // Auto-fetch Task details for Specification & Requirement link
    this.service.getTaskById(taskId).subscribe({
      next: (taskDetail) => {
        if (taskDetail) {
          const specId = taskDetail.specificationId;
          const specCode = taskDetail.specificationCode;
          const specTitle = taskDetail.specificationTitle;

          if (specCode || specTitle) {
            const specText = specCode && specTitle ? `${specCode} - ${specTitle}` : (specCode || specTitle);
            this.formData.form.patchValue({ relatedSpec: specText });
          }

          if (specId) {
            // Fetch spec detail to get Requirement information
            this.service.getSpecificationById(specId).subscribe({
              next: (specData) => {
                if (specData) {
                  const reqCode = specData.requirementCode;
                  const reqTitle = specData.requirementTitle;
                  if (reqCode || reqTitle) {
                    const reqText = reqCode && reqTitle ? `${reqCode} - ${reqTitle}` : (reqCode || reqTitle);
                    this.formData.form.patchValue({ relatedRequirement: reqText });
                  }
                }
              },
              error: (e) => console.error('Error loading spec for requirement auto-fill:', e),
            });
          }
        }
      },
      error: (e) => console.error('Error loading task details:', e),
    });
  }

  loadTestCase(id: string): void {
    this.isLoading.set(true);
    this.service.getTestCaseById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        if (data.scenarioName && !data.scenarioId) {
          this.formData.form.patchValue({ scenarioName: data.scenarioName });
        }
        if (data.tester) {
          const names = data.tester.split(',').map((s) => s.trim()).filter((s) => !!s);
          this.testerValues.set(names);
        } else {
          this.testerValues.set([]);
        }
        this.formData.markAsPristine();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่พบข้อมูล Test Case นี้');
        this.onBack();
      },
    });
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นให้ถูกต้อง');
      return;
    }

    const data = { ...this.formData.value };
    data.state = this.isEdit() || this.isExecution() ? 3 : 4;

    if (this.isExecution() && data.testStatus === 'Fail') {
      this.dialog.confirm('แจ้งเตือน', 'ต้องการสร้าง Bug จากผลการทดสอบนี้หรือไม่?').then((confirmed) => {
        if (confirmed) {
          this.createBugAndSave(data);
        } else {
          this.saveExecution(data);
        }
      });
    } else {
      this.saveExecution(data);
    }
  }

  saveExecution(data: any) {
    this.isSaving.set(true);
    this.service.saveTestCase(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.formData.markAsPristine();
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูล Test Case เรียบร้อยแล้ว').then(() => {
          this.onBack();
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('บันทึกไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการบันทึก');
      },
    });
  }

  createBugAndSave(data: any) {
    this.isSaving.set(true);
    const bugData = {
      projectId: data.projectId,
      bugCode: 'BUG-' + Math.floor(1000 + Math.random() * 9000),
      title: `Bug จาก Test Case: ${data.testCaseCode} - ${data.title || ''}`,
      description: `พบปัญหาในการทดสอบ ${data.testCaseCode}\n\nผลลัพธ์จริง: ${data.actualResult || ''}`,
      severity: 'Medium',
      priority: data.priority || 'High',
      status: 'Open',
      testCaseId: data.id,
      testCaseCode: data.testCaseCode,
      relatedSpec: data.relatedSpec,
      state: 4,
    };

    this.service.createBugFromTest(bugData).subscribe({
      next: () => {
        this.saveExecution(data);
      },
      error: (err) => {
        console.error('Create bug error:', err);
        // If bug create fails, still save test case
        this.saveExecution(data);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/test-case']);
  }
}

export default Pmdt13AComponent;
