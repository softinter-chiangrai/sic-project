// src/app/feature/pm/dt/pmdt01A/pmdt01A.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import type { PhaseRequest, PhaseResponse } from '../../../../../core/model/phase.model';
import { PhaseService } from '../../../../../core/services/phase.service';
import { DrawerService } from '../../../../../core/component/sic-drawer/drawer.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-pmdt01A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicDatepickerComponent,
    SicTimepickerComponent,
    RouterModule,
  ],
  templateUrl: './pmdt01A.component.html',
})
export class Pmdt01AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private phaseService = inject(PhaseService);
  private dialog = inject(DialogService);
  private drawerService = inject(DrawerService);

  @Input() projectId = '';
  @Input() phaseId: string | null = null;
  @Input() isEdit = false;
  @Input() data: PhaseResponse | null = null;

  @Output() saved = new EventEmitter<PhaseResponse>();
  @Output() cancelled = new EventEmitter<void>();

  form = this.fb.group({
    phaseName: ['', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
    owner: [''],
    dependencyId: [''],
  });

  ngOnInit() {
    if (this.isEdit && this.data) {
      const startDate = this.data.startDate ? this.data.startDate.split('T')[0] : '';
      const startTime = this.data.startDate ? this.data.startDate.split('T')[1]?.substring(0, 5) : '';
      const endDate = this.data.endDate ? this.data.endDate.split('T')[0] : '';
      const endTime = this.data.endDate ? this.data.endDate.split('T')[1]?.substring(0, 5) : '';
      this.form.patchValue({
        phaseName: this.data.phaseName,
        description: this.data.description,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        endTime: endTime,
        owner: this.data.owner,
        dependencyId: this.data.dependencyId || '',
      });
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
    const data: PhaseRequest = {
      projectId: this.projectId,
      phaseName: raw.phaseName!,
      description: raw.description || undefined,
      startDate: this.buildISOString(raw.startDate, raw.startTime!),
      endDate: this.buildISOString(raw.endDate, raw.endTime!),
      owner: raw.owner || undefined,
      dependencyId: raw.dependencyId || undefined,
    };

    const request = this.isEdit && this.phaseId
      ? this.phaseService.updatePhase(this.phaseId, data)
      : this.phaseService.createPhase(this.projectId, data);

    request.subscribe({
      next: (res) => {
        this.dialog.success('สำเร็จ', this.isEdit ? 'อัปเดต Phase เรียบร้อย' : 'สร้าง Phase เรียบร้อย');
        this.saved.emit(res);
        this.drawerService.close(); // ปิด Drawer
      },
      error: (err) => this.dialog.error('ไม่สำเร็จ', err.message),
    });
  }

  cancel() {
    this.cancelled.emit();
    this.drawerService.close();
  }
}