import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { FeatureService } from './feature.service';
import { FeatureForm } from './feature.form';
import { FeatureModel, FeaturePageData } from './feature.model';
import { SicFromData } from '../core/model/sic-from-data';

export const featureResolver: ResolveFn<FeaturePageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(FeatureService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = FeatureForm.createForm(fb);

  return {
    formData: new SicFromData<FeatureModel>(form),
  };
};
