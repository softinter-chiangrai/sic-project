import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-input-number',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input-number.component.html',
  styleUrl: './sic-input-number.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputNumberComponent),
      multi: true,
    },
  ],
})
export class SicInputNumberComponent extends SicFormControlBase<number | null> {
  @Input() name?: string;
  @Input() placeholder = '';
  @Input() min?: number;
  @Input() max?: number;
  @Input() step = 1;
  @Input() prefix = '';
  @Input() suffix = '';

  @HostBinding('class.sic-input-number-host') readonly hostClass = true;

  override value: number | null = null;

  override writeValue(value: number | null | undefined): void {
    this.value = value ?? null;
  }

  handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const nextValue = raw === '' ? null : Number(raw);
    this.value = nextValue;
    this.onChange(nextValue);
  }

  adjust(delta: number): void {
    if (this.disabled || this.readonly) {
      return;
    }

    const base = this.value ?? 0;
    let next = base + delta * this.step;

    if (this.min !== undefined) {
      next = Math.max(this.min, next);
    }
    if (this.max !== undefined) {
      next = Math.min(this.max, next);
    }

    this.value = next;
    this.onChange(next);
  }

  handleBlur(): void {
    this.markTouched();
  }
}
