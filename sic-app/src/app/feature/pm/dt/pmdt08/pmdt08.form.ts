// src/app/feature/pm/dt/pmdt08/pmdt08.form.ts

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PmSpecificationModel } from './pmdt08.model';

export class Pmdt08Form {
    static createForm(fb: FormBuilder): FormGroup {
        return fb.group({
            id: [null],
            specificationCode: [null, [Validators.required, Validators.maxLength(50)]],
            title: [null, [Validators.required, Validators.maxLength(255)]],
            module: [null, [Validators.maxLength(100)]],
            version: [{ value: '1.0', disabled: true }],
            status: ['Draft'],
            priority: ['Medium'],
            owner: [null, [Validators.maxLength(100)]],
            estimatedManday: [null, [Validators.min(0)]],
            objective: [null],
            scope: [null],
            description: [null],
            remark: [null],
            uploadGroupId: [null],
            isAiGenerated: [null],
            aiGeneratedAt: [null],
            generatedFromRequirementId: [null],
            generatedFromDiagramId: [null],
            state: [null],
            rowVersion: [null],
            requirements: [[]],
            screens: [[]],
            fields: [[]],
            validations: [[]],
            businessRules: [[]],
            apis: [[]],
        });
    }
}