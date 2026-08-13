import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pmdt10Service } from '../pmdt10.service';
import { Pmdt10AForm } from './pmdt10A.form';
import { PmBugModel } from '../pmdt10.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';

@Component({
  selector: 'app-pmdt10a',
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
  templateUrl: './pmdt10A.component.html',
  styleUrls: ['./pmdt10A.component.css']
})
export class Pmdt10AComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private service = inject(Pmdt10Service);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  formData!: SicFromData<PmBugModel>;
  isEdit = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  bugId: string | null = null;

  pageDirty = () => this.formData?.dirty ?? false;

  severityOptions = [
    { value: 'Critical', text: 'Critical' },
    { value: 'High', text: 'High' },
    { value: 'Medium', text: 'Medium' },
    { value: 'Low', text: 'Low' }
  ];

  priorityOptions = [
    { value: 'Urgent', text: 'Urgent' },
    { value: 'High', text: 'High' },
    { value: 'Medium', text: 'Medium' },
    { value: 'Low', text: 'Low' }
  ];

  statusOptions = [
    { value: 'Open', text: 'Open' },
    { value: 'In Progress', text: 'In Progress' },
    { value: 'Fixed', text: 'Fixed' },
    { value: 'Closed', text: 'Closed' },
    { value: 'Rejected', text: 'Rejected' }
  ];

  environmentOptions = [
    { value: 'Dev', text: 'Development' },
    { value: 'Staging', text: 'Staging' },
    { value: 'Prod', text: 'Production' }
  ];

  issueTypeOptions = [
    { value: 'Bug', text: 'Bug' },
    { value: 'Issue', text: 'Issue' },
    { value: 'Enhancement', text: 'Enhancement' }
  ];

  ngOnInit(): void {
    this.formData = new SicFromData<PmBugModel>(Pmdt10AForm.createForm(this.fb));
    const pId = this.customerState.getProjectId();
    if (pId) {
      this.formData.form.patchValue({ projectId: pId });
    }

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.bugId = id;
      this.isEdit.set(true);
      this.loadBug(id);
    } else {
      // Auto-generate code draft
      const randomCode = 'BUG-' + Math.floor(1000 + Math.random() * 9000);
      this.formData.form.patchValue({ bugCode: randomCode, foundDate: new Date().toISOString() });
    }
  }

  loadBug(id: string): void {
    this.isLoading.set(true);
    this.service.getBugById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        this.formData.markAsPristine();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่พบข้อมูล Bug นี้');
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

    this.service.saveBug(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.formData.markAsPristine();
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูล Bug / Issue เรียบร้อยแล้ว').then(() => {
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
