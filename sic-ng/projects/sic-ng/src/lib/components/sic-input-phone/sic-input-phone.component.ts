import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

export interface SicPhoneCountry {
  code: string;
  dialCode: string;
  label: string;
}

export const SIC_DEFAULT_PHONE_COUNTRIES: SicPhoneCountry[] = [
  { code: 'TH', dialCode: '+66', label: 'TH +66' },
  { code: 'US', dialCode: '+1', label: 'US +1' },
  { code: 'GB', dialCode: '+44', label: 'GB +44' },
  { code: 'SG', dialCode: '+65', label: 'SG +65' },
];

@Component({
  selector: 'sic-input-phone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input-phone.component.html',
  styleUrl: './sic-input-phone.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputPhoneComponent),
      multi: true,
    },
  ],
})
export class SicInputPhoneComponent extends SicFormControlBase<string> {
  @Input() name?: string;
  @Input() placeholder = '';
  @Input() countries: SicPhoneCountry[] = SIC_DEFAULT_PHONE_COUNTRIES;

  @HostBinding('class.sic-input-phone-host') readonly hostClass = true;

  override value = '';
  dialCode = this.countries[0]?.dialCode ?? '';

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
  }

  handleDialCodeChange(event: Event): void {
    this.dialCode = (event.target as HTMLSelectElement).value;
    this.emit();
  }

  handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.emit();
  }

  handleBlur(): void {
    this.markTouched();
  }

  private emit(): void {
    this.onChange(`${this.dialCode} ${this.value}`.trim());
  }
}
