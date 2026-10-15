import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

type FormLike = AbstractControl | { form: AbstractControl };

const asControl = (f: FormLike): AbstractControl => ('form' in f && !(f instanceof AbstractControl) ? f.form : (f as AbstractControl));

/** leaf controls that are invalid, as [formControlName, control] */
function invalidLeaves(c: AbstractControl, name = ''): [string, AbstractControl][] {
  if (c instanceof FormGroup || c instanceof FormArray) {
    return Object.entries(c.controls).flatMap(([k, child]) => invalidLeaves(child, k));
  }
  return c.invalid ? [[name, c]] : [];
}

/** the label the user sees next to the field: sic-* components render it in "*__label", plain inputs in a nearby <label> */
function labelOnScreen(name: string): { text: string | null; el: Element | null } {
  const els = Array.from(document.querySelectorAll(`[formcontrolname="${name}"]`));
  const el = els.find((e) => (e as HTMLElement).offsetParent !== null) ?? els[0] ?? null;
  if (!el) return { text: null, el: null };
  const own = el.querySelector('[class$="__label"], [class*="__label "]');
  const near = own ?? (el.id ? document.querySelector(`label[for="${el.id}"]`) : null) ?? el.closest('label') ?? el.parentElement?.querySelector('label');
  const text = near?.textContent?.replace(/\*/g, '').replace(/\s+/g, ' ').trim() || el.getAttribute('placeholder') || null;
  return { text, el };
}

/**
 * The form's own "please check the form" message plus the names of the fields that still need a value, e.g.
 * "กรุณากรอกข้อมูลให้ครบ\n• ชื่อโครงการ\n• วันที่เริ่มต้น". Also marks every field touched (so each shows its red error)
 * and scrolls to the first one. Fields that are not on screen (e.g. the project picked in the top bar) use FIELD_<NAME> from i18n.
 */
export function withInvalidFields(message: string, form: FormLike, translate: TranslateService): string {
  const control = asControl(form);
  control.markAllAsTouched();
  const labels: string[] = [];
  let first: Element | null = null;
  for (const [name] of invalidLeaves(control)) {
    const { text, el } = labelOnScreen(name);
    first ??= el;
    const key = 'FIELD_' + name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
    const fallback = translate.instant(key);
    labels.push(text ?? (fallback !== key ? fallback : name));
  }
  (first as HTMLElement | null)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  const unique = [...new Set(labels)];
  return unique.length ? `${message}\n• ${unique.join('\n• ')}` : message;
}
