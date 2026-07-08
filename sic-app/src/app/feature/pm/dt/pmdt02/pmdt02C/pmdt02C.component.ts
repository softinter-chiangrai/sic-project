// src/app/feature/pm/dt/pmdt02/pmdt02C/pmdt02C.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from '../../../../../core/component/sic-colorpicker/sic-colorpicker.component';
import { TaskService } from '../../../../../core/services/task.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { BusinessService } from '../../../../../core/services/business.service';
import type { TaskRequest, TaskResponse } from '../../../../../core/model/phase.model';

@Component({
  selector: 'app-pmdt02C',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicComboboxComponent,
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicColorpickerComponent,
  ],
  templateUrl: './pmdt02C.component.html',
})
export class Pmdt02CComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private businessService = inject(BusinessService);

  @ViewChild('assigneeCombobox') assigneeCombobox!: SicComboboxComponent;

  workPackageId = '';
  projectId = '';
  phaseId = '';
  taskId: string | null = null;
  isEdit = false;
  data: TaskResponse | null = null;
  assignedToApiUrl = '';

  // เก็บชื่อผู้ใช้เพื่อแสดง (key = userId, value = displayName)
  assigneeNames: Record<string, string> = {};

  form = this.fb.group({
    taskCode: ['', Validators.required],
    taskName: ['', Validators.required],
    description: [''],
    assignedTo: [''], // คนหลัก (optional)
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
    estimateManday: [null as number | null, [Validators.required, Validators.min(1)]],
    priority: ['Medium'],
    color: [''],
    assigneeIds: [[]], // ✅ array ของ userId
  });

  get assigneeIds(): FormControl {
    return this.form.get('assigneeIds') as FormControl;
  }

  ngOnInit() {
    const businessId = this.businessService.getCurrentBusinessId();
    if (businessId) {
      this.assignedToApiUrl = `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${businessId}`;
    }

    this.route.paramMap.subscribe((params) => {
      this.taskId = params.get('id');
      this.isEdit = !!this.taskId;
    });

    this.route.queryParams.subscribe((qParams) => {
      this.workPackageId = qParams['workPackageId'] || '';
      this.projectId = qParams['projectId'] || '';
      this.phaseId = qParams['phaseId'] || '';
      if (this.isEdit && this.taskId) {
        this.loadTask(this.taskId);
      }
    });
  }

  loadTask(id: string) {
    this.taskService.getTaskById(id).subscribe({
      next: (data) => {
        this.data = data;
        this.patchForm(data);
      },
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
      color: data.color || '',
    });

    // ✅ โหลด assigneeIds และ assigneeNames
    if (data.assigneeIds) {
      this.assigneeIds.setValue(data.assigneeIds);
    }
    if (data.assigneeNames) {
      this.assigneeNames = data.assigneeNames;
    }
  }

  // ✅ เมื่อเลือกจาก combobox
  onAssigneeSelect(item: any) {
    if (!item) return;
    const userId = item.value;
    const current = this.assigneeIds.value || [];
    if (current.includes(userId)) {
      this.dialog.warn('ซ้ำ', 'ผู้รับผิดชอบนี้ถูกเลือกแล้ว');
      this.assigneeCombobox.clearSelection();
      return;
    }
    this.assigneeNames[userId] = item.text;
    this.assigneeIds.setValue([...current, userId]);
    this.assigneeCombobox.clearSelection();
  }

  // ✅ ลบผู้รับผิดชอบ (แก้ไขแล้ว: เพิ่ม type ให้ id)
  removeAssignee(userId: string) {
    const current = this.assigneeIds.value || [];
    this.assigneeIds.setValue(current.filter((id: string) => id !== userId));
    delete this.assigneeNames[userId];
  }

  // ✅ ดูชื่อจาก userId
  getAssigneeName(userId: string): string {
    return this.assigneeNames[userId] || userId;
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
      color: raw.color || undefined,
      assigneeIds: raw.assigneeIds || [], // ✅ ส่ง array ไป
    };

    const request = this.isEdit && this.taskId
      ? this.taskService.updateTask(this.taskId, data)
      : this.taskService.createTask(data);

    request.subscribe({
      next: (res) => {
        this.dialog.success('สำเร็จ', this.isEdit ? 'อัปเดต Task เรียบร้อย' : 'สร้าง Task เรียบร้อย');
        this.router.navigate(['/feature/pm/phase', this.phaseId], {
          queryParams: { projectId: this.projectId },
        });
      },
      error: (err) => this.dialog.error('ไม่สำเร็จ', err.message),
    });
  }

  cancel() {
    this.router.navigate(['/feature/pm/phase', this.phaseId], {
      queryParams: { projectId: this.projectId },
    });
  }
}