// src/app/core/component/sic-tiptap-editor/sic-tiptap-editor.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  forwardRef,
  signal,
  computed,
  effect,
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicTiptapEditorComponent),
      multi: true,
    },
  ],
})
export class SicTiptapEditorComponent implements ControlValueAccessor, OnDestroy {
  // ===== Inputs (signals) - เปลี่ยนเป็น public readonly =====
  readonly placeholder = signal<string>('กรอกรายละเอียด...');
  readonly disabled = signal<boolean>(false);
  readonly minHeight = signal<string>('150px');
  readonly maxHeight = signal<string>('500px');
  readonly errorMessages = signal<Record<string, string>>({});
  readonly touched = signal<boolean>(false);

  // ===== Input setters (ยังคงเดิม) =====
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

  // ===== Outputs =====
  @Output() contentChange = new EventEmitter<string>();
  @Output() imageUpload = new EventEmitter<File>();

  // ===== State =====
  content = signal<string>('');
  editorConfig = signal<AteEditorConfig>(this.buildDefaultConfig());

  // ===== Computed =====
  showError = computed(() => false);
  errorMessage = computed(() => null);

  // ===== ControlValueAccessor callbacks =====
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // เมื่อ placeholder เปลี่ยน ให้ rebuild config
    effect(() => {
      this.updateEditorConfig();
    });
  }

  ngOnDestroy(): void {
    // ไม่ต้องทำอะไรเพิ่ม
  }

  // ===== Editor Config =====
  private buildDefaultConfig(): AteEditorConfig {
    return {
      placeholder: this.placeholder(),
      toolbar: {
        ...ATE_DEFAULT_TOOLBAR_CONFIG,
      },
      showBubbleMenu: true,
      showCharacterCount: true,
    };
  }

  private updateEditorConfig(): void {
    this.editorConfig.set(this.buildDefaultConfig());
  }

  // ===== Editor Events =====
  onContentChange(html: string): void {
    this.content.set(html);
    this.onChange(html);
    this.contentChange.emit(html);
  }

  // ===== ControlValueAccessor Implementation =====
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

  // ===== Public Methods =====
  getContent(): string {
    return this.content();
  }

  getText(): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.content(), 'text/html');
    return doc.body.textContent || '';
  }

  getJSON(): any {
    return null;
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