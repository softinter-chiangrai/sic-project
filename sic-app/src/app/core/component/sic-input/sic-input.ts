import { CommonModule } from '@angular/common';
import {
  Component,
  HostBinding,
  Injector,
  Input,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { SicValidator } from '../../services/sic-validator';

@Component({
  selector: 'sic-input',
  standalone: true,
  imports: [CommonModule, NgxMaskDirective],
  templateUrl: './sic-input.html',
  styleUrl: './sic-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInput),
      multi: true,
    },
  ],
})
export class SicInput implements ControlValueAccessor {
  @Input() label?: string;
  @Input() name?: string;
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' = 'text';
  @Input() autocomplete?: string;
  @Input() hint?: string;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() inputMode?: 'text' | 'email' | 'search' | 'tel' | 'url' | 'numeric' | 'decimal';
  @Input() mask?: string | null;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() thousandSeparator = ',';
  @Input() dropSpecialCharacters: boolean | string[] = true;
  @Input() clearIfNotMatch: boolean | null = null;
  @Input() showMaskTyped: boolean | null = null;
  @Input() validation: boolean | null = null;
  @Input() errorMessages: Record<string, string> = {};

  @HostBinding('class.sic-input-host') readonly hostClass = true;

  value = '';
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

  writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
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

  handleInput(event: Event): void {
    const nextValue = (event.target as HTMLInputElement).value;
    this.value = nextValue;
    this.onChange(nextValue);
  }

  handleBlur(): void {
    this.touched = true;
    this.onTouched();
  }
}
