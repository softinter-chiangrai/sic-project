// src/app/core/utils/resolve-context.util.ts
import { ActivatedRoute } from '@angular/router';
import { CustomerStateService } from '../services/customer-state.service';

// ลำดับความสำคัญ: query param ใน URL ปัจจุบันมาก่อนเสมอ (ตรงกับสิ่งที่ผู้ใช้ตั้งใจนำทางมา)
// แล้วค่อย fallback ไปที่ค่าที่เคยเลือกไว้ก่อนหน้าใน session (เพื่อความสะดวก ไม่ใช่ความถูกต้อง)
export function resolveProjectId(route: ActivatedRoute, customerState: CustomerStateService): string | null {
  return route.snapshot.queryParams['projectId'] || customerState.getProjectId() || null;
}

export function resolveCustomerId(route: ActivatedRoute, customerState: CustomerStateService): string | null {
  return route.snapshot.queryParams['customerId'] || customerState.getCustomerId() || null;
}

export function resolveRequirementId(route: ActivatedRoute, customerState: CustomerStateService): string | null {
  return route.snapshot.queryParams['requirementId'] || customerState.getRequirementId() || null;
}
