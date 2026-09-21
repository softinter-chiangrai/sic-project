import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt09Service } from './pmdt09.service';
import { Pmdt09PageData } from './pmdt09.model';

// Preloads the first page of design reviews for the current project so the list page
// (pmdt09.component.ts) doesn't have to make its own initial HTTP call in ngOnInit.
export const pmdt09Resolver: ResolveFn<Pmdt09PageData> = async (route) => {
  const service = inject(Pmdt09Service);
  const projectId = route.queryParamMap.get('projectId') || null;

  try {
    const res = await lastValueFrom(
      service.getDesignReviews({
        projectId: projectId || undefined,
        status: 'all',
        page: 1,
        size: 12,
      }),
    );
    return {
      projectId,
      reviews: res.data || [],
      totalElements: res.pageable?.totalElements || 0,
    };
  } catch (err) {
    console.error('Failed to load design reviews:', err);
    return { projectId, reviews: [], totalElements: 0 };
  }
};
