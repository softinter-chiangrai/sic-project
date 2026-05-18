import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  forwardRef,
  inject,
  Injector,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SicValidator } from '../../services/sic-validator';

export type SicRadioOptionValue = string | number | boolean | null;

export interface SicRadioOption {
  value: SicRadioOptionValue;
  text: string;
  disabled?: boolean;
  [key: string]: unknown;
}

interface SicRadioApiResponse<TItem> {
  data?: TItem[];
}

let sicRadioGroupId = 0;

function nextSicRadioGroupName(): string {
  sicRadioGroupId += 1;
  return `sic-radio-${sicRadioGroupId}`;
}

@Component({
  selector: 'sic-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-radio.html',
  styleUrl: './sic-radio.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicRadio),
      multi: true,
    },
  ],
})
export class SicRadio implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  @Input() label?: string;
  @Input() options: SicRadioOption[] = [];
  @Input() apiUrl = '';
  @Input() params: Record<string, unknown> = {};
  @Input() valueField = 'value';
  @Input() textField = 'text';
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';
  @Input() alignment: 'left' | 'center' | 'right' = 'left';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() hint?: string;
  @Input() emptyText = 'No data found';
  @Input() errorMessages: Record<string, string> = {};
  @Input() name = nextSicRadioGroupName();

  @HostBinding('class.sic-radio-host') readonly hostClass = true;

  value: SicRadioOptionValue = null;
  touched = false;
  loading = false;
  resolvedOptions: SicRadioOption[] = [];

  private onChange: (value: SicRadioOptionValue) => void = () => {};
  private onTouched: () => void = () => {};
  private ngControl: NgControl | null = null;
  private readonly http = inject(HttpClient, { optional: true });
  private readonly translate = inject(TranslateService, { optional: true });
  private loadSubscription: Subscription | null = null;
  private languageChangeSubscription: Subscription | null = null;
  private updateOptionsHandle: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly injector: Injector,
    private readonly validator: SicValidator,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.languageChangeSubscription = this.translate?.onLangChange.subscribe(() => {
      this.refreshOptions();
    }) ?? null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['options'] ||
      changes['apiUrl'] ||
      changes['params'] ||
      changes['textField'] ||
      changes['valueField']
    ) {
      this.refreshOptions();
    }
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    this.languageChangeSubscription?.unsubscribe();
    if (this.updateOptionsHandle) {
      clearTimeout(this.updateOptionsHandle);
    }
  }

  get control() {
    return this.validator.getControl(this.ngControl);
  }

  get showError(): boolean {
    return this.validator.shouldShowError(this.control, this.touched);
  }

  get errorMessage(): string | null {
    return this.validator.getErrorMessage(this.control, this.errorMessages);
  }

  get showEmptyState(): boolean {
    return !this.loading && this.resolvedOptions.length === 0;
  }

  get alignmentClass(): string {
    const alignmentMap: Record<'left' | 'center' | 'right', string> = {
      left: 'sic-radio__align-left',
      center: 'sic-radio__align-center',
      right: 'sic-radio__align-right',
    };
    return alignmentMap[this.alignment];
  }

  writeValue(value: SicRadioOptionValue): void {
    this.value = value;
  }

  registerOnChange(fn: (value: SicRadioOptionValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  isChecked(option: SicRadioOption): boolean {
    return this.value === option.value;
  }

  isOptionDisabled(option: SicRadioOption): boolean {
    return this.disabled || this.readonly || !!option.disabled;
  }

  selectOption(option: SicRadioOption): void {
    if (this.isOptionDisabled(option)) {
      return;
    }

    this.value = option.value;
    this.onChange(this.value);
    this.markTouched();
  }

  onBlur(): void {
    this.markTouched();
  }

  trackOption(index: number, option: SicRadioOption): SicRadioOptionValue | number {
    return option.value ?? index;
  }

  resolveOptionText(option: SicRadioOption): string {
    const localizedText = this.resolveLocalizedText(option);
    const configuredText =
      this.textField === 'messageEn' || this.textField === 'messageLocal'
        ? localizedText
        : option[this.textField];

    if (typeof configuredText === 'string' && configuredText.trim()) {
      return configuredText;
    }

    if (typeof option.text === 'string' && option.text.trim()) {
      return option.text;
    }

    if (typeof localizedText === 'string' && localizedText.trim()) {
      return localizedText;
    }

    return '';
  }

  private refreshOptions(): void {
    if (this.apiUrl) {
      this.loadRemoteOptions();
      return;
    }

    this.loadSubscription?.unsubscribe();
    this.scheduleOptionsUpdate({
      loading: false,
      options: this.options.map((option) => this.normalizeOption(option)),
    });
  }

  private loadRemoteOptions(): void {
    if (!this.http || !this.apiUrl) {
      this.resolvedOptions = [];
      this.loading = false;
      return;
    }

    this.loadSubscription?.unsubscribe();
    this.scheduleOptionsUpdate({
      loading: true,
      options: this.resolvedOptions,
    });

    this.loadSubscription = this.http.get<SicRadioOption[] | SicRadioApiResponse<SicRadioOption>>(this.apiUrl, {
      params: this.buildParams(),
    }).subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : (response.data ?? []);
        this.scheduleOptionsUpdate({
          loading: false,
          options: items.map((option) => this.normalizeOption(option)),
        });
      },
      error: () => {
        this.scheduleOptionsUpdate({
          loading: false,
          options: [],
        });
      },
    });
  }

  private buildParams(): HttpParams {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(this.params ?? {})) {
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
      ) {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }

  private normalizeOption(option: SicRadioOption): SicRadioOption {
    return {
      ...option,
      value: option[this.valueField] as SicRadioOptionValue ?? option.value ?? null,
      text: this.resolveOptionText(option),
      disabled: !!option.disabled,
    };
  }

  private scheduleOptionsUpdate(state: { loading: boolean; options: SicRadioOption[] }): void {
    if (this.updateOptionsHandle) {
      clearTimeout(this.updateOptionsHandle);
    }

    this.updateOptionsHandle = setTimeout(() => {
      this.loading = state.loading;
      this.resolvedOptions = state.options;
      this.updateOptionsHandle = null;
      this.cdr.markForCheck();
    }, 0);
  }

  private resolveLocalizedText(option: SicRadioOption): string | null {
    const currentLanguage = this.translate?.getCurrentLang() === 'th' ? 'th' : 'en';
    const preferredKey = currentLanguage === 'th' ? 'messageLocal' : 'messageEn';
    const fallbackKey = currentLanguage === 'th' ? 'messageEn' : 'messageLocal';
    const preferredText = option[preferredKey];
    const fallbackText = option[fallbackKey];

    if (typeof preferredText === 'string' && preferredText.trim()) {
      return preferredText;
    }

    if (typeof fallbackText === 'string' && fallbackText.trim()) {
      return fallbackText;
    }

    return null;
  }

  private markTouched(): void {
    if (this.touched) {
      return;
    }

    this.touched = true;
    this.onTouched();
  }
}
