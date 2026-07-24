// src/app/feature/pm/dt/pmdt08/pmdt08.resolver.ts

import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { Pmdt08Form } from './pmdt08.form';
import { SpecificationModel, Pmdt08FormData } from './pmdt08.model';
import { Pmdt08Service } from './pmdt08.service';

// pmdt08.resolver.ts (ปรับปรุง)

export const pmdt08CreateResolver: ResolveFn<Pmdt08FormData> = (route) => {
  const fb = inject(FormBuilder);
  const form = Pmdt08Form.createForm(fb);
  
  // อ่าน queryParams
  const requirementId = route.queryParams['requirementId'];
  const projectId = route.queryParams['projectId'];
  
  if (requirementId) {
    form.patchValue({ requirementId });
  }
  if (projectId) {
    form.patchValue({ projectId });
  }
  
  return { specification: new SicFromData<SpecificationModel>(form) };
};

export const pmdt08EditResolver: ResolveFn<Pmdt08FormData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt08Service);
  const router = inject(Router);
  const id = route.params['id'];
  const form = Pmdt08Form.createForm(fb);

  return service.getById(id).pipe(
    tap((data) => {
      form.patchValue(data);
      form.updateValueAndValidity();
    }),
    map(() => ({
      specification: new SicFromData<SpecificationModel>(form),
    })),
    catchError(() => {
      router.navigate(['/feature/pm/pmdt08']);
      return EMPTY;
    })
  );
};