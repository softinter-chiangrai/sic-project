import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';

export interface SicUploadProgress {
  file: File;
  percent: number;
}

@Component({
  selector: 'sic-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-upload.component.html',
  styleUrl: './sic-upload.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicUploadComponent),
      multi: true,
    },
  ],
})
export class SicUploadComponent extends SicFormControlBase<File[]> {
  @Input() accept = '*';
  @Input() multiple = true;
  @Input() maxSizeMb = 10;

  @Output() progress = new EventEmitter<SicUploadProgress>();
  @Output() rejected = new EventEmitter<File[]>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  @HostBinding('class.sic-upload-host') readonly hostClass = true;

  override value: File[] = [];
  dragOver = false;

  override writeValue(value: File[] | null | undefined): void {
    this.value = value ?? [];
  }

  openPicker(): void {
    if (!this.disabled) {
      this.fileInput?.nativeElement.click();
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;

    if (!this.disabled) {
      this.addFiles(event.dataTransfer?.files ?? null);
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  handleDragLeave(): void {
    this.dragOver = false;
  }

  removeFile(file: File): void {
    this.value = this.value.filter((f) => f !== file);
    this.onChange(this.value);
    this.markTouched();
  }

  private addFiles(fileList: FileList | null): void {
    if (!fileList) {
      return;
    }

    const incoming = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: File[] = [];

    for (const file of incoming) {
      if (file.size > this.maxSizeMb * 1024 * 1024) {
        rejected.push(file);
        continue;
      }
      accepted.push(file);
    }

    if (rejected.length) {
      this.rejected.emit(rejected);
    }

    this.value = this.multiple ? [...this.value, ...accepted] : accepted.slice(0, 1);
    this.onChange(this.value);
    this.markTouched();

    for (const file of accepted) {
      this.progress.emit({ file, percent: 100 });
    }
  }
}
