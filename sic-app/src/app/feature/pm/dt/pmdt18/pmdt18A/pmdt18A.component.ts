import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';

import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from 'sic-ng';
import { SicInputAreaComponent } from 'sic-ng';
import { SicDatepickerComponent } from 'sic-ng';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';

import { PmMaRenewalModel } from './pmdt18A.model';
import { Pmdt18AService } from './pmdt18A.service';
import { Pmdt18AForm } from './pmdt18A.form';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-pmdt18a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicVersionBadgeComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicDatepickerComponent,
    TranslateModule,
  ],
  templateUrl: './pmdt18A.component.html',
  styleUrls: ['./pmdt18A.component.css'],
})
export class Pmdt18AComponent implements OnInit, CanComponentDeactivate {
  private translate = inject(TranslateService);
  private service = inject(Pmdt18AService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);

  formData!: SicFromData<PmMaRenewalModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);
  isLocked = signal(false);

  statusOptions = [
    { value: 'DRAFT', label: this.translate.instant('PMDT18_STATUS_DRAFT_LONG') },
    { value: 'PROPOSED', label: this.translate.instant('PMDT18_STATUS_PROPOSED') },
    { value: 'CONFIRMED', label: this.translate.instant('PMDT18_STATUS_CONFIRMED') },
    { value: 'REJECTED', label: this.translate.instant('PMDT18_STATUS_REJECTED') },
    { value: 'EXPIRED', label: this.translate.instant('PMDT18_STATUS_EXPIRED_ALREADY') },
  ];

  apiContractCombobox = `${apiBaseUrl}/api/pm/contracts/combobox`;
  apiCustomerCombobox = `${apiBaseUrl}/api/pm/customers/combobox`;
  apiProjectCombobox = `${apiBaseUrl}/api/pm/customer-projects/combobox`;
  isDerived = signal(false);

  dataResource = httpResource<PmMaRenewalModel>(() =>
  this.id() ? `${apiBaseUrl}/api/pm/ma-renewals/${this.id()}` : undefined
  );


  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  constructor() {
    effect(() => {
      const data = this.dataResource.value();
      if (data) {
        this.formData.resetModel(data);
        this.isDerived.set(!!data.contractId);
        if (data.isLocked) {
          this.isLocked.set(true);
          this.formData.form.disable();
        } else {
          this.isLocked.set(false);
          const isViewRoute = this.router.url.includes('/view');
          if (isViewRoute) {
            this.formData.form.disable();
          } else {
            this.formData.form.enable();
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.formData = new SicFromData<PmMaRenewalModel>(Pmdt18AForm.createForm(this.fb));

    this.route.params.subscribe((params) => {
      const idParam = params['id'];
      if (idParam) {
        this.id.set(idParam);
      } else {
        this.formData.patchValue({ state: SicEntityState.Added } as any);
      }
    });
  }

  // เลือกสัญญาเดิมแล้วผูกลูกค้า/โครงการให้อัตโนมัติ (backend derive จาก contractId เสมอ ห้ามให้ผู้ใช้เลือกลูกค้า/โครงการแยกเอง)
  onContractSelected(item: any): void {
    const contractId = item?.value ?? item?.id ?? null;
    if (!contractId) {
      this.isDerived.set(false);
      return;
    }
    this.service.getContractById(contractId).subscribe({
      next: (contract) => {
        this.formData.patchValue({
          customerId: contract?.customerId || null,
          projectId: contract?.projectId || null,
        } as any);
        this.isDerived.set(true);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/renewal']);
  }

  requestChange(): void {
    const rawVal = this.formData.form.getRawValue();
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: rawVal.projectId,
        targetType: 'MA_RENEWAL',
        targetId: this.id(),
        targetTitle: rawVal.renewalNo,
      },
    });
  }

  submit(): void {
    if (this.isLocked()) {
      return;
    }
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn(this.translate.instant('PMDT18A_INVALID_TITLE'), this.translate.instant('PMDT18A_INVALID_MSG'));
      return;
    }

    this.isSaving.set(true);
    const rawVal = this.formData.form.getRawValue();
    const targetId = this.id() || rawVal.id;
    const isEditMode = !!targetId;
    const val = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
    };

    this.service.save(val).subscribe({
      next: () => {
        this.isSaved = true;
        this.dialog.success(this.translate.instant('PMDT18A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT18A_SAVE_SUCCESS_MSG'));
        this.formData.form.markAsPristine();
        this.router.navigate(['/feature/pm/renewal']);
      },
      error: (err) => {
        this.dialog.error(this.translate.instant('PMDT18A_ERROR_TITLE'), err.message || this.translate.instant('PMDT18A_SAVE_ERROR_MSG'));
      },
      complete: () => this.isSaving.set(false),
    });
  }
}

export default Pmdt18AComponent;