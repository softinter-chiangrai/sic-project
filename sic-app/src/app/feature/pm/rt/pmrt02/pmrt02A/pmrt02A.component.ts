// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmrt02AService } from './pmrt02A.service';
import { NavigationService } from '../../../../../core/services/navigation.service';

import { ProjectModel } from './pmrt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';


@Component({
  selector: 'app-pmrt02a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicDatepickerComponent,
    SicNumberComponent,
    SicComboboxComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmrt02A.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [],
})
export class Pmrt02AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private projectService = inject(Pmrt02AService);
  private customerState = inject(CustomerStateService);
  private navigation = inject(NavigationService);
  private cdr = inject(ChangeDetectorRef);

  formData!: SicFromData<any>;
  get form(): FormGroup {
    return this.formData?.formGroup;
  }
  isEdit = false;
  isViewOnly = false;
  projectId: string | null = null;
  isLoading = false;
  isSaving = false; // ✅ เพิ่ม property

  customerName = signal<string>('');

  pageDirty = () => this.isViewOnly ? false : (this.formData?.isChanged ?? false);

  statusOptions = [
    { value: 'Prospect', text: 'Prospect' },
    { value: 'Contract Drafting', text: 'Contract Drafting' },
    { value: 'Contract Signed', text: 'Contract Signed' },
    { value: 'Requirement Gathering', text: 'Requirement Gathering' },
    { value: 'Requirement Approval', text: 'Requirement Approval' },
    { value: 'System Analysis', text: 'System Analysis' },
    { value: 'DFD Design', text: 'DFD Design' },
    { value: 'ER Design', text: 'ER Design' },
    { value: 'Specification Design', text: 'Specification Design' },
    { value: 'Specification Approval', text: 'Specification Approval' },
    { value: 'Planning', text: 'Planning' },
    { value: 'Development', text: 'Development' },
    { value: 'Internal Testing', text: 'Internal Testing' },
    { value: 'UAT', text: 'UAT' },
    { value: 'Bug Fixing', text: 'Bug Fixing' },
    { value: 'Ready for Delivery', text: 'Ready for Delivery' },
    { value: 'Delivered', text: 'Delivered' },
    { value: 'Invoicing', text: 'Invoicing' },
    { value: 'Closed', text: 'Closed' },
    { value: 'MA Active', text: 'MA Active' },
  ];
  priorityOptions = [
    { value: 'Low', text: 'Low' },
    { value: 'Medium', text: 'Medium' },
    { value: 'High', text: 'High' },
    { value: 'Critical', text: 'Critical' },
  ];

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      if (mode === 'view') {
        this.isViewOnly = true;
      }
      const customerId = params['customerId'];
      const customerName = params['customerName'] || '';
      if (customerId) {
        this.form.patchValue({ customerId: customerId });
        if (customerName) {
          this.customerName.set(customerName);
        }
      }
    });

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.projectId = id;
        this.loadProject(id);
      }
    });
  }

  initForm(): void {
    this.formData = new SicFromData<any>(this.fb.group({
      id: [null],
      projectCode: [null, [Validators.required, Validators.maxLength(30)]],
      projectName: [null, [Validators.required, Validators.maxLength(255)]],
      customerId: [null],
      contractId: [null],
      contractNo: [null],
      startDate: [null, [Validators.required]],
      plannedEndDate: [null, [Validators.required]],
      actualEndDate: [null],
      budgetManday: [null, [Validators.required, Validators.min(0)]],
      usedManday: [0, [Validators.min(0)]],
      status: ['Prospect', [Validators.required]],
      priority: ['Medium', [Validators.required]],
      description: [null],
      isActive: [true],
    }));
  }

  loadProject(id: string) {
    this.isLoading = true;
    this.projectService
      .getById(id)
      .pipe(finalize(() => {
      this.isLoading = false;
      if (this.isViewOnly) {
        this.form.disable();
      }
      this.formData.resetModel(this.form.getRawValue());
      this.cdr.detectChanges(); // ✅ บังคับอัปเดต View ทันที
    }))
      .subscribe({
        next: (data: ProjectModel) => {
          this.form.patchValue(data);
          if (data.customerName) {
            this.customerName.set(data.customerName);
          }
          this.formData.resetModel(this.form.getRawValue());
        },
        error: (err) => {
          console.error('Load project error:', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบโครงการ');
          this.navigation.navigate(['/feature/pm/project']);
        },
      });
  }

  onBack(): void {
    const customerId = this.form.get('customerId')?.value;
    if (customerId) {
      this.customerState.setCustomer(customerId);
      this.navigation.navigate(['/feature/pm/project']);
    } else {
      this.navigation.navigate(['/feature/pm/project']);
    }
  }

  submit() {
    if (this.isViewOnly) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const data = this.form.getRawValue() as ProjectModel;

    // ✅ ตรวจสอบ before call
    let request$;
    if (this.isEdit && this.projectId) {
      request$ = this.projectService.update(this.projectId, data);
    } else {
      request$ = this.projectService.create(data);
    }

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.form.markAsPristine();
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลโครงการถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          // ✅ กลับไป project พร้อม customerId (ใช้ CustomerStateService)
          const customerId = this.form.get('customerId')?.value;
          if (customerId) this.customerState.setCustomer(customerId);
          this.navigation.navigate(['/feature/pm/project']);
        });
      },
      error: (err) => {
        this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }
}
