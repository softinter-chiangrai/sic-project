// src/app/core/guard/requirement.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DialogService } from '../services/dialog.service';
import { CustomerStateService } from '../services/customer-state.service'; // ✅ เพิ่ม

export const requirementGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const dialog = inject(DialogService);
  const customerState = inject(CustomerStateService); // ✅ เพิ่ม

  // ✅ ตรวจสอบจาก Service หรือ queryParams
  let requirementId = customerState.getRequirementId(); // ต้องเพิ่ม method ใน Service
  if (!requirementId) {
    requirementId = route.queryParams['requirementId'] || null;
    if (requirementId) {
      customerState.setRequirement(
        requirementId,
        route.queryParams['requirementTitle'] || ''
      );
    }
  }

  if (!requirementId) {
    dialog.warn('กรุณาเลือก Requirement', 'ไม่พบข้อมูล Requirement');
    const projectId = customerState.getProjectId();
    const customerId = customerState.getCustomerId();
    router.navigate(['/feature/pm/pmdt04'], {
      queryParams: {
        projectId: projectId || undefined,
        customerId: customerId || undefined
      }
    });
    return false;
  }

  return true;
};