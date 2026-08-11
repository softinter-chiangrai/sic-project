// src/app/feature/pm/dt/pmdt02/pmdt02C/pmdt02C.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, catchError, EMPTY } from 'rxjs';
import { Pmdt02CService } from './pmdt02C.service';
import { Pmdt02CForm } from './pmdt02C.form';
import { TaskModel, TaskPageData } from './pmdt02C.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt02CResolver: ResolveFn<TaskPageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt02CService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt02CForm.createForm(fb);

  if (!id) {
    return { taskData: new SicFromData<TaskModel>(form) };
  }

  try {
    const detail = await lastValueFrom(service.getTaskById(id));
    if (detail) {
      const startDate = detail.startDate ? detail.startDate.split('T')[0] : '';
      const startTime = detail.startDate ? detail.startDate.split('T')[1]?.substring(0, 5) : '';
      const endDate = detail.endDate ? detail.endDate.split('T')[0] : '';
      const endTime = detail.endDate ? detail.endDate.split('T')[1]?.substring(0, 5) : '';
      form.patchValue({
        id: detail.id,
        workPackageId: detail.workPackageId,
        taskCode: detail.taskCode,
        taskName: detail.taskName,
        description: detail.description,
        assignedTo: detail.assignedTo,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        endTime: endTime,
        estimateManday: detail.estimateManday ?? null,
        priority: detail.priority,
        status: detail.status,
        color: detail.color,
        assigneeIds: detail.assigneeIds || [],
        assigneeNames: detail.assigneeNames || {},
      });
      return {
        taskData: new SicFromData<TaskModel>(form, form.value as any),
        taskDetail: detail,
      };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
