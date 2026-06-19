import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { DialogService } from '../../../../core/services/dialog.service';

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
class Pmdt03Form {
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
export class Pmdt03Service {
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
  selector: 'app-pmdt03',
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
  templateUrl: './pmdt03.component.html',
  styles: [],
})
export class Pmdt03Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt03Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  formProjectData!: SicFromData<ProjectModel>;
  isEdit = false;
  projectId: string | null = null;
  isLoading = false;

  pageDirty = () => this.formProjectData?.dirty ?? false;

  ngOnInit(): void {
    const form = Pmdt03Form.createForm(this.fb);
    this.formProjectData = new SicFromData<ProjectModel>(form);

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.projectId = id;
        this.loadProject(id);
      }
    });
  }

  loadProject(id: string) {
    this.isLoading = true;
    this.service.getProject(id).subscribe({
      next: (data) => {
        this.formProjectData.formGroup.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลโครงการสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลโครงการรหัสนี้');
        this.router.navigate(['/feature/pm/project']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/project']);
  }

  submit() {
    this.formProjectData.markAllAsTouched();
    if (this.formProjectData.invalid) {
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.formProjectData.value;
    this.service.save(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลโครงการถูกบันทึกเรียบร้อย').then(() => {
          this.formProjectData.markAsPristine();
          this.router.navigate(['/feature/pm/project']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt03Component;