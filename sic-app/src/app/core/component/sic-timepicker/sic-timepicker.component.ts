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
  OnInit,
  ViewChild,
  forwardRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
} from '@angular/forms';
import dayjs from '../../../core/dayjs';
import type { Dayjs } from 'dayjs';
import { SicValidator } from '../../validator/sic.validator';

@Component({
  selector: 'sic-timepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-timepicker.component.html',
  styleUrl: './sic-timepicker.component.css',
  host: {
    ngSkipHydration: 'true',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicTimepickerComponent),
      multi: true,
    },
  ],
})
export class SicTimepickerComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @Input() label?: string;
  @Input() placeholder = 'Select time';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() hint?: string;
  @Input() errorMessages: Record<string, string> = {};

  @HostBinding('class.sic-timepicker-host') readonly hostClass = true;

  @ViewChild('fieldInput') fieldInput?: ElementRef<HTMLInputElement>;
  @ViewChild('clockPanel') clockPanel?: ElementRef<HTMLDivElement>;

  ready = false;
  opened = false;
  touched = false;
  inputText = '';
  selectedTime: Dayjs | null = null;
  value: string | null = null;

  hour = 0;
  minute = 0;
  selectedMode: 'hour' | 'minute' = 'hour'; // Start with hour selection
  isKeyboardFocused = false; // Track if focus is from keyboard
  isFocused = false; // Track if field is focused

  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);

  clockPanelStyle: Record<string, string> = {};
  focusedHour: number | null = null;
  focusedMinute: number | null = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  ngControl: NgControl | null = null;
  private closeDropdownHandle: ReturnType<typeof setTimeout> | null = null;
  private readyHandle: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly injector: Injector,
    private readonly cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly validator: SicValidator,
  ) {}

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterViewInit(): void {
    this.readyHandle = setTimeout(() => {
      this.ready = true;
      this.cdr.markForCheck();
    }, 0);
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

  ngOnDestroy(): void {
    if (this.closeDropdownHandle) {
      clearTimeout(this.closeDropdownHandle);
    }
    if (this.readyHandle) {
      clearTimeout(this.readyHandle);
    }
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onWindowResizeOrScroll(): void {
    if (this.opened) {
      this.updateClockPosition();
    }
  }

  onFieldClick(): void {
    if (this.disabled || this.readonly) {
      return;
    }
    this.isKeyboardFocused = false;
    this.isFocused = true;
    this.toggleDropdown();
  }

  onFieldMouseDown(): void {
    this.isKeyboardFocused = false;
    this.isFocused = true;
  }

  onFieldFocus(): void {
    this.isFocused = true;
    this.isKeyboardFocused = false;
    if (!this.opened) {
      this.openDropdown();
    }
  }

  onFieldBlur(): void {
    this.isFocused = false;
    this.isKeyboardFocused = false;
  }

  toggleDropdown(): void {
    this.opened = !this.opened;
    if (this.opened) {
      this.selectedMode = 'hour';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.updateClockPosition();
        this.fieldInput?.nativeElement.focus();
      }, 0);
    } else {
      this.markTouched();
    }
  }

  openDropdown(): void {
    this.opened = true;
    this.selectedMode = 'hour';
    this.cdr.markForCheck();
    setTimeout(() => {
      this.updateClockPosition();
      this.fieldInput?.nativeElement.focus();
    }, 0);
  }

  closeDropdown(): void {
    this.opened = false;
    this.markTouched();
  }

  updateClockPosition(): void {
    if (!this.fieldInput || !this.clockPanel) {
      return;
    }

    const fieldRect = this.fieldInput.nativeElement.getBoundingClientRect();
    const panelHeight = 420; // Approximate height of clock panel
    const gap = 8;
    const viewportHeight = window.innerHeight;

    let top = fieldRect.bottom + gap;
    if (top + panelHeight > viewportHeight) {
      top = fieldRect.top - panelHeight - gap;
    }

    this.clockPanelStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${fieldRect.left}px`,
    };

    this.cdr.markForCheck();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.opened) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        this.openDropdown();
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        this.isKeyboardFocused = true;
        if (this.selectedMode === 'minute') {
          this.selectedMode = 'hour';
        }
        this.cdr.markForCheck();
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.isKeyboardFocused = true;
        if (this.selectedMode === 'hour') {
          this.selectedMode = 'minute';
        }
        this.cdr.markForCheck();
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.isKeyboardFocused = true;
        this.adjustTime(1);
        this.cdr.markForCheck();
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.isKeyboardFocused = true;
        this.adjustTime(-1);
        this.cdr.markForCheck();
        event.preventDefault();
        break;
      case 'Enter':
        this.confirmTime();
        event.preventDefault();
        break;
      case 'Tab':
        this.closeDropdown();
        this.moveFocusToAdjacentField(event.shiftKey);
        event.preventDefault();
        break;
      case 'Escape':
        this.closeDropdown();
        event.preventDefault();
        break;
    }
  }

  adjustTime(delta: number): void {
    if (this.selectedMode === 'hour') {
      this.hour = (this.hour + delta + 24) % 24;
    } else {
      this.minute = (this.minute + delta + 60) % 60;
    }
    this.cdr.markForCheck();
  }

  selectHour(h: number): void {
    this.hour = h;
    // Auto switch to minute mode after selecting hour
    this.selectedMode = 'minute';
    this.cdr.markForCheck();
  }

  selectMinute(m: number): void {
    this.minute = m;
    this.confirmTime();
  }

  confirmTime(): void {
    this.updateValue();
    this.closeDropdown();
  }

  updateValue(): void {
    const timeStr = `${String(this.hour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}`;
    this.inputText = timeStr;
    this.value = timeStr;
    this.onChange(timeStr);
    this.cdr.markForCheck();
  }

  onClear(event: Event): void {
    event.stopPropagation();
    this.hour = 0;
    this.minute = 0;
    this.inputText = '';
    this.value = null;
    this.selectedTime = null;
    this.onChange(null);
    this.cdr.markForCheck();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value) {
      if (typeof value === 'string') {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          this.hour = h;
          this.minute = m;
          this.inputText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          this.value = this.inputText;
        }
      }
    } else {
      this.hour = 0;
      this.minute = 0;
      this.inputText = '';
      this.value = null;
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }

  /**
   * Get position of hour number on clock
   * Outer ring (radius 105): hours 0-11 displayed as 12, 1-11
   * Inner ring (radius 70): hours 12-23 displayed as 00-11
   */
  getHourPositionByIndex(h: number): { top: string; left: string } {
    const displayHour = h % 12; // 0-11
    const angle = (360 / 12) * (displayHour === 0 ? 0 : displayHour) - 90;
    const radian = (angle * Math.PI) / 180;

    // Use different radius based on outer (0-11) or inner (12-23) ring
    const radius = h < 12 ? 115 : 80;
    // Offset: 20px for outer (width 40px), 16px for inner (width 32px)
    const offset = h < 12 ? 20 : 16;

    const x = 150 + radius * Math.cos(radian);
    const y = 150 + radius * Math.sin(radian);

    return {
      top: `${y - offset}px`,
      left: `${x - offset}px`,
    };
  }

  getMinuteClockPosition(index: number): { top: string; left: string } {
    // 12 minutes displayed around clock (every 5 minutes)
    const angle = (360 / 12) * index - 90;
    const radian = (angle * Math.PI) / 180;
    const radius = 115; // Closer to clock edge

    const x = 150 + radius * Math.cos(radian);
    const y = 150 + radius * Math.sin(radian);

    return {
      top: `${y - 20}px`,
      left: `${x - 20}px`,
    };
  }

  getHourHandRotation(): number {
    // Hour hand: rotate on 12-hour clock face (30 degrees per hour position)
    // 0° points up (12 o'clock), 90° points right (3 o'clock), etc.
    const hourPosition = this.hour % 12;
    return (hourPosition * 30);
  }

  getMinuteHandRotation(): number {
    // Minute hand: full rotation in 60 minutes (6 degrees per minute)
    return (this.minute / 60) * 360;
  }

  private moveFocusToAdjacentField(reverse: boolean): void {
    const host = this.elementRef.nativeElement;
    const documentRef = host.ownerDocument;
    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = Array.from(documentRef.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (element) => element.offsetParent !== null,
    );
    const activeElement = documentRef.activeElement as HTMLElement | null;
    const currentElement = activeElement && host.contains(activeElement) ? activeElement : host;
    let currentIndex = focusableElements.indexOf(currentElement);

    if (currentIndex < 0) {
      currentIndex = focusableElements.findIndex((element) => element === host || host.contains(element));
    }

    const step = reverse ? -1 : 1;
    let nextIndex = currentIndex + step;
    let target: HTMLElement | undefined;

    while (nextIndex >= 0 && nextIndex < focusableElements.length) {
      const candidate = focusableElements[nextIndex];
      if (candidate !== host && !host.contains(candidate)) {
        target = candidate;
        break;
      }
      nextIndex += step;
    }

    if (target) {
      target.focus();
    }
  }

  private markTouched(): void {
    if (this.touched) {
      return;
    }
    this.touched = true;
    this.onTouched();
  }

  preventMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  get isHourSelected(): boolean {
    return this.selectedMode === 'hour';
  }

  get isMinuteSelected(): boolean {
    return this.selectedMode === 'minute';
  }
}
