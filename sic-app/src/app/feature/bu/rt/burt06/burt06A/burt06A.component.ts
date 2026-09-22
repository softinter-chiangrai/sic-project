// src/app/feature/bu/rt/burt06/burt06A/burt06A.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from 'sic-ng';
import { SicCardComponent } from 'sic-ng';
import { SicCheckboxComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from 'sic-ng';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { BusinessService } from '../../../../../core/services/business.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Burt06AModel, Burt06APageData, UserOption } from './burt06A.model';
import { Burt06AForm } from './burt06A.form';
import { ApprovalFlow } from '../burt06.model';
import { Burt06Service } from '../burt06.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-burt06a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicTiptapEditorComponent,
    SicCheckboxComponent,
    SicCardComponent,
    SicComboboxComponent,
    TranslateModule,
  ],
  templateUrl: './burt06A.component.html',
  styleUrl: './burt06A.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Burt06AComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Burt06Service);
  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private businessService = inject(BusinessService);
  private translate = inject(TranslateService);
  readonly apiBaseUrl = environment.apiBaseUrl;

  readonly approvalModeComboboxConfig = {
    apiUrl: `${environment.apiBaseUrl}/api/db/parameter/lov`,
    params: { group: 'PM', parameterCode: 'APPROVAL_MODE' },
  };

  isEdit = false;
  flowId: string | null = null;
  isLoading = signal(false);
  isSaving = signal(false);

  formData!: SicFromData<Burt06AModel>;

  get form(): FormGroup {
    return this.formData.formGroup;
  }

  get steps() {
    return this.form.get('steps') as FormArray;
  }

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit(): void {
    this.timeoutActionOptions = this.buildTimeoutActionOptions();
    const page: Burt06APageData = this.route.snapshot.data['form'];
    this.formData = page.flowData;
    this.isEdit = page.isEdit;
    this.flowId = this.route.snapshot.paramMap.get('id');
    const docTypeQuery = this.route.snapshot.queryParamMap.get('documentType');
    if (!this.isEdit && docTypeQuery && !this.form.get('documentType')?.value) {
      this.form.get('documentType')?.setValue(docTypeQuery);
    }
  }

  timeoutActionOptions: { value: string; text: string }[] = [];

  private buildTimeoutActionOptions(): { value: string; text: string }[] {
    return [
      { value: 'NONE', text: this.translate.instant('BURT06A_TIMEOUT_NONE') },
      { value: 'AUTO_SKIP', text: this.translate.instant('BURT06A_TIMEOUT_AUTO_SKIP') },
      { value: 'AUTO_APPROVE', text: this.translate.instant('BURT06A_TIMEOUT_AUTO_APPROVE') },
      { value: 'AUTO_REJECT', text: this.translate.instant('BURT06A_TIMEOUT_AUTO_REJECT') },
    ];
  }

  addStep(): void {
    this.steps.push(Burt06AForm.createStepForm(this.fb, this.steps.length + 1));
    this.reorderSteps();
    this.cdr.detectChanges();
  }

  removeStep(index: number): void {
    if (this.steps.length <= 1) {
      this.dialog.warn(this.translate.instant('BURT06A_CANNOT_REMOVE_TITLE'), this.translate.instant('BURT06A_CANNOT_REMOVE_MSG'));
      return;
    }
    this.steps.removeAt(index);
    this.reorderSteps();
    this.cdr.detectChanges();
  }

  moveStepUp(index: number): void {
    if (index <= 0) return;
    const stepsArray = this.steps;
    const stepGroup = stepsArray.at(index) as FormGroup;
    stepsArray.removeAt(index);
    stepsArray.insert(index - 1, stepGroup);
    this.reorderSteps();
    this.form.markAsDirty();
    this.cdr.detectChanges();
  }

  moveStepDown(index: number): void {
    if (index >= this.steps.length - 1) return;
    const stepsArray = this.steps;
    const stepGroup = stepsArray.at(index) as FormGroup;
    stepsArray.removeAt(index);
    stepsArray.insert(index + 1, stepGroup);
    this.reorderSteps();
    this.form.markAsDirty();
    this.cdr.detectChanges();
  }

  loadUsersForStep(index: number, roleCode: string): void {
    const stepGroup = this.steps.at(index) as FormGroup;
    stepGroup.get('selectedUserIds')?.setValue([]);
    stepGroup.get('approverUserId')?.setValue('');
    this.cdr.detectChanges();
  }

  getUsersByRoleApiUrl(roleCode?: string): string {
    const businessId = this.businessService.getCurrentBusinessId();
    if (!businessId || !roleCode) return '';
    return `${this.apiBaseUrl}/api/su/business-roles/${businessId}/users-by-role?roleCode=${encodeURIComponent(roleCode)}`;
  }

  private reorderSteps(): void {
    this.steps.controls.forEach((ctrl, index) => {
      ctrl.get('stepOrder')?.setValue(index + 1);
    });
  }

  private hasMissingApprover(): boolean {
    const stepControls = this.steps.controls;
    for (let i = 0; i < stepControls.length; i++) {
      const group = stepControls[i];
      const role = group.get('approverRole')?.value;
      const userIds = group.get('selectedUserIds')?.value;
      const hasUsers = Array.isArray(userIds) && userIds.length > 0;
      if (!role || !hasUsers) {
        return true;
      }
    }
    return false;
  }

  cancel(): void {
    this.router.navigate(['/feature/bu/approval-flow']);
  }

  save(): void {
    if (this.hasMissingApprover()) {
      this.dialog.warn(
        this.translate.instant('BURT06A_INCOMPLETE_TITLE'),
        this.translate.instant('BURT06A_INCOMPLETE_MSG'),
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn(this.translate.instant('BURT06A_FORM_INVALID_TITLE'), this.translate.instant('BURT06A_FORM_INVALID_MSG'));
      return;
    }

    this.isSaving.set(true);
    const raw = this.form.value;

    const steps = (raw.steps as any[])?.map((s) => ({
      ...s,
      approverUserId: ((s.selectedUserIds as string[]) ?? []).join(',') || s.approverUserId || '',
    }));

    const hasEmptyStepName = steps?.some((s: any) => !s.stepName?.trim());
    if (hasEmptyStepName) {
      this.isSaving.set(false);
      this.dialog.warn(this.translate.instant('BURT06A_INCOMPLETE_DATA_TITLE'), this.translate.instant('BURT06A_STEPNAME_REQUIRED_MSG'));
      return;
    }

    const data: ApprovalFlow = { ...(raw as any), steps };

    const request =
      this.isEdit && this.flowId
        ? this.service.updateFlow(this.flowId, data)
        : this.service.createFlow(data);

    request
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.isSaved = true;
          this.form.markAsPristine();
          this.dialog.success(this.translate.instant('BURT06A_SAVE_SUCCESS_TITLE'), this.translate.instant('BURT06A_SAVE_SUCCESS_MSG', { name: data.flowName }));
          this.router.navigate(['/feature/bu/approval-flow']);
        },
        error: (err) => {
          this.dialog.error(this.translate.instant('BURT06A_SAVE_FAILED_TITLE'), err.error?.message || this.translate.instant('BURT06A_GENERIC_ERROR_MSG'));
        },
      });
  }

  get roleApiUrl(): string {
    const businessId = this.businessService.getCurrentBusinessId();
    if (!businessId) return '';
    return `${environment.apiBaseUrl}/api/su/business-roles?businessId=${businessId}`;
  }


}
