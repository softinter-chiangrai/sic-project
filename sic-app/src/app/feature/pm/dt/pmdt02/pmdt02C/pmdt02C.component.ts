// src/app/feature/pm/dt/pmdt02/pmdt02C/pmdt02C.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from '../../../../../core/component/sic-colorpicker/sic-colorpicker.component';
import { HttpClient } from '@angular/common/http';
import { Pmdt02CService } from './pmdt02C.service';
import { Pmdt02CForm } from './pmdt02C.form';
import { TaskModel, TaskRequest, TaskResponse } from './pmdt02C.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';
import { BusinessService } from '../../../../../core/services/business.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmdt02C.component.html',
})
export class Pmdt02CComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private taskService = inject(Pmdt02CService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private businessService = inject(BusinessService);
  private customerState = inject(CustomerStateService);
  workPackageId = '';
  projectId = '';
  phaseId = '';
  taskId: string | null = null;
  isEdit = false;
  data: TaskResponse | null = null;
  assignedToApiUrl = '';
  specOptions = signal<{ value: string; text: string }[]>([]);
  linkedTestCases = signal<any[]>([]);
  testCasesLoading = signal(false);

  // เก็บชื่อผู้ใช้เพื่อแสดง (key = userId, value = displayName)
  assigneeNames: Record<string, string> = {};

  formData: SicFromData<TaskModel> = new SicFromData<TaskModel>(Pmdt02CForm.createForm(this.fb));

  get form() {
    return this.formData.formGroup;
  }

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
      this.projectId = qParams['projectId'] || this.customerState.getProjectId() || '';
      this.phaseId = qParams['phaseId'] || '';

      if (this.workPackageId) {
        this.form.patchValue({ workPackageId: this.workPackageId });
      }

      this.loadSpecifications(this.projectId);

      const dateParam = qParams['startDate'] || qParams['date'];
      if (!this.isEdit && dateParam) {
        const cleanDate = dateParam.split('T')[0];
        this.form.patchValue({
          startDate: cleanDate,
          startTime: '09:00',
          endDate: cleanDate,
          endTime: '18:00',
        });
      }
      if (this.isEdit && this.taskId) {
        this.loadTask(this.taskId);
      }
    });
  }

  loadSpecifications(projectId: string) {
    this.http
      .get<any>(`${environment.apiBaseUrl}/api/pm/specifications`, {
        params: { page: '0', size: '100' },
      })
      .subscribe({
        next: (res) => {
          const list: any[] = res?.data || res?.content || (Array.isArray(res) ? res : []);
          const targetProjId = projectId ? String(projectId).toLowerCase() : null;
          const options = list
            .filter((item: any) => {
              if (item.isDelete) return false;
              if (!targetProjId) return true;
              const itemProjId = item.projectId
                ? String(item.projectId).toLowerCase()
                : item.project?.id
                ? String(item.project.id).toLowerCase()
                : null;
              return !itemProjId || itemProjId === targetProjId;
            })
            .map((item: any) => ({
              value: item.id,
              text: `[${item.specificationCode || item.specCode || 'SPEC'}] ${item.title || 'Specification'}`,
            }));
          this.specOptions.set(options);
        },
        error: (err) => console.error('Failed to load specifications in pmdt02C', err),
      });
  }

  loadTask(id: string) {
    this.taskService.getTaskById(id).subscribe({
      next: (data) => {
        this.data = data;
        this.patchForm(data);
        this.loadLinkedTestCases(id, data.projectId || this.projectId);
      },
      error: (err) => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.message),
    });
  }

  loadLinkedTestCases(taskId: string, projectId?: string) {
    this.testCasesLoading.set(true);
    const params: any = { page: 0, size: 1000 };
    if (projectId) params.projectId = projectId;

    this.http.get<any>(`${environment.apiBaseUrl}/api/pm/test-cases/paging`, { params }).subscribe({
      next: (res) => {
        const list: any[] = res?.content || res?.data || (Array.isArray(res) ? res : []);
        const matching = list.filter((tc: any) => tc.taskId === taskId && !tc.isDelete);
        this.linkedTestCases.set(matching);
        this.testCasesLoading.set(false);
      },
      error: () => {
        this.linkedTestCases.set([]);
        this.testCasesLoading.set(false);
      },
    });
  }

  getTestStatusBadgeClass(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'pass' || s === 'passed') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
    }
    if (s === 'fail' || s === 'failed') {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700 font-bold';
    }
    if (s === 'blocked') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }

  getTestStatusLabel(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'pass' || s === 'passed') return '✅ ผ่าน (Pass)';
    if (s === 'fail' || s === 'failed') return '❌ ไม่ผ่าน (Fail)';
    if (s === 'blocked') return '🚧 ติดปัญหา (Blocked)';
    return '⏳ รอทดสอบ (Pending)';
  }

  patchForm(data: TaskResponse) {
    const startDate = data.startDate ? data.startDate.split('T')[0] : '';
    const startTime = data.startDate ? data.startDate.split('T')[1]?.substring(0, 5) : '';
    const endDate = data.endDate ? data.endDate.split('T')[0] : '';
    const endTime = data.endDate ? data.endDate.split('T')[1]?.substring(0, 5) : '';

    this.form.patchValue({
      specificationId: data.specificationId || null,
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

  // ✅ เมื่อเลือกจาก combobox multiple
  onAssigneeSelectionChanged(items: any[]) {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (item && item.value && item.text) {
        this.assigneeNames[item.value] = item.text;
      }
    });

    const firstItem = items.find((it) => it && (it.text || it.name));
    if (firstItem) {
      this.form.patchValue({ assignedTo: firstItem.text || firstItem.name });
    } else if (items.length === 0) {
      this.form.patchValue({ assignedTo: null });
    }
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
      specificationId: raw.specificationId || undefined,
      taskCode: raw.taskCode!,
      taskName: raw.taskName!,
      description: raw.description || undefined,
      assignedTo: raw.assignedTo || undefined,
      startDate: this.buildISOString(raw.startDate, raw.startTime!),
      endDate: this.buildISOString(raw.endDate, raw.endTime!),
      estimateManday: raw.estimateManday!,
      priority: raw.priority || 'Medium',
      color: raw.color || undefined,
      assigneeIds: raw.assigneeIds || [],
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