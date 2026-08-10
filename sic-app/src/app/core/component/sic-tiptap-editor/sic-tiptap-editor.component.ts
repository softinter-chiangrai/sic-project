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
  // === Inputs (ยังคงเดิม) ===
  @Input() set placeholderInput(value: string) {
    this.placeholder.set(value);
    this.updateEditorConfig();
  }
  @Input() set disabledInput(value: boolean) {
    this.disabled.set(value);
  }
  @Input() set minHeightInput(value: string) {
    this.minHeight.set(value);
  }
  @Input() set maxHeightInput(value: string) {
    this.maxHeight.set(value);
  }
  @Input() set errorMessagesInput(value: Record<string, string>) {
    this.errorMessages.set(value);
  }
  @Input() set touchedInput(value: boolean) {
    this.touched.set(value);
  }

  // === ใหม่: Full‑screen mode (ควบคุมจากภายนอก) ===
  @Input() fullscreen: boolean = false;
  @Output() fullscreenClosed = new EventEmitter<void>();

  // === State ===
  placeholder = signal<string>('กรอกรายละเอียด...');
  disabled = signal<boolean>(false);
  minHeight = signal<string>('150px');
  maxHeight = signal<string>('500px');
  errorMessages = signal<Record<string, string>>({});
  touched = signal<boolean>(false);
  content = signal<string>('');
  editorConfig = signal<AteEditorConfig>(this.buildDefaultConfig());

  // === Computed สำหรับ showError ===
  showError = computed(() => {
    // ตรวจสอบว่า control ถูก touched หรือไม่ และมี error หรือไม่
    return this.touched() && Object.keys(this.errorMessages()).length > 0;
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
      placeholder: this.placeholder(),
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
  openFullscreen(): void {
    this.fullscreen = true;
  }

  // ปิด Fullscreen (เรียกจาก template)
  closeFullscreen(): void {
    this.fullscreen = false;
    this.fullscreenClosed.emit();
    // เมื่อปิด ให้ mark touched เพื่อแสดง error ถ้ามี
    this.onTouched();
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
    this.disabled.set(isDisabled);
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