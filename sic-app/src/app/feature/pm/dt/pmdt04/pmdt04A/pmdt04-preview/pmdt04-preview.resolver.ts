import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Pmdt04PreviewService } from './pmdt04-preview.service';
import { Pmdt04PreviewForm } from './pmdt04-preview.form';
import { Pmdt04PreviewModel, Pmdt04PreviewPageData } from './pmdt04-preview.model';
import { SicFromData } from '../../../../../../core/model/sic-from-data';

export const pmdt04PreviewResolver: ResolveFn<Pmdt04PreviewPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt04PreviewService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt04PreviewForm.createForm(fb);

  return {
    formData: new SicFromData<Pmdt04PreviewModel>(form),
  };
};
