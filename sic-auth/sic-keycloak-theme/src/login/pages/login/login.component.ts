import { ChangeDetectionStrategy, Component, type OnInit, forwardRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { USE_DEFAULT_CSS } from '@keycloakify/angular/lib/tokens/use-default-css';
import { ComponentReference } from '@keycloakify/angular/login/classes/component-reference';
import { LOGIN_CLASSES } from '@keycloakify/angular/login/tokens/classes';
import { LOGIN_I18N } from '@keycloakify/angular/login/tokens/i18n';
import { KC_LOGIN_CONTEXT } from '@keycloakify/angular/login/tokens/kc-context';
import type { ClassKey } from 'keycloakify/login/lib/kcClsx';

// sic-ng UI — ให้หน้าตาเหมือนแอปหลัก
import {
  SicInputComponent,
  SicInputPasswordComponent,
  SicCheckboxComponent,
  SicButtonComponent,
  SicALinkComponent,
  SicFlexComponent,
  SicTextComponent,
  SicToastService,
  type SicToastType,
} from 'sic-ng';

import { MainLayoutComponent } from '../../components/main-layout/main-layout.component';
import { PLEASE_INPUT_DATA_MESSAGE } from '../../constants';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

@Component({
  selector: 'kc-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [
    ReactiveFormsModule,
    SicInputComponent,
    SicInputPasswordComponent,
    SicCheckboxComponent,
    SicButtonComponent,
    SicALinkComponent,
    SicFlexComponent,
    SicTextComponent,
    MainLayoutComponent,
  ],
  providers: [
    {
      provide: ComponentReference,
      useExisting: forwardRef(() => LoginComponent),
    },
  ],
})
export class LoginComponent extends ComponentReference implements OnInit {
  kcContext = inject<Extract<KcContext, { pageId: 'login.ftl' }>>(KC_LOGIN_CONTEXT);
  i18n = inject<I18n>(LOGIN_I18N);
  private readonly toasts = inject(SicToastService);

  override doUseDefaultCss = inject<boolean>(USE_DEFAULT_CSS);
  override classes = inject<Partial<Record<ClassKey, string>>>(LOGIN_CLASSES);

  // Reactive Forms (FormGroup/FormControl) — เติมค่าเริ่มต้นจาก kcContext.login
  // (Keycloak ส่งค่าที่กรอกไว้กลับมาให้เวลา validation fail)
  //
  // ตั้งใจ "ไม่" ใส่ [formGroup] บน <form> เพราะ FormGroupDirective ก็มี host listener
  // ดัก submit event แล้ว preventDefault() เหมือน NgForm ของ template-driven forms —
  // ผูกทีละ control ด้วย [formControl] ตรงๆ แทน (ไม่ต้องพึ่ง ControlContainer จาก
  // formGroup ของ ancestor) เพื่อให้ browser ยัง POST ฟอร์มแบบ native ได้ตามปกติ
  readonly loginForm = new FormGroup({
    username: new FormControl(this.kcContext?.login?.username ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    rememberMe: new FormControl(!!this.kcContext?.login?.rememberMe, {
      nonNullable: true,
    }),
  });

  displayInfo =
    !!this.kcContext?.realm?.password &&
    !!this.kcContext?.realm?.registrationAllowed &&
    !this.kcContext?.registrationDisabled;

  // TemplateComponent เรนเดอร์ kcContext.message (ข้อความทั่วไปจาก Keycloak เช่น
  // brute-force lockout, "you are already logged in" ฯลฯ) เป็น <div class="alert-...">
  // ของมันเองเสมอถ้า displayMessage เป็น true (ค่า default) — set เป็น false ตรงนี้
  // เพื่อปิดการ render อันนั้น แล้วเราแสดงเป็น sic-toast แทนใน ngOnInit() ด้านล่าง
  displayMessage = false;

  private static readonly TOAST_TYPE_BY_KC_MESSAGE_TYPE: Record<string, SicToastType> = {
    success: 'success',
    warning: 'warning',
    error: 'danger',
    info: 'info',
  };

  // TemplateComponent (ตัวห่อกลางของ Keycloakify) ยัง render #kc-header (ชื่อ realm)
  // และ #kc-locale (dropdown ภาษา) อยู่เสมอไม่ว่า doUseDefaultCss จะเป็นอะไร — ใส่ class
  // นี้ให้ body แล้วซ่อนสองส่วนนั้นด้วย global CSS (ดู src/global-overrides.css) เฉพาะตอน
  // อยู่หน้านี้เท่านั้น หน้าอื่นที่ยังใช้ default theme จะไม่โดนกระทบ
  bodyClassName = 'kc-sic-custom-login';
  // loginTitle ("Sign in to {realm}") มีชื่อ realm ฝังอยู่แล้วในตัว i18n key เอง —
  // ไม่ต้องผ่าน buildDocumentTitle ซ้ำเหมือนหน้าอื่น (จะกลายเป็นชื่อ realm ซ้ำสองที)
  // ค่านี้จริงๆ ตรงกับ default fallback ของ TemplateComponent อยู่แล้ว แต่ set ไว้ตรงๆ
  // ให้เห็นชัดเจนว่าตั้งใจ ไม่ได้ลืม documentTitle เหมือนหน้าอื่นที่เคยเป็นบั๊กมาก่อน
  documentTitle = this.i18n.msgStr(
    'loginTitle',
    this.kcContext?.realm?.displayName ?? this.kcContext?.realm?.name ?? '',
  );

  isLoginButtonDisabled = signal(false);

  ngOnInit(): void {
    const message = this.kcContext?.message;
    // รวมถึง error "Invalid username or password" ที่ผูกกับ field username/password
    // ด้วย (usernameOrPasswordError) — ให้ขึ้น toast เหมือน message อื่นๆ ทั้งหมด
    // ไม่แยกแสดง inline ใต้ field อีกต่อไป (ดู template: ลบ sic-text ที่เคยโชว์ซ้ำออกแล้ว)
    if (!message) {
      return;
    }
    if (message.type === 'warning' && this.kcContext?.isAppInitiatedAction) {
      return;
    }
    this.toasts.show({
      // sic-toast แสดง message เป็น plain text ธรรมดา (ไม่รองรับ innerHTML เหมือน
      // sic-text) ส่วนใหญ่ kcContext.message.summary เป็นข้อความล้วนอยู่แล้ว แต่บาง
      // ข้อความของ Keycloak เองก็แทรก markup ง่ายๆ มาได้ (เช่น <a>) เลย strip tag
      // ออกกันไว้ก่อน ไม่งั้นผู้ใช้จะเห็น "<a href=...>" เป็นตัวหนังสือดิบๆ
      message: message.summary.replace(/<[^>]+>/g, ''),
      type: LoginComponent.TOAST_TYPE_BY_KC_MESSAGE_TYPE[message.type] ?? 'info',
    });
  }

  handleSubmit(event: SubmitEvent): void {
    // validate ฝั่ง client ก่อน — ถ้าไม่ผ่านให้กัน native submit ไว้ (เหมือนฟอร์มทั่วไป)
    // ถ้าผ่านแล้ว "ไม่" preventDefault ปล่อยให้ browser POST จริงไปที่ url.loginAction ต่อ
    if (this.loginForm.invalid) {
      event.preventDefault();
      this.loginForm.markAllAsTouched();

      // แจ้งด้วย toast ด้วย นอกเหนือจากกรอบแดง/ข้อความ error ใต้ field ที่ markAllAsTouched
      // ทำให้ขึ้นอยู่แล้ว — เผื่อผู้ใช้เลื่อนจอจนมองไม่เห็น field ที่ error — ข้อความ
      // เดียวกันกับทุกหน้า (ดู PLEASE_INPUT_DATA_MESSAGE) ไม่แยกบอกทีละ field อีกต่อไป
      this.toasts.show({
        message: PLEASE_INPUT_DATA_MESSAGE,
        type: 'warning',
      });
      return;
    }
    this.isLoginButtonDisabled.set(true);
  }
}
