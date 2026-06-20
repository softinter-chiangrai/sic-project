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
export interface TaskModel {
  id: string;
  taskCode: string;
  taskName: string;
  relatedSpec: string;
  relatedSpecName?: string;
  projectId: string;
  projectName?: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  actualStart?: string;
  actualEnd?: string;
  estimateManday: number;
  actualManday: number;
  status: string;
  priority: string;
  dependency?: string;
  dependencyName?: string;
  description: string;
  impactIfDelay?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt12Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      taskCode: [null, [Validators.required, Validators.maxLength(30)]],
      taskName: [null, [Validators.required, Validators.maxLength(255)]],
      relatedSpec: [null, [Validators.required]],
      relatedSpecName: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      assignedTo: [null, [Validators.maxLength(100)]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      actualStart: [null],
      actualEnd: [null],
      estimateManday: [null, [Validators.required, Validators.min(0)]],
      actualManday: [0, [Validators.min(0)]],
      status: ['Todo', [Validators.required]],
      priority: ['Medium', [Validators.required]],
      dependency: [null],
      dependencyName: [null],
      description: [null, [Validators.maxLength(2000)]],
      impactIfDelay: [null, [Validators.maxLength(500)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt12Service {
  private mockTasks: TaskModel[] = [
    {
      id: '1',
      taskCode: 'TASK-001',
      taskName: 'ออกแบบ Table Customer',
      relatedSpec: 'SPEC-001',
      relatedSpecName: 'Customer Management',
      projectId: '1',
      projectName: 'ระบบ CRM',
      assignedTo: 'สมหญิง รักเรียน',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      actualStart: '2024-01-15',
      actualEnd: '2024-01-22',
      estimateManday: 3,
      actualManday: 4,
      status: 'Done',
      priority: 'High',
      dependency: '',
      dependencyName: '',
      description: 'ออกแบบโครงสร้างตาราง Customer และความสัมพันธ์',
      impactIfDelay: 'กระทบงานพัฒนา API',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/task/combobox-project';
  apiGetComboboxSpec = '/api/task/combobox-spec';
  apiGetComboboxTask = '/api/task/combobox-task';
  apiGetLovStatus = '/api/task/lov-status';
  apiGetLovPriority = '/api/task/lov-priority';

  save(data: TaskModel): Observable<string> {
    console.log('📝 Saving task:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getTask(id: string): Observable<TaskModel> {
    const found = this.mockTasks.find((t) => t.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: TaskModel = {
      id: '',
      taskCode: '',
      taskName: '',
      relatedSpec: '',
      relatedSpecName: '',
      projectId: '',
      projectName: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      actualStart: '',
      actualEnd: '',
      estimateManday: 0,
      actualManday: 0,
      status: 'Todo',
      priority: 'Medium',
      dependency: '',
      dependencyName: '',
      description: '',
      impactIfDelay: '',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt12',
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
  templateUrl: './pmdt12.component.html',
  styles: [],
})
export class Pmdt12Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt12Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  taskId: string | null = null;
  isLoading = false;

  // ===== Options =====
  statusOptions = ['Todo', 'In Progress', 'Waiting Review', 'Waiting Fix', 'Done', 'Delayed', 'Blocked', 'Cancelled'];
  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.taskId = id;
        this.loadTask(id);
      }
    });

    // เมื่อเปลี่ยน projectId ให้โหลด Spec และ Task Dependency
    this.form.get('projectId')?.valueChanges.subscribe((projectId) => {
      this.form.patchValue({ relatedSpec: null, dependency: null });
    });
  }

  initForm(): void {
    this.form = Pmdt12Form.createForm(this.fb);
  }

  loadTask(id: string) {
    this.isLoading = true;
    this.service.getTask(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Task สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Task รหัสนี้');
        this.router.navigate(['/feature/pm/task']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/task']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Task ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/task']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt12Component;