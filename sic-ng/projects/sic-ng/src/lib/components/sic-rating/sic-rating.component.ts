import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-rating.component.html',
  styleUrl: './sic-rating.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicRatingComponent),
      multi: true,
    },
  ],
})
export class SicRatingComponent extends SicFormControlBase<number> {
  @Input() max = 5;
  @Input() allowHalf = false;

  @HostBinding('class.sic-rating-host') readonly hostClass = true;

  override value = 0;
  hovered: number | null = null;

  get stars(): number[] {
    return Array.from({ length: this.max }, (_, i) => i + 1);
  }

  displayValue(star: number): 'full' | 'half' | 'empty' {
    const active = this.hovered ?? this.value;

    if (active >= star) {
      return 'full';
    }
    if (this.allowHalf && active >= star - 0.5) {
      return 'half';
    }
    return 'empty';
  }

  setValue(star: number, event: MouseEvent): void {
    if (this.disabled || this.readonly) {
      return;
    }

    if (this.allowHalf) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const isHalf = event.clientX - rect.left < rect.width / 2;
      this.value = isHalf ? star - 0.5 : star;
    } else {
      this.value = star;
    }

    this.onChange(this.value);
    this.markTouched();
  }

  setHover(star: number | null): void {
    if (!this.disabled && !this.readonly) {
      this.hovered = star;
    }
  }
}
