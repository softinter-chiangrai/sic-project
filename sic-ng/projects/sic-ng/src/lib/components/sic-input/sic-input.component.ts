import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

export type SicInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

@Component({
  selector: 'sic-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input.component.html',
  styleUrl: './sic-input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputComponent),
      multi: true,
    },
  ],
})
export class SicInputComponent extends SicFormControlBase<string> {
  @Input() name?: string;
  @Input() placeholder = '';
  @Input() type: SicInputType = 'text';
  @Input() autocomplete?: string;
  @Input() maxlength?: number;

  @HostBinding('class.sic-input-host') readonly hostClass = true;

  override value = '';

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
  }

  handleInput(event: Event): void {
    const nextValue = (event.target as HTMLInputElement).value;
    this.value = nextValue;
    this.onChange(nextValue);
  }

  handleBlur(): void {
    this.markTouched();
  }
}
