import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { DialogService } from '../../services/dialog.service';
import { SicProfileCropper } from './sic-profile-cropper';
import { SicEntityState, StorageUploadReference } from '../sic-upload/sic-upload';

interface SicUploadSessionState {
  sessionId: string;
  uploadGroupId?: string | null;
  fileName: string;
  fileSize: number;
  contentType: string;
  category: number;
  visibility: number;
  chunkSize: number;
  totalChunks: number;
  nextChunkIndex: number;
  uploadedBytes: number;
  isCompleted: boolean;
}

@Component({
  selector: 'sic-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-profile.html',
  styleUrl: './sic-profile.css',
  host: {
    ngSkipHydration: 'true',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicProfile),
      multi: true,
    },
  ],
})
export class SicProfile implements ControlValueAccessor, OnInit, OnDestroy {
  readonly defaultImageSrc = 'images/profile.png';
  readonly defaultSize = '240px';
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly dialogService = inject(DialogService);
  private readonly authService = inject(AuthService);
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() src: string | null = 'images/profile.png';
  @Input() size: number | string | null = null;
  @Input() disabled = false;
  @Input() visibility: 1 | 2 | 3 | 4 = 1;
  @Input() uploadGroupId: string | null = null;
  @Input() chunkSize = 5 * 1024 * 1024;
  @Input() businessId?: string;
  @Output() imageChange = new EventEmitter<Blob>();

  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  preview: string | null = null;
  fileError: string | null = null;
  isLoading = false;

  private ngControl: NgControl | null = null;
  private localObjectUrl: string | null = null;
  private value: StorageUploadReference[] = [];
  private onChange: (value: StorageUploadReference[]) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy(): void {
    this.revokeLocalObjectUrl();
  }

  get displaySrc(): string {
    const activeValue = this.getActiveValue();
    return this.localObjectUrl ?? activeValue?.accessUrl ?? this.src ?? this.defaultImageSrc;
  }

  get avatarSize(): string {
    if (typeof this.size === 'number') {
      return `${this.size}px`;
    }

    if (typeof this.size === 'string' && this.size.trim()) {
      return this.size.trim();
    }

    return this.defaultSize;
  }

  writeValue(value: StorageUploadReference[] | null | undefined): void {
    this.value = (value ?? []).map((item) => this.cloneUploadValue(this.normalizeUploadValue(item)));
    this.revokeLocalObjectUrl();
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: StorageUploadReference[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  openFile(): void {
    if (this.isLoading || this.disabled || !this.isBrowser) {
      return;
    }

    this.markTouched();
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.fileError = 'Please choose an image file.';
      this.resetFileInput();
      this.cdr.markForCheck();
      return;
    }

    this.fileError = null;
    this.isLoading = true;
    this.cdr.markForCheck();

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      this.preview = typeof loadEvent.target?.result === 'string' ? loadEvent.target.result : null;

      if (!this.preview) {
        this.fileError = 'Unable to read the selected image.';
        this.isLoading = false;
        this.resetFileInput();
        this.cdr.markForCheck();
        return;
      }

      void this.openCropDialog();
      this.cdr.markForCheck();
    };

    reader.onerror = () => {
      this.fileError = 'Unable to read the selected image.';
      this.isLoading = false;
      this.resetFileInput();
      this.cdr.markForCheck();
    };

    reader.readAsDataURL(file);
  }

  async onCrop(croppedDataUrl: string): Promise<void> {
    this.preview = null;
    this.isLoading = true;
    this.fileError = null;
    this.cdr.markForCheck();

    try {
      const blob = await this.resizeImage(croppedDataUrl, 128, 128);
      const file = this.createProfileFile(blob);
      const uploadedValue = await this.uploadProfileFile(file);

      this.applyUploadedValue(uploadedValue);
      if (this.src) {
        URL.revokeObjectURL(this.src);
      }

      this.src = URL.createObjectURL(blob);
      this.imageChange.emit(blob);
      this.revokeLocalObjectUrl();
      this.localObjectUrl = URL.createObjectURL(blob);
    } catch {
      this.fileError = 'Unable to upload the selected image.';
    } finally {
      this.isLoading = false;
      this.resetFileInput();
      this.cdr.markForCheck();
    }
  }

  onCancelCrop(): void {
    this.preview = null;
    this.isLoading = false;
    this.resetFileInput();
    this.cdr.markForCheck();
  }

  resizeImage(dataUrl: string, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas rendering is unavailable.'));
          return;
        }

        ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Unable to process the selected image.'));
            return;
          }

          resolve(blob);
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Unable to process the selected image.'));
      img.src = dataUrl;
    });
  }

  private async openCropDialog(): Promise<void> {
    if (!this.preview) {
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    await this.dialogService.open({
      type: 'info',
      component: SicProfileCropper,
      componentInputs: {
        src: this.preview,
        onCropResult: (croppedDataUrl: string) => this.onCrop(croppedDataUrl),
        onCancelCrop: () => this.onCancelCrop(),
      },
    });
  }

  private createProfileFile(blob: Blob): File {
    return new File([blob], `profile-${Date.now()}.png`, { type: 'image/png' });
  }

  private async uploadProfileFile(file: File): Promise<StorageUploadReference> {
    const session = await this.createSession(file);
    let sessionState = session;

    let nextChunkIndex = sessionState.nextChunkIndex;
    while (nextChunkIndex < sessionState.totalChunks) {
      const chunkStart = nextChunkIndex * sessionState.chunkSize;
      const chunkEnd = Math.min(file.size, chunkStart + sessionState.chunkSize);
      const chunk = file.slice(chunkStart, chunkEnd);

      sessionState = await this.uploadChunk(sessionState.sessionId, nextChunkIndex, chunk, file.name);
      nextChunkIndex = sessionState.nextChunkIndex;
    }

    const result = await this.completeSession(sessionState.sessionId);
    return this.normalizeUploadValue(result);
  }

  private async createSession(file: File): Promise<SicUploadSessionState> {
    return this.sendJsonRequest<SicUploadSessionState>('POST', this.buildSessionUrl(), {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      category: 0,
      visibility: this.visibility,
      uploadGroupId: this.normalizeUploadGroupId(this.uploadGroupId),
      chunkSize: this.chunkSize,
    });
  }

  private async uploadChunk(
    sessionId: string,
    chunkIndex: number,
    chunk: Blob,
    fileName: string,
  ): Promise<SicUploadSessionState> {
    const formData = new FormData();
    formData.append('chunk', chunk, `${fileName}.part-${chunkIndex}`);

    return this.sendFormDataRequest<SicUploadSessionState>(
      'POST',
      `${this.buildSessionUrl(sessionId)}/chunks/${chunkIndex}`,
      formData,
    );
  }

  private async completeSession(sessionId: string): Promise<StorageUploadReference> {
    return this.sendJsonRequest<StorageUploadReference>(
      'POST',
      `${this.buildSessionUrl(sessionId)}/complete`,
      {},
    );
  }

  private applyUploadedValue(uploadedValue: StorageUploadReference): void {
    const nextValue = this.value.map((item) => {
      const cloned = this.cloneUploadValue(item);
      if (cloned.state !== SicEntityState.Deleted) {
        cloned.state = SicEntityState.Deleted;
        cloned.isActive = false;
      }
      return cloned;
    });

    nextValue.push({
      ...this.cloneUploadValue(uploadedValue),
      state: SicEntityState.Modified,
      isActive: true,
    });

    this.value = nextValue;
    this.onChange(this.value.map((item) => this.cloneUploadValue(item)));
  }

  private getActiveValue(): StorageUploadReference | null {
    for (let index = this.value.length - 1; index >= 0; index -= 1) {
      const item = this.value[index];
      if (item.state !== SicEntityState.Deleted && item.isActive !== false) {
        return item;
      }
    }

    return null;
  }

  private normalizeUploadValue(value: StorageUploadReference): StorageUploadReference {
    return {
      ...value,
      state: value.state ?? SicEntityState.Detached,
      isStreaming: value.isStreaming ?? false,
      isActive: value.isActive ?? true,
      uploadGroupId: value.uploadGroupId ?? null,
    };
  }

  private cloneUploadValue(value: StorageUploadReference): StorageUploadReference {
    return {
      state: value.state,
      id: value.id,
      uploadGroupId: value.uploadGroupId ?? null,
      isStreaming: value.isStreaming ?? false,
      isActive: value.isActive ?? true,
      fileName: value.fileName,
      contentType: value.contentType,
      fileSize: value.fileSize,
      accessUrl: value.accessUrl,
      visibility: value.visibility,
    };
  }

  private normalizeUploadGroupId(uploadGroupId: string | null): string | null {
    const value = uploadGroupId?.trim();
    return value ? value : null;
  }

  private buildSessionUrl(sessionId?: string): string {
    const baseUrl = `${environment.apiBaseUrl}/api/storage/upload/sessions`;
    return sessionId ? `${baseUrl}/${sessionId}` : baseUrl;
  }

  private sendJsonRequest<T>(method: string, url: string, body?: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.isBrowser) {
        reject(new Error('Uploads require a browser environment.'));
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      this.applyRequestHeaders(xhr, true);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const responseText = xhr.responseText;
          resolve(responseText ? (JSON.parse(responseText) as T) : (undefined as T));
          return;
        }

        reject(new Error(this.readResponseError(xhr)));
      };

      xhr.onerror = () => reject(new Error('Network error while uploading.'));
      xhr.onabort = () => reject(new Error('Upload request was aborted.'));

      if (body === undefined || method === 'GET' || method === 'DELETE') {
        xhr.send();
        return;
      }

      xhr.send(JSON.stringify(body));
    });
  }

  private sendFormDataRequest<T>(method: string, url: string, body: FormData): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.isBrowser) {
        reject(new Error('Uploads require a browser environment.'));
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      this.applyRequestHeaders(xhr, false);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as T);
          return;
        }

        reject(new Error(this.readResponseError(xhr)));
      };

      xhr.onerror = () => reject(new Error('Network error while uploading.'));
      xhr.onabort = () => reject(new Error('Upload request was aborted.'));

      xhr.send(body);
    });
  }

  private applyRequestHeaders(xhr: XMLHttpRequest, isJson: boolean): void {
    const accessToken = this.authService.getAccessToken();
    if (accessToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    }

    if (this.isBrowser) {
      const languageCode = localStorage.getItem('app-lang');
      xhr.setRequestHeader(
        'X-Language-Code',
        languageCode === 'th' || languageCode === 'en' ? languageCode : 'en',
      );
    }

    if (this.businessId) {
      xhr.setRequestHeader('X-Business-Id', this.businessId);
    }

    if (isJson) {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }
  }

  private readResponseError(xhr: XMLHttpRequest): string {
    try {
      const payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      return payload?.message || payload?.title || xhr.statusText || 'Upload failed.';
    } catch {
      return xhr.responseText || xhr.statusText || 'Upload failed.';
    }
  }

  private markTouched(): void {
    this.onTouched();
  }

  private resetFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private revokeLocalObjectUrl(): void {
    if (this.localObjectUrl) {
      URL.revokeObjectURL(this.localObjectUrl);
      this.localObjectUrl = null;
    }
  }
}
