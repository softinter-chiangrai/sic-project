// src/app/feature/bu/rt/burt04/burt04.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Burt04Model } from './burt04.model';

export class Burt04Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt04Model>> {
    return fb.group<ToForm<Burt04Model>>({
      id: fb.control(null),
      teamCode: fb.control(null, [Validators.required]),
      teamName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      leaderId: fb.control(null),
      memberCount: fb.control(0),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
