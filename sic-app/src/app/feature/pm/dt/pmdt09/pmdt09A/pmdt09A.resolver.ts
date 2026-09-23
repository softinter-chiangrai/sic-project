import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { catchError, EMPTY, map, tap } from 'rxjs';

import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { Pmdt09AForm } from './pmdt09A.form';
import { DesignReviewModel, Pmdt09APageData } from './pmdt09A.model';
import { Pmdt09AService } from './pmdt09A.service';

export const pmdt09AResolver: ResolveFn<Pmdt09APageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt09AService);
  const router = inject(Router);
  const customerState = inject(CustomerStateService);
  const id = route.paramMap.get('id');

  const form = Pmdt09AForm.createForm(fb);

  if (!id) {
    // create mode: seed the form from queryParams or customerState
    const projectId = route.queryParamMap.get('projectId') || customerState.currentProjectId();
    const requirementId = route.queryParamMap.get('requirementId');
    if (projectId) {
      form.patchValue({ projectId } as Partial<DesignReviewModel>);
    }
    if (requirementId) {
      form.patchValue({ reviewableType: 'Requirement', reviewableId: requirementId } as Partial<DesignReviewModel>);
    }
    return {
      formData: new SicFromData<DesignReviewModel>(form),
      isEdit: false,
      reviewId: null,
    };
  }

  return service.getDesignReview(id).pipe(
    tap((data: DesignReviewModel) => {
      if (data) {
        const patch: any = { ...data };
        if (typeof patch.assignedTo === 'string' && patch.assignedTo.trim()) {
          patch.assignedTo = patch.assignedTo.split(',').map((s: string) => s.trim());
        }
        form.patchValue(patch);
      }
    }),
    map((data) => ({
      formData: new SicFromData<DesignReviewModel>(form, data),
      isEdit: true,
      reviewId: id,
    })),
    catchError((err) => {
      console.error('Failed to load design review:', err);
      router.navigate(['/not-found']);
      return EMPTY;
    }),
  );
};
