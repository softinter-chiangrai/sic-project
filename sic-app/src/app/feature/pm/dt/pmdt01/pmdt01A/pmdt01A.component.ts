// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from '../../../../../core/component/sic-colorpicker/sic-colorpicker.component';
import type { PhaseRequest, PhaseResponse } from '../../../../../core/model/phase.model';
import { DialogService } from '../../../../../core/services/dialog.service';
import { PhaseService } from '../../../../../core/services/phase.service';

@Component({
  selector: 'app-pmdt01A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicColorpickerComponent,   // ✅ import
    RouterModule,
  ],
  templateUrl: './pmdt01A.component.html',
})
export class Pmdt01AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private phaseService = inject(PhaseService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  projectId = '';
  phaseId: string | null = null;
  isEdit = false;
  data: PhaseResponse | null = null;

  // ✅ เพิ่ม color ในฟอร์ม
  form = this.fb.group({
    phaseName: ['', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
    owner: [''],
    dependencyId: [''],
    color: [''], // ✅ เพิ่มบรรทัดนี้
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.projectId = params['projectId'] || '';
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.phaseId = id;
        this.isEdit = true;
        this.loadPhase(id);
      } else {
        this.isEdit = false;
        this.phaseId = null;
      }
    });
  }

  loadPhase(id: string) {
    this.phaseService.getPhaseById(id).subscribe({
      next: (data) => {
        this.data = data;
        this.patchForm(data);
      },
      error: (err) => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.message),
    });
  }

  patchForm(data: PhaseResponse) {
    const startDate = data.startDate ? data.startDate.split('T')[0] : '';
    const startTime = data.startDate ? data.startDate.split('T')[1]?.substring(0, 5) : '';
    const endDate = data.endDate ? data.endDate.split('T')[0] : '';
    const endTime = data.endDate ? data.endDate.split('T')[1]?.substring(0, 5) : '';
    this.form.patchValue({
      phaseName: data.phaseName,
      description: data.description,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      owner: data.owner,
      dependencyId: data.dependencyId || '',
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
    const data: PhaseRequest = {
      projectId: this.projectId,
      phaseName: raw.phaseName!,
      description: raw.description || undefined,
      startDate: this.buildISOString(raw.startDate, raw.startTime!),
      endDate: this.buildISOString(raw.endDate, raw.endTime!),
      owner: raw.owner || undefined,
      dependencyId: raw.dependencyId || undefined,
      color: raw.color || undefined, // ✅ ส่งค่าสี
    };

    const request =
      this.isEdit && this.phaseId
        ? this.phaseService.updatePhase(this.phaseId, data)
        : this.phaseService.createPhase(this.projectId, data);

    request.subscribe({
      next: (res) => {
        this.dialog.success(
          'สำเร็จ',
          this.isEdit ? 'อัปเดต Phase เรียบร้อย' : 'สร้าง Phase เรียบร้อย',
        );
        this.router.navigate(['/feature/pm/pmdt01'], {
          queryParams: { projectId: this.projectId },
        });
      },
      error: (err) => this.dialog.error('ไม่สำเร็จ', err.message),
    });
  }

  cancel() {
    this.router.navigate(['/feature/pm/pmdt01'], {
      queryParams: { projectId: this.projectId },
    });
  }
}