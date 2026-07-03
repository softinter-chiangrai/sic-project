// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmrt02AService } from './pmrt02A.service';
import { NavigationService } from '../../../../../core/services/navigation.service';

// ===== Interface =====
export interface ProjectModel {
  id?: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName?: string;
  contractId?: string;
  contractNo?: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  isActive: boolean;
  createdAt?: string;
  rowVersion?: number;
}

@Component({
  selector: 'app-pmrt02a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicDatepickerComponent,
    SicNumberComponent,
  ],
  templateUrl: './pmrt02A.component.html',
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

  form!: FormGroup;
  isEdit = false;
  projectId: string | null = null;
  isLoading = false;
  isSaving = false; // ✅ เพิ่ม property

  customerName = signal<string>('');

  statusOptions = [
    'Prospect',
    'Contract Drafting',
    'Contract Signed',
    'Requirement Gathering',
    'Requirement Approval',
    'System Analysis',
    'DFD Design',
    'ER Design',
    'Specification Design',
    'Specification Approval',
    'Planning',
    'Development',
    'Internal Testing',
    'UAT',
    'Bug Fixing',
    'Ready for Delivery',
    'Delivered',
    'Invoicing',
    'Closed',
    'MA Active',
  ];
  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams.subscribe((params) => {
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
    this.form = this.fb.group({
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
    });
  }

  loadProject(id: string) {
    this.isLoading = true;
    this.projectService
      .getById(id)
      .pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // ✅ บังคับอัปเดต View ทันที
    }))
      .subscribe({
        next: (data: ProjectModel) => {
          this.form.patchValue(data);
          if (data.customerName) {
            this.customerName.set(data.customerName);
          }
        },
        error: (err) => {
          console.error('Load project error:', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบโครงการ');
          this.navigation.navigate(['/feature/pm/pmrt02']);
        },
      });
  }

  onBack(): void {
    const customerId = this.form.get('customerId')?.value;
    if (customerId) {
      this.customerState.setCustomer(customerId);
      this.navigation.navigate(['/feature/pm/pmrt02']);
    } else {
      this.navigation.navigate(['/feature/pm/pmrt02']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const data = this.form.value as ProjectModel;

    // ✅ ตรวจสอบ before call
    let request$;
    if (this.isEdit && this.projectId) {
      request$ = this.projectService.update(this.projectId, data);
    } else {
      request$ = this.projectService.create(data);
    }

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลโครงการถูกบันทึกเรียบร้อย');
        // ✅ กลับไป pmrt02 พร้อม customerId (ใช้ CustomerStateService)
        const customerId = this.form.get('customerId')?.value;
        if (customerId) this.customerState.setCustomer(customerId);
        this.navigation.navigate(['/feature/pm/pmrt02']);
      },
      error: (err) => {
        this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  pageDirty = () => this.form?.dirty ?? false;
}
