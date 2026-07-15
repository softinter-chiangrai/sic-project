import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-timepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-timepicker.component.html',
  styleUrl: './sic-timepicker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicTimepickerComponent),
      multi: true,
    },
  ],
})
export class SicTimepickerComponent extends SicFormControlBase<string> {
  @Input() min?: string;
  @Input() max?: string;
  @Input() step?: number;

  @HostBinding('class.sic-timepicker-host') readonly hostClass = true;

  override value = '';

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
  }

  handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.markTouched();
  }
}
