import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-checkbox.component.html',
  styleUrl: './sic-checkbox.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicCheckboxComponent),
      multi: true,
    },
  ],
})
export class SicCheckboxComponent extends SicFormControlBase<unknown> {
  @Input() checkedValue: unknown = true;
  @Input() uncheckedValue: unknown = false;

  @HostBinding('class.sic-checkbox-host') readonly hostClass = true;

  override value: unknown = false;

  get checked(): boolean {
    return this.value === this.checkedValue;
  }

  onCheckboxChange(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    this.value = this.checked ? this.uncheckedValue : this.checkedValue;
    this.onChange(this.value);
    this.markTouched();
  }
}
