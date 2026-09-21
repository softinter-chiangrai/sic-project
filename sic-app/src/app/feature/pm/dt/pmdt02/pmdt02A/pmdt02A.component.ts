// src/app/feature/pm/dt/pmdt02/pmdt02A/pmdt02A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SicDatepickerComponent } from 'sic-ng';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmdt02AService } from './pmdt02A.service';
import { Pmdt02AForm } from './pmdt02A.form';
import { MilestoneModel, MilestonePageData, MilestoneRequest, MilestoneResponse } from './pmdt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicButtonComponent } from "sic-ng";
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-pmdt02A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicColorpickerComponent,
    SicComboboxComponent,
    SicTiptapEditorComponent,
    SicButtonComponent,
    TranslateModule
],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmdt02A.component.html',
})
export class Pmdt02AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private milestoneService = inject(Pmdt02AService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  phaseId = '';
  projectId = '';
  milestoneId: string | null = null;
  isEdit = false;
  data: MilestoneResponse | null = null;
  apiGetComboboxPhase = `${environment.apiBaseUrl}/api/pm/phases/combobox`;

  formData: SicFromData<MilestoneModel> = new SicFromData<MilestoneModel>(Pmdt02AForm.createForm(this.fb));

  get form() {
    return this.formData.formGroup;
  }

  ngOnInit() {
    const pageData: MilestonePageData | undefined = this.route.snapshot.data['pageData'];
    if (pageData?.milestoneData) {
      this.formData = pageData.milestoneData;
    }
    if (pageData?.milestoneDetail) {
      this.data = pageData.milestoneDetail;
      this.isEdit = true;
      this.milestoneId = pageData.milestoneDetail.id;
      if (pageData.milestoneDetail.phaseId) {
        this.phaseId = pageData.milestoneDetail.phaseId;
      }
    }

    this.route.paramMap.subscribe((params) => {
      this.milestoneId = params.get('id');
      this.isEdit = !!this.milestoneId;
    });

    this.route.queryParams.subscribe((qParams) => {
      this.phaseId = qParams['phaseId'] || this.phaseId;
      this.projectId = qParams['projectId'] || '';
      const dateParam = qParams['dueDate'] || qParams['date'];
      if (!this.isEdit && dateParam) {
        const cleanDate = dateParam.split('T')[0];
        this.form.patchValue({
          dueDate: cleanDate,
          dueTime: '17:00',
        });
      }
      if (this.isEdit && this.milestoneId && !this.data) {
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
      error: (err) => this.dialog.error(this.translate.instant('PMDT02_LOAD_FAIL_TITLE'), err.message),
    });
  }

  patchForm(data: MilestoneResponse) {
    const dueDate = data.dueDate ? data.dueDate.split('T')[0] : '';
    const dueTime = data.dueDate ? data.dueDate.split('T')[1]?.substring(0, 5) : '';
    if (data.phaseId) {
      this.phaseId = data.phaseId;
    }
    this.form.patchValue({
      phaseId: data.phaseId,
      milestoneName: data.milestoneName,
      description: data.description,
      dueDate: dueDate,
      dueTime: dueTime,
      color: data.color || '', // ✅ patch ค่าสี
    });
  }

  // ผู้ใช้เลือกเฟสเองจาก Combobox (ไม่ต้องเคยเข้าหน้าเฟสมาก่อน)
  onPhaseSelected(item: any): void {
    this.phaseId = item?.value ?? item?.id ?? '';
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
      this.dialog.error(this.translate.instant('PMDT02_INVALID_DATA_TITLE'), this.translate.instant('PMDT02_FILL_ALL_FIELDS'));
      return;
    }

    const raw = this.form.value;
    const data: MilestoneRequest = {
      phaseId: this.phaseId,
      milestoneName: raw.milestoneName!,
      description: raw.description || undefined,
      dueDate: this.buildISOString(raw.dueDate, raw.dueTime!),
      color: raw.color || undefined, // ✅ ส่งค่าสี
    };

    const request = this.isEdit && this.milestoneId
      ? this.milestoneService.updateMilestone(this.milestoneId, data)
      : this.milestoneService.createMilestone(data);

    request.subscribe({
      next: (res) => {
        this.dialog.success(this.translate.instant('PMDT02_SUCCESS_TITLE'), this.isEdit ? this.translate.instant('PMDT02_UPDATE_MS_SUCCESS_MSG') : this.translate.instant('PMDT02_CREATE_MS_SUCCESS_MSG'));
        this.router.navigate(['/feature/pm/phase', this.phaseId], {
          queryParams: { projectId: this.projectId },
        });
      },
      error: (err) => this.dialog.error(this.translate.instant('PMDT02_FAIL_TITLE'), err.message),
    });
  }

  cancel() {
    this.router.navigate(['/feature/pm/phase', this.phaseId], {
      queryParams: { projectId: this.projectId },
    });
  }
}