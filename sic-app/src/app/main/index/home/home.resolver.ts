import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HomeService } from './home.service';
import { HomeForm } from './home.form';
import { HomeModel, HomePageData } from './home.model';
import { SicFromData } from '../../../core/model/sic-from-data';

export const homeResolver: ResolveFn<HomePageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(HomeService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = HomeForm.createForm(fb);

  return {
    formData: new SicFromData<HomeModel>(form),
  };
};
