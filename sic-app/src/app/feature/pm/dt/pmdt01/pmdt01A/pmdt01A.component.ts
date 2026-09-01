// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from '../../../../../core/component/sic-colorpicker/sic-colorpicker.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { Pmdt01AModel, Pmdt01APageData } from './pmdt01A.model';
import { Pmdt01AService } from './pmdt01A.service';
import { Pmdt01AForm } from './pmdt01A.form';
import { DialogService } from '../../../../../core/services/dialog.service';
import { BusinessService } from '../../../../../core/services/business.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicButtonComponent } from "../../../../../core/component/sic-button/sic-button.component";

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
    SicButtonComponent
],
  templateUrl: './pmdt01A.component.html',
})
export class Pmdt01AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private phaseService = inject(Pmdt01AService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private businessService = inject(BusinessService);

  projectId = '';
  phaseId: string | null = null;
  isEdit = false;
  data: Pmdt01AModel | null = null;
  userApiUrl = '';
  selectedOwnerNames: Record<string, string> = {};

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
      }
    });

    if (this.isEdit && this.data) {
      this.patchForm(this.data);
    }

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.phaseId = id;
        this.isEdit = true;
        if (!this.data) {
          this.loadPhase(id);
        }
      } else if (!this.isEdit) {
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
      this.dialog.error('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
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

    request.subscribe({
      next: () => {
        this.form.markAsPristine();
        this.dialog.success(
          'สำเร็จ',
          this.isEdit ? 'อัปเดต Phase เรียบร้อย' : 'สร้าง Phase เรียบร้อย',
        ).then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/phase'], {
            queryParams: { projectId: this.projectId },
          });
        });
      },
      error: (err) => this.dialog.error('ไม่สำเร็จ', err.message),
    });
  }

  cancel() {
    this.router.navigate(['/feature/pm/phase'], {
      queryParams: { projectId: this.projectId },
    });
  }
}