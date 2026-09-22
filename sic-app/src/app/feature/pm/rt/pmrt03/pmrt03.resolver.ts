// src/app/feature/pm/rt/pmrt03/pmrt03.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmrt03Service } from './pmrt03.service';
import { Pmrt03PageData } from './pmrt03.model';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { Pmrt02Service } from '../pmrt02/pmrt02.service';

export const pmrt03Resolver: ResolveFn<Pmrt03PageData> = async (route) => {
  const service = inject(Pmrt03Service);
  const projectService = inject(Pmrt02Service);
  const customerState = inject(CustomerStateService);

  let id = route.queryParamMap.get('projectId') || route.paramMap.get('id') || '';

  if (!id) {
    id = customerState.getProjectId() || '';
  }

  if (!id) {
    try {
      const projRes = await lastValueFrom(projectService.getProjects({ page: 0, size: 1 }));
      if (projRes?.data && projRes.data.length > 0) {
        id = projRes.data[0].id;
        customerState.setProject(id, projRes.data[0].projectName);
      }
    } catch (e) {
      console.error('Failed to get default project for dashboard:', e);
    }
  }

  if (!id) {
    return { dashboard: null, projectId: '' };
  }

  try {
    const data = await lastValueFrom(service.getDashboard(id));
    return { dashboard: data ?? null, projectId: id };
  } catch (err) {
    console.error('Failed to load project dashboard:', err);
    return { dashboard: null, projectId: id };
  }
};
