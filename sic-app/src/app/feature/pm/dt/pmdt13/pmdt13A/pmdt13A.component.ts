// src/app/feature/pm/dt/pmdt13/pmdt13A/pmdt13A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
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
    SicInputAreaComponent,
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
  scenarioOptions = signal<{ value: string; text: string }[]>([]);

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

    const pId = this.customerState.getProjectId();
    if (pId) {
      this.formData.form.patchValue({ projectId: pId });
      this.loadScenarios(pId);
    } else {
      this.loadScenarios();
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.testCaseId = id;
        this.isEdit.set(!this.isView() && !this.isExecution());
        this.loadTestCase(id);
      } else {
        const randomCode = 'TC-' + Math.floor(1000 + Math.random() * 9000);
        this.formData.form.patchValue({ testCaseCode: randomCode });
      }
    });
  }

  loadScenarios(projectId?: string): void {
    this.service.getTestScenarios(projectId).subscribe((scenarios) => {
      const list = (scenarios || []).map((s) => ({ value: s.id!, text: s.scenarioName }));
      this.scenarioOptions.set(list);
    });
  }

  loadTestCase(id: string): void {
    this.isLoading.set(true);
    this.service.getTestCaseById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
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
