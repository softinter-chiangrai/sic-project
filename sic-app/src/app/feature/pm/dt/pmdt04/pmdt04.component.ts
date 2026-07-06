// src/app/feature/pm/dt/pmdt04/pmdt04.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TaskService } from '../../../../core/services/task.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { DrawerService } from '../../../../core/component/sic-drawer/drawer.service';
import type { TaskRequest, TaskResponse } from '../../../../core/model/phase.model';
import { SicTimepickerComponent } from '../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicDatepickerComponent } from '../../../../core/component/sic-datepicker/sic-datepicker.component';


@Component({
  selector: 'app-pmdt04',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicDatepickerComponent,
    SicTimepickerComponent,
  ],
  templateUrl: './pmdt04.component.html',
})
export class Pmdt04Component implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private dialog = inject(DialogService);
  private drawerService = inject(DrawerService);

  @Input() workPackageId = '';
  @Input() projectId = '';
  @Input() phaseId = '';
  @Input() taskId: string | null = null;
  @Input() isEdit = false;
  @Input() data: TaskResponse | null = null;

  @Output() saved = new EventEmitter<TaskResponse>();
  @Output() cancelled = new EventEmitter<void>();

  form = this.fb.group({
    taskCode: ['', Validators.required],
    taskName: ['', Validators.required],
    description: [''],
    assignedTo: [''],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
    estimateManday: [null as number | null, [Validators.required, Validators.min(1)]],
    priority: ['Medium'],
  });

  ngOnInit() {
    if (this.isEdit && !this.data && this.taskId) {
      this.loadTask(this.taskId);
    }
    if (this.isEdit && this.data) {
      this.patchForm(this.data);
    }
  }

  loadTask(id: string) {
    this.taskService.getTaskById(id).subscribe({
      next: (data) => this.patchForm(data),
      error: (err) => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.message),
    });
  }

  patchForm(data: TaskResponse) {
    const startDate = data.startDate ? data.startDate.split('T')[0] : '';
    const startTime = data.startDate ? data.startDate.split('T')[1]?.substring(0, 5) : '';
    const endDate = data.endDate ? data.endDate.split('T')[0] : '';
    const endTime = data.endDate ? data.endDate.split('T')[1]?.substring(0, 5) : '';
    this.form.patchValue({
      taskCode: data.taskCode,
      taskName: data.taskName,
      description: data.description,
      assignedTo: data.assignedTo,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      estimateManday: data.estimateManday ?? null,
      priority: data.priority,
    });
  }

  private buildISOString(date: any, time: string): string {
    if (!date) return '';
    let dateStr = typeof date === 'string' ? date.split('T')[0] : '';
    if (!dateStr) return '';
    const timeStr = time || '00:00';
    return `${dateStr}T${timeStr}:00Z`;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.dialog.error('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const raw = this.form.value;
    const data: TaskRequest = {
      workPackageId: this.workPackageId,
      taskCode: raw.taskCode!,
      taskName: raw.taskName!,
      description: raw.description || undefined,
      assignedTo: raw.assignedTo || undefined,
      startDate: this.buildISOString(raw.startDate, raw.startTime!),
      endDate: this.buildISOString(raw.endDate, raw.endTime!),
      estimateManday: raw.estimateManday!,
      priority: raw.priority || 'Medium',
    };

    const request = this.isEdit && this.taskId
      ? this.taskService.updateTask(this.taskId, data)
      : this.taskService.createTask(data);

    request.subscribe({
      next: (res) => {
        this.dialog.success('สำเร็จ', this.isEdit ? 'อัปเดต Task เรียบร้อย' : 'สร้าง Task เรียบร้อย');
        this.saved.emit(res);
        this.drawerService.close();
      },
      error: (err) => this.dialog.error('ไม่สำเร็จ', err.message),
    });
  }

  cancel() {
    this.cancelled.emit();
    this.drawerService.close();
  }
}