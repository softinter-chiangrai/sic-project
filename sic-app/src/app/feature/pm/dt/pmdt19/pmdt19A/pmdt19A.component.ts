import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';

import { Pmdt19AForm } from './pmdt19A.form';
import { Pmdt19AService } from './pmdt19A.service';
import { DocumentVersionModel, Pmdt19APageData } from './pmdt19A.model';
import { resolveProjectId } from '../../../../../core/utils/resolve-context.util';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmdt19a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicUploadComponent,
    TranslateModule,
  ],
  templateUrl: './pmdt19A.component.html',
  styleUrls: ['./pmdt19A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt19AComponent implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt19AService);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  formData!: SicFromData<DocumentVersionModel>;
  id = signal<string | null>(null);
  isEdit = signal(false);
  isSaving = signal(false);

  docTypeOptions = [
    { label: 'Requirement', value: 'REQUIREMENT' },
    { label: 'Specification', value: 'SPECIFICATION' },
    { label: 'Diagram', value: 'DIAGRAM' },
    { label: 'Design Review', value: 'DESIGN_REVIEW' },
    { label: 'Change Request', value: 'CHANGE_REQUEST' },
    { label: 'Delivery Document', value: 'DELIVERY' },
    { label: 'Contract', value: 'CONTRACT' },
    { label: 'Invoice', value: 'INVOICE' },
    { label: 'MA Ticket', value: 'MA_TICKET' },
    { label: 'MA Renewal', value: 'MA_RENEWAL' },
    { label: 'User Manual', value: 'USER_MANUAL' },
    { label: 'Project', value: 'PROJECT' },
  ];

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit(): void {
    const page: Pmdt19APageData = this.route.snapshot.data['pageData'];
    this.formData = page.formData;
    this.isEdit.set(page.isEdit);
    if (page.id) {
      this.id.set(page.id);
    }
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn(this.translate.instant('PMDT19A_WARN_TITLE'), this.translate.instant('PMDT19A_WARN_MSG'));
      return;
    }

    const rawVal = this.formData.form.getRawValue();
    const targetId = this.id() || rawVal.id;
    const isEditMode = !!targetId || this.isEdit();
    const payload = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
    };

    this.isSaving.set(true);
    this.service.saveVersion(payload).subscribe({
      next: () => {
        this.isSaved = true;
        this.dialog.success(this.translate.instant('PMDT19A_SUCCESS_TITLE'), this.translate.instant('PMDT19A_SAVE_SUCCESS_MSG'));
        this.formData.markAsPristine();
        this.router.navigate(['/feature/pm/version'], {
          queryParams: { projectId: this.customerState.getProjectId() || undefined }
        });
      },
      error: (err) => {
        this.dialog.error(this.translate.instant('PMDT19A_ERROR_TITLE'), err.message || this.translate.instant('PMDT19A_SAVE_ERROR_MSG'));
      },
      complete: () => this.isSaving.set(false),
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/version'], {
      queryParams: { projectId: this.customerState.getProjectId() || undefined }
    });
  }
}

export default Pmdt19AComponent;