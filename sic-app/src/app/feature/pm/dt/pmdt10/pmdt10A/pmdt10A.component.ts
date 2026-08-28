import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pmdt10Service } from '../pmdt10.service';
import { Pmdt10Form } from '../pmdt10.form';
import type { TaskModel, TaskRequest, TaskResponse, SpecificationSummary, WorkPackageOption } from '../pmdt10.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { BusinessService } from '../../../../../core/services/business.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicTimepickerComponent} from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from '../../../../../core/component/sic-colorpicker/sic-colorpicker.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';

@Component({
  selector: 'app-pmdt10a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicComboboxComponent,
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicColorpickerComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmdt10A.component.html',
  styleUrls: ['./pmdt10A.component.css'],
})
export class Pmdt10AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(Pmdt10Service);
  private dialog = inject(DialogService);
  private businessService = inject(BusinessService);

  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() taskId: string | null = null;
  @Input() initialSpecId: string | null = null;
  @Input() specifications: SpecificationSummary[] = [];
  @Input() workPackages: WorkPackageOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<TaskResponse>();

  assignedToApiUrl = '';
  isSaving = false;
  formData: SicFromData<TaskModel> = new SicFromData<TaskModel>(Pmdt10Form.createForm(this.fb));

  get form() {
    return this.formData.formGroup;
  }

  get specOptions() {
    return this.specifications.map((s) => ({
      value: s.id,
      text: `[${s.code}] ${s.title}`,
    }));
  }

  get wpOptions() {
    return this.workPackages.map((wp) => ({
      value: wp.id,
      text: `${wp.packageName} (${wp.phaseName})`,
    }));
  }

  ngOnInit(): void {
    this.updateAssignedToApiUrl();
  }

  private updateAssignedToApiUrl(): void {
    const businessId = this.businessService.getCurrentBusinessId();
    if (businessId) {
      this.assignedToApiUrl = this.service.getMembersApiUrl(businessId);
    }
  }

  initForCreate(defaultSpecId?: string | null) {
    this.updateAssignedToApiUrl();
    this.form.reset({
      startTime: '09:00',
      endTime: '18:00',
      estimateManday: 1,
      priority: 'Medium',
      status: 'Todo',
      color: '#3B82F6',
      specificationId: defaultSpecId || this.initialSpecId || (this.specifications[0]?.id ?? null),
      workPackageId: this.workPackages[0]?.id ?? null,
      assigneeIds: [],
    });
  }

  loadTaskData(task: TaskResponse) {
    const startParts = task.startDate ? task.startDate.split('T') : ['', '09:00'];
    const endParts = task.endDate ? task.endDate.split('T') : ['', '18:00'];

    this.form.patchValue({
      id: task.id,
      workPackageId: task.workPackageId,
      specificationId: task.specificationId || null,
      taskCode: task.taskCode,
      taskName: task.taskName,
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      startDate: startParts[0] || null,
      startTime: (startParts[1] || '09:00').substring(0, 5),
      endDate: endParts[0] || null,
      endTime: (endParts[1] || '18:00').substring(0, 5),
      estimateManday: task.estimateManday || 1,
      priority: task.priority || 'Medium',
      status: task.status || 'Todo',
      color: task.color || '#3B82F6',
      assigneeIds: task.assigneeIds || [],
    });
  }

  onAssigneeSelectionChanged(items: any[]) {
    if (!items || items.length === 0) {
      this.form.patchValue({ assignedTo: null });
      return;
    }
    const first = items[0];
    this.form.patchValue({ assignedTo: first.text || first.name || first.value });
  }

  private buildISOString(date: any, time: string): string {
    if (!date) return '';
    const dateStr = typeof date === 'string' ? date.split('T')[0] : '';
    if (!dateStr) return '';
    const timeStr = time || '00:00';
    return `${dateStr}T${timeStr}:00Z`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุ Specification, Work Package และข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    const raw = this.form.value;
    const data: TaskRequest = {
      workPackageId: raw.workPackageId!,
      specificationId: raw.specificationId || undefined,
      taskCode: raw.taskCode!,
      taskName: raw.taskName!,
      description: raw.description || undefined,
      assignedTo: raw.assignedTo || undefined,
      startDate: this.buildISOString(raw.startDate, raw.startTime || '09:00'),
      endDate: this.buildISOString(raw.endDate, raw.endTime || '18:00'),
      estimateManday: raw.estimateManday!,
      priority: raw.priority || 'Medium',
      status: raw.status || 'Todo',
      color: raw.color || undefined,
      assigneeIds: raw.assigneeIds || [],
    };

    this.isSaving = true;
    const req$ = this.isEdit && this.taskId
      ? this.service.updateTask(this.taskId, data)
      : this.service.createTask(data);

    req$.subscribe({
      next: (res) => {
        this.isSaving = false;
        this.dialog.success('สำเร็จ', this.isEdit ? 'อัปเดต Task เรียบร้อย' : 'สร้าง Task พร้อมผูก Specification เรียบร้อย');
        this.saved.emit(res);
        this.closeModal();
      },
      error: (err) => {
        this.isSaving = false;
        this.dialog.error('บันทึกไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการบันทึก Task');
      },
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
