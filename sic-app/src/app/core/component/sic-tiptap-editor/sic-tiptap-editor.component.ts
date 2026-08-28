// src/app/core/component/sic-tiptap-editor/sic-tiptap-editor.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  AngularTiptapEditorComponent,
  ATE_DEFAULT_TOOLBAR_CONFIG,
  AteEditorConfig,
} from '@flogeez/angular-tiptap-editor';

@Component({
  selector: 'sic-tiptap-editor',
  standalone: true,
  imports: [CommonModule, AngularTiptapEditorComponent],
  templateUrl: './sic-tiptap-editor.component.html',
  styleUrls: ['./sic-tiptap-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicTiptapEditorComponent),
      multi: true,
    },
  ],
})
export class SicTiptapEditorComponent implements ControlValueAccessor {
  // === Standard Component Inputs ===
  @Input() label?: string;
  @Input() hint?: string;
  @Input() required = false;

  // === Inputs (Aliases & original inputs) ===
  @Input() set placeholder(value: string) {
    this.placeholderState.set(value);
    this.updateEditorConfig();
  }
  @Input() set placeholderInput(value: string) {
    this.placeholderState.set(value);
    this.updateEditorConfig();
  }
  @Input() set disabled(value: boolean) {
    this.disabledState.set(value);
  }
  @Input() set disabledInput(value: boolean) {
    this.disabledState.set(value);
  }
  @Input() set minHeight(value: string) {
    this.minHeightState.set(value);
  }
  @Input() set minHeightInput(value: string) {
    this.minHeightState.set(value);
  }
  @Input() set maxHeight(value: string) {
    this.maxHeightState.set(value);
  }
  @Input() set maxHeightInput(value: string) {
    this.maxHeightState.set(value);
  }
  @Input() set errorMessages(value: Record<string, string>) {
    this.errorMessagesState.set(value);
  }
  @Input() set errorMessagesInput(value: Record<string, string>) {
    this.errorMessagesState.set(value);
  }
  @Input() set touched(value: boolean) {
    this.touchedState.set(value);
  }
  @Input() set touchedInput(value: boolean) {
    this.touchedState.set(value);
  }

  // === Full‑screen mode ===
  @Input() fullscreen: boolean = false;
  @Output() fullscreenClosed = new EventEmitter<void>();

  // === State ===
  placeholderState = signal<string>('กรอกรายละเอียด...');
  disabledState = signal<boolean>(false);
  minHeightState = signal<string>('150px');
  maxHeightState = signal<string>('500px');
  errorMessagesState = signal<Record<string, string>>({});
  touchedState = signal<boolean>(false);
  content = signal<string>('');
  editorConfig = signal<AteEditorConfig>(this.buildDefaultConfig());

  // === Computed ===
  showError = computed(() => {
    return this.touchedState() && Object.keys(this.errorMessagesState()).length > 0;
  });

  errorMessage = computed(() => {
    const msgs = this.errorMessagesState();
    const keys = Object.keys(msgs);
    return keys.length > 0 ? msgs[keys[0]] : null;
  });

  // === ControlValueAccessor ===
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => this.updateEditorConfig());
  }

  // === Config ===
  private buildDefaultConfig(): AteEditorConfig {
    return {
      placeholder: this.placeholderState(),
      toolbar: { ...ATE_DEFAULT_TOOLBAR_CONFIG },
      showBubbleMenu: true,
      showCharacterCount: true,
    };
  }

  private updateEditorConfig(): void {
    this.editorConfig.set(this.buildDefaultConfig());
  }

  // === Events ===
  onContentChange(html: string): void {
    this.content.set(html);
    this.onChange(html);
  }

  // เปิด Fullscreen (เรียกจาก template)
  openFullscreen(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.fullscreen = true;
  }

  // ปิด Fullscreen (เรียกจาก template)
  closeFullscreen(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.fullscreen = false;
    this.fullscreenClosed.emit();
  }

  // === ControlValueAccessor Implementation ===
  writeValue(value: any): void {
    this.content.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  // === Public Methods ===
  getContent(): string {
    return this.content();
  }

  getText(): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.content(), 'text/html');
    return doc.body.textContent || '';
  }

  isEmpty(): boolean {
    const html = this.content();
    return !html || html === '<p></p>' || html === '<p><br></p>';
  }

  setContent(html: string): void {
    this.writeValue(html);
  }

  clear(): void {
    this.writeValue('');
  }
}