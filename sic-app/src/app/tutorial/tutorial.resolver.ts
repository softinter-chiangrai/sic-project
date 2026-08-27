import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { TutorialService } from './tutorial.service';
import { TutorialForm } from './tutorial.form';
import { TutorialModel, TutorialPageData } from './tutorial.model';
import { SicFromData } from '../core/model/sic-from-data';

export const tutorialResolver: ResolveFn<TutorialPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(TutorialService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = TutorialForm.createForm(fb);

  return {
    formData: new SicFromData<TutorialModel>(form),
  };
};
