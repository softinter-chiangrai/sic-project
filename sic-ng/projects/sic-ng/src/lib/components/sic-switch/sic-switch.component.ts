import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-switch.component.html',
  styleUrl: './sic-switch.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicSwitchComponent),
      multi: true,
    },
  ],
})
export class SicSwitchComponent extends SicFormControlBase<boolean> {
  @Input() checkedValue: unknown = true;
  @Input() uncheckedValue: unknown = false;

  @HostBinding('class.sic-switch-host') readonly hostClass = true;

  override value = false;

  get checked(): boolean {
    return this.value === this.checkedValue;
  }

  onToggle(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    this.value = (this.checked ? this.uncheckedValue : this.checkedValue) as boolean;
    this.onChange(this.value);
    this.markTouched();
  }
}
