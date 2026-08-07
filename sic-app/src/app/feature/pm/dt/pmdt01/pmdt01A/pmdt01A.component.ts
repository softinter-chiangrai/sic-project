// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
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

import { Pmdt01Service } from '../pmdt01.service';
import { Pmdt01Form } from '../pmdt01.form';
import { PhaseModel, PhasePageData } from '../pmdt01.model';

import { pmdt01QueryKeys } from '../pmdt01.query';
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
  private service = inject(Pmdt01Service);
  private dialog = inject(DialogService);
  private queryClient = inject(QueryClient);

  phaseData!: SicFromData<PhaseModel>;
  projectId = '';

  pageDirty = (): boolean => this.phaseData?.isChanged ?? false;

  // เปลี่ยนเป็น public เพื่อใช้ใน template
  saveMutation = injectMutation(() => ({
    mutationFn: (payload: Partial<PhaseModel>) => {
      if (this.phaseData.value.id) {
        return lastValueFrom(this.service.updatePhase(this.phaseData.value.id, payload));
      } else {
        return lastValueFrom(this.service.createPhase(payload));
      }
    },
    onSuccess: (saved: PhaseModel) => {
      this.dialog.success('บันทึกสำเร็จ', '');
      this.queryClient.invalidateQueries({ queryKey: pmdt01QueryKeys.list(this.projectId) });
      if (saved?.id) {
        this.queryClient.invalidateQueries({ queryKey: pmdt01QueryKeys.detail(saved.id) });
      }
      this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId } });
    },
    onError: (err: any) => this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกได้'),
  }));

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.projectId = params['projectId'] || '';
    });

    const resolved = this.route.snapshot.data['form'] as PhasePageData;
    if (resolved && resolved.phaseData) {
      this.phaseData = resolved.phaseData;
    } else {
      const form = Pmdt01Form.createForm(this.fb);
      this.phaseData = new SicFromData<PhaseModel>(form);
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
    this.saveMutation.mutate(this.phaseData.value);
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