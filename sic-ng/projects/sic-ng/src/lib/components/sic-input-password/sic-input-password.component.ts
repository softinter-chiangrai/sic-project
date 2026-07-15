import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-input-password',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input-password.component.html',
  styleUrl: './sic-input-password.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputPasswordComponent),
      multi: true,
    },
  ],
})
export class SicInputPasswordComponent extends SicFormControlBase<string> {
  @Input() name?: string;
  @Input() placeholder = '';
  @Input() autocomplete = 'current-password';

  @HostBinding('class.sic-input-password-host') readonly hostClass = true;

  override value = '';
  revealed = false;

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
  }

  toggleReveal(): void {
    this.revealed = !this.revealed;
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
