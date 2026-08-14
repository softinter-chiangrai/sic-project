import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PmTestScenarioModel } from '../pmdt10.model';
import { ToForm } from '../../../../../core/types/form.type';


export class Pmdt10CForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmTestScenarioModel>> {
    return fb.group<ToForm<PmTestScenarioModel>>({
      id: fb.control(null),
      projectId: fb.control(null),
      testPlanId: fb.control(null),
      scenarioName: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      description: fb.control(null),
      prerequisite: fb.control(null),
      status: fb.control('Active'),
      state: fb.control(null),
      rowVersion: fb.control(null),
      createdDate: fb.control(null),
      updatedDate: fb.control(null)
    });
  }
}
