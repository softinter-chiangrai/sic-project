import { getDefaultPageComponent, type KcPage } from '@keycloakify/angular/login';
import { UserProfileFormFieldsComponent } from '@keycloakify/angular/login/components/user-profile-form-fields';
import { TemplateComponent } from '@keycloakify/angular/login/template';
import type { ClassKey } from 'keycloakify/login';
import type { KcContext } from './KcContext';

export const classes = {} satisfies Partial<Record<ClassKey, string>>;
export const doUseDefaultCss = true;
export const doMakeUserConfirmPassword = true;

// pageId ที่มี PageComponent เป็น custom UI (sic-ng + MainLayoutComponent) แล้ว —
// import แบบ dynamic ทีละหน้าเพื่อไม่ให้ปุ่ม default page component ที่เหลือถูกรวม
// เข้ามาใน bundle โดยไม่จำเป็น
async function getCustomPageComponent(pageId: Extract<KcContext['pageId'], string>) {
  switch (pageId) {
    case 'login.ftl':
      return (await import('./pages/login/login.component')).LoginComponent;
    case 'register.ftl':
      return (await import('./pages/register/register.component')).RegisterComponent;
    case 'login-reset-password.ftl':
      return (await import('./pages/login-reset-password/login-reset-password.component')).LoginResetPasswordComponent;
    case 'login-update-password.ftl':
      return (await import('./pages/login-update-password/login-update-password.component'))
        .LoginUpdatePasswordComponent;
    case 'login-verify-email.ftl':
      return (await import('./pages/login-verify-email/login-verify-email.component')).LoginVerifyEmailComponent;
    case 'error.ftl':
      return (await import('./pages/error/error.component')).ErrorComponent;
    case 'info.ftl':
      return (await import('./pages/info/info.component')).InfoComponent;
    default:
      return getDefaultPageComponent(pageId as KcContext['pageId']);
  }
}

export async function getKcPage(pageId: KcContext['pageId']): Promise<KcPage> {
  switch (pageId) {
    case 'login.ftl':
    case 'register.ftl':
    case 'login-reset-password.ftl':
    case 'login-update-password.ftl':
    case 'login-verify-email.ftl':
    case 'error.ftl':
    case 'info.ftl':
      // ปิด default CSS ของ Keycloak เฉพาะหน้าที่ทำ custom UI ด้วย sic-ng แล้ว — ไม่งั้น
      // TemplateComponent (ตัวห่อกลาง ที่ครอบทุกหน้ารวมถึงหน้านี้) จะบังคับใช้ layout/
      // ความกว้างแบบ card แคบๆ ของ Keycloak เดิม ทับ full-viewport split-screen ที่
      // ออกแบบเอง (ดู MainLayoutComponent ที่ทุกหน้าด้านล่างใช้ร่วมกัน)
      return {
        PageComponent: await getCustomPageComponent(pageId),
        TemplateComponent,
        UserProfileFormFieldsComponent,
        doMakeUserConfirmPassword,
        doUseDefaultCss: false,
        classes,
      };
    default:
      return {
        PageComponent: await getDefaultPageComponent(pageId),
        TemplateComponent,
        UserProfileFormFieldsComponent,
        doMakeUserConfirmPassword,
        doUseDefaultCss,
        classes,
      };
  }
}
