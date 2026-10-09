// src/app/feature/pm/dt/pmdt02/pmdt02B/pmdt02B.component.ts
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
import { Pmdt02BService } from './pmdt02B.service';
import { Pmdt02BForm } from './pmdt02B.form';
import { WorkPackageModel, WorkPackagePageData, WorkPackageRequest, WorkPackageResponse } from './pmdt02B.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicButtonComponent } from "sic-ng";
import { environment } from '../../../../../../environments/environment';

import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { SicTraceLinkPanelComponent } from '../../../../../core/component/sic-trace-link-panel/sic-trace-link-panel.component';

import { HolidayService } from '../../../../../core/services/holiday.service';
import { signal, computed } from '@angular/core';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pmdt02B',
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
    SicUploadComponent,
    SicButtonComponent,
    TranslateModule,
    SicTraceLinkPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmdt02B.component.html',
})
export class Pmdt02BComponent implements OnInit {
  private fb = inject(FormBuilder);
  private wpService = inject(Pmdt02BService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private holidayService = inject(HolidayService);

  milestoneId = '';
  projectId = '';
  phaseId = '';
  wpId: string | null = null;
  isEdit = false;
  isSaving = signal(false);
  data: WorkPackageResponse | null = null;
  apiGetComboboxMilestone = `${environment.apiBaseUrl}/api/pm/milestones/combobox`;

  startDateVal = signal<string>('');
  endDateVal = signal<string>('');
  startHolidayInfo = computed(() => this.holidayService.checkHoliday(this.startDateVal(), this.phaseId));
  endHolidayInfo = computed(() => this.holidayService.checkHoliday(this.endDateVal(), this.phaseId));
  workdayCalculation = computed(() => this.holidayService.calculateWorkingDays(this.startDateVal(), this.endDateVal(), this.phaseId));

  formData: SicFromData<WorkPackageModel> = new SicFromData<WorkPackageModel>(Pmdt02BForm.createForm(this.fb));

  get form() {
    return this.formData.formGroup;
  }

  ngOnInit() {
    const pageData: WorkPackagePageData | undefined = this.route.snapshot.data['pageData'];
    if (pageData?.workPackageData) {
      this.formData = pageData.workPackageData;
    }
    if (pageData?.workPackageDetail) {
      this.data = pageData.workPackageDetail;
      this.isEdit = true;
      this.wpId = pageData.workPackageDetail.id;
      if (pageData.workPackageDetail.milestoneId) {
        this.milestoneId = pageData.workPackageDetail.milestoneId;
      }
    }

    this.route.paramMap.subscribe((params) => {
      this.wpId = params.get('id');
      this.isEdit = !!this.wpId;
    });

    this.route.queryParams.subscribe((qParams) => {
      this.milestoneId = qParams['milestoneId'] || this.milestoneId;
      this.projectId = qParams['projectId'] || '';
      this.phaseId = qParams['phaseId'] || '';
      const dateParam = qParams['startDate'] || qParams['date'];
      if (!this.isEdit && dateParam) {
        const cleanDate = dateParam.split('T')[0];
        this.form.patchValue({
          startDate: cleanDate,
          startTime: '09:00',
          endDate: cleanDate,
          endTime: '18:00',
        });
        this.startDateVal.set(cleanDate);
        this.endDateVal.set(cleanDate);
      }
      if (this.isEdit && this.wpId && !this.data) {
        this.loadWorkPackage(this.wpId);
      }
    });

    this.form.get('startDate')?.valueChanges.subscribe((v) => this.startDateVal.set(v ? String(v).split('T')[0] : ''));
    this.form.get('endDate')?.valueChanges.subscribe((v) => this.endDateVal.set(v ? String(v).split('T')[0] : ''));
  }

  skipStartDateToNextWorkday(): void {
    const current = this.startDateVal() || this.form.get('startDate')?.value;
    if (!current) return;
    const next = this.holidayService.getNextWorkday(current, this.phaseId);
    this.form.patchValue({ startDate: next });
    this.startDateVal.set(next);
  }

  skipEndDateToNextWorkday(): void {
    const current = this.endDateVal() || this.form.get('endDate')?.value;
    if (!current) return;
    const next = this.holidayService.getNextWorkday(current, this.phaseId);
    this.form.patchValue({ endDate: next });
    this.endDateVal.set(next);
  }

  loadWorkPackage(id: string) {
    this.wpService.getWorkPackageById(id).subscribe({
      next: (data) => {
        this.data = data;
        this.patchForm(data);
      },
      error: (err) => this.dialog.error(this.translate.instant('PMDT02_LOAD_FAIL_TITLE'), err.message),
    });
  }

  patchForm(data: WorkPackageResponse) {
    const startDate = data.startDate ? data.startDate.split('T')[0] : '';
    const startTime = (data.startDate?.includes('T') ? data.startDate.split('T')[1]?.substring(0, 5) : '') || (data as any).startTime || '09:00';
    const endDate = data.endDate ? data.endDate.split('T')[0] : '';
    const endTime = (data.endDate?.includes('T') ? data.endDate.split('T')[1]?.substring(0, 5) : '') || (data as any).endTime || '18:00';
    if (data.milestoneId) {
      this.milestoneId = data.milestoneId;
    }
    this.form.patchValue({
      milestoneId: data.milestoneId,
      packageName: data.packageName,
      description: data.description,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      color: data.color || '', // ✅ patch ค่าสี
    });
    if (startDate) this.startDateVal.set(startDate);
    if (endDate) this.endDateVal.set(endDate);
  }

  // ผู้ใช้เลือกไมล์สโตนเองจาก Combobox (ไม่ต้องเคยเข้าหน้าไมล์สโตนมาก่อน)
  onMilestoneSelected(item: any): void {
    this.milestoneId = item?.value ?? item?.id ?? '';
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
    const data: WorkPackageRequest = {
      milestoneId: this.milestoneId,
      packageName: raw.packageName!,
      description: raw.description || undefined,
      startDate: this.buildISOString(raw.startDate, raw.startTime!),
      endDate: this.buildISOString(raw.endDate, raw.endTime!),
      color: raw.color || undefined, // ✅ ส่งค่าสี
      attachmentGroupId: this.extractUploadGroupId(raw.attachmentGroupId) || undefined,
    };

    const request = this.isEdit && this.wpId
      ? this.wpService.updateWorkPackage(this.wpId, data)
      : this.wpService.createWorkPackage(data);

    this.isSaving.set(true);
    request
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (res) => {
        this.dialog.success(this.translate.instant('PMDT02_SUCCESS_TITLE'), this.isEdit ? this.translate.instant('PMDT02_UPDATE_WP_SUCCESS_MSG') : this.translate.instant('PMDT02_CREATE_WP_SUCCESS_MSG'));
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

  private extractUploadGroupId(val: any): string | null {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (Array.isArray(val) && val.length > 0) return val[0]?.uploadGroupId || val[0]?.id || null;
    if (typeof val === 'object') return val.uploadGroupId || val.id || null;
    return null;
  }
}