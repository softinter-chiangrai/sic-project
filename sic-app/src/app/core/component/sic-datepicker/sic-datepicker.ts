import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  ViewChild,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import dayjs from '../../../core/dayjs';
import type { Dayjs } from 'dayjs';
import { DateTimeUtil, type CalendarEra } from '../../../core/utils/datetime.util';
import { SicValidator } from '../../services/sic-validator';
import type { Subscription } from 'rxjs';

@Component({
  selector: 'sic-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-datepicker.html',
  styleUrl: './sic-datepicker.css',
  host: {
    ngSkipHydration: 'true',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicDatepicker),
      multi: true,
    },
  ],
})
export class SicDatepicker implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() label?: string;
  @Input() placeholder = 'Select date';
  @Input() dateFormat?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() clearable = true;
  @Input() hint?: string;
  @Input() errorMessages: Record<string, string> = {};
  @Input() minDate?: Date | string | null;
  @Input() maxDate?: Date | string | null;

  @HostBinding('class.sic-datepicker-host') readonly hostClass = true;

  @ViewChild('fieldInput') fieldInput?: ElementRef<HTMLInputElement>;
  @ViewChild('fieldContainer') fieldContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('calendarPanel') calendarPanel?: ElementRef<HTMLDivElement>;

  ready = false;
  opened = false;
  touched = false;
  inputText = '';
  selectedDate: Dayjs | null = null;
  value: string | null = null;

  private _era: CalendarEra | null = null;
  private _offset: number | null = null;

  currentViewDate: Dayjs = dayjs.utc().utcOffset(this.getOffset()).locale(this.resolveLocale(this.getEra()));
  calendarDays: (Dayjs | null)[] = [];
  weekDays: string[] = [];
  monthNames: string[] = [];
  years: number[] = [];
  yearViewOpen = false;
  monthViewOpen = false;
  calendarPanelStyle: Record<string, string> = {};
  focusedDate: Dayjs | null = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private ngControl: NgControl | null = null;
  private closeDropdownHandle: ReturnType<typeof setTimeout> | null = null;
  private readyHandle: ReturnType<typeof setTimeout> | null = null;
  private positionDropdownHandle: ReturnType<typeof setTimeout> | null = null;
  private languageChangeSubscription: Subscription | null = null;

  constructor(
    private readonly injector: Injector,
    private readonly cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly validator: SicValidator,
  ) {
    this.generateWeekDays();
  }

  ngAfterViewInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    // Subscribe to era changes from DateTimeUtil
    this.languageChangeSubscription = DateTimeUtil.onEraChange().subscribe(() => {
      this.onLanguageChange();
    });

    this.readyHandle = setTimeout(() => {
      this.ready = true;
      this.readyHandle = null;
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.readyHandle) {
      clearTimeout(this.readyHandle);
    }
    if (this.closeDropdownHandle) {
      clearTimeout(this.closeDropdownHandle);
    }
    if (this.positionDropdownHandle) {
      clearTimeout(this.positionDropdownHandle);
    }
    if (this.languageChangeSubscription) {
      this.languageChangeSubscription.unsubscribe();
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

  get isRequired(): boolean {
    if (!this.control?.validator) {
      return false;
    }
    // Check if the validator returns a 'required' error by testing with null value
    const testControl = { value: null } as any;
    const errorMap = this.control.validator(testControl);
    return !!errorMap?.['required'];
  }

  private onLanguageChange(): void {
    // Clear cached era and offset
    this._era = null;
    this._offset = null;

    // Refresh the current view date with new locale
    this.currentViewDate = dayjs.utc().utcOffset(this.getOffset()).locale(this.resolveLocale(this.getEra()));

    // Regenerate week days and calendar controls with new locale
    this.generateWeekDays();
    
    // If calendar is open, regenerate it
    if (this.opened) {
      this.generateCalendar();
      this.updateCalendarControls();
    }

    // Update selected date with new locale and displayed date format if selected date exists
    if (this.selectedDate && this.value) {
      // Recreate selectedDate with new locale
      this.selectedDate = dayjs.utc(this.value).utcOffset(this.getOffset()).locale(this.resolveLocale(this.getEra()));
      const format = this.dateFormat || DateTimeUtil.getDefaults().dateFormat;
      const normalizedFormat = this.normalizeYearFormat(format);
      this.inputText = this.selectedDate.format(normalizedFormat);
    }

    this.cdr.markForCheck();
  }

  writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.selectedDate = null;
      this.inputText = '';
      this.value = null;
      return;
    }

    const date = dayjs.utc(value).utcOffset(this.getOffset()).locale(this.resolveLocale(this.getEra()));
    if (date.isValid()) {
      this.selectedDate = date;
      const format = this.dateFormat || DateTimeUtil.getDefaults().dateFormat;
      const normalizedFormat = this.normalizeYearFormat(format);
      this.inputText = date.format(normalizedFormat);
      this.value = date.toISOString();
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
    this.yearViewOpen = false;
    this.monthViewOpen = false;
    this.calendarPanelStyle = {};
    if (this.selectedDate) {
      this.currentViewDate = this.selectedDate;
      this.focusedDate = this.selectedDate;
    } else {
      this.focusedDate = this.currentViewDate;
    }
    this.generateCalendar();
    this.updateCalendarControls();
    this.cdr.markForCheck();
    this.scheduleDropdownPositionUpdate();
  }

  closeDropdown(): void {
    if (this.closeDropdownHandle) {
      clearTimeout(this.closeDropdownHandle);
      this.closeDropdownHandle = null;
    }

    this.closeDropdownHandle = setTimeout(() => {
      this.opened = false;
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
    if (this.opened) {
      this.scheduleDropdownPositionUpdate();
    }
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

  private updateDropdownPosition(): void {
    const anchorElement = this.fieldContainer?.nativeElement ?? this.fieldInput?.nativeElement;
    if (!anchorElement) {
      this.calendarPanelStyle = {};
      return;
    }

    const rect = anchorElement.getBoundingClientRect();
    const minWidth = Math.max(rect.width, 320);
    const maxWidth = 360;
    const availableWidth = window.innerWidth - 16;
    const width = Math.min(minWidth, maxWidth, availableWidth);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }

    const panelElement = this.calendarPanel?.nativeElement;
    const panelHeight = panelElement?.getBoundingClientRect().height || panelElement?.offsetHeight || 480;
    const gap = 8;
    const viewportHeight = window.innerHeight;
    const viewportPadding = 8;
    const spaceBelow = viewportHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;

    let top = rect.bottom + gap;
    if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
      top = rect.top - panelHeight - gap;
    }
    top = Math.max(viewportPadding, Math.min(top, viewportHeight - panelHeight - viewportPadding));

    this.calendarPanelStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      minWidth: `${width}px`,
      maxWidth: `${maxWidth}px`,
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

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.opened || this.yearViewOpen || this.monthViewOpen) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.navigateDate(-7);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateDate(7);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.navigateDate(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.navigateDate(1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.focusedDate) {
          this.selectDate(this.focusedDate);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  preventMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  previousMonth(): void {
    this.currentViewDate = this.currentViewDate.subtract(1, 'month');
    this.focusedDate = null;
    this.generateCalendar();
    this.updateCalendarControls();
  }

  nextMonth(): void {
    this.currentViewDate = this.currentViewDate.add(1, 'month');
    this.focusedDate = null;
    this.generateCalendar();
    this.updateCalendarControls();
  }

  toggleYearView(): void {
    this.yearViewOpen = !this.yearViewOpen;
    if (this.yearViewOpen) {
      this.monthViewOpen = false;
    }
  }

  selectYear(year: number): void {
    this.currentViewDate = this.currentViewDate.year(year);
    this.yearViewOpen = false;
    this.monthViewOpen = true;
    this.focusedDate = null;
    this.generateCalendar();
    this.updateCalendarControls();
  }

  selectMonth(month: number): void {
    this.currentViewDate = this.currentViewDate.month(month);
    this.monthViewOpen = false;
    this.focusedDate = null;
    this.generateCalendar();
    this.updateCalendarControls();
  }

  getMonthYearLabel(): string {
    const normalized = this.normalizeYearFormat('MMM YYYY');
    return this.currentViewDate.format(normalized).toUpperCase();
  }

  getYearRangeLabel(): string {
    if (!this.years.length) {
      return '';
    }
    return `${this.getDisplayYear(this.years[0])} – ${this.getDisplayYear(this.years[this.years.length - 1])}`;
  }

  getDisplayYear(year: number): string {
    return this.getEra() === 'th' ? String(year + 543) : String(year);
  }

  changeMonth(value: string): void {
    const month = Number(value);
    if (Number.isNaN(month)) {
      return;
    }

    this.currentViewDate = this.currentViewDate.month(month);
    this.generateCalendar();
    this.updateCalendarControls();
  }

  changeYear(value: string): void {
    const year = Number(value);
    if (Number.isNaN(year)) {
      return;
    }

    this.currentViewDate = this.currentViewDate.year(year);
    this.generateCalendar();
    this.updateCalendarControls();
  }

  selectDate(date: Dayjs | null): void {
    if (!date || this.isDateDisabled(date)) {
      return;
    }

    this.selectedDate = date;
    const format = this.dateFormat || DateTimeUtil.getDefaults().dateFormat;
    const normalizedFormat = this.normalizeYearFormat(format);
    this.inputText = date.format(normalizedFormat);
    this.value = date.toISOString();
    this.onChange(this.value);
    this.markTouched();
    this.closeDropdown();
  }

  navigateDate(days: number): void {
    if (!this.focusedDate) {
      this.focusedDate = this.currentViewDate;
    }

    const newDate = this.focusedDate.add(days, 'day');

    // If navigating to a different month, update the view
    if (!newDate.isSame(this.currentViewDate, 'month')) {
      this.currentViewDate = newDate;
      this.generateCalendar();
      this.updateCalendarControls();
    }

    this.focusedDate = newDate;
    this.cdr.markForCheck();
  }

  onDayMouseEnter(date: Dayjs): void {
    this.focusedDate = date;
  }

  isFocused(date: Dayjs): boolean {
    if (!this.focusedDate) {
      return false;
    }
    return date.isSame(this.focusedDate, 'day');
  }

  clearSelection(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.selectedDate = null;
    this.inputText = '';
    this.value = null;
    this.onChange(null);
    this.markTouched();
  }

  toggleDropdown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.opened) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  isToday(date: Dayjs): boolean {
    const today = dayjs.utc().utcOffset(this.getOffset()).locale(this.resolveLocale(this.getEra()));
    return date.isSame(today, 'day');
  }

  isSelected(date: Dayjs): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return date.isSame(this.selectedDate, 'day');
  }

  isCurrentMonth(date: Dayjs | null): boolean {
    if (!date) {
      return false;
    }
    return date.isSame(this.currentViewDate, 'month');
  }

  isDateDisabled(date: Dayjs): boolean {
    let minDate: Dayjs | null = null;
    let maxDate: Dayjs | null = null;

    if (this.minDate) {
      minDate = dayjs.utc(this.minDate).utcOffset(this.getOffset()).locale(this.resolveLocale(this.getEra()));
    }

    if (this.maxDate) {
      maxDate = dayjs.utc(this.maxDate).utcOffset(this.getOffset()).locale(this.resolveLocale(this.getEra()));
    }

    if (minDate && date.isBefore(minDate, 'day')) {
      return true;
    }

    if (maxDate && date.isAfter(maxDate, 'day')) {
      return true;
    }

    return false;
  }

  getMonthYear(): string {
    const normalizedFormat = this.normalizeYearFormat('MMMM YYYY');
    return this.currentViewDate.format(normalizedFormat);
  }

  private getEra(): CalendarEra {
    if (!this._era) {
      this._era = DateTimeUtil.getDefaults().era;
    }
    return this._era;
  }

  private getOffset(): number {
    if (this._offset === null) {
      this._offset = DateTimeUtil.getDefaults().offset;
    }
    return this._offset;
  }

  private normalizeYearFormat(format: string): string {
    const era = this.getEra();
    if (era === 'th') {
      return format.replaceAll('YYYY', 'BBBB').replaceAll('YY', 'BB');
    }
    return format.replaceAll('BBBB', 'YYYY').replaceAll('BB', 'YY');
  }

  private generateWeekDays(): void {
    const locale = this.resolveLocale(this.getEra());
    
    if (locale === 'th') {
      this.weekDays = ['อ.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    } else {
      this.weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }
  }

  private updateCalendarControls(): void {
    this.generateMonthNames();
    this.generateYearOptions();
  }

  private generateMonthNames(): void {
    const locale = this.resolveLocale(this.getEra());
    if (locale === 'th') {
      this.monthNames = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
      ];
    } else {
      this.monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
    }
  }

  private generateYearOptions(): void {
    const currentYear = this.currentViewDate.year();
    const minYear = this.minDate ? dayjs.utc(this.minDate).year() : currentYear - 10;
    const maxYear = this.maxDate ? dayjs.utc(this.maxDate).year() : currentYear + 10;
    const startYear = Math.min(minYear, currentYear - 10);
    const endYear = Math.max(maxYear, currentYear + 10);

    this.years = [];
    for (let year = startYear; year <= endYear; year += 1) {
      this.years.push(year);
    }
  }

  private generateCalendar(): void {
    const start = this.currentViewDate.startOf('month');
    const end = this.currentViewDate.endOf('month');
    const startOfWeek = start.startOf('week');
    const endOfWeek = end.endOf('week');

    this.calendarDays = [];
    let current = startOfWeek;

    while (current.isBefore(endOfWeek) || current.isSame(endOfWeek, 'day')) {
      this.calendarDays.push(current);
      current = current.add(1, 'day');
    }
  }

  private resolveLocale(era: CalendarEra): 'en' | 'th' {
    return era === 'en' ? 'en' : 'th';
  }

  private markTouched(): void {
    if (this.touched) {
      return;
    }

    this.touched = true;
    this.onTouched();
  }

  private resolveErrorMessage(): void {
    // Error messages are now resolved by SicValidator service
  }
}
