import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../../environments/environment';
import { SicDatepickerComponent } from 'sic-ng';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { Pmdt01AModel, Pmdt01APageData } from './pmdt01A.model';
import { Pmdt01AService } from './pmdt01A.service';
import { Pmdt01AForm } from './pmdt01A.form';
import { DialogService } from '../../../../../core/services/dialog.service';
import { BusinessService } from '../../../../../core/services/business.service';
import { SicButtonComponent } from "sic-ng";

@Component({
  selector: 'app-pmdt01A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicColorpickerComponent,
    SicComboboxComponent,
    SicTiptapEditorComponent,
    RouterModule,
    SicButtonComponent,
    TranslateModule
],
  templateUrl: './pmdt01A.component.html',
})
export class Pmdt01AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private phaseService = inject(Pmdt01AService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private businessService = inject(BusinessService);
  private translate = inject(TranslateService);

  projectId = '';
  phaseId: string | null = null;
  isEdit = false;
  isSaving = signal(false);
  data: Pmdt01AModel | null = null;
  userApiUrl = '';
  selectedOwnerNames: Record<string, string> = {};
  apiGetComboboxCustomer = `${environment.apiBaseUrl}/api/pm/customers/combobox`;
  apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/customer-projects/combobox`;
  projectParams: Record<string, any> = {};

  form: FormGroup = Pmdt01AForm.createForm(this.fb);

  ngOnInit() {
    const businessId = this.businessService.getCurrentBusinessId();
    if (businessId) {
      this.userApiUrl = `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${businessId}`;
    }

    // 1. Check if resolver preloaded data
    const resolvedData: Pmdt01APageData = this.route.snapshot.data['form'];
    if (resolvedData?.phaseData?.formGroup) {
      this.form = resolvedData.phaseData.formGroup;
      if (resolvedData.phaseData.value?.id) {
        this.data = resolvedData.phaseData.value;
        this.isEdit = true;
        this.phaseId = this.data.id || null;
      }
    }

    // 2. Query Params
    this.route.queryParams.subscribe((params) => {
      this.projectId = params['projectId'] || '';
      if (this.projectId) {
        this.form.patchValue({ projectId: this.projectId });
        this.loadCustomerFromProject(this.projectId);
      }
    });

    if (this.isEdit && this.data) {
      this.patchForm(this.data);
    }
  }

  patchForm(data: Pmdt01AModel) {
    const startDate = data.startDate ? data.startDate.split('T')[0] : '';
    const startTime = data.startDate ? data.startDate.split('T')[1]?.substring(0, 5) : '';
    const endDate = data.endDate ? data.endDate.split('T')[0] : '';
    const endTime = data.endDate ? data.endDate.split('T')[1]?.substring(0, 5) : '';

    let ownerValues: string[] = [];
    if (data.owner) {
      ownerValues = data.owner
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // ✅ sync this.projectId (ใช้ตอน submit/cancel) ให้ตรงกับ project จริงของ Phase ที่โหลดมาแก้ไข
    if (data.projectId) {
      this.projectId = data.projectId;
      this.loadCustomerFromProject(data.projectId);
    }

    this.form.patchValue({
      projectId: data.projectId || this.projectId,
      phaseCode: data.phaseCode || '',
      phaseName: data.phaseName,
      description: data.description,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      owner: ownerValues,
      color: data.color || '',
    });
    this.form.markAsPristine();
  }

  loadCustomerFromProject(projectId: string): void {
    if (!projectId) return;
    this.http.get<any>(`${environment.apiBaseUrl}/api/pm/customer-projects/${projectId}`).subscribe({
      next: (project) => {
        if (project?.customerId) {
          this.form.patchValue({ customerId: project.customerId }, { emitEvent: false });
          this.projectParams = { customerId: project.customerId };
        }
      },
      error: () => {},
    });
  }

  onCustomerSelected(item: any): void {
    const customerId = item?.value ?? item?.id ?? null;
    if (customerId) {
      this.projectParams = { customerId };
    } else {
      this.projectParams = {};
    }

    // Two-way check: If the selected project does not belong to this customer, reset it
    const currentProjectId = this.form.get('projectId')?.value;
    if (currentProjectId) {
      this.http.get<any>(`${environment.apiBaseUrl}/api/pm/customer-projects/${currentProjectId}`).subscribe({
        next: (project) => {
          if (project?.customerId !== customerId) {
            this.form.patchValue({ projectId: null });
            this.projectId = '';
          }
        },
        error: () => {
          this.form.patchValue({ projectId: null });
          this.projectId = '';
        }
      });
    }
  }

  // ผู้ใช้เลือกโครงการเองจาก Combobox (ไม่ต้องเคยเข้าหน้าโครงการมาก่อน)
  onProjectSelected(item: any): void {
    const selectedProjectId = item?.value ?? item?.id ?? '';
    this.projectId = selectedProjectId;
    if (selectedProjectId) {
      this.loadCustomerFromProject(selectedProjectId);
    }
  }

  onOwnerSelectionChanged(items: any[]) {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (item && item.value && item.text) {
        this.selectedOwnerNames[item.value] = item.text;
      }
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
      this.dialog.error(this.translate.instant('PMDT01_INVALID_DATA_TITLE'), this.translate.instant('PMDT01_FILL_ALL_FIELDS'));
      return;
    }

    const raw = this.form.value;
    let ownerString = '';
    if (Array.isArray(raw.owner)) {
      ownerString = raw.owner
        .map((val: string) => this.selectedOwnerNames[val] || val)
        .filter(Boolean)
        .join(', ');
    } else if (typeof raw.owner === 'string') {
      ownerString = raw.owner;
    }

    const phasePayload: Partial<Pmdt01AModel> = {
      projectId: this.projectId,
      phaseCode: raw.phaseCode || undefined,
      phaseName: raw.phaseName!,
      description: raw.description || undefined,
      startDate: this.buildISOString(raw.startDate, raw.startTime!),
      endDate: this.buildISOString(raw.endDate, raw.endTime!),
      owner: ownerString || undefined,
      color: raw.color || undefined,
    };

    const request =
      this.isEdit && this.phaseId
        ? this.phaseService.updatePhase(this.phaseId, phasePayload)
        : this.phaseService.createPhase(phasePayload);

    this.isSaving.set(true);
    request
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.form.markAsPristine();
          this.dialog.success(
            this.translate.instant('PMDT01_SUCCESS_TITLE'),
            this.isEdit ? this.translate.instant('PMDT01_UPDATE_SUCCESS_MSG') : this.translate.instant('PMDT01_CREATE_SUCCESS_MSG'),
          ).then(() => {
            this.form.markAsPristine();
            this.router.navigate(['/feature/pm/phase'], {
              queryParams: { projectId: this.projectId },
            });
          });
        },
        error: (err) => this.dialog.error(this.translate.instant('PMDT01_FAIL_TITLE'), err.error?.message || err.message || this.translate.instant('PMDT01_FAIL_TITLE')),
      });
  }

  cancel() {
    this.router.navigate(['/feature/pm/phase'], {
      queryParams: { projectId: this.projectId },
    });
  }
}