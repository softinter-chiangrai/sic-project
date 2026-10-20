// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.form.ts
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Pmrt04BModel } from './pmrt04B.model';
import { ContractModel } from '../pmrt04A/pmrt04A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmrt04BForm {
  static dateRangeValidator(originalContract?: ContractModel | null): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('newStartDate')?.value;
      const end = group.get('newEndDate')?.value;
      const errors: ValidationErrors = {};

      if (start && originalContract?.endDate) {
        const startDate = new Date(start);
        const originalEndDate = new Date(originalContract.endDate);
        startDate.setHours(0, 0, 0, 0);
        originalEndDate.setHours(0, 0, 0, 0);
        if (startDate < originalEndDate) {
          errors['startDateBeforeOriginalEnd'] = true;
        }
      }

      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        if (startDate >= endDate) {
          errors['endDateInvalid'] = true;
        }
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static computeRenewalContractNo(originalContractNo: string, takenContractNos?: string[]): string {
    if (!originalContractNo) return '';
    let base = originalContractNo;
    const match = originalContractNo.match(/^(.*?)-R(\d+)$/i);
    if (match) {
      base = match[1];
    } else if (originalContractNo.endsWith('-R') || originalContractNo.endsWith('-r')) {
      base = originalContractNo.substring(0, originalContractNo.length - 2);
    }

    const takenSet = new Set((takenContractNos || []).map((x) => x.trim().toUpperCase()));
    let seq = 1;
    let candidate = `${base}-R${seq}`;
    while (takenSet.has(candidate.toUpperCase())) {
      seq++;
      candidate = `${base}-R${seq}`;
    }
    return candidate;
  }

  /** เดาค่าเริ่มต้นของฟอร์มต่อสัญญาจากสัญญาต้นฉบับ (ต่อ 1 ปีถัดจากวันหมดอายุเดิม) */
  static buildDefaults(original: ContractModel, suggestedContractNo?: string, takenContractNos?: string[]): Partial<Pmrt04BModel> {
    const currentEndDate = new Date(original.endDate);
    const newStartDate = new Date(currentEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newEndDate = new Date(newStartDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    const contractNo = `${original.contractNo}-[สร้างอัตโนมัติ]`;

    return {
      newContractNo: contractNo,
      newStartDate: newStartDate.toISOString().split('T')[0],
      newEndDate: newEndDate.toISOString().split('T')[0],
      newContractValue: original.contractValue,
    };
  }

  static createForm(fb: FormBuilder, originalContract?: ContractModel | null): FormGroup<ToForm<Pmrt04BModel>> {
    return fb.group<ToForm<Pmrt04BModel>>(
      {
        newContractNo: fb.control(null, Validators.required),
        newStartDate: fb.control(null, Validators.required),
        newEndDate: fb.control(null, Validators.required),
        newContractValue: fb.control(null, [Validators.required, Validators.min(0)]),
        renewalRemark: fb.control(null),
        approvalFlowId: fb.control(null),
        attachmentGroupId: fb.control(null),
      },
      { validators: Pmrt04BForm.dateRangeValidator(originalContract) },
    );
  }
}
