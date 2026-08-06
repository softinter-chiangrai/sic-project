import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

export type SicRangeValue = number | [number, number];

@Component({
  selector: 'sic-range',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-range.component.html',
  styleUrl: './sic-range.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicRangeComponent),
      multi: true,
    },
  ],
})
export class SicRangeComponent extends SicFormControlBase<SicRangeValue> {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() dual = false;

  @HostBinding('class.sic-range-host') readonly hostClass = true;

  override value: SicRangeValue = 0;

  get low(): number {
    return Array.isArray(this.value) ? this.value[0] : this.value;
  }

  get high(): number {
    return Array.isArray(this.value) ? this.value[1] : this.value;
  }

  override writeValue(value: SicRangeValue | null | undefined): void {
    this.value = value ?? (this.dual ? [this.min, this.max] : this.min);
  }

  handleLowChange(event: Event): void {
    const next = Number((event.target as HTMLInputElement).value);
    this.value = this.dual ? [next, this.high] : next;
    this.onChange(this.value);
  }

  handleHighChange(event: Event): void {
    const next = Number((event.target as HTMLInputElement).value);
    this.value = [this.low, next];
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.markTouched();
  }
}
