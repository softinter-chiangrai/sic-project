import { Directive, HostBinding, Injector, Input, OnInit, inject } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SicValidator } from '../validator/sic.validator';

export type SicSize = 'sm' | 'md' | 'lg';

/**
 * Shared ControlValueAccessor plumbing for every sic-ng form control.
 * Mirrors the CVA shape used across sic-app/src/app/core/component (NgControl
 * pulled via Injector in ngOnInit, error state resolved through SicValidator).
 */
@Directive()
export abstract class SicFormControlBase<T> implements ControlValueAccessor, OnInit {
  @Input() size: SicSize = 'md';
  @Input() label?: string;
  @Input() hint?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() errorMessages: Record<string, string> = {};

  @HostBinding('class.sic-size-sm') get isSm(): boolean {
    return this.size === 'sm';
  }
  @HostBinding('class.sic-size-lg') get isLg(): boolean {
    return this.size === 'lg';
  }
  @HostBinding('class.sic-disabled') get isDisabledHost(): boolean {
    return this.disabled;
  }

  abstract value: T;
  touched = false;

  protected readonly injector = inject(Injector);
  protected readonly validator = inject(SicValidator);

  private ngControl: NgControl | null = null;
  protected onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get control() {
    return this.validator.getControl(this.ngControl);
  }

  get showError(): boolean {
    return this.validator.shouldShowError(this.control, this.touched);
  }

  get errorMessage(): string | null {
    return this.validator.getErrorMessage(this.control, this.errorMessages);
  }

  get isRequired(): boolean {
    return this.validator.isRequired(this.control);
  }

  writeValue(value: T): void {
    this.value = value;
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  markTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }
}
