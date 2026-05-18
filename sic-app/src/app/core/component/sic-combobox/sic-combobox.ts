import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SicValidator } from '../../services/sic-validator';

interface ComboboxPagingResponse<TItem> {
  data?: TItem[];
  pageable?: {
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
  };
}

@Directive({
  selector: 'ng-template[sicComboboxOption]',
  standalone: true,
})
export class SicComboboxOptionTemplate {
  constructor(readonly template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'sic-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-combobox.html',
  styleUrl: './sic-combobox.css',
  host: {
    ngSkipHydration: 'true',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicCombobox),
      multi: true,
    },
  ],
})
export class SicCombobox implements ControlValueAccessor, AfterContentInit, AfterViewInit, OnDestroy {
  @Input() label?: string;
  @Input({ required: true }) apiUrl = '';
  @Input() params: Record<string, any> = {};
  @Input() paging = true;
  @Input() pageSize = 10;
  @Input() pageNumberParam = 'pageNumber';
  @Input() pageSizeParam = 'pageSize';
  @Input() keywordParam = 'keyword';
  @Input() placeholder = 'Select option';
  @Input() emptyText = 'No data found';
  @Input() valueField = 'value';
  @Input() textField = 'text';
  @Input() disabled = false;
  @Input() required = false;
  @Input() readonly = false;
  @Input() clearable = true;
  @Input() hint?: string;
  @Input() errorMessages: Record<string, string> = {};

  @Output() selectionChanged = new EventEmitter<any>();

  @HostBinding('class.sic-combobox-host') readonly hostClass = true;

  @ContentChild(SicComboboxOptionTemplate) optionTemplate?: SicComboboxOptionTemplate;
  @ViewChild('fieldInput') fieldInput?: ElementRef<HTMLInputElement>;
  @ViewChild('fieldContainer') fieldContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('dropdownPanel') dropdownPanel?: ElementRef<HTMLDivElement>;
  @ViewChild('optionsPanel') optionsPanel?: ElementRef<HTMLDivElement>;

  ready = false;
  opened = false;
  loading = false;
  hasProjectedTemplate = false;

  inputText = '';
  selectedText = '';
  selectedItem: unknown = null;
  value: any = null;
  options: any[] = [];
  activeIndex = -1;
  pageNumber = 1;
  totalPages = 1;
  totalElements = 0;
  touched = false;
  dropdownPanelStyle: Record<string, string> = {};

  private searchTerm = '';
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private ngControl: NgControl | null = null;
  private searchDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private loadSubscription: Subscription | null = null;
  private closeDropdownHandle: ReturnType<typeof setTimeout> | null = null;
  private readyHandle: ReturnType<typeof setTimeout> | null = null;
  private positionDropdownHandle: ReturnType<typeof setTimeout> | null = null;
  private languageChangeSubscription: Subscription | null = null;

  constructor(
    private readonly injector: Injector,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly translate: TranslateService,
    private readonly validator: SicValidator,
  ) {}

  ngAfterContentInit(): void {
    this.hasProjectedTemplate = !!this.optionTemplate;
  }

  ngAfterViewInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.readyHandle = setTimeout(() => {
      this.ready = true;
      this.readyHandle = null;
    }, 0);

    this.languageChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.handleLanguageChange();
    });
  }

  ngOnDestroy(): void {
    if (this.readyHandle) {
      clearTimeout(this.readyHandle);
    }
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }
    if (this.closeDropdownHandle) {
      clearTimeout(this.closeDropdownHandle);
    }
    if (this.positionDropdownHandle) {
      clearTimeout(this.positionDropdownHandle);
    }
    this.languageChangeSubscription?.unsubscribe();
    this.loadSubscription?.unsubscribe();
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

  get showLoadingState(): boolean {
    return this.loading && this.options.length === 0;
  }

  get showEmptyState(): boolean {
    return !this.loading && this.options.length === 0;
  }

  get canLoadMore(): boolean {
    return this.paging && !this.loading && this.pageNumber < this.totalPages;
  }

  writeValue(value: any): void {
    const normalizedValue = this.normalizeControlValue(value);
    this.value = normalizedValue;

    if (normalizedValue === null) {
      this.selectedItem = null;
      this.selectedText = '';
      this.inputText = '';
      this.activeIndex = -1;
      return;
    }

    if (normalizedValue && typeof normalizedValue === 'object' && !Array.isArray(normalizedValue)) {
      this.selectedItem = normalizedValue;
      this.selectedText = this.resolveLabel(normalizedValue);
      this.inputText = this.selectedText;
      this.value = this.resolveValue(normalizedValue);
      return;
    }

    const matched = this.options.find((item) => this.resolveValue(item) === normalizedValue);
    if (matched) {
      this.selectedItem = matched;
      this.selectedText = this.resolveLabel(matched);
      this.inputText = this.selectedText;
    } else {
      // Value not found in current options, fetch it
      setTimeout(() => this.loadValueById(normalizedValue), 0);
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openDropdown(): void {
    if (!this.ready || this.disabled || this.readonly || this.opened) {
      return;
    }

    this.opened = true;
    this.dropdownPanelStyle = {};
    this.pageNumber = 1;
    this.searchTerm = (this.selectedItem && this.inputText === this.selectedText)
      ? ''
      : this.inputText.trim();
    this.loadOptions(true);
    this.scheduleDropdownPositionUpdate();
  }

  closeDropdown(): void {
    if (this.closeDropdownHandle) {
      clearTimeout(this.closeDropdownHandle);
      this.closeDropdownHandle = null;
    }

    this.closeDropdownHandle = setTimeout(() => {
      this.clearSearchDebounce();
      this.cancelPendingLoad();
      this.opened = false;
      this.loading = false;
      this.activeIndex = -1;
      this.inputText = this.selectedText;
      this.searchTerm = '';
      this.dropdownPanelStyle = {};
      this.closeDropdownHandle = null;
      this.cdr.markForCheck();
    }, 0);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.opened) {
      this.scheduleDropdownPositionUpdate();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.onWindowResize();
  }

  onFieldFocus(): void {
    this.openDropdown();
  }

  onFieldClick(): void {
    this.openDropdown();
  }

  onFieldBlur(): void {
    this.markTouched();
  }

  onFocusOut(event: FocusEvent): void {
    const target = event.relatedTarget as HTMLElement | null;
    if (!target || !this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  onFieldInput(term: string): void {
    if (this.disabled || this.readonly) {
      return;
    }

    this.inputText = term;
    this.searchTerm = term.trim();
    this.pageNumber = 1;
    this.options = [];
    this.totalElements = 0;
    this.totalPages = 1;
    this.activeIndex = -1;
    this.opened = true;
    this.loading = true;
    this.cancelPendingLoad();
    this.scheduleSearchLoad();
  }

  onBackdropClick(): void {
    this.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.opened) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target || !this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.opened || event.key !== 'Tab') {
      return;
    }

    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement | null;
      if (!activeElement || !this.elementRef.nativeElement.contains(activeElement)) {
        this.closeDropdown();
      }
    }, 0);
  }

  onOptionsScroll(event: Event): void {
    if (!this.canLoadMore || this.loading) {
      return;
    }

    const target = event.target as HTMLElement;
    const threshold = 80;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - threshold) {
      this.loadMore();
    }
  }

  handleFieldKeydown(event: KeyboardEvent): void {
    if (this.disabled || this.readonly) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this.opened) {
        this.openDropdown();
        return;
      }
      this.moveActive(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.opened) {
        this.openDropdown();
        return;
      }
      this.moveActive(-1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.opened && this.activeIndex >= 0 && this.activeIndex < this.options.length) {
        this.selectOption(this.options[this.activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDropdown();
    }
  }

  loadMore(): void {
    if (!this.canLoadMore) {
      return;
    }

    this.pageNumber += 1;
    this.loadOptions(false);
  }

  selectOption(item: any): void {
    if (this.disabled || this.readonly) {
      return;
    }

    this.selectedItem = item;
    this.selectedText = this.resolveLabel(item);
    this.inputText = this.selectedText;
    this.value = this.resolveValue(item);
    this.onChange(this.value);
    this.selectionChanged.emit(item);
    this.markTouched();

    if (this.closeDropdownHandle) {
      clearTimeout(this.closeDropdownHandle);
      this.closeDropdownHandle = null;
    }

    this.opened = false;
    this.clearSearchDebounce();
    this.cancelPendingLoad();

    this.closeDropdownHandle = setTimeout(() => {
      this.loading = false;
      this.activeIndex = -1;
      this.searchTerm = '';
      this.closeDropdownHandle = null;
      this.cdr.markForCheck();
    }, 0);
  }

  clearSelection(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.selectedItem = null;
    this.selectedText = '';
    this.inputText = '';
    this.searchTerm = '';
    this.value = null;
    this.activeIndex = -1;
    this.onChange(null);
    this.selectionChanged.emit(null);
    this.markTouched();
  }

  toggleFromIcon(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.opened) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  preventMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  trackOption(index: number, item: any): any {
    return this.resolveValue(item) ?? index;
  }

  isActiveOption(index: number): boolean {
    return this.activeIndex === index;
  }

  resolveValue(item: any): any {
    return item?.[this.valueField] ?? item?.value ?? item?.id ?? null;
  }

  resolveLabel(item: any): string {
    const localizedLabel = this.resolveLocalizedLabel(item);
    const configuredLabel =
      this.textField === 'messageEn' || this.textField === 'messageLocal'
        ? localizedLabel
        : item?.[this.textField];

    return String(
      configuredLabel ??
      item?.text ??
      item?.label ??
      item?.name ??
      localizedLabel ??
      '',
    );
  }

  private moveActive(step: 1 | -1): void {
    if (this.options.length === 0) {
      return;
    }

    if (this.activeIndex < 0) {
      this.activeIndex = step === 1 ? 0 : this.options.length - 1;
    } else {
      this.activeIndex = Math.max(0, Math.min(this.options.length - 1, this.activeIndex + step));
    }

    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    requestAnimationFrame(() => {
      const panel = this.optionsPanel?.nativeElement;
      if (!panel || this.activeIndex < 0) {
        return;
      }

      const option = panel.querySelectorAll<HTMLElement>('.sic-combobox__option')[this.activeIndex];
      option?.scrollIntoView({ block: 'nearest' });
    });
  }

  private scheduleSearchLoad(): void {
    this.clearSearchDebounce();
    this.searchDebounceHandle = setTimeout(() => {
      this.searchDebounceHandle = null;
      this.loadOptions(true);
    }, 250);
  }

  private loadOptions(reset: boolean): void {
    if (!this.apiUrl) {
      this.options = [];
      this.totalElements = 0;
      this.totalPages = 1;
      this.loading = false;
      return;
    }

    this.cancelPendingLoad();
    this.loading = true;

    const subscription = this.http.get<any[] | ComboboxPagingResponse<any>>(this.apiUrl, {
      params: this.buildParams(),
    }).subscribe({
      next: (response) => {
        if (this.loadSubscription !== subscription) {
          return;
        }

        const items = Array.isArray(response) ? response : (response.data ?? []);
        const pageable = Array.isArray(response) ? null : (response.pageable ?? null);

        setTimeout(() => {
          if (this.loadSubscription !== subscription) {
            return;
          }

          this.options = reset ? items : [...this.options, ...items];
          this.pageNumber = pageable?.pageNumber ?? this.pageNumber;
          this.totalPages = Math.max(1, pageable?.totalPages ?? 1);
          this.totalElements = pageable?.totalElements ?? items.length;
          this.loading = false;
          this.loadSubscription = null;

          const selectedIndex = this.options.findIndex((item) => this.resolveValue(item) === this.value);
          if (reset) {
                let nextActiveIndex = -1;

                if (selectedIndex >= 0) {
                  nextActiveIndex = selectedIndex;
                } else if (this.options.length > 0) {
                  nextActiveIndex = 0;
                }

                this.activeIndex = nextActiveIndex;
          }

          this.syncSelectedDisplay();
          if (reset || selectedIndex >= 0) {
            this.scrollActiveIntoView();
          }
          this.scheduleDropdownPositionUpdate();
          this.cdr.markForCheck();
        }, 0);
      },
      error: () => {
        if (this.loadSubscription !== subscription) {
          return;
        }

        setTimeout(() => {
          if (this.loadSubscription !== subscription) {
            return;
          }

          this.options = [];
          this.totalElements = 0;
          this.totalPages = 1;
          this.loading = false;
          this.loadSubscription = null;
          this.activeIndex = -1;
          this.scheduleDropdownPositionUpdate();
          this.cdr.markForCheck();
        }, 0);
      },
    });

    this.loadSubscription = subscription as any;
  }

  private syncSelectedDisplay(): void {
    const matched = this.options.find((item) => this.resolveValue(item) === this.value);
    if (!matched) {
      if (!this.value) {
        this.selectedItem = null;
        this.selectedText = '';
      }
      return;
    }

    const previousSelectedText = this.selectedText;
    this.selectedItem = matched;
    this.selectedText = this.resolveLabel(matched);

    if (!this.searchTerm || this.inputText === previousSelectedText) {
      this.inputText = this.selectedText;
    }
  }

  private loadValueById(value: any): void {
    if (!this.apiUrl) {
      return;
    }

    this.cancelPendingLoad();
    this.loading = true;

    const subscription = this.http.get<any[] | ComboboxPagingResponse<any>>(this.apiUrl, {
      params: this.buildParamsWithValue(value),
    }).subscribe({
      next: (response) => {
        if (this.loadSubscription !== subscription) {
          return;
        }

        const items = Array.isArray(response) ? response : (response.data ?? []);
        if (items.length > 0) {
          const item = items[0];
          setTimeout(() => {
            this.selectedItem = item;
            this.selectedText = this.resolveLabel(item);
            this.inputText = this.selectedText;
            this.loading = false;
            this.cdr.markForCheck();
          }, 0);
        } else {
          this.loading = false;
        }
        this.loadSubscription = null;
      },
      error: () => {
        if (this.loadSubscription !== subscription) {
          return;
        }
        this.loading = false;
        this.loadSubscription = null;
      },
    });

    this.loadSubscription = subscription as any;
  }

  private cancelPendingLoad(): void {
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = null;
  }

  private clearSearchDebounce(): void {
    if (!this.searchDebounceHandle) {
      return;
    }

    clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = null;
  }

  private buildParams(): HttpParams {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(this.params ?? {})) {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    if (this.searchTerm) {
      httpParams = httpParams.set(this.keywordParam, this.searchTerm);
    }

    if (this.paging) {
      httpParams = httpParams.set(this.pageNumberParam, String(this.pageNumber));
      httpParams = httpParams.set(this.pageSizeParam, String(this.pageSize));
    }

    return httpParams;
  }

  private buildParamsWithValue(value: any): HttpParams {
    let httpParams = new HttpParams();

    for (const [key, val] of Object.entries(this.params ?? {})) {
      if (val !== null && val !== undefined && val !== '') {
        httpParams = httpParams.set(key, String(val));
      }
    }

    if (value !== null && value !== undefined && !(typeof value === 'string' && value.trim() === '')) {
      httpParams = httpParams.set('value', String(value));
    }

    return httpParams;
  }

  private normalizeControlValue(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }

    return value;
  }

  private markTouched(): void {
    if (this.touched) {
      return;
    }

    this.touched = true;
    this.onTouched();
  }

  private handleLanguageChange(): void {
    const currentValue = this.value;
    const currentSelectedItem = this.selectedItem;

    this.clearSearchDebounce();
    this.cancelPendingLoad();

    if (this.closeDropdownHandle) {
      clearTimeout(this.closeDropdownHandle);
      this.closeDropdownHandle = null;
    }

    if (this.positionDropdownHandle) {
      clearTimeout(this.positionDropdownHandle);
      this.positionDropdownHandle = null;
    }

    this.options = [];
    this.totalElements = 0;
    this.totalPages = 1;
    this.pageNumber = 1;
    this.activeIndex = -1;
    this.searchTerm = '';
    this.dropdownPanelStyle = {};
    this.opened = false;
    this.loading = false;

    if (currentSelectedItem) {
      const refreshedDisplay = this.resolveLabel(currentSelectedItem);
      this.selectedText = refreshedDisplay;
      this.inputText = refreshedDisplay;
    }

    if (currentValue === null || currentValue === undefined) {
      this.cdr.markForCheck();
      return;
    }

    this.selectedItem = null;
    this.selectedText = '';
    this.inputText = '';
    this.loading = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      if (this.value !== currentValue) {
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }

      this.loadValueById(currentValue);
    }, 0);
  }

  private resolveLocalizedLabel(item: any): string | null {
    const currentLanguage = this.translate.getCurrentLang() === 'th' ? 'th' : 'en';
    const preferredKey = currentLanguage === 'th' ? 'messageLocal' : 'messageEn';
    const fallbackKey = currentLanguage === 'th' ? 'messageEn' : 'messageLocal';
    const preferredLabel = item?.[preferredKey];
    const fallbackLabel = item?.[fallbackKey];

    if (typeof preferredLabel === 'string' && preferredLabel.trim()) {
      return preferredLabel;
    }

    if (typeof fallbackLabel === 'string' && fallbackLabel.trim()) {
      return fallbackLabel;
    }

    return null;
  }

  private updateDropdownPosition(): void {
    const anchorElement = this.fieldContainer?.nativeElement ?? this.fieldInput?.nativeElement;
    const panelElement = this.dropdownPanel?.nativeElement;
    if (!anchorElement || !panelElement) {
      this.dropdownPanelStyle = {};
      return;
    }

    const rect = anchorElement.getBoundingClientRect();
    const panelRect = panelElement.getBoundingClientRect();
    const panelHeight = panelRect.height || panelElement.offsetHeight || 320;
    const gap = 8;
    const viewportPadding = 8;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const width = Math.min(rect.width, viewportWidth - viewportPadding * 2);
    const spaceBelow = viewportHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;

    let top = rect.bottom + gap;
    if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
      top = rect.top - panelHeight - gap;
    }

    top = Math.max(viewportPadding, Math.min(top, viewportHeight - panelHeight - viewportPadding));

    let left = rect.left;
    if (left + width > viewportWidth - viewportPadding) {
      left = Math.max(viewportPadding, viewportWidth - width - viewportPadding);
    }

    this.dropdownPanelStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      minWidth: `${width}px`,
    };
  }

  private scheduleDropdownPositionUpdate(): void {
    if (this.positionDropdownHandle) {
      clearTimeout(this.positionDropdownHandle);
    }

    this.positionDropdownHandle = setTimeout(() => {
      this.positionDropdownHandle = null;
      this.updateDropdownPosition();
      this.cdr.markForCheck();
      setTimeout(() => {
        if (!this.opened) {
          return;
        }

        this.updateDropdownPosition();
        this.cdr.markForCheck();
      }, 0);
    }, 0);
  }
}
