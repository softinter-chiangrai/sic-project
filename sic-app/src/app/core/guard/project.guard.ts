// src/app/core/guard/project.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerStateService } from '../services/customer-state.service';
import { DialogService } from '../services/dialog.service';

export const projectGuard: CanActivateFn = (route, state) => {
  const customerState = inject(CustomerStateService);
  const router = inject(Router);
  const dialog = inject(DialogService);

  // 1. ลองอ่าน projectId จาก Service
  let projectId = customerState.getProjectId();

  // 2. ถ้าไม่มีใน Service ลองอ่านจาก queryParams
  if (!projectId) {
    projectId = route.queryParams['projectId'] || null;
    if (projectId) {
      customerState.setProject(
        projectId,
        route.queryParams['projectName'] || ''
      );
    }
  }

  // 3. ถ้ายังไม่มี → แจ้งเตือนและพาไปเลือกโครงการ
  if (!projectId) {
    const customerId = customerState.getCustomerId();
    dialog.warn(
      'กรุณาเลือกโครงการก่อน',
      'คุณต้องเลือกโครงการเพื่อเข้าถึงหน้านี้'
    );
    router.navigate(['/feature/pm/pmrt02'], {
      queryParams: { customerId: customerId || undefined }
    });
    return false;
  }

  return true;
};