import { ChangeDetectionStrategy, Component, type OnInit, forwardRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { USE_DEFAULT_CSS } from '@keycloakify/angular/lib/tokens/use-default-css';
import { ComponentReference } from '@keycloakify/angular/login/classes/component-reference';
import { LOGIN_CLASSES } from '@keycloakify/angular/login/tokens/classes';
import { LOGIN_I18N } from '@keycloakify/angular/login/tokens/i18n';
import { KC_LOGIN_CONTEXT } from '@keycloakify/angular/login/tokens/kc-context';
import type { ClassKey } from 'keycloakify/login/lib/kcClsx';

import {
  SicInputComponent,
  SicButtonComponent,
  SicALinkComponent,
  SicFlexComponent,
  SicTextComponent,
  SicToastService,
  type SicToastType,
} from 'sic-ng';

import { MainLayoutComponent } from '../../components/main-layout/main-layout.component';
import { PLEASE_INPUT_DATA_MESSAGE, buildDocumentTitle } from '../../constants';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

@Component({
  selector: 'kc-login-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-reset-password.component.html',
  styleUrl: './login-reset-password.component.css',
  imports: [
    ReactiveFormsModule,
    SicInputComponent,
    SicButtonComponent,
    SicALinkComponent,
    SicFlexComponent,
    SicTextComponent,
    MainLayoutComponent,
  ],
  providers: [
    {
      provide: ComponentReference,
      useExisting: forwardRef(() => LoginResetPasswordComponent),
    },
  ],
})
export class LoginResetPasswordComponent extends ComponentReference implements OnInit {
  kcContext = inject<Extract<KcContext, { pageId: 'login-reset-password.ftl' }>>(KC_LOGIN_CONTEXT);
  i18n = inject<I18n>(LOGIN_I18N);
  private readonly toasts = inject(SicToastService);

  override doUseDefaultCss = inject<boolean>(USE_DEFAULT_CSS);
  override classes = inject<Partial<Record<ClassKey, string>>>(LOGIN_CLASSES);

  // เหมือน login.component.ts: ไม่ใส่ [formGroup] บน <form> เพื่อให้ native submit ทำงาน
  readonly resetForm = new FormGroup({
    username: new FormControl(this.kcContext?.auth?.attemptedUsername ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  displayMessage = false;
  bodyClassName = 'kc-sic-custom-login';
  documentTitle = buildDocumentTitle(this.kcContext?.realm, this.i18n.msgStr('emailForgotTitle'));

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
      type: LoginResetPasswordComponent.TOAST_TYPE_BY_KC_MESSAGE_TYPE[message.type] ?? 'info',
    });
  }

  handleSubmit(event: SubmitEvent): void {
    if (this.resetForm.invalid) {
      event.preventDefault();
      this.resetForm.markAllAsTouched();
      this.toasts.show({ message: PLEASE_INPUT_DATA_MESSAGE, type: 'warning' });
    }
  }
}
