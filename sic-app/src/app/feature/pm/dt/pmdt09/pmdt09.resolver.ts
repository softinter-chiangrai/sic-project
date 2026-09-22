import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt09Service } from './pmdt09.service';
import { Pmdt09PageData } from './pmdt09.model';

// Preloads the first page of design reviews for the current project so the list page
// (pmdt09.component.ts) doesn't have to make its own initial HTTP call in ngOnInit.
export const pmdt09Resolver: ResolveFn<Pmdt09PageData> = async (route) => {
  const service = inject(Pmdt09Service);
  // Kept only to preselect the project when creating a new design review from context —
  // no longer used to filter the loaded list (see pmdt09.component.ts filteredReviews).
  const projectId = route.queryParamMap.get('projectId') || null;

  try {
    // Always load all design reviews of all projects; navbar context filters client-side.
    // size bumped well above the previous 12/page so the client has the (near-)full
    // dataset to filter against.
    const res = await lastValueFrom(
      service.getDesignReviews({
        status: 'all',
        page: 1,
        size: 1000,
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
