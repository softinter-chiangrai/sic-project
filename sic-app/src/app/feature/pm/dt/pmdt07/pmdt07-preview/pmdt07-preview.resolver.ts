import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Pmdt07PreviewService } from './pmdt07-preview.service';
import { Pmdt07PreviewForm } from './pmdt07-preview.form';
import { Pmdt07PreviewModel, Pmdt07PreviewPageData } from './pmdt07-preview.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt07PreviewResolver: ResolveFn<Pmdt07PreviewPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt07PreviewService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt07PreviewForm.createForm(fb);

  return {
    formData: new SicFromData<Pmdt07PreviewModel>(form),
  };
};
