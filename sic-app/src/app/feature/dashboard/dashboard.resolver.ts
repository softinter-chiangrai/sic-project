import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { DashboardForm } from './dashboard.form';
import { DashboardModel, DashboardPageData } from './dashboard.model';
import { SicFromData } from '../../core/model/sic-from-data';

export const dashboardResolver: ResolveFn<DashboardPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(DashboardService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = DashboardForm.createForm(fb);

  return {
    formData: new SicFromData<DashboardModel>(form),
  };
};
