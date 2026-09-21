// src/app/feature/bu/rt/burt02/burt02A/burt02A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { forkJoin, lastValueFrom } from 'rxjs';
import { burt02AService } from './burt02A.component';
import { burt03Service } from '../../burt03/burt03.service';
import { Burt02AForm } from './burt02A.form';
import { Burt02AModel, Burt02APageData } from './burt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const burt02AResolver: ResolveFn<Burt02APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(burt02AService);
  const roleService = inject(burt03Service);
  const router = inject(Router);
  const roleId = route.paramMap.get('id');

  const form = Burt02AForm.createForm(fb);

  if (!roleId) {
    router.navigate(['/feature/bu/permission']);
    return { formData: new SicFromData<Burt02AModel>(form) };
  }

  try {
    const { permissions, roleDetail } = await lastValueFrom(
      forkJoin({
        permissions: service.getRolePermissions(roleId),
        roleDetail: roleService.getRole(roleId),
      }),
    );

    const model: Burt02AModel = {
      roleId,
      roleCode: permissions.roleCode || roleDetail.roleCode,
      roleName: roleDetail.roleName || roleDetail.roleNameEn || roleDetail.roleCode,
      modules: permissions.modules,
      state: null as any,
      rowVersion: null as any,
    };
    form.patchValue(model as any);
    return { formData: new SicFromData<Burt02AModel>(form, model) };
  } catch (err) {
    console.error('Failed to load role permissions:', err);
    router.navigate(['/not-found']);
    return { formData: new SicFromData<Burt02AModel>(form) };
  }
};
