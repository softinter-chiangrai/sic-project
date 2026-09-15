import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { KC_LOGIN_CONTEXT } from '@keycloakify/angular/login/tokens/kc-context';

import { SicCardComponent, SicFlexComponent, SicTextComponent, SicToastComponent } from 'sic-ng';

import type { KcContext } from '../../KcContext';

/**
 * Layout ร่วมของทุกหน้า Keycloak custom theme (login, register, forgot password ฯลฯ) —
 * ให้พื้นหลัง (hero image เต็มจอ), การ์ดขาวลอยชิดขวา, โลโก้/ชื่อแบรนด์, และ toast
 * container เหมือนกันทุกหน้า โดยแต่ละหน้าใส่แค่เนื้อหาฟอร์มของตัวเองผ่าน <ng-content>
 *
 * ใช้งาน:
 * ```html
 * <app-main-layout [subtitle]="i18n.msgStr('...')">
 *   <form>...</form>
 * </app-main-layout>
 * ```
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  imports: [SicCardComponent, SicFlexComponent, SicTextComponent, SicToastComponent],
})
export class MainLayoutComponent {
  // inject กว้างเป็น KcContext (union ของทุกหน้า) แทนที่จะ narrow เป็น pageId เดียว
  // เหมือนที่แต่ละหน้าทำ — เพราะ component นี้ใช้ร่วมกันทุกหน้า และ field ที่ใช้ตรงนี้
  // (url, realm) เป็น field ร่วมที่มีอยู่ในทุก pageId อยู่แล้ว (ไม่ใช่ field เฉพาะหน้าใดหน้าหนึ่ง)
  private readonly kcContext = inject<KcContext>(KC_LOGIN_CONTEXT);

  /** ข้อความใต้ชื่อแบรนด์ เปลี่ยนไปตามหน้า เช่น "Sign in to your account" / "Create an account" */
  @Input() subtitle?: string;

  // ไฟล์ static asset ของ Keycloak theme (public/bg.png, public/logo.png) ถูก serve อยู่ใต้
  // kcContext.url.resourcesPath ไม่ใช่ root "/" ของโดเมน (path มี hash เปลี่ยนได้ตามเวอร์ชัน
  // theme) — ต้องต่อ URL แบบนี้เสมอ ห้าม hardcode path ตรงๆ ใน CSS เพราะ CSS ธรรมดาไม่มีทาง
  // รู้ค่า resourcesPath นี้ได้ (มันมาจาก kcContext ตอน request)
  readonly heroBackgroundUrl = `${this.kcContext?.url?.resourcesPath ?? ''}/dist/bg.png`;
  readonly logoUrl = `${this.kcContext?.url?.resourcesPath ?? ''}/dist/logo.png`;

  // ชื่อแบรนด์ดึงจาก realm.displayName (ตั้งค่าได้ที่ Admin Console → Realm Settings →
  // General → Display name) fallback ไปที่ realm.name (technical name ของ realm เสมอมี
  // ค่า) แล้วค่อย fallback ไปข้อความ placeholder สุดท้ายถ้าไม่มีทั้งคู่ (ไม่ควรเกิดขึ้นจริง)
  readonly brandName = this.kcContext?.realm?.displayName || this.kcContext?.realm?.name || 'SIC E-Learning';
}
