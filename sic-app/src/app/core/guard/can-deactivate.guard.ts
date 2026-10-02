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
  isLocked?: boolean | Signal<boolean> | (() => boolean) | any;
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

  const currentUrl = state?.url || '';
  const isViewRoute =
    currentUrl.includes('/view') ||
    currentUrl.includes('/preview') ||
    Boolean(route.routeConfig?.path?.includes('view')) ||
    Boolean(route.routeConfig?.path?.includes('preview')) ||
    route.queryParams?.['mode'] === 'view';

  // 1. If explicitly in view-only mode, saved successfully, or currently saving/submitting, never block navigation
  if (
    isViewRoute ||
    resolveBoolean(component.isViewOnly) ||
    resolveBoolean(component.isView) ||
    resolveBoolean(component.isLocked) ||
    resolveBoolean(component.isSaved) ||
    resolveBoolean(component.isSaving) ||
    resolveBoolean(component.isSubmitting)
  ) {
    return true;
  }

  // Helper to extract all FormGroups on the component (regardless of property name)
  const getAllForms = (): FormGroup[] => {
    const forms: FormGroup[] = [];
    const anyComp = component as any;
    if (component.formData?.formGroup instanceof FormGroup) forms.push(component.formData.formGroup);
    if (component.formData?.form instanceof FormGroup && !forms.includes(component.formData.form)) forms.push(component.formData.form);
    if (component.formCustomerData?.formGroup instanceof FormGroup) forms.push(component.formCustomerData.formGroup);
    if (component.formBusinessData?.formGroup instanceof FormGroup) forms.push(component.formBusinessData.formGroup);
    if (component.form instanceof FormGroup && !forms.includes(component.form)) forms.push(component.form);
    if (component.formGroup instanceof FormGroup && !forms.includes(component.formGroup)) forms.push(component.formGroup);

    for (const key of Object.keys(anyComp)) {
      try {
        const val = anyComp[key];
        if (val instanceof FormGroup && !forms.includes(val)) {
          forms.push(val);
        } else if (val?.formGroup instanceof FormGroup && !forms.includes(val.formGroup)) {
          forms.push(val.formGroup);
        } else if (val?.form instanceof FormGroup && !forms.includes(val.form)) {
          forms.push(val.form);
        }
      } catch {}
    }
    return forms;
  };

  const allForms = getAllForms();
  if (allForms.length > 0 && allForms.every((f) => f.disabled)) {
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
  } else if (allForms.length > 0) {
    isDirty = allForms.some((f) => f.dirty);
  }

  // Safety check: If all underlying forms are completely pristine (user never typed/interacted)
  // and no delete operation occurred, never block navigation.
  if (isDirty && allForms.length > 0 && allForms.every((f) => f.pristine)) {
    const isExplicitlyDeleted =
      component.formData?.state === 2 /* Deleted */ ||
      component.formCustomerData?.state === 2 ||
      component.formBusinessData?.state === 2;

    if (!isExplicitlyDeleted) {
      isDirty = false;
    }
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