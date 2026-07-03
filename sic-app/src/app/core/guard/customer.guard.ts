// customer.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerStateService } from '../services/customer-state.service';
import { DialogService } from '../services/dialog.service';


export const customerGuard: CanActivateFn = (route, state) => {
  const customerState = inject(CustomerStateService);
  const router = inject(Router);
  const dialog = inject(DialogService);

  // ตรวจสอบว่า customerId มีอยู่ใน Service หรือ queryParams
  let customerId = customerState.getCustomerId();

  // ถ้าไม่มีใน Service ลองอ่านจาก queryParams
  if (!customerId) {
    customerId = route.queryParams['customerId'] || null;
    if (customerId) {
      // ถ้ามีใน queryParams ให้ set ลง Service
      customerState.setCustomer(
        customerId,
        route.queryParams['customerName'] || ''
      );
    }
  }

  if (!customerId) {
    dialog.warn('กรุณาเลือกลูกค้าก่อน', 'ไม่พบข้อมูลลูกค้า');
    router.navigate(['/feature/pm/pmrt01']);
    return false;
  }

  return true;
};