// src/app/core/utils/resolve-context.util.ts
import { ActivatedRoute } from '@angular/router';
import { CustomerStateService } from '../services/customer-state.service';

// ดึง Context จาก URL Query Param เท่านั้น เพื่อให้การเข้าสู่หน้าจอทั่วไปแสดงข้อมูลทั้งหมดขององค์กรเสมอ
export function resolveProjectId(route: ActivatedRoute, _customerState?: CustomerStateService): string | null {
  return route.snapshot.queryParams['projectId'] || null;
}

export function resolveCustomerId(route: ActivatedRoute, _customerState?: CustomerStateService): string | null {
  return route.snapshot.queryParams['customerId'] || null;
}

export function resolveRequirementId(route: ActivatedRoute, _customerState?: CustomerStateService): string | null {
  return route.snapshot.queryParams['requirementId'] || null;
}
