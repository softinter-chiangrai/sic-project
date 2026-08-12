// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicColorpickerComponent } from '../../../../../core/component/sic-colorpicker/sic-colorpicker.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { Pmdt01AModel } from './pmdt01A.model';
import { Pmdt01AService } from './pmdt01A.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { BusinessService } from '../../../../../core/services/business.service';

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
    RouterModule,
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

  @ViewChild('ownerCombobox') ownerCombobox!: SicComboboxComponent;

  projectId = '';
  phaseId: string | null = null;
  isEdit = false;
  data: Pmdt01AModel | null = null;
  userApiUrl = '';
  selectedOwners: { id: string; name: string }[] = [];

  form = this.fb.group({
    phaseName: ['', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
    color: [''],
  });

  get excludeOwnerValues(): string[] {
    return this.selectedOwners.map((o) => o.id);
  }

  ngOnInit() {
    const businessId = this.businessService.getCurrentBusinessId();
    if (businessId) {
      this.userApiUrl = `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${businessId}`;
    }

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

  patchForm(data: Pmdt01AModel) {
    const startDate = data.startDate ? data.startDate.split('T')[0] : '';
    const startTime = data.startDate ? data.startDate.split('T')[1]?.substring(0, 5) : '';
    const endDate = data.endDate ? data.endDate.split('T')[0] : '';
    const endTime = data.endDate ? data.endDate.split('T')[1]?.substring(0, 5) : '';

    if (data.owner) {
      this.selectedOwners = data.owner
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((val) => ({ id: val, name: val }));
    } else {
      this.selectedOwners = [];
    }

    this.form.patchValue({
      phaseName: data.phaseName,
      description: data.description,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      color: data.color || '',
    });
  }

  onOwnerSelect(item: any) {
    if (!item) return;
    const userId = item.value;
    const userName = item.text;
    if (this.selectedOwners.some((o) => o.id === userId || o.name === userName)) {
      this.dialog.warn('ซ้ำ', 'ผู้รับผิดชอบนี้ถูกเลือกแล้ว');
      if (this.ownerCombobox) this.ownerCombobox.clearSelection();
      return;
    }
    this.selectedOwners.push({ id: userId, name: userName });
    if (this.ownerCombobox) this.ownerCombobox.clearSelection();
  }

  removeOwner(index: number) {
    this.selectedOwners.splice(index, 1);
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
    const ownerString = this.selectedOwners.map((o) => o.name).join(', ');

    const phasePayload: Partial<Pmdt01AModel> = {
      projectId: this.projectId,
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