import { ChangeDetectionStrategy, Component, forwardRef, inject } from '@angular/core';
import { USE_DEFAULT_CSS } from '@keycloakify/angular/lib/tokens/use-default-css';
import { ComponentReference } from '@keycloakify/angular/login/classes/component-reference';
import { LOGIN_CLASSES } from '@keycloakify/angular/login/tokens/classes';
import { LOGIN_I18N } from '@keycloakify/angular/login/tokens/i18n';
import { KC_LOGIN_CONTEXT } from '@keycloakify/angular/login/tokens/kc-context';
import type { ClassKey } from 'keycloakify/login/lib/kcClsx';

import { SicALinkComponent } from 'sic-ng';

import { MainLayoutComponent } from '../../components/main-layout/main-layout.component';
import { buildDocumentTitle } from '../../constants';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

@Component({
  selector: 'kc-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
  imports: [SicALinkComponent, MainLayoutComponent],
  providers: [
    {
      provide: ComponentReference,
      useExisting: forwardRef(() => ErrorComponent),
    },
  ],
})
export class ErrorComponent extends ComponentReference {
  kcContext = inject<Extract<KcContext, { pageId: 'error.ftl' }>>(KC_LOGIN_CONTEXT);
  i18n = inject<I18n>(LOGIN_I18N);

  override doUseDefaultCss = inject<boolean>(USE_DEFAULT_CSS);
  override classes = inject<Partial<Record<ClassKey, string>>>(LOGIN_CLASSES);

  displayMessage = false;
  bodyClassName = 'kc-sic-custom-login';
  documentTitle = buildDocumentTitle(this.kcContext?.realm, this.i18n.msgStr('errorTitle'));
}
