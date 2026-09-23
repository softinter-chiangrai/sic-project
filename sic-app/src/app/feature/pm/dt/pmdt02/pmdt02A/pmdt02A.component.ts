import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  private http = inject(HttpClient);
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
  apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/customer-projects/combobox`;
  apiGetComboboxPhase = `${environment.apiBaseUrl}/api/pm/phases/combobox`;
  phaseParams: Record<string, any> = {};

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
        this.loadProjectFromPhase(this.phaseId);
      }
    }

    this.route.paramMap.subscribe((params) => {
      this.milestoneId = params.get('id');
      this.isEdit = !!this.milestoneId;
    });

    this.route.queryParams.subscribe((qParams) => {
      this.phaseId = qParams['phaseId'] || this.phaseId;
      this.projectId = qParams['projectId'] || this.projectId;
      if (this.projectId) {
        this.form.patchValue({ projectId: this.projectId });
        this.phaseParams = { projectId: this.projectId };
      }
      if (this.phaseId) {
        this.loadProjectFromPhase(this.phaseId);
      }
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
      this.loadProjectFromPhase(data.phaseId);
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

  loadProjectFromPhase(phaseId: string): void {
    if (!phaseId) return;
    this.http.get<any>(`${environment.apiBaseUrl}/api/pm/phases/${phaseId}`).subscribe({
      next: (phase) => {
        if (phase?.projectId) {
          this.projectId = phase.projectId;
          this.form.patchValue({ projectId: phase.projectId });
          this.phaseParams = { projectId: phase.projectId };
        }
      },
      error: () => {},
    });
  }

  onProjectSelected(item: any): void {
    const selectedProjectId = item?.value ?? item?.id ?? null;
    this.projectId = selectedProjectId || '';
    if (selectedProjectId) {
      this.phaseParams = { projectId: selectedProjectId };
    } else {
      this.phaseParams = {};
    }

    const currentPhaseId = this.form.get('phaseId')?.value;
    if (currentPhaseId) {
      this.http.get<any>(`${environment.apiBaseUrl}/api/pm/phases/${currentPhaseId}`).subscribe({
        next: (phase) => {
          if (phase?.projectId !== selectedProjectId) {
            this.form.patchValue({ phaseId: null });
            this.phaseId = '';
          }
        },
        error: () => {
          this.form.patchValue({ phaseId: null });
          this.phaseId = '';
        }
      });
    }
  }

  // ผู้ใช้เลือกเฟสเองจาก Combobox (ไม่ต้องเคยเข้าหน้าเฟสมาก่อน)
  onPhaseSelected(item: any): void {
    const selectedPhaseId = item?.value ?? item?.id ?? '';
    this.phaseId = selectedPhaseId;
    if (selectedPhaseId) {
      this.loadProjectFromPhase(selectedPhaseId);
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
      this.dialog.error(this.translate.instant('PMDT02_INVALID_DATA_TITLE'), this.translate.instant('PMDT02_FILL_ALL_FIELDS'));
      return;
    }

    const raw = this.form.value;
    const targetPhaseId = raw.phaseId || this.phaseId;
    const data: MilestoneRequest = {
      phaseId: targetPhaseId,
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
        if (targetPhaseId) {
          this.router.navigate(['/feature/pm/phase', targetPhaseId], {
            queryParams: this.projectId ? { projectId: this.projectId } : undefined,
          });
        } else {
          this.router.navigate(['/feature/pm/phase']);
        }
      },
      error: (err) => this.dialog.error(this.translate.instant('PMDT02_FAIL_TITLE'), err.message),
    });
  }

  cancel() {
    const targetPhaseId = this.form.get('phaseId')?.value || this.phaseId;
    if (targetPhaseId) {
      this.router.navigate(['/feature/pm/phase', targetPhaseId], {
        queryParams: this.projectId ? { projectId: this.projectId } : undefined,
      });
    } else {
      window.history.back();
    }
  }
}