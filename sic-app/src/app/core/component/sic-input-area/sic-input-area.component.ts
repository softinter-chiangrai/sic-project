import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

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
export class SicInputAreaComponent extends SicFormControlBase<string> {
  @Input() name?: string;
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() maxlength?: number;
  @Input() autoResize = false;

  @HostBinding('class.sic-input-area-host') readonly hostClass = true;

  override value = '';

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
  }

  handleInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.onChange(textarea.value);

    if (this.autoResize) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  handleBlur(): void {
    this.markTouched();
  }
}
