import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { DialogService } from '../services/dialog.service';
import { inject, isSignal, Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface CanComponentDeactivate {
  pageDirty?: () => boolean;
  form?: FormGroup | any;
  formData?: any;
  formGroup?: FormGroup | any;
  formCustomerData?: any;
  isViewOnly?: boolean | Signal<boolean> | (() => boolean) | any;
  isView?: boolean | Signal<boolean> | (() => boolean) | any;
}

export const CanDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate,
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  nextState: RouterStateSnapshot
) => {
  const dialogService = inject(DialogService);

  const resolveBoolean = (val: any): boolean => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'function') return Boolean(val());
    if (isSignal(val)) return Boolean(val());
    return false;
  };

  // 1. If explicitly in view-only mode, never block navigation
  if (resolveBoolean(component.isViewOnly) || resolveBoolean(component.isView)) {
    return true;
  }

  // 2. Determine if the component has unsaved changes automatically
  let isDirty = false;

  if (typeof component.pageDirty === 'function') {
    isDirty = component.pageDirty();
  } else if (component.formData && typeof component.formData.isChanged === 'boolean') {
    isDirty = component.formData.isChanged;
  } else if (component.formData && typeof component.formData.dirty === 'boolean') {
    isDirty = component.formData.dirty;
  } else if (component.formCustomerData && typeof component.formCustomerData.isChanged === 'boolean') {
    isDirty = component.formCustomerData.isChanged;
  } else if (component.formCustomerData && typeof component.formCustomerData.dirty === 'boolean') {
    isDirty = component.formCustomerData.dirty;
  } else if (component.form && component.form instanceof FormGroup) {
    isDirty = component.form.dirty;
  } else if (component.formGroup && component.formGroup instanceof FormGroup) {
    isDirty = component.formGroup.dirty;
  }

  if (!isDirty) {
    return true;
  }

  return dialogService.confirm(
    'มีการเปลี่ยนแปลงอยู่',
    'คุณต้องการออกจากหน้านี้หรือไม่?'
  ).then((confirmed) => {
    if (!confirmed) {
      window.history.pushState(null, '', state.url);
    }
    return confirmed;
  });
};