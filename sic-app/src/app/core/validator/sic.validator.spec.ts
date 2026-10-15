import { FormControl, Validators } from '@angular/forms';
import { SicValidator } from './sic.validator';

describe('SicValidator', () => {
  const v = new SicValidator();

  describe('shouldShowError', () => {
    it('is false without a control or while the control is valid', () => {
      expect(v.shouldShowError(null, true)).toBe(false);
      expect(v.shouldShowError(new FormControl('ok', Validators.required), true)).toBe(false);
    });

    it('an invalid control stays quiet until the control itself is touched or dirty (submit = markAllAsTouched)', () => {
      const c = new FormControl('', Validators.required);
      expect(v.shouldShowError(c, false)).toBe(false);
      expect(v.shouldShowError(c, true)).toBe(false); // the picker's own flag alone does not count (2dd69c50)
      c.markAsTouched();
      expect(v.shouldShowError(c, false)).toBe(true);
      const d = new FormControl('', Validators.required);
      d.markAsDirty();
      expect(v.shouldShowError(d, false)).toBe(true);
    });
  });

  describe('isRequired', () => {
    it('detects Validators.required, also when combined with others', () => {
      expect(v.isRequired(new FormControl('', Validators.required))).toBe(true);
      expect(v.isRequired(new FormControl('', [Validators.required, Validators.minLength(3)]))).toBe(true);
    });
    it('is false for optional controls, no validator, and null', () => {
      expect(v.isRequired(new FormControl('', Validators.minLength(3)))).toBe(false);
      expect(v.isRequired(new FormControl(''))).toBe(false);
      expect(v.isRequired(null)).toBe(false);
    });
  });

  describe('resolveErrorMessage', () => {
    it('null errors give null', () => {
      expect(v.resolveErrorMessage(null)).toBeNull();
    });
    it('a custom message for the first error key wins over the default', () => {
      expect(v.resolveErrorMessage({ required: true }, { required: 'กรุณากรอก' })).toBe('กรุณากรอก');
    });
    it('built-in messages carry the limits', () => {
      expect(v.resolveErrorMessage({ minlength: { requiredLength: 3 } })).toBe('Minimum length is 3.');
      expect(v.resolveErrorMessage({ maxlength: { requiredLength: 9 } })).toBe('Maximum length is 9.');
      expect(v.resolveErrorMessage({ min: { min: 1 } })).toBe('Minimum value is 1.');
      expect(v.resolveErrorMessage({ max: { max: 5 } })).toBe('Maximum value is 5.');
      expect(v.resolveErrorMessage({ email: true })).toBe('Please enter a valid email address.');
      expect(v.resolveErrorMessage({ pattern: {} })).toBe('The format is invalid.');
      expect(v.resolveErrorMessage({ required: true })).toBe('This field is required.');
    });
    it('an unknown error key gets the generic message', () => {
      expect(v.resolveErrorMessage({ custom: true })).toBe('The value is invalid.');
    });
  });

  describe('getErrorMessage / getControl', () => {
    it('returns the message of a real control and null when it has no errors', () => {
      const c = new FormControl('', Validators.required);
      expect(v.getErrorMessage(c)).toBe('This field is required.');
      c.setValue('x');
      expect(v.getErrorMessage(c)).toBeNull();
      expect(v.getErrorMessage(null)).toBeNull();
    });
    it('getControl unwraps an NgControl', () => {
      const c = new FormControl('');
      expect(v.getControl({ control: c } as any)).toBe(c);
      expect(v.getControl(null)).toBeNull();
    });
  });
});
