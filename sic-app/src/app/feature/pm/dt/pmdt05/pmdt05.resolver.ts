// src/app/feature/pm/dt/pmdt05/pmdt05.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { DiagramService } from './diagram.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { Pmdt05PageData } from './pmdt05.model';

export const pmdt05Resolver: ResolveFn<Pmdt05PageData> = async (route) => {
  const service = inject(DiagramService);
  const customerState = inject(CustomerStateService);

  // This route ('diagram') has no :id param — it's a multi-tab diagram editor
  // driven entirely by queryParams (tabId/projectId), resolved reactively in
  // the component. We only preload the tab list when a projectId is already
  // known up front, to skip the component's own first getTabs() call.
  const projectId = route.queryParams['projectId'] || customerState.getProjectId() || null;
  if (!projectId) {
    return { initialTabs: null, projectId: null };
  }

  try {
    const tabs = await lastValueFrom(service.getTabs(projectId));
    return { initialTabs: tabs ?? [], projectId };
  } catch (err) {
    console.error('pmdt05Resolver: failed to preload diagram tabs', err);
    return { initialTabs: null, projectId };
  }
};
