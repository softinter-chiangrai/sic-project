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
export interface TestExecutionModel {
  id: string;
  testCode: string;
  testCase: string;
  module: string;
  scenario: string;
  steps: string[];
  expectedResult: string;
  actualResult: string;
  status: string;
  testType: string;
  tester: string;
  testDate: string;
  bugId?: string;
  bugCode?: string;
  comment?: string;
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt16Service {
  private mockTest: TestExecutionModel = {
    id: '3',
    testCode: 'TC-LOG-001',
    testCase: 'กรอก Username/Password ถูกต้อง',
    module: 'Login System',
    scenario: 'เข้าสู่ระบบ',
    steps: ['กรอก Username', 'กรอก Password', 'กด Login'],
    expectedResult: 'เข้าสู่ระบบสำเร็จ',
    actualResult: '',
    status: 'Pending',
    testType: 'System Test',
    tester: 'มานี มีทรัพย์',
    testDate: '',
    comment: '',
  };

  saveExecution(data: TestExecutionModel): Observable<string> {
    console.log('📝 Saving test execution:', data);
    return of('บันทึกผลการทดสอบสำเร็จ').pipe(delay(500));
  }

  createBugFromTest(data: any): Observable<string> {
    console.log('🐛 Creating bug from test:', data);
    return of('สร้าง Bug สำเร็จ').pipe(delay(500));
  }

  getTestExecution(id: string): Observable<TestExecutionModel> {
    const found = { ...this.mockTest, id: id };
    return of(found).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt16',
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
  templateUrl: './pmdt16.component.html',
  styles: [],
})
export class Pmdt16Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt16Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  testId: string | null = null;
  isLoading = false;
  testCode = '';
  testCase = '';
  isSubmitting = false;

  // ===== Options =====
  statusOptions = ['Pass', 'Fail', 'Blocked'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.testId = id;
        this.loadTest(id);
      } else {
        this.router.navigate(['/feature/pm/test-case']);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      testCode: [null],
      testCase: [null],
      module: [null],
      scenario: [null],
      steps: [[]],
      expectedResult: [null],
      actualResult: [null, [Validators.required]],
      status: ['Pending', [Validators.required]],
      testType: [null],
      tester: [null],
      testDate: [null],
      bugId: [null],
      bugCode: [null],
      comment: [null, [Validators.maxLength(500)]],
    });
  }

  loadTest(id: string) {
    this.isLoading = true;
    this.service.getTestExecution(id).subscribe({
      next: (data) => {
        this.testCode = data.testCode;
        this.testCase = data.testCase;
        this.form.patchValue(data);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Test รหัสนี้');
        this.router.navigate(['/feature/pm/test-case']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/test-case']);
  }

  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกผลการทดสอบ');
    return;
  }

  this.isSubmitting = true;
  const data = this.form.value;
  data.id = this.testId;

  if (data.status === 'Fail' && !data.bugId) {
    // ✅ ใช้ confirm() แทน
    const confirmed = confirm('ต้องการสร้าง Bug จากผลการทดสอบนี้หรือไม่?');
    if (confirmed) {
      this.createBugAndSave(data);
    } else {
      this.saveExecution(data);
    }
  } else {
    this.saveExecution(data);
  }
}

  saveExecution(data: any) {
    this.service.saveExecution(data).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.dialog.success('บันทึกสำเร็จ', 'ผลการทดสอบถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/test-case']);
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  createBugAndSave(data: any) {
    const bugData = {
      title: `Bug from Test: ${this.testCode}`,
      description: `พบปัญหาในการทดสอบ ${this.testCode}\n\n${data.comment || ''}`,
      severity: 'Medium',
      priority: 'High',
      relatedTestId: this.testId,
      // ... other fields
    };

    this.service.createBugFromTest(bugData).subscribe({
      next: (response) => {
        // แก้ไข data ให้มี bugId
        data.bugId = 'new-bug-id';
        data.bugCode = 'BUG-NEW';

        this.service.saveExecution(data).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.dialog.success('บันทึกสำเร็จ', 'ผลการทดสอบและ Bug ถูกสร้างเรียบร้อย').then(() => {
              this.form.markAsPristine();
              this.router.navigate(['/feature/pm/test-case']);
            });
          },
          error: (error) => {
            this.isSubmitting = false;
            this.dialog.error('บันทึกไม่สำเร็จ', error);
          },
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.dialog.error('สร้าง Bug ไม่สำเร็จ', error);
      },
    });
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Pass: 'ผ่าน',
      Fail: 'ไม่ผ่าน',
      Blocked: 'ติดปัญหา',
      Pending: 'รอทดสอบ',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Fail: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Blocked: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || map['Pending'];
  }
}

export default Pmdt16Component;