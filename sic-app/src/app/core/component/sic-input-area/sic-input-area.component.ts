import { CommonModule } from '@angular/common';
import {
  Component,
  HostBinding,
  Injector,
  Input,
  OnInit,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { SicValidator } from '../../validator/sic.validator';

@Component({
  selector: 'sic-input-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input-area.component.html',
  styleUrl: './sic-input-area.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputAreaComponent),
      multi: true,
    },
  ],
})
export class SicInputAreaComponent implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() name?: string;
  @Input() placeholder = '';
  @Input() hint?: string;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() rows = 4;
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() errorMessages: Record<string, string> = {};

  @HostBinding('class.sic-input-area-host') readonly hostClass = true;

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
    return !!this.control?.invalid && (!!this.control?.touched || this.touched || !!this.control?.dirty);
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
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.touched = true;
    this.onTouched();
  }
}
