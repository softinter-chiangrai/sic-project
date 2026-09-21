// src/app/feature/bu/rt/burt06/burt06A/burt06A.form.ts
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ApprovalFlow, ApprovalFlowStep } from '../burt06.model';

export class Burt06AForm {
  static stepValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }
      const invalidSteps = control.controls
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

  private static parseUserIds(csv?: string): string[] {
    if (!csv || !csv.trim()) return [];
    return csv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  static createStepForm(fb: FormBuilder, stepOrder: number, step?: ApprovalFlowStep): FormGroup {
    return fb.group({
      id: [step?.id || null],
      stepOrder: [step?.stepOrder || stepOrder, [Validators.required, Validators.min(1)]],
      stepName: [step?.stepName || '', [Validators.required, Validators.maxLength(255)]],
      approverRole: [step?.approverRole || '', [Validators.required]],
      approverUserId: [step?.approverUserId || ''],
      selectedUserIds: [Burt06AForm.parseUserIds(step?.approverUserId), [Validators.required]],
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

  static createForm(fb: FormBuilder, flow?: ApprovalFlow | null): FormGroup {
    const stepsArray = fb.array<FormGroup>([], [Burt06AForm.stepValidator()]);
    const steps = flow?.steps?.length ? flow.steps : [undefined];
    steps.forEach((step, index) => {
      stepsArray.push(Burt06AForm.createStepForm(fb, index + 1, step));
    });

    return fb.group({
      id: [flow?.id || null],
      flowCode: [flow?.flowCode || '', [Validators.required, Validators.maxLength(50)]],
      flowName: [flow?.flowName || '', [Validators.required, Validators.maxLength(255)]],
      documentType: [flow?.documentType ?? (null as string | null), [Validators.required]],
      approvalMode: [flow?.approvalMode || 'CHAIN', [Validators.required]],
      description: [flow?.description || ''],
      isActive: [flow?.active !== false],
      steps: stepsArray,
      rowVersion: [flow?.rowVersion || null],
    });
  }
}
