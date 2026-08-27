import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { IndexService } from './index.service';
import { IndexForm } from './index.form';
import { IndexModel, IndexPageData } from './index.model';
import { SicFromData } from '../../core/model/sic-from-data';

export const indexResolver: ResolveFn<IndexPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(IndexService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = IndexForm.createForm(fb);

  return {
    formData: new SicFromData<IndexModel>(form),
  };
};
