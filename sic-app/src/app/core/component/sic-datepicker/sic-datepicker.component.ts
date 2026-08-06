import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

function toInputValue(value: Date | string | null): string {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

@Component({
  selector: 'sic-datepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-datepicker.component.html',
  styleUrl: './sic-datepicker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicDatepickerComponent),
      multi: true,
    },
  ],
})
export class SicDatepickerComponent extends SicFormControlBase<Date | string | null> {
  @Input() min?: string;
  @Input() max?: string;
  @Input() outputType: 'date' | 'string' = 'string';

  @HostBinding('class.sic-datepicker-host') readonly hostClass = true;

  override value: Date | string | null = null;

  get inputValue(): string {
    return toInputValue(this.value);
  }

  override writeValue(value: Date | string | null | undefined): void {
    this.value = value ?? null;
  }

  handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.value = this.outputType === 'date' && raw ? new Date(raw) : raw;
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.markTouched();
  }
}
