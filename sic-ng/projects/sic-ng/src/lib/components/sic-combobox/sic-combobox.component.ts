import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

export type SicComboboxValue<T> = T | T[] | null;

@Component({
  selector: 'sic-combobox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-combobox.component.html',
  styleUrl: './sic-combobox.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicComboboxComponent),
      multi: true,
    },
  ],
})
export class SicComboboxComponent<T = unknown> extends SicFormControlBase<SicComboboxValue<T>> {
  @Input() options: T[] = [];
  @Input() optionLabel: keyof T | ((option: T) => string) = ((o: T) => String(o)) as any;
  @Input() optionValue: keyof T | ((option: T) => unknown) = ((o: T) => o) as any;
  @Input() placeholder = 'Select…';
  @Input() multi = false;
  @Input() searchable = true;

  @Output() search = new EventEmitter<string>();

  @HostBinding('class.sic-combobox-host') readonly hostClass = true;

  override value: SicComboboxValue<T> = null;
  open = false;
  query = '';

  constructor(private readonly host: ElementRef<HTMLElement>) {
    super();
  }

  get filteredOptions(): T[] {
    if (!this.query) {
      return this.options;
    }

    const q = this.query.toLowerCase();
    return this.options.filter((option) => this.labelFor(option).toLowerCase().includes(q));
  }

  get selectedLabel(): string {
    if (this.multi && Array.isArray(this.value)) {
      return this.value.map((v) => this.labelFor(v)).join(', ');
    }

    return this.value ? this.labelFor(this.value as T) : '';
  }

  labelFor(option: T): string {
    return typeof this.optionLabel === 'function'
      ? this.optionLabel(option)
      : String(option[this.optionLabel]);
  }

  valueFor(option: T): unknown {
    return typeof this.optionValue === 'function'
      ? this.optionValue(option)
      : option[this.optionValue];
  }

  isSelected(option: T): boolean {
    if (this.multi && Array.isArray(this.value)) {
      return this.value.some((v) => this.valueFor(v) === this.valueFor(option));
    }

    return this.value != null && this.valueFor(this.value as T) === this.valueFor(option);
  }

  toggleOpen(): void {
    if (this.disabled) {
      return;
    }

    this.open = !this.open;
  }

  selectOption(option: T): void {
    if (this.multi) {
      const current = Array.isArray(this.value) ? [...this.value] : [];
      const idx = current.findIndex((v) => this.valueFor(v) === this.valueFor(option));

      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(option);
      }

      this.value = current;
    } else {
      this.value = option;
      this.open = false;
    }

    this.onChange(this.value);
    this.markTouched();
  }

  handleQuery(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.search.emit(this.query);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) {
      this.open = false;
      this.markTouched();
    }
  }
}
