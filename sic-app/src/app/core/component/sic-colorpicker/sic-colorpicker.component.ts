import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-colorpicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-colorpicker.component.html',
  styleUrl: './sic-colorpicker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicColorpickerComponent),
      multi: true,
    },
  ],
})
export class SicColorpickerComponent extends SicFormControlBase<string> {
  @Input() allowText = true;

  @HostBinding('class.sic-colorpicker-host') readonly hostClass = true;

  override value = '#2563eb';

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '#000000';
  }

  handleColorInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  handleTextInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) {
      this.value = raw;
      this.onChange(this.value);
    }
  }

  handleBlur(): void {
    this.markTouched();
  }
}
