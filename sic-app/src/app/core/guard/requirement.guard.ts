// src/app/core/guard/requirement.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DialogService } from '../services/dialog.service';
import { CustomerStateService } from '../services/customer-state.service';

export const requirementGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const dialog = inject(DialogService);
  const customerState = inject(CustomerStateService);

  // 1. พยายามดึงจาก Service ก่อน
  let requirementId: string | null = customerState.getRequirementId();

  // 2. ถ้าไม่มี ให้ลองอ่านจาก path parameter (กรณี route เช่น requirement/:id)
  if (!requirementId) {
    const routePath = route.routeConfig?.path || '';
    if (routePath.startsWith('requirement/:id')) {
      const idFromParam = route.params['id'];
      if (idFromParam) {
        requirementId = idFromParam;
      }
    }
  }

  // 3. ถ้ายังไม่มี ให้ลองอ่านจาก query parameter
  if (!requirementId) {
    const qReqId = route.queryParams['requirementId'];
    if (qReqId && typeof qReqId === 'string') {
      requirementId = qReqId;
    }
  }

  // 4. ถ้ามี requirementId แล้ว → ตั้งค่าใน Service และ return true
  if (requirementId) {
    const title = route.queryParams['requirementTitle'] || '';
    customerState.setRequirement(requirementId, title);
    return true;
  }

  // 5. ไม่มี requirementId → แจ้งเตือนและกลับไปหน้ารายการ
  await dialog.warn('กรุณาเลือก Requirement', 'ไม่พบข้อมูล Requirement');
  const projectId = customerState.getProjectId();
  const customerId = customerState.getCustomerId();
  router.navigate(['/feature/pm/requirement'], {
    queryParams: {
      projectId: projectId || undefined,
      customerId: customerId || undefined,
    },
  });
  return false;
};