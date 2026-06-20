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
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt15Service {
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
  selector: 'app-pmdt15',
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
  templateUrl: './pmdt15.component.html',
  styles: [],
})
export class Pmdt15Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt15Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  taskId: string | null = null;
  isLoading = false;
  taskCode = '';
  taskName = '';

  // ===== Options =====
  statusOptions = ['Todo', 'In Progress', 'Waiting Review', 'Waiting Fix', 'Done', 'Delayed', 'Blocked', 'Cancelled'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

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

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      taskCode: [null],
      taskName: [null],
      projectName: [null],
      assignedTo: [null],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      actualStart: [null],
      actualEnd: [null],
      status: ['Todo', [Validators.required]],
      dependency: [null],
      dependencyName: [null],
      comment: [null, [Validators.maxLength(500)]],
    });
  }

  loadTask(id: string) {
    this.isLoading = true;
    this.service.getTask(id).subscribe({
      next: (data) => {
        this.taskCode = data.taskCode;
        this.taskName = data.taskName;
        this.form.patchValue(data);
        this.isLoading = false;
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const data = this.form.value;
    data.id = this.taskId;
    this.service.updateSchedule(data).subscribe({
      next: () => {
        this.dialog.success('อัปเดตสำเร็จ', 'กำหนดการงานถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/gantt']);
        });
      },
      error: (error) => {
        this.dialog.error('อัปเดตไม่สำเร็จ', error);
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

export default Pmdt15Component;