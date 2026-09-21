// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.form.ts
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Pmrt04BModel } from './pmrt04B.model';
import { ContractModel } from '../pmrt04A/pmrt04A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmrt04BForm {
  static dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('newStartDate')?.value;
      const end = group.get('newEndDate')?.value;
      if (start && end && new Date(start) >= new Date(end)) {
        return { endDateInvalid: true };
      }
      return null;
    };
  }

  static computeRenewalContractNo(originalContractNo: string): string {
    if (!originalContractNo) return '';
    const match = originalContractNo.match(/^(.*?)-R(\d+)$/i);
    if (match) {
      const base = match[1];
      const seq = parseInt(match[2], 10) + 1;
      return `${base}-R${seq}`;
    }
    if (originalContractNo.endsWith('-R') || originalContractNo.endsWith('-r')) {
      const base = originalContractNo.substring(0, originalContractNo.length - 2);
      return `${base}-R1`;
    }
    return `${originalContractNo}-R1`;
  }

  /** เดาค่าเริ่มต้นของฟอร์มต่อสัญญาจากสัญญาต้นฉบับ (ต่อ 1 ปีถัดจากวันหมดอายุเดิม) */
  static buildDefaults(original: ContractModel): Partial<Pmrt04BModel> {
    const currentEndDate = new Date(original.endDate);
    const newStartDate = new Date(currentEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newEndDate = new Date(newStartDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    return {
      newContractNo: Pmrt04BForm.computeRenewalContractNo(original.contractNo),
      newStartDate: newStartDate.toISOString().split('T')[0],
      newEndDate: newEndDate.toISOString().split('T')[0],
      newContractValue: original.contractValue,
      renewalStatus: 'ต่อแล้ว',
    };
  }

  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt04BModel>> {
    return fb.group<ToForm<Pmrt04BModel>>(
      {
        newContractNo: fb.control(null, Validators.required),
        newStartDate: fb.control(null, Validators.required),
        newEndDate: fb.control(null, Validators.required),
        newContractValue: fb.control(null, [Validators.required, Validators.min(0)]),
        renewalRemark: fb.control(null),
        renewalStatus: fb.control('ต่อแล้ว'),
        approvalFlowId: fb.control(null),
      },
      { validators: Pmrt04BForm.dateRangeValidator() },
    );
  }
}
