import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  HostBinding,
  Injector,
  Input,
  OnInit,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { SicNumberConfigService } from './sic-number.config';
import { SicValidator } from '../../services/sic-validator';

@Component({
  selector: 'sic-number',
  standalone: true,
  imports: [CommonModule, NgxMaskDirective],
  templateUrl: './sic-number.html',
  styleUrl: './sic-number.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicNumber),
      multi: true,
    },
  ],
})
export class SicNumber implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() hint?: string;
  @Input() required = false;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() decimal?: number;
  @Input() thousandSeparator = ',';
  @Input() allowNegativeNumbers = false;
  @Input() errorMessages: Record<string, string> = {};

  @HostBinding('class.sic-number-host') readonly hostClass = true;

  displayValue = '';
  touched = false;
  private modelValue: number | null = null;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private ngControl: NgControl | null = null;
  private readonly injector = inject(Injector);
  private readonly configService = inject(SicNumberConfigService);
  private readonly validator = inject(SicValidator);

  constructor() {
    effect(() => {
      this.configService.config();

      if (this.decimal === undefined) {
        this.displayValue = this.formatValue(this.modelValue);
      }
    });
  }

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

  get decimalPlaces(): number {
    return this.decimal ?? this.configService.config().decimal;
  }

  get maskExpression(): string {
    return `separator.${this.decimalPlaces}`;
  }

  writeValue(value: number | null | undefined): void {
    this.modelValue = value ?? null;
    this.displayValue = this.formatValue(this.modelValue);
  }

  registerOnChange(fn: (value: number | null) => void): void {
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
    this.displayValue = nextValue;
    this.modelValue = this.parseValue(nextValue);
    this.onChange(this.modelValue);
  }

  handleBlur(): void {
    this.touched = true;
    this.onTouched();
    this.modelValue = this.parseValue(this.displayValue);
    this.onChange(this.modelValue);
    this.displayValue = this.formatValue(this.modelValue);
  }

  private parseValue(value: string): number | null {
    const normalized = value
      .replaceAll(this.thousandSeparator, '')
      .trim();

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private formatValue(value: number | null): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '';
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: this.decimalPlaces,
      maximumFractionDigits: this.decimalPlaces,
    }).format(value);
  }
}
