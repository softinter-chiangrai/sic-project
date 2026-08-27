import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { map } from 'rxjs/operators';
import { DashboardService } from './dashboard.service';
import { DashboardForm } from './dashboard.form';
import { DashboardModel, DashboardPageData } from './dashboard.model';
import { SicFromData } from '../../core/model/sic-from-data';

export const dashboardResolver: ResolveFn<DashboardPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(DashboardService);

  const form = DashboardForm.createForm(fb);

  return service.loadDashboardData().pipe(
    map((data) => ({
      formData: new SicFromData<DashboardModel>(form),
      profile: data.profile,
      business: data.business,
      rawMenu: data.rawMenu || [],
      projects: data.projects || [],
      reviews: data.reviews || [],
      auditLogs: data.auditLogs || [],
    }))
  );
};
