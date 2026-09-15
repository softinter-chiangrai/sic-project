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
  selector: 'kc-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
  imports: [SicALinkComponent, MainLayoutComponent],
  providers: [
    {
      provide: ComponentReference,
      useExisting: forwardRef(() => InfoComponent),
    },
  ],
})
export class InfoComponent extends ComponentReference {
  kcContext = inject<Extract<KcContext, { pageId: 'info.ftl' }>>(KC_LOGIN_CONTEXT);
  i18n = inject<I18n>(LOGIN_I18N);

  override doUseDefaultCss = inject<boolean>(USE_DEFAULT_CSS);
  override classes = inject<Partial<Record<ClassKey, string>>>(LOGIN_CLASSES);

  displayMessage = false;
  bodyClassName = 'kc-sic-custom-login';

  get headerHtml(): string {
    return this.kcContext?.messageHeader ?? this.i18n.advancedMsgStr(this.kcContext?.message?.summary ?? '');
  }

  // headerHtml เป็นตัวเนื้อหาที่เปลี่ยนไปตามสถานการณ์จริง (เช่น "Email sent",
  // "Registration successful" ฯลฯ) — เอามาใช้ตั้ง document title ด้วย strip tag ออก
  // ก่อน (document.title เป็น plain text ไม่รองรับ HTML)
  documentTitle = buildDocumentTitle(this.kcContext?.realm, this.headerHtml.replace(/<[^>]+>/g, '') || 'Information');

  get infoMessageHtml(): string {
    let html = this.kcContext?.message?.summary ?? '';
    if (this.kcContext?.requiredActions?.length) {
      html += '<b>';
      html += this.kcContext.requiredActions
        .map((requiredAction) => this.i18n.advancedMsgStr(`requiredAction.${requiredAction}`))
        .join(', ');
      html += '</b>';
    }
    return html;
  }
}
