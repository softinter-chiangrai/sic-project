import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { DialogService } from '../services/dialog.service';
import { inject, isSignal, Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export interface CanComponentDeactivate {
  pageDirty?: () => boolean;
  form?: FormGroup | any;
  formData?: any;
  formGroup?: FormGroup | any;
  formCustomerData?: any;
  formBusinessData?: any;
  isViewOnly?: boolean | Signal<boolean> | (() => boolean) | any;
  isView?: boolean | Signal<boolean> | (() => boolean) | any;
  isSaved?: boolean | Signal<boolean> | (() => boolean) | any;
  isSaving?: boolean | Signal<boolean> | (() => boolean) | any;
  isSubmitting?: boolean | Signal<boolean> | (() => boolean) | any;
}

export const CanDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate,
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  nextState: RouterStateSnapshot
) => {
  const dialogService = inject(DialogService);
  const translate = inject(TranslateService);

  const resolveBoolean = (val: any): boolean => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'function') return Boolean(val());
    if (isSignal(val)) return Boolean(val());
    return false;
  };

  // 1. If explicitly in view-only mode, saved successfully, or currently saving/submitting, never block navigation
  if (
    resolveBoolean(component.isViewOnly) ||
    resolveBoolean(component.isView) ||
    resolveBoolean(component.isSaved) ||
    resolveBoolean(component.isSaving) ||
    resolveBoolean(component.isSubmitting)
  ) {
    return true;
  }

  // 2. Determine if the component has unsaved changes automatically
  let isDirty = false;

  if (typeof component.pageDirty === 'function') {
    isDirty = component.pageDirty();
  } else if (component.formData) {
    if (typeof component.formData.isChanged === 'boolean') {
      isDirty = component.formData.isChanged;
    } else if (typeof component.formData.dirty === 'boolean') {
      isDirty = component.formData.dirty;
    }
  } else if (component.formCustomerData) {
    if (typeof component.formCustomerData.isChanged === 'boolean') {
      isDirty = component.formCustomerData.isChanged;
    } else if (typeof component.formCustomerData.dirty === 'boolean') {
      isDirty = component.formCustomerData.dirty;
    }
  } else if (component.formBusinessData) {
    if (typeof component.formBusinessData.isChanged === 'boolean') {
      isDirty = component.formBusinessData.isChanged;
    } else if (typeof component.formBusinessData.dirty === 'boolean') {
      isDirty = component.formBusinessData.dirty;
    }
  } else if (component.form && component.form instanceof FormGroup) {
    isDirty = component.form.dirty;
  } else if (component.formGroup && component.formGroup instanceof FormGroup) {
    isDirty = component.formGroup.dirty;
  }

  if (!isDirty) {
    return true;
  }

  const currentLang = (typeof window !== 'undefined' && localStorage.getItem('app-lang') === 'en')
    ? 'en'
    : (translate.currentLang === 'en' ? 'en' : 'th');

  const defaultTitle = currentLang === 'en' ? 'Unsaved Changes' : 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก';
  const defaultMsg = currentLang === 'en'
    ? 'You have unsaved changes. Leave this page anyway?'
    : 'คุณมีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการออกจากหน้านี้หรือไม่?';

  const translatedTitle = translate.instant('COMMON_UNSAVED_CHANGES_TITLE');
  const title = (translatedTitle && translatedTitle !== 'COMMON_UNSAVED_CHANGES_TITLE')
    ? translatedTitle
    : defaultTitle;

  const translatedMsg = translate.instant('COMMON_UNSAVED_CHANGES_MSG');
  const message = (translatedMsg && translatedMsg !== 'COMMON_UNSAVED_CHANGES_MSG')
    ? translatedMsg
    : defaultMsg;

  return dialogService.confirm(
    title,
    message
  ).then((confirmed) => {
    if (!confirmed) {
      window.history.pushState(null, '', state.url);
    }
    return confirmed;
  });
};