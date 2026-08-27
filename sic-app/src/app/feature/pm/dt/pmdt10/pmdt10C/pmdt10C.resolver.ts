import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Pmdt10CService } from './pmdt10C.service';
import { Pmdt10CForm } from './pmdt10C.form';
import { Pmdt10CModel, Pmdt10CPageData } from './pmdt10C.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt10CResolver: ResolveFn<Pmdt10CPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt10CService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt10CForm.createForm(fb);

  return {
    formData: new SicFromData<Pmdt10CModel>(form),
  };
};
