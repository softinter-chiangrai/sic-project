// src/app/feature/pm/dt/pmdt03/pmdt03.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { WorkPackageService } from '../../../../core/services/work-package.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { DrawerService } from '../../../../core/component/sic-drawer/drawer.service';
import { SicDatepickerComponent } from '../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../core/component/sic-timepicker/sic-timepicker.component';
import type { WorkPackageRequest, WorkPackageResponse } from '../../../../core/model/phase.model';


@Component({
  selector: 'app-pmdt03',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicDatepickerComponent,
    SicTimepickerComponent,
  ],
  templateUrl: './pmdt03.component.html',
})
export class Pmdt03Component implements OnInit {
  private fb = inject(FormBuilder);
  private wpService = inject(WorkPackageService);
  private dialog = inject(DialogService);
  private drawerService = inject(DrawerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() milestoneId = '';
  @Input() projectId = '';
  @Input() phaseId = '';
  @Input() wpId: string | null = null;
  @Input() isEdit = false;
  @Input() data: WorkPackageResponse | null = null;

  @Output() saved = new EventEmitter<WorkPackageResponse>();
  @Output() cancelled = new EventEmitter<void>();

  form = this.fb.group({
    packageName: ['', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
  });

  ngOnInit() {
    if (this.isEdit && !this.data && this.wpId) {
      this.loadWorkPackage(this.wpId);
    }
    if (this.isEdit && this.data) {
      this.patchForm(this.data);
    }
  }

  loadWorkPackage(id: string) {
    this.wpService.getWorkPackageById(id).subscribe({
      next: (data) => this.patchForm(data),
      error: (err) => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.message),
    });
  }

  patchForm(data: WorkPackageResponse) {
    const startDate = data.startDate ? data.startDate.split('T')[0] : '';
    const startTime = data.startDate ? data.startDate.split('T')[1]?.substring(0, 5) : '';
    const endDate = data.endDate ? data.endDate.split('T')[0] : '';
    const endTime = data.endDate ? data.endDate.split('T')[1]?.substring(0, 5) : '';
    this.form.patchValue({
      packageName: data.packageName,
      description: data.description,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
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
    const data: WorkPackageRequest = {
      milestoneId: this.milestoneId,
      packageName: raw.packageName!,
      description: raw.description || undefined,
      startDate: this.buildISOString(raw.startDate, raw.startTime!),
      endDate: this.buildISOString(raw.endDate, raw.endTime!),
    };

    const request = this.isEdit && this.wpId
      ? this.wpService.updateWorkPackage(this.wpId, data)
      : this.wpService.createWorkPackage(data);

    request.subscribe({
      next: (res) => {
        this.dialog.success('สำเร็จ', this.isEdit ? 'อัปเดต Work Package เรียบร้อย' : 'สร้าง Work Package เรียบร้อย');
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