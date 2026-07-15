import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-radio.component.html',
  styleUrl: './sic-radio.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicRadioComponent),
      multi: true,
    },
  ],
})
export class SicRadioComponent extends SicFormControlBase<unknown> {
  @Input() name = `sic-radio-${Math.random().toString(36).slice(2)}`;
  @Input() radioValue: unknown;

  @HostBinding('class.sic-radio-host') readonly hostClass = true;

  override value: unknown = null;

  get checked(): boolean {
    return this.value === this.radioValue;
  }

  onRadioChange(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    this.value = this.radioValue;
    this.onChange(this.value);
    this.markTouched();
  }
}
