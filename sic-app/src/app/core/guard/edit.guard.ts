import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { DialogService } from '../core/services/dialog.service';
import { environment } from '../../environments/environment';

export const editGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const dialog = inject(DialogService);

  // กำหนด targetType จาก route data หรือ path
  const targetType = route.data['targetType'] || 'REQUIREMENT';
  const targetId = route.params['id'] || route.queryParams['id'];

  if (!targetId) {
    return true; // ถ้าไม่มี id ให้ผ่าน (เช่นหน้า create)
  }

  return http.get<{ isLocked: boolean; session: any }>(
    `${environment.apiBaseUrl}/api/pm/edit-sessions/check?targetType=${targetType}&targetId=${targetId}`
  ).pipe(
    map(response => {
      if (response.isLocked) {
        const session = response.session;
        if (session.assigneeId !== localStorage.getItem('userId')) { // ต้องมี userId
          dialog.warn('เอกสารถูกล็อก', `เอกสารนี้กำลังถูกแก้ไขโดย ${session.assigneeName || 'ผู้อื่น'}`);
          return false;
        }
      }
      return true;
    }),
    catchError(() => {
      // ถ้า API error ให้ผ่าน (หรือแสดง warning)
      return of(true);
    })
  );
};