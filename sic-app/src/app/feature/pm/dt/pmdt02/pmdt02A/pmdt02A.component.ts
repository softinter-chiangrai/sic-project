// src/app/feature/pm/dt/pmdt02A/pmdt02A.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { DialogService } from '../../../../../core/services/dialog.service';

import { MilestoneService } from '../../../../../core/services/milestone.service';
import type { MilestoneRequest, MilestoneResponse } from '../../../../../core/model/phase.model';
import { DrawerService } from '../../../../../core/component/sic-drawer/drawer.service';

@Component({
  selector: 'app-pmdt02A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicDatepickerComponent,
    SicTimepickerComponent,
  ],
  templateUrl: './pmdt02A.component.html',
})
export class Pmdt02AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private milestoneService = inject(MilestoneService);
  private dialog = inject(DialogService);
  private drawerService = inject(DrawerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() phaseId = '';
  @Input() projectId = '';
  @Input() milestoneId: string | null = null;
  @Input() isEdit = false;
  @Input() data: MilestoneResponse | null = null;

  @Output() saved = new EventEmitter<MilestoneResponse>();
  @Output() cancelled = new EventEmitter<void>();

  phaseName = '';

  form = this.fb.group({
    milestoneName: ['', Validators.required],
    description: [''],
    dueDate: ['', Validators.required],
    dueTime: ['', Validators.required],
  });

  ngOnInit() {
    if (this.isEdit && !this.data && this.milestoneId) {
      this.loadMilestone(this.milestoneId);
    }
    if (this.isEdit && this.data) {
      this.patchForm(this.data);
    }
  }

  loadMilestone(id: string) {
    this.milestoneService.getMilestoneById(id).subscribe({
      next: (data) => this.patchForm(data),
      error: (err) => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.message),
    });
  }

  patchForm(data: MilestoneResponse) {
    const dueDate = data.dueDate ? data.dueDate.split('T')[0] : '';
    const dueTime = data.dueDate ? data.dueDate.split('T')[1]?.substring(0, 5) : '';
    this.form.patchValue({
      milestoneName: data.milestoneName,
      description: data.description,
      dueDate: dueDate,
      dueTime: dueTime,
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
    const data: MilestoneRequest = {
      phaseId: this.phaseId,
      milestoneName: raw.milestoneName!,
      description: raw.description || undefined,
      dueDate: this.buildISOString(raw.dueDate, raw.dueTime!),
    };

    const request = this.isEdit && this.milestoneId
      ? this.milestoneService.updateMilestone(this.milestoneId, data)
      : this.milestoneService.createMilestone(data);

    request.subscribe({
      next: (res) => {
        this.dialog.success('สำเร็จ', this.isEdit ? 'อัปเดต Milestone เรียบร้อย' : 'สร้าง Milestone เรียบร้อย');
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