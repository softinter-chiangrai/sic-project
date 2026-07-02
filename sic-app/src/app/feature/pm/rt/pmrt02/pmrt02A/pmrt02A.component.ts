// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';

// ===== Model =====
export interface ProjectModel {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName?: string;
  contractId: string;
  contractNo?: string;
  projectManager: string;
  ba: string;
  sa: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: string;
  description?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmrt02AForm {
  static createForm(fb: FormBuilder) {
    return fb.group({
      id: [null],
      projectCode: [null, [Validators.required, Validators.maxLength(30)]],
      projectName: [null, [Validators.required, Validators.maxLength(255)]],
      customerId: [null, [Validators.required]],
      customerName: [null],
      contractId: [null, [Validators.required]],
      contractNo: [null],
      projectManager: [null, [Validators.maxLength(100)]],
      ba: [null, [Validators.maxLength(100)]],
      sa: [null, [Validators.maxLength(100)]],
      startDate: [null, [Validators.required]],
      plannedEndDate: [null, [Validators.required]],
      actualEndDate: [null],
      budgetManday: [null, [Validators.required, Validators.min(0)]],
      usedManday: [0, [Validators.min(0)]],
      status: ['Prospect', [Validators.required]],
      priority: ['Medium', [Validators.required]],
      description: [null, [Validators.maxLength(1000)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmrt02AService {
  private mockProjects: ProjectModel[] = [
    {
      id: '1',
      projectCode: 'PRJ-001',
      projectName: 'ระบบ CRM',
      customerId: '1',
      customerName: 'สมชาย ใจดี',
      contractId: '1',
      contractNo: 'CT-001',
      projectManager: 'สมศักดิ์ รุ่งเรือง',
      ba: 'สมหญิง รักเรียน',
      sa: 'วิชัย พัฒนาชัย',
      startDate: '2024-01-15',
      plannedEndDate: '2024-06-30',
      actualEndDate: '2024-07-15',
      budgetManday: 120,
      usedManday: 135,
      status: 'Development',
      priority: 'High',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxCustomer = '/api/project/combobox-customer';
  apiGetComboboxContract = '/api/project/combobox-contract';
  apiGetLovStatus = '/api/project/lov-status';
  apiGetLovPriority = '/api/project/lov-priority';

  save(project: ProjectModel): Observable<string> {
    console.log('📝 Saving project:', project);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getProject(id: string): Observable<ProjectModel> {
    const found = this.mockProjects.find((p) => p.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const emptyProject: ProjectModel = {
      id: '',
      projectCode: '',
      projectName: '',
      customerId: '',
      customerName: '',
      contractId: '',
      contractNo: '',
      projectManager: '',
      ba: '',
      sa: '',
      startDate: '',
      plannedEndDate: '',
      actualEndDate: '',
      budgetManday: 0,
      usedManday: 0,
      status: 'Prospect',
      priority: 'Medium',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(emptyProject).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmrt02a',  // ✅ เปลี่ยน selector
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
  templateUrl: './pmrt02A.component.html',  // ✅ ใช้ไฟล์ html ใหม่
  styles: [],
})
export class Pmrt02AComponent implements OnInit, CanComponentDeactivate {  // ✅ เปลี่ยนชื่อ class
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmrt02AService);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  projectId: string | null = null;
  isLoading = false;

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

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
    this.form = Pmrt02AForm.createForm(this.fb);
  }

  loadProject(id: string) {
    this.isLoading = true;
    this.service.getProject(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลโครงการสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลโครงการรหัสนี้');
        this.router.navigate(['/feature/pm/pmrt02']);  // ✅ เปลี่ยน path
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/pmrt02']);  // ✅ เปลี่ยน path
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลโครงการถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/pmrt02']);  // ✅ เปลี่ยน path
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}