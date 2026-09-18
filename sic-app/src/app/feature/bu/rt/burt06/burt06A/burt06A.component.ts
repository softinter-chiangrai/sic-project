// src/app/feature/bu/rt/burt06/burt06A/burt06A.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { UserOption } from './burt06A.model';
import { ApprovalFlowStep, ApprovalFlow } from '../burt06.model';
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
  private http = inject(HttpClient);
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

  formData = new SicFromData<any>(
    this.fb.group({
      id: [null],
      flowCode: ['', [Validators.required, Validators.maxLength(50)]],
      flowName: ['', [Validators.required, Validators.maxLength(255)]],
      documentType: [null as string | null, [Validators.required]],
      approvalMode: ['CHAIN', [Validators.required]],
      description: [''],
      isActive: [true],
      steps: this.fb.array<FormGroup>([], [this.stepValidator()]),
      rowVersion: [null],
    })
  );

  get form() {
    return this.formData.formGroup;
  }

  get steps() {
    return this.form.get('steps') as FormArray;
  }

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  stepValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }
      const formArray = control as FormArray;
      const invalidSteps = formArray.controls
        .map((stepGroup, index) => ({ index, stepGroup }))
        .filter(({ stepGroup }) => {
          const approverRole = stepGroup.get('approverRole')?.value;
          const selectedUserIds = stepGroup.get('selectedUserIds')?.value;
          const hasUsers = Array.isArray(selectedUserIds) && selectedUserIds.length > 0;
          return !approverRole || !hasUsers;
        });

      if (invalidSteps.length > 0) {
        return { missingApprover: true, invalidIndices: invalidSteps.map((s) => s.index) };
      }
      return null;
    };
  }

  ngOnInit(): void {
    this.timeoutActionOptions = this.buildTimeoutActionOptions();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.flowId = id;
      this.loadFlow(id);
    } else {
      this.addStep();
    }
  }

  loadFlow(id: string): void {
    this.isLoading.set(true);
    this.service
      .getFlow(id)
      .subscribe({
        next: (data) => {
          this.form.patchValue(data as any);
          this.steps.clear();
          data.steps?.forEach((step) => {
            this.steps.push(this.createStepForm(step));
          });
          this.reorderSteps();
          this.formData.resetModel(this.form.getRawValue());
          this.isLoading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading.set(false);
          this.cdr.detectChanges();
          this.dialog.error(this.translate.instant('BURT06A_LOAD_FAILED_TITLE'), this.translate.instant('BURT06A_LOAD_FAILED_MSG'));
          this.router.navigate(['/feature/bu/approval-flow']);
        },
      });
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

  createStepForm(step?: ApprovalFlowStep): FormGroup {
    return this.fb.group({
      id: [step?.id || null],
      stepOrder: [
        step?.stepOrder || this.steps.length + 1,
        [Validators.required, Validators.min(1)],
      ],
      stepName: [step?.stepName || '', [Validators.required, Validators.maxLength(255)]],
      approverRole: [step?.approverRole || '', [Validators.required]],
      approverUserId: [step?.approverUserId || ''],
      selectedUserIds: [this.parseUserIds(step?.approverUserId), [Validators.required]],
      isRequired: [step?.isRequired !== false],
      timeoutDays: [
        step?.timeoutDays !== undefined && step?.timeoutDays !== null ? step.timeoutDays : 1,
        [Validators.required, Validators.min(1)],
      ],
      timeoutAction: [step?.timeoutAction || 'NONE', [Validators.required]],
      canSkip: [step?.canSkip || false],
      rowVersion: [step?.rowVersion || null],
    });
  }

  private parseUserIds(csv?: string): string[] {
    if (!csv || !csv.trim()) return [];
    return csv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  addStep(): void {
    this.steps.push(this.createStepForm());
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

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isSaved = true;
        this.form.markAsPristine();
        this.dialog.success(this.translate.instant('BURT06A_SAVE_SUCCESS_TITLE'), this.translate.instant('BURT06A_SAVE_SUCCESS_MSG', { name: data.flowName }));
        this.router.navigate(['/feature/bu/approval-flow']);
      },
      error: (err) => {
        this.isSaving.set(false);
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
