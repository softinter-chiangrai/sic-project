import { ChangeDetectionStrategy, Component, type OnInit, forwardRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { USE_DEFAULT_CSS } from '@keycloakify/angular/lib/tokens/use-default-css';
import { ComponentReference } from '@keycloakify/angular/login/classes/component-reference';
import { LOGIN_CLASSES } from '@keycloakify/angular/login/tokens/classes';
import { LOGIN_I18N } from '@keycloakify/angular/login/tokens/i18n';
import { KC_LOGIN_CONTEXT } from '@keycloakify/angular/login/tokens/kc-context';
import type { ClassKey } from 'keycloakify/login/lib/kcClsx';

import {
  SicInputPasswordComponent,
  SicCheckboxComponent,
  SicButtonComponent,
  SicFlexComponent,
  SicToastService,
  type SicToastType,
} from 'sic-ng';

import { MainLayoutComponent } from '../../components/main-layout/main-layout.component';
import { PLEASE_INPUT_DATA_MESSAGE, buildDocumentTitle } from '../../constants';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

@Component({
  selector: 'kc-login-update-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-update-password.component.html',
  styleUrl: './login-update-password.component.css',
  imports: [
    ReactiveFormsModule,
    SicInputPasswordComponent,
    SicCheckboxComponent,
    SicButtonComponent,
    SicFlexComponent,
    MainLayoutComponent,
  ],
  providers: [
    {
      provide: ComponentReference,
      useExisting: forwardRef(() => LoginUpdatePasswordComponent),
    },
  ],
})
export class LoginUpdatePasswordComponent extends ComponentReference implements OnInit {
  kcContext = inject<Extract<KcContext, { pageId: 'login-update-password.ftl' }>>(KC_LOGIN_CONTEXT);
  i18n = inject<I18n>(LOGIN_I18N);
  private readonly toasts = inject(SicToastService);

  override doUseDefaultCss = inject<boolean>(USE_DEFAULT_CSS);
  override classes = inject<Partial<Record<ClassKey, string>>>(LOGIN_CLASSES);

  readonly updateForm = new FormGroup({
    passwordNew: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    passwordConfirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    logoutOtherSessions: new FormControl(false, { nonNullable: true }),
  });

  displayMessage = false;
  bodyClassName = 'kc-sic-custom-login';
  isAppInitiatedAction = !!this.kcContext?.isAppInitiatedAction;
  documentTitle = buildDocumentTitle(this.kcContext?.realm, this.i18n.msgStr('updatePasswordTitle'));

  private static readonly TOAST_TYPE_BY_KC_MESSAGE_TYPE: Record<string, SicToastType> = {
    success: 'success',
    warning: 'warning',
    error: 'danger',
    info: 'info',
  };

  ngOnInit(): void {
    const message = this.kcContext?.message;
    if (!message) {
      return;
    }
    this.toasts.show({
      message: message.summary.replace(/<[^>]+>/g, ''),
      type: LoginUpdatePasswordComponent.TOAST_TYPE_BY_KC_MESSAGE_TYPE[message.type] ?? 'info',
    });
  }

  handleSubmit(event: SubmitEvent): void {
    if (this.updateForm.invalid) {
      event.preventDefault();
      this.updateForm.markAllAsTouched();
      this.toasts.show({ message: PLEASE_INPUT_DATA_MESSAGE, type: 'warning' });
      return;
    }
    if (this.updateForm.controls.passwordNew.value !== this.updateForm.controls.passwordConfirm.value) {
      event.preventDefault();
      this.toasts.show({ message: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน', type: 'warning' });
    }
  }
}
