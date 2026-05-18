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
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { SicValidator } from '../../services/sic-validator';

@Component({
  selector: 'sic-colorpicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-colorpicker.html',
  styleUrl: './sic-colorpicker.css',
  host: {
    ngSkipHydration: 'true',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicColorpicker),
      multi: true,
    },
  ],
})
export class SicColorpicker implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @Input() label?: string;
  @Input() placeholder = 'Select color';
  @Input() disabled = false;
  @Input() required = false;
  @Input() readonly = false;
  @Input() hint?: string;
  @Input() errorMessages: Record<string, string> = {};

  @HostBinding('class.sic-colorpicker-host') readonly hostClass = true;

  @ViewChild('fieldContainer') fieldContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('fieldInput') fieldInput?: ElementRef<HTMLInputElement>;
  @ViewChild('colorPanel') colorPanel?: ElementRef<HTMLDivElement>;
  @ViewChild('colorWheel') colorWheelCanvas?: ElementRef<HTMLCanvasElement>;

  readonly presetColors = [
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#84CC16',
    '#10B981',
    '#06B6D4',
    '#3B82F6',
    '#6366F1',
    '#A855F7',
    '#EC4899',
  ];

  ready = false;
  opened = false;
  touched = false;
  inputText = '';
  value: string | null = null;
  selectedColor = '#10B981';
  hexInput = '#10B981';
  hue = 154;
  saturation = 84;
  lightness = 39;
  indicatorX = 50;
  indicatorY = 50;
  colorPanelStyle: Record<string, string> = {};
  isFocused = false;

  ngControl: NgControl | null = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private readyHandle: ReturnType<typeof setTimeout> | null = null;
  private isDraggingWheel = false;
  private wheelClickStarted = false;

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
    this.syncIndicator();
  }

  ngAfterViewInit(): void {
    this.readyHandle = setTimeout(() => {
      this.ready = true;
      this.readyHandle = null;
      this.drawColorWheel();
      this.cdr.markForCheck();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.readyHandle) {
      clearTimeout(this.readyHandle);
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

  get displayValue(): string {
    return this.value ?? '';
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onWindowResizeOrScroll(): void {
    if (this.opened) {
      this.updateColorPanelPosition();
    }
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    if (this.wheelClickStarted) {
      this.wheelClickStarted = false;
      this.confirmColor();
      return;
    }

    if (this.isDraggingWheel) {
      this.isDraggingWheel = false;
      this.confirmColor();
      return;
    }

    this.isDraggingWheel = false;
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

  onFieldFocus(): void {
    this.isFocused = true;
    if (!this.opened) {
      this.openDropdown();
    }
  }

  onFieldBlur(): void {
    this.isFocused = false;
    this.markTouched();
  }

  onFieldMouseDown(): void {
    this.isFocused = true;
  }

  onFieldClick(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    if (this.opened) {
      this.closeDropdown();
      return;
    }

    this.openDropdown();
  }

  openDropdown(): void {
    if (!this.ready || this.disabled || this.readonly || this.opened) {
      return;
    }

    this.opened = true;
    this.wheelClickStarted = false;
    this.isDraggingWheel = false;
    // Set initial hidden state to prevent flashing at 0,0
    this.colorPanelStyle = {
      position: 'fixed',
      visibility: 'hidden',
      top: '0px',
      left: '0px',
    };
    this.cdr.markForCheck();
    setTimeout(() => {
      if (!this.opened) return;
      this.updateColorPanelPosition();
      this.drawColorWheel();
      this.cdr.markForCheck();
    }, 50);
  }

  closeDropdown(): void {
    this.opened = false;
    this.colorPanelStyle = {};
    this.isDraggingWheel = false;
    this.markTouched();
    this.cdr.markForCheck();
  }

  onWheelMouseDown(event: MouseEvent): void {
    this.wheelClickStarted = true;
    this.isDraggingWheel = true;
    this.updateWheelPosition(event);
  }

  onWheelMouseMove(event: MouseEvent): void {
    if (!this.isDraggingWheel) {
      return;
    }
    // If user moves the mouse while clicking, it's a drag, not a click
    this.wheelClickStarted = false;
    this.updateWheelPosition(event);
  }

  updateLightness(value: number | string): void {
    this.lightness = Number(value);
    this.applyHslState();
  }

  onHexInputChange(value: string): void {
    this.hexInput = value.toUpperCase();
  }

  applyHexInput(): void {
    const normalized = this.normalizeHex(this.hexInput);
    if (!normalized) {
      this.hexInput = this.value ?? this.selectedColor;
      this.cdr.markForCheck();
      return;
    }

    this.applyHexColor(normalized, false);
  }

  selectPresetColor(color: string): void {
    this.applyHexColor(color, false);
  }

  confirmColor(): void {
    this.value = this.hexInput;
    this.selectedColor = this.hexInput;
    this.inputText = this.hexInput;
    this.onChange(this.value);
    this.closeDropdown();
  }

  clearValue(): void {
    this.value = null;
    this.inputText = '';
    this.applyHexColor('#10B981', true);
    this.onChange(null);
    this.markTouched();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled || this.readonly) {
      return;
    }

    if (!this.opened) {
      if (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === ' ') {
        this.openDropdown();
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        this.hue = (this.hue + 8) % 360;
        this.applyHslState();
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.hue = (this.hue - 8 + 360) % 360;
        this.applyHslState();
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.saturation = Math.min(100, this.saturation + 5);
        this.applyHslState();
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.saturation = Math.max(0, this.saturation - 5);
        this.applyHslState();
        event.preventDefault();
        break;
      case 'Enter':
        this.confirmColor();
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

  writeValue(value: any): void {
    if (typeof value === 'string' && this.normalizeHex(value)) {
      this.value = this.normalizeHex(value);
      this.inputText = this.value ?? '';
      this.applyHexColor(this.value!, true);
    } else {
      this.value = null;
      this.inputText = '';
      this.applyHexColor('#10B981', true);
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

  private updateColorPanelPosition(): void {
    const anchorElement = this.fieldContainer?.nativeElement;
    if (!anchorElement) {
      this.colorPanelStyle = {};
      return;
    }

    const rect = anchorElement.getBoundingClientRect();
    const panelElement = this.colorPanel?.nativeElement;
    const panelHeight = panelElement?.getBoundingClientRect().height || panelElement?.offsetHeight || 380;
    const panelWidth = panelElement?.getBoundingClientRect().width || panelElement?.offsetWidth || 340;
    const gap = 8;
    const viewportPadding = 8;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;

    let top = rect.bottom + gap;
    if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
      top = rect.top - panelHeight - gap;
    }
    top = Math.max(viewportPadding, Math.min(top, viewportHeight - panelHeight - viewportPadding));

    let left = rect.left;
    if (left + panelWidth > viewportWidth - viewportPadding) {
      left = Math.max(viewportPadding, viewportWidth - panelWidth - viewportPadding);
    }

    this.colorPanelStyle = {
      position: 'fixed',
      visibility: 'visible',
      top: `${top}px`,
      left: `${left}px`,
    };

    this.cdr.markForCheck();
  }

  private updateWheelPosition(event: MouseEvent): void {
    const canvas = this.colorWheelCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = rect.width / 2 - 10;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.min(Math.hypot(dx, dy), radius);

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) {
      angle += 360;
    }

    this.hue = Math.round(angle);
    this.saturation = Math.round((distance / radius) * 100);
    this.applyHslState();
  }

  private applyHexColor(hex: string, skipInputSync = false): void {
    const rgb = this.hexToRgb(hex);
    if (!rgb) {
      return;
    }

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    this.hue = hsl.h;
    this.saturation = hsl.s;
    this.lightness = hsl.l;
    this.selectedColor = hex;
    this.hexInput = hex;
    if (!skipInputSync) {
      this.inputText = hex;
    }
    this.syncIndicator();
    this.drawColorWheel();
    this.cdr.markForCheck();
  }

  private applyHslState(): void {
    this.selectedColor = this.hslToHex(this.hue, this.saturation, this.lightness);
    this.hexInput = this.selectedColor;
    this.syncIndicator();
    this.drawColorWheel();
    this.cdr.markForCheck();
  }

  private syncIndicator(): void {
    const radiusPercent = (this.saturation / 100) * 42;
    const angleRad = (this.hue * Math.PI) / 180;
    this.indicatorX = 50 + Math.cos(angleRad) * radiusPercent;
    this.indicatorY = 50 + Math.sin(angleRad) * radiusPercent;
  }

  private drawColorWheel(): void {
    const canvas = this.colorWheelCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const size = 250;
    const center = size / 2;
    const radius = center - 10;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = x - center;
        const dy = y - center;
        const distance = Math.hypot(dx, dy);
        const pixelIndex = (y * size + x) * 4;

        if (distance > radius) {
          data[pixelIndex + 3] = 0;
          continue;
        }

        let hue = Math.atan2(dy, dx) * (180 / Math.PI);
        if (hue < 0) {
          hue += 360;
        }

        const saturation = Math.min(100, (distance / radius) * 100);
        const rgb = this.hexToRgb(this.hslToHex(hue, saturation, this.lightness));
        if (!rgb) {
          continue;
        }

        data[pixelIndex] = rgb.r;
        data[pixelIndex + 1] = rgb.g;
        data[pixelIndex + 2] = rgb.b;

        const edgeSoftness = 1.5;
        const alpha = distance > radius - edgeSoftness
          ? Math.max(0, ((radius - distance) / edgeSoftness) * 255)
          : 255;
        data[pixelIndex + 3] = alpha;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private normalizeHex(value: string): string | null {
    const raw = value.trim().replace('#', '');
    if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) {
      return null;
    }

    const normalized = raw.length === 3
      ? raw.split('').map((char) => `${char}${char}`).join('')
      : raw;

    return `#${normalized.toUpperCase()}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const normalized = this.normalizeHex(hex);
    if (!normalized) {
      return null;
    }

    return {
      r: Number.parseInt(normalized.slice(1, 3), 16),
      g: Number.parseInt(normalized.slice(3, 5), 16),
      b: Number.parseInt(normalized.slice(5, 7), 16),
    };
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;
    const lightness = (max + min) / 2;
    const saturation = delta === 0
      ? 0
      : delta / (1 - Math.abs(2 * lightness - 1));

    if (delta !== 0) {
      switch (max) {
        case red:
          hue = 60 * (((green - blue) / delta) % 6);
          break;
        case green:
          hue = 60 * ((blue - red) / delta + 2);
          break;
        default:
          hue = 60 * ((red - green) / delta + 4);
          break;
      }
    }

    if (hue < 0) {
      hue += 360;
    }

    return {
      h: Math.round(hue),
      s: Math.round(saturation * 100),
      l: Math.round(lightness * 100),
    };
  }

  private hslToHex(h: number, s: number, l: number): string {
    const saturation = s / 100;
    const lightness = l / 100;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const huePrime = h / 60;
    const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
    let red = 0;
    let green = 0;
    let blue = 0;

    if (huePrime >= 0 && huePrime < 1) {
      red = chroma;
      green = secondComponent;
    } else if (huePrime < 2) {
      red = secondComponent;
      green = chroma;
    } else if (huePrime < 3) {
      green = chroma;
      blue = secondComponent;
    } else if (huePrime < 4) {
      green = secondComponent;
      blue = chroma;
    } else if (huePrime < 5) {
      red = secondComponent;
      blue = chroma;
    } else {
      red = chroma;
      blue = secondComponent;
    }

    const match = lightness - chroma / 2;
    const toHex = (value: number) => Math.round((value + match) * 255).toString(16).padStart(2, '0');

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
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

    target?.focus();
  }

  private markTouched(): void {
    if (this.touched) {
      return;
    }

    this.touched = true;
    this.onTouched();
  }

  getContrastingTextColor(): string {
    const rgb = this.hexToRgb(this.selectedColor);
    if (!rgb) {
      return '#FFFFFF';
    }

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}
