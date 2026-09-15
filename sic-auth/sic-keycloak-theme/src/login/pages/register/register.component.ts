import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type OnDestroy,
  type OnInit,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { USE_DEFAULT_CSS } from '@keycloakify/angular/lib/tokens/use-default-css';
import { ComponentReference } from '@keycloakify/angular/login/classes/component-reference';
import { LOGIN_CLASSES } from '@keycloakify/angular/login/tokens/classes';
import { LOGIN_I18N } from '@keycloakify/angular/login/tokens/i18n';
import { KC_LOGIN_CONTEXT } from '@keycloakify/angular/login/tokens/kc-context';
import { UserProfileFormService } from '@keycloakify/angular/login/services/user-profile-form';
import type { Attribute } from 'keycloakify/login/KcContext';
import type { ClassKey } from 'keycloakify/login/lib/kcClsx';
import { map } from 'rxjs';

import {
  SicInputComponent,
  SicInputPasswordComponent,
  SicInputAreaComponent,
  SicComboboxComponent,
  SicCheckboxComponent,
  SicButtonComponent,
  SicALinkComponent,
  SicFlexComponent,
  SicTextComponent,
  SicToastService,
} from 'sic-ng';

import { MainLayoutComponent } from '../../components/main-layout/main-layout.component';
import { PLEASE_INPUT_DATA_MESSAGE, buildDocumentTitle } from '../../constants';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

type FieldKind = 'hidden' | 'password' | 'textarea' | 'choice' | 'multichoice' | 'text';

interface FieldVM {
  attribute: Attribute;
  control: FormControl<string | string[]>;
  kind: FieldKind;
  options: string[];
  label: string;
  groupHeader: string | null;
  // คู่ field ที่ตั้งใจวางข้างกันครึ่งแถวเดียวกัน (password+password-confirm,
  // firstName+lastName) — ตั้งเฉพาะ field แรกของคู่ ส่วน field ที่สองจะถูก
  // skipInLoop ไม่ให้ @for ของ register.component.html วนแยกออกมาอีกรอบ
  pairWith?: FieldVM;
  skipInLoop?: boolean;
}

// ลำดับ field ที่อยากให้แสดงผล (username → email → password คู่กับ confirm →
// firstName คู่กับ lastName) — field อื่นที่ไม่อยู่ในนี้ (attribute เพิ่มเติมที่ตั้งค่า
// เองใน Keycloak Admin) จะถูกเรียงต่อท้ายตามลำดับเดิมจาก Keycloak
const FIELD_ORDER = ['username', 'email', 'password', 'password-confirm', 'firstName', 'lastName'];

// คู่ field ที่วางข้างกันครึ่งแถวเดียวกัน (ชื่อ field แรก → ชื่อ field ที่สอง)
const FIELD_PAIRS: [string, string][] = [
  ['username', 'email'],
  ['password', 'password-confirm'],
  ['firstName', 'lastName'],
];

function kindOf(attribute: Attribute): FieldKind {
  const inputType = attribute.annotations.inputType;
  if (inputType === 'hidden') return 'hidden';
  if (inputType === 'textarea') return 'textarea';
  if (inputType === 'select' || inputType === 'select-radiobuttons') return 'choice';
  if (inputType === 'multiselect' || inputType === 'multiselect-checkboxes') return 'multichoice';
  if (attribute.name === 'password' || attribute.name === 'password-confirm') return 'password';
  return 'text';
}

@Component({
  selector: 'kc-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet,
    SicInputComponent,
    SicInputPasswordComponent,
    SicInputAreaComponent,
    SicComboboxComponent,
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
      useExisting: forwardRef(() => RegisterComponent),
    },
  ],
})
export class RegisterComponent extends ComponentReference implements OnInit, OnDestroy {
  private readonly userProfileFormService = inject(UserProfileFormService);
  private readonly toasts = inject(SicToastService);
  kcContext = inject<Extract<KcContext, { pageId: 'register.ftl' }>>(KC_LOGIN_CONTEXT);
  i18n = inject<I18n>(LOGIN_I18N);

  override doUseDefaultCss = inject<boolean>(USE_DEFAULT_CSS);
  override classes = inject<Partial<Record<ClassKey, string>>>(LOGIN_CLASSES);

  displayMessage = !this.kcContext?.messagesPerField?.existsError('global');
  bodyClassName = 'kc-sic-custom-login';
  documentTitle = buildDocumentTitle(this.kcContext?.realm, this.i18n.msgStr('registerTitle'));

  // -------------------------------------------------------------------------
  // register.ftl มี field ที่ config เปลี่ยนได้จาก Keycloak Admin (User Profile) —
  // ต่างจาก login.ftl ที่ field คงที่ 2 ช่อง — เลยต้องสร้าง FormControl ทีละช่องแบบ
  // dynamic จาก kcContext.profile.attributes เอง แล้ว render ด้วย sic-ng component
  // จริง (sic-input/sic-input-password/sic-combobox/sic-checkbox ฯลฯ) ตาม field type
  // แทนที่จะพึ่ง UserProfileFormFieldsComponent เดิมของ Keycloakify ที่ render
  // <input>/<label> ดิบๆ — แต่ยังใช้ UserProfileFormService (ตัวเดียวกับที่
  // UserProfileFormFieldsComponent ใช้ข้างใน) เป็นแหล่งความจริงเรื่อง validation/
  // error message เพื่อไม่ต้อง reimplement กฎ validate ของ Keycloak เอง (password
  // policy, email format, ข้อความ error หลายภาษา ฯลฯ)
  // -------------------------------------------------------------------------
  readonly fields: FieldVM[] = this.buildFields();
  private readonly errorTexts = signal<Record<string, string>>({});

  isFormSubmittable = toSignal(this.userProfileFormService.formState$.pipe(map((s) => s.isFormSubmittable)), {
    initialValue: false,
  });
  areTermsAccepted = signal(false);

  private buildFields(): FieldVM[] {
    let lastGroupName: string | undefined;
    // kcContext.profile ไม่มี `.attributes` เป็น array ตรงๆ (มีแค่ `.attributesByName`
    // เป็น map ไม่เรียงลำดับ) — ลำดับ/filter ที่ถูกต้องคำนวณอยู่ใน reactless engine ของ
    // Keycloakify เท่านั้น ดึง snapshot แรกจาก formState$ (เป็น BehaviorSubject ข้างใน
    // จึง emit ค่าล่าสุดทันทีที่ subscribe แบบ synchronous)
    let initialAttributes: Attribute[] = [];
    this.userProfileFormService.formState$
      .subscribe((s) => (initialAttributes = s.formFieldStates.map((fs) => fs.attribute)))
      .unsubscribe();

    // เรียงลำดับ attribute ตาม FIELD_ORDER ก่อนสร้าง FieldVM — field ที่ไม่อยู่ใน
    // FIELD_ORDER (เช่น attribute เพิ่มเติมที่ตั้งเองใน Keycloak Admin) จะถูกเรียง
    // ต่อท้ายทั้งหมด โดยคง "ลำดับสัมพัทธ์" เดิมของ Keycloak ไว้ (Array.sort เป็น
    // stable sort ตาม spec ของ ES2019+)
    const orderedAttributes = [...initialAttributes].sort((a, b) => {
      const ai = FIELD_ORDER.indexOf(a.name);
      const bi = FIELD_ORDER.indexOf(b.name);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    const fields = orderedAttributes.map((attribute) => {
      const kind = kindOf(attribute);
      const initialValue = attribute.values ?? attribute.value ?? (kind === 'multichoice' ? [] : '');
      const control = new FormControl<string | string[]>(initialValue, { nonNullable: true });

      // dispatch ค่าใหม่เข้า reactless engine ของ Keycloakify ทุกครั้งที่ผู้ใช้พิมพ์ —
      // ให้ engine คำนวณ validation ที่ต้องรู้ค่าฟิลด์อื่นด้วย (เช่น
      // passwordConfirmMatchesPassword) ได้ถูกต้อง
      control.valueChanges.subscribe((value) => {
        this.userProfileFormService.dispatchFormAction({
          action: 'update',
          name: attribute.name,
          valueOrValues: value,
        });
      });

      const groupName = attribute.group?.name;
      const groupHeader =
        groupName && groupName !== lastGroupName ? (attribute.group?.displayHeader ?? groupName) : null;
      lastGroupName = groupName;

      return {
        attribute,
        control,
        kind,
        options: attribute.validators?.options?.options ?? [],
        label: this.i18n.advancedMsgStr(attribute.displayName ?? attribute.name) + (attribute.required ? ' *' : ''),
        groupHeader,
      };
    });

    // จับคู่ field ตาม FIELD_PAIRS ให้อยู่แถวเดียวกัน (แบ่งครึ่ง) — จับคู่ตามชื่อ
    // attribute โดยตรง ไม่สนตำแหน่งติดกันในลิสต์ (ต่างจาก field.groupHeader ที่อิง
    // ตำแหน่งจริง) เพราะ FIELD_ORDER ข้างบนรับประกันแล้วว่าทั้งคู่จะอยู่ติดกันเสมอ
    const byName = new Map(fields.map((f) => [f.attribute.name, f]));
    for (const [firstName, secondName] of FIELD_PAIRS) {
      const first = byName.get(firstName);
      const second = byName.get(secondName);
      if (first && second) {
        first.pairWith = second;
        second.skipInLoop = true;
      }
    }

    return fields;
  }

  errorMessagesFor(name: string): Record<string, string> {
    const text = this.errorTexts()[name];
    return text ? { kc: text } : {};
  }

  // reactless engine ของ Keycloakify ไม่โชว์ error ของ field จนกว่าจะรู้ว่า field
  // นั้น "เสีย focus ไปแล้วอย่างน้อยหนึ่งครั้ง" (hasLostFocusAtLeastOnce) — เหมือน
  // <input (blur)="onBlur()"> ของ kc-input-tag เดิม แต่ blur ไม่ bubble จึงต้องใช้
  // focusout (bubble ได้) ผูกไว้ที่ sic-ng component แทน
  onFieldBlur(name: string): void {
    this.userProfileFormService.dispatchFormAction({ action: 'focus lost', name, fieldIndex: undefined });
  }

  // ปุ่ม Register ไม่ disable ล่วงหน้าอีกต่อไป (ต่างจากเดิมที่ผูก [disabled] กับ
  // isFormSubmittable() ตรงๆ) — ปล่อยให้กดได้เสมอ แล้วค่อย validate ตอน submit จริง
  // เหมือนหน้า login/forgot-password/update-password ทุกหน้า: ถ้ายังไม่ผ่าน กัน native
  // submit ไว้ + แสดง toast ข้อความกลาง + dispatch "focus lost" ให้ทุก field เพื่อให้
  // กรอบแดง/ข้อความ error ใต้ field ที่ยังไม่ผ่านโชว์ขึ้นมาทันที (ปกติจะรอจนกว่า field
  // นั้นจะเสีย focus เองก่อน — ดู onFieldBlur ด้านบน)
  handleSubmit(event: SubmitEvent): void {
    const termsBlocking = !!this.kcContext?.termsAcceptanceRequired && !this.areTermsAccepted();
    if (!this.isFormSubmittable() || termsBlocking) {
      event.preventDefault();
      for (const field of this.fields) {
        this.userProfileFormService.dispatchFormAction({
          action: 'focus lost',
          name: field.attribute.name,
          fieldIndex: undefined,
        });
        if (field.pairWith) {
          this.userProfileFormService.dispatchFormAction({
            action: 'focus lost',
            name: field.pairWith.attribute.name,
            fieldIndex: undefined,
          });
        }
      }
      this.toasts.show({ message: PLEASE_INPUT_DATA_MESSAGE, type: 'warning' });
    }
  }

  ngOnInit(): void {
    // sync error/ความถูกต้องของแต่ละ field กลับจาก reactless engine → FormControl.errors
    // (ผ่าน setErrors เฉยๆ ไม่ผ่าน validator function — เพื่อไม่ให้ยิง valueChanges ซ้ำ
    // จนวนลูปกับ dispatch ด้านบน) ทุกครั้งที่ formState เปลี่ยน (ทุก keystroke ของทุกช่อง)
    this.userProfileFormService.formState$.subscribe((formState) => {
      const nextErrorTexts: Record<string, string> = {};
      for (const fieldState of formState.formFieldStates) {
        const control = this.fields.find((f) => f.attribute.name === fieldState.attribute.name)?.control;
        const hasError = fieldState.displayableErrors.length > 0;
        if (hasError) {
          nextErrorTexts[fieldState.attribute.name] = fieldState.displayableErrors[0].errorMessageStr;
        }
        control?.setErrors(hasError ? { kc: true } : null);
      }
      this.errorTexts.set(nextErrorTexts);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)['onSubmitRecaptcha'] = () => {
      // @ts-expect-error: from native code
      document.getElementById('kc-register-form').requestSubmit();
    };
  }

  ngOnDestroy(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any)['onSubmitRecaptcha'];
  }
}
