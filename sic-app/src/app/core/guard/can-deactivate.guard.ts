import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { DialogService } from '../services/dialog.service';
import { inject } from '@angular/core';

export const CanDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate,
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  nextState: RouterStateSnapshot
) => {
  const dialogService = inject(DialogService);
  if (!component.pageDirty) {
    return true;
  }
  const isDirty = component.pageDirty();
  if (!isDirty) {
    return true;
  }
  return dialogService.confirm(
    'มีการเปลี่ยนแปลงอยู่',
    'คุณต้องการออกจากหน้านี้หรือไม่?'
  ).then((confirmed) => {
    return confirmed;
  });
};

export interface CanComponentDeactivate {
  pageDirty: () => boolean;
}