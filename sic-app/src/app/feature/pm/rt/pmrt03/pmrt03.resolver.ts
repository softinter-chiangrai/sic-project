// src/app/feature/pm/rt/pmrt03/pmrt03.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmrt03Service } from './pmrt03.service';
import { Pmrt03Form } from './pmrt03.form';
import { Pmrt03Model, Pmrt03PageData } from './pmrt03.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

import { CustomerStateService } from '../../../../core/services/customer-state.service';

export const pmrt03Resolver: ResolveFn<Pmrt03PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt03Service);
  const router = inject(Router);
  const customerState = inject(CustomerStateService);
  const id = route.paramMap.get('id') || route.queryParams['projectId'] || customerState.getProjectId();

  const form = Pmrt03Form.createForm(fb);

  if (!id) {
    return { dashboardData: new SicFromData<Pmrt03Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getDashboard(id));
    if (data) {
      const model: Partial<Pmrt03Model> = {
        id: data.id,
        projectId: data.id,
        projectName: data.projectName,
        progress: data.phaseCount > 0 ? 0 : 0,
        phaseCount: data.phaseCount,
        taskCount: data.taskCount,
        rowVersion: data.rowVersion,
      };
      form.patchValue(model as any);
      return { dashboardData: new SicFromData<Pmrt03Model>(form, model as Pmrt03Model) };
    }
    return { dashboardData: new SicFromData<Pmrt03Model>(form) };
  } catch {
    return { dashboardData: new SicFromData<Pmrt03Model>(form) };
  }
};
