// src/app/feature/pm/dt/pmdt02/pmdt02B/pmdt02B.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, catchError, EMPTY } from 'rxjs';
import { Pmdt02BService } from './pmdt02B.service';
import { Pmdt02BForm } from './pmdt02B.form';
import { WorkPackageModel, WorkPackagePageData } from './pmdt02B.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt02BResolver: ResolveFn<WorkPackagePageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt02BService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt02BForm.createForm(fb);

  if (!id) {
    return { workPackageData: new SicFromData<WorkPackageModel>(form) };
  }

  try {
    const detail = await lastValueFrom(service.getWorkPackageById(id));
    if (detail) {
      const startDate = detail.startDate ? detail.startDate.split('T')[0] : '';
      const startTime = detail.startDate ? detail.startDate.split('T')[1]?.substring(0, 5) : '';
      const endDate = detail.endDate ? detail.endDate.split('T')[0] : '';
      const endTime = detail.endDate ? detail.endDate.split('T')[1]?.substring(0, 5) : '';
      form.patchValue({
        id: detail.id,
        milestoneId: detail.milestoneId,
        packageName: detail.packageName,
        description: detail.description,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        endTime: endTime,
        status: detail.status,
        color: detail.color,
      });
      return {
        workPackageData: new SicFromData<WorkPackageModel>(form, form.value as any),
        workPackageDetail: detail,
      };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
