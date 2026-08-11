// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  SicButtonComponent,
  SicDatepickerComponent,
  SicTimepickerComponent,
  SicColorpickerComponent,
  SicInputComponent,
  SicInputAreaComponent,
  SicFlexComponent,
  SicGridComponent,
} from 'sic-ng';

import { Pmdt01AService } from './pmdt01A.service';
import { Pmdt01AForm } from './pmdt01A.form';
import { Pmdt01AModel, Pmdt01APageData } from './pmdt01A.model';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';

@Component({
  selector: 'app-pmdt01A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicColorpickerComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicFlexComponent,
    SicGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmdt01A.component.html',
})
export class Pmdt01AComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Pmdt01AService);
  private dialog = inject(DialogService);

  phaseData!: SicFromData<Pmdt01AModel>;
  projectId = '';
  isSaving = signal(false);

  pageDirty = (): boolean => this.phaseData?.isChanged ?? false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.projectId = params['projectId'] || '';
    });

    const resolved = this.route.snapshot.data['form'] as Pmdt01APageData;
    if (resolved && resolved.phaseData) {
      this.phaseData = resolved.phaseData;
    } else {
      const form = Pmdt01AForm.createForm(this.fb);
      this.phaseData = new SicFromData<Pmdt01AModel>(form);
    }

    if (!this.phaseData.value.id) {
      this.phaseData.formGroup.patchValue({ projectId: this.projectId });
    }
  }

  onSubmit() {
    if (this.phaseData.invalid) {
      this.phaseData.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const payload = this.phaseData.value;
    const phaseId = payload.id;
    this.isSaving.set(true);

    const request$ = phaseId
      ? this.service.updatePhase(phaseId, payload)
      : this.service.createPhase(payload);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.dialog.success('บันทึกสำเร็จ', '');
        this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId } });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกได้');
      },
    });
  }

  cancel() {
    if (this.phaseData.isChanged) {
      this.dialog
        .confirm('ยืนยัน', 'คุณต้องการยกเลิกการแก้ไข ข้อมูลที่ยังไม่บันทึกจะหายไป?')
        .then((confirmed) => {
          if (confirmed) {
            this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId } });
          }
        });
    } else {
      this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId } });
    }
  }
}