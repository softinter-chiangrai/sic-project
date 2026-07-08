// src/app/feature/pm/dt/pmdt02/pmdt02B/pmdt02B.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from '../../../../../core/component/sic-colorpicker/sic-colorpicker.component';
import { WorkPackageService } from '../../../../../core/services/work-package.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import type { WorkPackageRequest, WorkPackageResponse } from '../../../../../core/model/phase.model';

@Component({
  selector: 'app-pmdt02B',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicColorpickerComponent,   // ✅ import
  ],
  templateUrl: './pmdt02B.component.html',
})
export class Pmdt02BComponent implements OnInit {
  private fb = inject(FormBuilder);
  private wpService = inject(WorkPackageService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  milestoneId = '';
  projectId = '';
  phaseId = '';
  wpId: string | null = null;
  isEdit = false;
  data: WorkPackageResponse | null = null;

  // ✅ เพิ่ม color ในฟอร์ม
  form = this.fb.group({
    packageName: ['', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
    color: [''], // ✅ เพิ่ม
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.wpId = params.get('id');
      this.isEdit = !!this.wpId;
    });

    this.route.queryParams.subscribe((qParams) => {
      this.milestoneId = qParams['milestoneId'] || '';
      this.projectId = qParams['projectId'] || '';
      this.phaseId = qParams['phaseId'] || '';
      if (this.isEdit && this.wpId) {
        this.loadWorkPackage(this.wpId);
      }
    });
  }

  loadWorkPackage(id: string) {
    this.wpService.getWorkPackageById(id).subscribe({
      next: (data) => {
        this.data = data;
        this.patchForm(data);
      },
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
      color: data.color || '', // ✅ patch ค่าสี
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
      color: raw.color || undefined, // ✅ ส่งค่าสี
    };

    const request = this.isEdit && this.wpId
      ? this.wpService.updateWorkPackage(this.wpId, data)
      : this.wpService.createWorkPackage(data);

    request.subscribe({
      next: (res) => {
        this.dialog.success('สำเร็จ', this.isEdit ? 'อัปเดต Work Package เรียบร้อย' : 'สร้าง Work Package เรียบร้อย');
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