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
export interface SpecificationModel {
  id: string;
  specCode: string;
  specType: string;
  screenName: string;
  description: string;
  requirementIds: string[];
  requirementCodes: string[];
  erTables: string[];
  uiActions: string[];
  validationRules: string;
  permission: string;
  estimatedManday: number;
  dependency: string;
  status: string;
  projectId: string;
  projectName?: string;
  version: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt10Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      specCode: [null, [Validators.required, Validators.maxLength(30)]],
      specType: [null, [Validators.required]],
      screenName: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required, Validators.maxLength(2000)]],
      requirementIds: [[]], // ✅ เปลี่ยนเป็น array
      requirementCodes: [[]],
      erTables: [[]], // ✅ เปลี่ยนเป็น array
      uiActions: [[]], // ✅ เปลี่ยนเป็น array
      validationRules: [null, [Validators.maxLength(500)]],
      permission: [null, [Validators.maxLength(255)]],
      estimatedManday: [null, [Validators.required, Validators.min(0)]],
      dependency: [null, [Validators.maxLength(500)]],
      status: ['Draft', [Validators.required]],
      projectId: [null, [Validators.required]],
      projectName: [null],
      version: ['v1.0', [Validators.maxLength(20)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt10Service {
  private mockSpecs: SpecificationModel[] = [
    {
      id: '1',
      specCode: 'SPEC-001',
      specType: 'UI Specification',
      screenName: 'Customer Management',
      description: 'จัดการข้อมูลลูกค้า สามารถเพิ่ม แก้ไข ลบ ค้นหา',
      requirementIds: ['1', '2'],
      requirementCodes: ['REQ-001', 'REQ-002'],
      erTables: ['customers', 'customer_contacts'],
      uiActions: ['Add', 'Edit', 'Delete', 'Search'],
      validationRules: 'Tax ID ต้อง 13 หลัก',
      permission: 'Admin, Sales',
      estimatedManday: 3,
      dependency: 'ต้องมี Table customers ก่อน',
      status: 'Approved',
      projectId: '1',
      projectName: 'ระบบ CRM',
      version: 'v1.0',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/specification/combobox-project';
  apiGetComboboxRequirement = '/api/specification/combobox-requirement';
  apiGetLovSpecType = '/api/specification/lov-type';
  apiGetLovStatus = '/api/specification/lov-status';

  save(data: SpecificationModel): Observable<string> {
    console.log('📝 Saving specification:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getSpecification(id: string): Observable<SpecificationModel> {
    const found = this.mockSpecs.find((s) => s.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: SpecificationModel = {
      id: '',
      specCode: '',
      specType: '',
      screenName: '',
      description: '',
      requirementIds: [],
      requirementCodes: [],
      erTables: [],
      uiActions: [],
      validationRules: '',
      permission: '',
      estimatedManday: 0,
      dependency: '',
      status: 'Draft',
      projectId: '',
      projectName: '',
      version: 'v1.0',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt10',
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
  templateUrl: './pmdt10.component.html',
  styles: [],
})
export class Pmdt10Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt10Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  specId: string | null = null;
  isLoading = false;

  // ===== UI Actions (checkboxes) =====
  uiActionOptions = ['Add', 'Edit', 'Delete', 'Search', 'Print', 'Export', 'Import'];
  erTableOptions = ['customers', 'customer_contacts', 'users', 'approvals', 'email_queue'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.specId = id;
        this.loadSpecification(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt10Form.createForm(this.fb);
  }

  loadSpecification(id: string) {
    this.isLoading = true;
    this.service.getSpecification(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Specification สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Specification รหัสนี้');
        this.router.navigate(['/feature/pm/specification']);
      },
    });
  }

  // ===== UI Actions Helper =====
  onUiActionChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
    const currentValues = this.form.get('uiActions')?.value || [];

    if (checkbox.checked) {
      if (!currentValues.includes(value)) {
        this.form.patchValue({ uiActions: [...currentValues, value] });
      }
    } else {
      this.form.patchValue({
        uiActions: currentValues.filter((v: string) => v !== value),
      });
    }
  }

  isUiActionChecked(action: string): boolean {
    const values = this.form.get('uiActions')?.value || [];
    return values.includes(action);
  }

  // ===== Multi-select helpers =====
  onRequirementChange(event: any) {
    // ถ้า sic-combobox ส่งมาเป็น string ให้แปลงเป็น array
    const value = event;
    if (typeof value === 'string') {
      this.form.patchValue({
        requirementIds: value ? value.split(',').filter(Boolean) : [],
      });
    }
  }

  onErTableChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(select.selectedOptions).map((opt) => opt.value);
    this.form.patchValue({ erTables: selectedOptions });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/specification']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Specification ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/specification']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt10Component;