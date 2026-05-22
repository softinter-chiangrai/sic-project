import { CommonModule } from '@angular/common';
import {
  Component,
  HostBinding,
  Input,
  OnInit,
  forwardRef,
  Injector,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { SicValidator } from '../../services/sic-validator';

@Component({
  selector: 'sic-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-checkbox.html',
  styleUrl: './sic-checkbox.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicCheckbox),
      multi: true,
    },
  ],
})
export class SicCheckbox implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() checkedValue: any = true;
  @Input() uncheckedValue: any = false;
  @Input() hint?: string;
  @Input() errorMessages: Record<string, string> = {};

  @HostBinding('class.sic-checkbox-host') readonly hostClass = true;

  get checked(): boolean {
    return this.value == this.checkedValue;
  }

  touched = false;
  value: any = null;

  private onChange: (value: any) => void = () => {};
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

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckboxChange(): void {
    const newChecked = !this.checked;
    this.value = newChecked ? this.checkedValue : this.uncheckedValue;
    this.onChange(this.value);
    this.markTouched();
  }

  onBlur(): void {
    this.markTouched();
  }

  private markTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }
}
