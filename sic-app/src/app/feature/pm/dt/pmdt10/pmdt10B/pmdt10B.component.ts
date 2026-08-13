import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pmdt10Service } from '../pmdt10.service';
import { Pmdt10BForm } from './pmdt10B.form';
import { PmTestCaseModel } from '../pmdt10.model';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';

@Component({
  selector: 'app-pmdt10b',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicComboboxComponent,
    SicDatepickerComponent,
    SicInputAreaComponent
  ],
  templateUrl: './pmdt10B.component.html',
  styleUrls: ['./pmdt10B.component.css']
})
export class Pmdt10BComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private service = inject(Pmdt10Service);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  formData!: SicFromData<PmTestCaseModel>;
  isEdit = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  testCaseId: string | null = null;
  scenarioOptions = signal<{ value: string; text: string }[]>([]);

  pageDirty = () => this.formData?.dirty ?? false;

  priorityOptions = [
    { value: 'High', text: 'High' },
    { value: 'Medium', text: 'Medium' },
    { value: 'Low', text: 'Low' }
  ];

  statusOptions = [
    { value: 'Pending', text: 'Pending' },
    { value: 'Pass', text: 'Pass' },
    { value: 'Fail', text: 'Fail' },
    { value: 'Blocked', text: 'Blocked' },
    { value: 'Skip', text: 'Skip' }
  ];

  ngOnInit(): void {
    this.formData = new SicFromData<PmTestCaseModel>(Pmdt10BForm.createForm(this.fb));
    const pId = this.customerState.getProjectId();
    if (pId) {
      this.formData.form.patchValue({ projectId: pId });
      this.loadScenarios(pId);
    } else {
      this.loadScenarios();
    }

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.testCaseId = id;
      this.isEdit.set(true);
      this.loadTestCase(id);
    } else {
      const randomCode = 'TC-' + Math.floor(1000 + Math.random() * 9000);
      this.formData.form.patchValue({ testCaseCode: randomCode });
    }
  }

  loadScenarios(projectId?: string): void {
    this.service.getTestScenarios(projectId).subscribe((scenarios) => {
      const list = (scenarios || []).map(s => ({ value: s.id!, text: s.scenarioName }));
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
      }
    });
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นให้ถูกต้อง');
      return;
    }

    this.isSaving.set(true);
    const data = { ...this.formData.value };
    data.state = this.isEdit() ? 3 : 4;

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
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }
}
