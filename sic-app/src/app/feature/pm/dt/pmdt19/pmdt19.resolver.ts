import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt19AService } from './pmdt19A/pmdt19A.service';
import { Pmdt19PageData } from './pmdt19.model';

/**
 * Resolver for both:
 *  - 'version'              -> full version-history list (optionally filtered by query params)
 *  - 'version/history/:code' -> version history scoped to a single document (`code` route param)
 */
export const pmdt19Resolver: ResolveFn<Pmdt19PageData> = async (route) => {
  const service = inject(Pmdt19AService);

  // When landing on 'version/history/:code', scope the list to that one document.
  const historyCode = route.paramMap.get('code');

  const qType = route.queryParamMap.get('documentType') || 'ALL';
  const qId = route.queryParamMap.get('documentId') || historyCode || '';
  // Kept only to preselect the project when creating a new version from context, and for
  // goBack() — no longer passed to the service, so the list always loads all projects'
  // versions and the navbar context-switcher filters client-side (see pmdt19.component.ts).
  const qProjectId = route.queryParamMap.get('projectId') || null;

  try {
    const items = await lastValueFrom(
      service.getVersions(qType, qId || undefined),
    );
    return {
      items: items ?? [],
      filterType: qType,
      filterDocId: qId,
      projectId: qProjectId,
    };
  } catch (err) {
    console.error('Failed to load document versions:', err);
    return {
      items: [],
      filterType: qType,
      filterDocId: qId,
      projectId: qProjectId,
    };
  }
};
