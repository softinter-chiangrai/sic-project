import { CommonModule } from '@angular/common';
import { Component, HostBinding, Injector, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { SicValidator } from '../../services/sic-validator';

@Component({
  selector: 'sic-input-phone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input-phone.html',
  styleUrl: './sic-input-phone.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputPhone),
      multi: true,
    },
  ],
})
export class SicInputPhone implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint?: string;
  @Input() error = '';
  @Input() errorMessages: Record<string, string> = {};
  @Input() placeholderLeft = '+00';
  @Input() placeholderRight = '0000000000';

  @HostBinding('class.sic-input-phone-host') readonly hostClass = true;

  left = '';
  right = '';
  disabled = false;
  touched = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private ngControl: NgControl | null = null;

  constructor(
    private readonly injector: Injector,
    private readonly validator: SicValidator,
  ) {}

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
    if (this.error) {
      return this.error;
    }

    return this.validator.getErrorMessage(this.control, this.errorMessages);
  }

  get isRequired(): boolean {
    if (!this.control?.validator) {
      return false;
    }
    // Check if the validator returns a 'required' error by testing with null value
    const testControl = { value: null } as any;
    const errorMap = this.control.validator(testControl);
    return !!errorMap?.['required'];
  }

  writeValue(value: string | null): void {
    if (!value) {
      this.left = '';
      this.right = '';
      return;
    }

    const [left, right] = value.split('-');
    this.left = left || '';
    this.right = right || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onLeftKeyPress(event: KeyboardEvent): void {
    const char = event.key;

    if (char === '+' && (this.left.length > 0 || this.left.includes('+'))) {
      event.preventDefault();
      return;
    }

    if (!/\d/.test(char) && char !== '+') {
      event.preventDefault();
    }
  }

  onLeftInput(event: Event): void {
    let input = (event.target as HTMLInputElement).value;

    input = input.replaceAll(/[^\d+]/g, '');
    if (input.startsWith('+')) {
      input = '+' + input.slice(1).replaceAll(/[^\d]/g, '');
    } else {
      input = input.replaceAll(/[^\d]/g, '');
    }

    this.left = input.slice(0, 3);
    this.emitValue();
  }

  onRightInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value.replaceAll(/\D/g, '');
    this.right = input;
    this.emitValue();
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  private emitValue(): void {
    const value = this.left && this.right ? `${this.left}-${this.right}` : '';
    this.onChange(value);
  }
}
