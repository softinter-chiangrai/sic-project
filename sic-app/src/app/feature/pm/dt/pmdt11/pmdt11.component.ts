import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { SicFromData } from '../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../core/model/sic-entity-state';
import { ToForm } from '../../../../core/types/form.type';

// ===== Model =====
export interface TaskScheduleModel {
  id: string;
  taskCode: string;
  taskName: string;
  projectName: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  actualStart?: string;
  actualEnd?: string;
  status: string;
  dependency?: string;
  dependencyName?: string;
  comment?: string;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt11Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<TaskScheduleModel>> {
    return fb.group<ToForm<TaskScheduleModel>>({
      id: fb.control(null),
      taskCode: fb.control(null),
      taskName: fb.control(null),
      projectName: fb.control(null),
      assignedTo: fb.control(null),
      startDate: fb.control(null, [Validators.required]),
      endDate: fb.control(null, [Validators.required]),
      actualStart: fb.control(null),
      actualEnd: fb.control(null),
      status: fb.control('Todo', [Validators.required]),
      dependency: fb.control(null),
      dependencyName: fb.control(null),
      comment: fb.control(null, [Validators.maxLength(500)]),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt11Service {
  private mockTask: TaskScheduleModel = {
    id: '2',
    taskCode: 'TASK-002',
    taskName: 'พัฒนา Customer API',
    projectName: 'ระบบ CRM',
    assignedTo: 'สมชาย ใจดี',
    startDate: '2024-01-22',
    endDate: '2024-01-28',
    actualStart: '2024-01-22',
    actualEnd: '',
    status: 'In Progress',
    dependency: 'TASK-001',
    dependencyName: 'ออกแบบ Table Customer',
    comment: '',
  };

  updateSchedule(data: TaskScheduleModel): Observable<string> {
    console.log('📝 Updating task schedule:', data);
    return of('อัปเดตกำหนดการสำเร็จ').pipe(delay(500));
  }

  getTask(id: string): Observable<TaskScheduleModel> {
    const found = { ...this.mockTask, id: id };
    return of(found).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt11',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
  ],
  templateUrl: './pmdt11.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [],
})
export class Pmdt11Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt11Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  formData!: SicFromData<TaskScheduleModel>;
  taskId: string | null = null;
  isLoading = false;
  taskCode = '';
  taskName = '';

  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  // ===== Options =====
  statusOptions = ['Todo', 'In Progress', 'Waiting Review', 'Waiting Fix', 'Done', 'Delayed', 'Blocked', 'Cancelled'];

  pageDirty = () => this.formData?.isChanged ?? false;

  ngOnInit(): void {
    const rawForm = Pmdt11Form.createForm(this.fb);
    this.formData = new SicFromData<TaskScheduleModel>(rawForm);

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.taskId = id;
        this.loadTask(id);
      } else {
        this.router.navigate(['/feature/pm/gantt']);
      }
    });
  }

  loadTask(id: string) {
    this.isLoading = true;
    this.service.getTask(id).subscribe({
      next: (data) => {
        this.taskCode = data.taskCode;
        this.taskName = data.taskName;
        this.formData.formGroup.patchValue(data);
        this.formData.markAsPristine();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลงานรหัสนี้');
        this.router.navigate(['/feature/pm/gantt']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/gantt']);
  }

  submit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.formData.value;
    data.state = SicEntityState.Modified;

    this.service.updateSchedule(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'อัปเดตกำหนดการเรียบร้อย').then(() => {
          this.formData.markAsPristine();
          this.router.navigate(['/feature/pm/gantt']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Todo: 'รอเริ่ม',
      'In Progress': 'กำลังทำ',
      'Waiting Review': 'รอ Review',
      'Waiting Fix': 'รอแก้ไข',
      Done: 'เสร็จ',
      Delayed: 'ล่าช้า',
      Blocked: 'ติดปัญหา',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  onDependencyChange(event: any) {
    // TODO: เมื่อเปลี่ยน dependency ให้โหลดชื่อ dependency
  }
}

export default Pmdt11Component;