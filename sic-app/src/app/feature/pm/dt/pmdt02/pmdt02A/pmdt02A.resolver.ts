// src/app/feature/pm/dt/pmdt02/pmdt02A/pmdt02A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, catchError, EMPTY } from 'rxjs';
import { Pmdt02AService } from './pmdt02A.service';
import { Pmdt02AForm } from './pmdt02A.form';
import { MilestoneModel, MilestonePageData } from './pmdt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt02AResolver: ResolveFn<MilestonePageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt02AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt02AForm.createForm(fb);

  if (!id) {
    return { milestoneData: new SicFromData<MilestoneModel>(form) };
  }

  try {
    const detail = await lastValueFrom(service.getMilestoneById(id));
    if (detail) {
      const dueDate = detail.dueDate ? detail.dueDate.split('T')[0] : '';
      const dueTime = detail.dueDate ? detail.dueDate.split('T')[1]?.substring(0, 5) : '';
      form.patchValue({
        id: detail.id,
        phaseId: detail.phaseId,
        milestoneName: detail.milestoneName,
        description: detail.description,
        dueDate: dueDate,
        dueTime: dueTime,
        status: detail.status,
        color: detail.color,
      });
      return {
        milestoneData: new SicFromData<MilestoneModel>(form, form.value as any),
        milestoneDetail: detail,
      };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
