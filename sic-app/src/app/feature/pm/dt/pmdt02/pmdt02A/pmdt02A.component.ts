// src/app/feature/pm/dt/pmdt02A/pmdt02A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { MilestoneService } from '../../../../../core/services/milestone.service';
import type { MilestoneRequest, MilestoneResponse } from '../../../../../core/model/phase.model';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  phaseId = '';
  projectId = '';
  milestoneId: string | null = null;
  isEdit = false;
  data: MilestoneResponse | null = null;

  form = this.fb.group({
    milestoneName: ['', Validators.required],
    description: [''],
    dueDate: ['', Validators.required],
    dueTime: ['', Validators.required],
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.milestoneId = params.get('id');
      this.isEdit = !!this.milestoneId;
    });

    this.route.queryParams.subscribe((qParams) => {
      this.phaseId = qParams['phaseId'] || '';
      this.projectId = qParams['projectId'] || '';
      if (this.isEdit && this.milestoneId) {
        this.loadMilestone(this.milestoneId);
      }
    });
  }

  loadMilestone(id: string) {
    this.milestoneService.getMilestoneById(id).subscribe({
      next: (data) => {
        this.data = data;
        this.patchForm(data);
      },
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