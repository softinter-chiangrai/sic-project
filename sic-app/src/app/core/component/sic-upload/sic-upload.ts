import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { SicValidator } from '../../services/sic-validator';

export type SicUploadCategory = 'all' | 'image' | 'video' | 'document';
export type SicUploadStatus = 'queued' | 'uploading' | 'processing' | 'paused' | 'failed' | 'stopped' | 'completed';

export enum SicEntityState {
  Detached = 0,
  Unchanged = 1,
  Deleted = 2,
  Modified = 3,
  Added = 4,
}

export interface StorageUploadReference {
  state: SicEntityState;
  id: string;
  uploadGroupId?: string | null;
  isStreaming?: boolean;
  isActive?: boolean;
  fileName: string;
  contentType: string;
  fileSize: number;
  accessUrl: string;
  visibility: string;
}

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

export interface SicUploadItem {
  localId: string;
  file: File | null;
  fileName: string;
  size: number;
  contentType: string;
  progress: number;
  status: SicUploadStatus;
  uploadedBytes: number;
  sessionId: string | null;
  chunkSize: number;
  totalChunks: number;
  nextChunkIndex: number;
  activeRequest: XMLHttpRequest | null;
  abortMode: 'pause' | 'stop' | null;
  errorMessage: string | null;
  result: StorageUploadReference | null;
  downloadLoading: boolean;
  hideUploadState: boolean;
  completedStateTimer: ReturnType<typeof setTimeout> | null;
}

const fileCategoryMap: Record<SicUploadCategory, number> = {
  all: 2,
  image: 0,
  video: 1,
  document: 2,
};

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'avif']);
const videoExtensions = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'mpeg', 'mpg', 'ogv']);
const documentExtensions = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf']);

@Component({
  selector: 'sic-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-upload.html',
  styleUrl: './sic-upload.css',
  host: {
    ngSkipHydration: 'true',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicUpload),
      multi: true,
    },
  ],
})
export class SicUpload implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() multiple = true;
  @Input() category: SicUploadCategory = 'all';
  @Input() visibility: 1 | 2 | 3 | 4 = 1;
  @Input() uploadGroupId: string | null = null;
  @Input() chunkSize = 5 * 1024 * 1024;
  @Input() accept?: string;
  @Input() businessId?: string;
  @Input() emptyText = 'Drop files here or click to browse';
  @Input() helperText = 'Multiple files supported';
  @Input() errorMessages: Record<string, string> = {};
  readonly emptyTrackSrc = 'data:text/vtt;charset=utf-8,WEBVTT';

  @HostBinding('class.sic-upload-host') readonly hostClass = true;

  @ViewChild('fileInput') private readonly fileInput?: ElementRef<HTMLInputElement>;

  readonly items: SicUploadItem[] = [];
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  dragActive = false;
  touched = false;
  private readonly previewUrls = new Map<string, string>();
  private readonly previewLoadingIds = new Set<string>();

  private readonly injector = inject(Injector);
  private readonly authService = inject(AuthService);
  private readonly validator = inject(SicValidator);
  private readonly cdr = inject(ChangeDetectorRef);
  private ngControl: NgControl | null = null;
  private onChange: (value: StorageUploadReference[]) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy(): void {
    this.revokeAllPreviewUrls();

    for (const item of this.items) {
      this.clearCompletedStateTimer(item);
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

  get resolvedAccept(): string {
    if (this.accept) {
      return this.accept;
    }

    switch (this.category) {
      case 'all':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,image/*,video/*';
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      default:
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*';
    }
  }

  writeValue(value: StorageUploadReference[] | null | undefined): void {
    this.revokeAllPreviewUrls();

    for (const item of this.items) {
      this.clearCompletedStateTimer(item);
    }

    this.items.splice(0, this.items.length);

    for (const item of value ?? []) {
      const normalizedResult = this.normalizeUploadValue(item);

      this.items.push({
        localId: normalizedResult.id,
        file: null,
        fileName: normalizedResult.fileName,
        size: normalizedResult.fileSize,
        contentType: normalizedResult.contentType,
        progress: 100,
        status: 'completed',
        uploadedBytes: normalizedResult.fileSize,
        sessionId: null,
        chunkSize: this.chunkSize,
        totalChunks: 1,
        nextChunkIndex: 1,
        activeRequest: null,
        abortMode: null,
        errorMessage: null,
        result: normalizedResult,
        downloadLoading: false,
        hideUploadState: true,
        completedStateTimer: null,
      });
    }

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

  openPicker(): void {
    if (this.disabled || !this.isBrowser) {
      return;
    }

    this.fileInput?.nativeElement.click();
  }

  onFileSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) {
      return;
    }

    this.addFiles(Array.from(files));
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
  }

  onDrop(event: DragEvent): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.dragActive = false;

    const files = Array.from(event.dataTransfer?.files ?? []);
    if (!files.length) {
      return;
    }

    this.addFiles(files);
  }

  async pauseUpload(item: SicUploadItem): Promise<void> {
    if (item.status !== 'uploading') {
      return;
    }

    item.abortMode = 'pause';
    item.activeRequest?.abort();
  }

  async resumeUpload(item: SicUploadItem): Promise<void> {
    if (!item.file || this.disabled) {
      return;
    }

    if (item.sessionId) {
      const session = await this.getSessionStatus(item.sessionId);
      this.applySessionState(item, session);
    }

    void this.uploadItem(item);
  }

  async stopUpload(item: SicUploadItem): Promise<void> {
    item.abortMode = 'stop';

    if (item.activeRequest) {
      item.activeRequest.abort();
      return;
    }

    if (item.sessionId) {
      await this.cancelSession(item.sessionId);
    }

    this.resetStoppedItem(item);
  }

  async removeItem(item: SicUploadItem): Promise<void> {
    if (item.result) {
      item.result.state = SicEntityState.Deleted;
      item.hideUploadState = true;
      this.clearCompletedStateTimer(item);
      this.updateControlValue();
      this.revokePreviewUrl(item.localId);
      this.cdr.markForCheck();
      return;
    }

    if (item.status !== 'completed' && item.sessionId) {
      try {
        await this.cancelSession(item.sessionId);
      } catch {
        // Ignore cleanup errors when removing from the local list.
      }
    }

    const index = this.items.findIndex((candidate) => candidate.localId === item.localId);
    if (index >= 0) {
      this.clearCompletedStateTimer(item);
      this.items.splice(index, 1);
      this.updateControlValue();
      this.revokePreviewUrl(item.localId);
      this.cdr.markForCheck();
    }
  }

  canDownload(item: SicUploadItem): boolean {
    return !!(item.file || item.result);
  }

  shouldShowUploadState(item: SicUploadItem): boolean {
    return item.status !== 'completed' || !item.hideUploadState;
  }

  async downloadItem(item: SicUploadItem): Promise<void> {
    if (!this.canDownload(item)) {
      return;
    }

    item.downloadLoading = true;
    item.errorMessage = null;
    this.cdr.markForCheck();

    try {
      const blob = await this.getItemBlob(item);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = item.fileName;
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      item.errorMessage = this.resolveErrorMessage(error);
    } finally {
      item.downloadLoading = false;
      this.cdr.markForCheck();
    }
  }

  trackItem(index: number, item: SicUploadItem): string {
    return item.localId || `${index}`;
  }

  isSoftDeleted(item: SicUploadItem): boolean {
    return item.result?.state === SicEntityState.Deleted;
  }

  getPreviewUrl(item: SicUploadItem): string | null {
    if (!this.isImageItem(item) && !this.isVideoItem(item)) {
      return null;
    }

    const existingUrl = this.previewUrls.get(item.localId);
    if (existingUrl) {
      return existingUrl;
    }

    if (item.file) {
      const objectUrl = URL.createObjectURL(item.file);
      this.previewUrls.set(item.localId, objectUrl);
      return objectUrl;
    }

    if (item.result?.accessUrl && this.isBrowser && !this.previewLoadingIds.has(item.localId)) {
      this.previewLoadingIds.add(item.localId);
      void this.fetchBlob(item.result.accessUrl)
        .then((blob) => {
          if (this.previewUrls.has(item.localId)) {
            return;
          }

          const objectUrl = URL.createObjectURL(blob);
          this.previewUrls.set(item.localId, objectUrl);
          this.cdr.markForCheck();
        })
        .catch(() => {
          // keep fallback URL if authenticated preview fetch fails
        })
        .finally(() => {
          this.previewLoadingIds.delete(item.localId);
        });
    }

    return item.result?.accessUrl ?? null;
  }

  isImageItem(item: SicUploadItem): boolean {
    return this.resolveItemCategory(item) === 'image';
  }

  isVideoItem(item: SicUploadItem): boolean {
    return this.resolveItemCategory(item) === 'video';
  }

  isDocumentItem(item: SicUploadItem): boolean {
    return this.resolveItemCategory(item) === 'document';
  }

  formatSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  getFileBadgeLabel(item: SicUploadItem): string {
    const extension = this.getFileExtension(item.fileName);
    if (!extension) {
      if (item.contentType.startsWith('image/')) {
        return 'IMG';
      }

      if (item.contentType.startsWith('video/')) {
        return 'VID';
      }

      return 'FILE';
    }

    return extension.slice(0, 4).toUpperCase();
  }

  getFileBadgeIcon(item: SicUploadItem): string {
    const extension = this.getFileExtension(item.fileName);

    if (item.contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(extension)) {
      return 'bi-file-earmark-image';
    }

    if (item.contentType.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension)) {
      return 'bi-file-earmark-play';
    }

    if (extension === 'pdf') {
      return 'bi-file-earmark-pdf';
    }

    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return 'bi-file-earmark-text';
    }

    if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return 'bi-file-earmark-spreadsheet';
    }

    if (['ppt', 'pptx'].includes(extension)) {
      return 'bi-file-earmark-slides';
    }

    if (['zip', 'rar', '7z'].includes(extension)) {
      return 'bi-file-earmark-zip';
    }

    return 'bi-file-earmark';
  }

  statusLabel(item: SicUploadItem): string {
    switch (item.status) {
      case 'queued':
        return 'Queued';
      case 'uploading':
        return 'Uploading';
      case 'processing':
        return 'Processing';
      case 'paused':
        return 'Paused';
      case 'failed':
        return 'Failed';
      case 'stopped':
        return 'Stopped';
      case 'completed':
        return 'Completed';
      default:
        return item.status;
    }
  }

  protected addFiles(files: File[]): void {
    this.markTouched();

    const filteredFiles = this.filterAcceptedFiles(files);
    const acceptedFiles = this.multiple ? filteredFiles : filteredFiles.slice(0, 1);
    if (!this.multiple) {
      void Promise.all(this.items.map((item) => this.removeItem(item)));
    }

    for (const file of acceptedFiles) {
      const item: SicUploadItem = {
        localId: this.createLocalId(),
        file,
        fileName: file.name,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
        progress: 0,
        status: 'queued',
        uploadedBytes: 0,
        sessionId: null,
        chunkSize: this.chunkSize,
        totalChunks: Math.max(1, Math.ceil(file.size / this.chunkSize)),
        nextChunkIndex: 0,
        activeRequest: null,
        abortMode: null,
        errorMessage: null,
        result: null,
        downloadLoading: false,
        hideUploadState: false,
        completedStateTimer: null,
      };

      this.items.push(item);
      void this.uploadItem(item);
    }

    this.cdr.markForCheck();
  }

  private filterAcceptedFiles(files: File[]): File[] {
    switch (this.category) {
      case 'all':
        return files.filter((file) => this.resolveFileCategory(file) !== null);
      case 'image':
        return files.filter((file) => this.resolveFileCategory(file) === 'image');
      case 'video':
        return files.filter((file) => this.resolveFileCategory(file) === 'video');
      default:
        return files.filter((file) => this.resolveFileCategory(file) === 'document');
    }
  }

  private async uploadItem(item: SicUploadItem): Promise<void> {
    if (!item.file || item.status === 'uploading' || this.disabled) {
      return;
    }

    item.status = 'uploading';
    item.errorMessage = null;
    item.abortMode = null;
    item.hideUploadState = false;
    this.clearCompletedStateTimer(item);
    this.cdr.markForCheck();

    try {
      await this.ensureUploadSession(item);
      await this.uploadPendingChunks(item);
      await this.finalizeUpload(item);
    } catch (error) {
      await this.handleUploadFailure(item, error);
    }

    this.cdr.markForCheck();
  }

  private async createSession(file: File): Promise<SicUploadSessionState> {
    const resolvedCategory = this.resolveFileCategory(file);
    if (resolvedCategory === null) {
      throw new Error('This file type is not supported.');
    }

    return this.sendJsonRequest<SicUploadSessionState>('POST', this.buildSessionUrl(), {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      category: fileCategoryMap[resolvedCategory],
      visibility: this.visibility,
      uploadGroupId: this.uploadGroupId,
      chunkSize: this.chunkSize,
    });
  }

  private async getSessionStatus(sessionId: string): Promise<SicUploadSessionState> {
    return this.sendJsonRequest<SicUploadSessionState>('GET', this.buildSessionUrl(sessionId));
  }

  private async uploadChunk(item: SicUploadItem, chunkIndex: number, chunk: Blob): Promise<SicUploadSessionState> {
    if (!item.sessionId) {
      throw new Error('Upload session is missing.');
    }

    const formData = new FormData();
    formData.append('chunk', chunk, `${item.fileName}.part-${chunkIndex}`);

    return this.sendFormDataRequest<SicUploadSessionState>(
      'POST',
      `${this.buildSessionUrl(item.sessionId)}/chunks/${chunkIndex}`,
      formData,
      (event) => {
        item.progress = Math.min(100, Math.round(((item.uploadedBytes + event.loaded) / item.size) * 100));
        this.cdr.markForCheck();
      },
      item,
    );
  }

  private async completeSession(sessionId: string): Promise<StorageUploadReference> {
    return this.sendJsonRequest<StorageUploadReference>('POST', `${this.buildSessionUrl(sessionId)}/complete`, {});
  }

  private async cancelSession(sessionId: string): Promise<void> {
    await this.sendJsonRequest<void>('DELETE', this.buildSessionUrl(sessionId));
  }

  private applySessionState(item: SicUploadItem, state: SicUploadSessionState): void {
    item.sessionId = state.sessionId;
    item.chunkSize = state.chunkSize;
    item.totalChunks = state.totalChunks;
    item.nextChunkIndex = state.nextChunkIndex;
    item.uploadedBytes = state.uploadedBytes;
    item.progress = Math.min(100, Math.round((state.uploadedBytes / item.size) * 100));
  }

  private async ensureUploadSession(item: SicUploadItem): Promise<void> {
    if (item.sessionId || !item.file) {
      return;
    }

    const session = await this.createSession(item.file);
    this.applySessionState(item, session);
  }

  private async uploadPendingChunks(item: SicUploadItem): Promise<void> {
    while (item.nextChunkIndex < item.totalChunks) {
      if (item.status !== 'uploading' || !item.file) {
        return;
      }

      const chunkIndex = item.nextChunkIndex;
      const chunkStart = chunkIndex * item.chunkSize;
      const chunkEnd = Math.min(item.file.size, chunkStart + item.chunkSize);
      const chunk = item.file.slice(chunkStart, chunkEnd);
      const sessionState = await this.uploadChunk(item, chunkIndex, chunk);
      this.applySessionState(item, sessionState);
    }
  }

  private async finalizeUpload(item: SicUploadItem): Promise<void> {
    if (!item.sessionId) {
      throw new Error('Upload session was not initialized.');
    }

    item.status = 'processing';
    item.progress = 100;
    item.uploadedBytes = item.size;
    item.hideUploadState = false;
    this.cdr.markForCheck();

    const result = await this.completeSession(item.sessionId);
    item.result = {
      ...this.normalizeUploadValue(result),
      state: SicEntityState.Modified,
      isActive: true,
    };
    item.status = 'completed';
    item.progress = 100;
    item.uploadedBytes = item.size;
    item.activeRequest = null;
    item.abortMode = null;
    item.sessionId = null;
    item.hideUploadState = false;
    this.scheduleCompletedStateHide(item);
    this.updateControlValue();
  }

  private async handleUploadFailure(item: SicUploadItem, error: unknown): Promise<void> {
    item.activeRequest = null;

    if (item.abortMode === 'pause') {
      item.status = 'paused';
      this.clearCompletedStateTimer(item);
      item.hideUploadState = false;
      return;
    }

    if (item.abortMode === 'stop') {
      await this.cancelSessionQuietly(item.sessionId);
      this.resetStoppedItem(item);
      return;
    }

    item.status = 'failed';
    this.clearCompletedStateTimer(item);
    item.hideUploadState = false;
    item.errorMessage = this.resolveErrorMessage(error);
  }

  private async cancelSessionQuietly(sessionId: string | null): Promise<void> {
    if (!sessionId) {
      return;
    }

    try {
      await this.cancelSession(sessionId);
    } catch {
      // Ignore cleanup errors after stop.
    }
  }

  private resetStoppedItem(item: SicUploadItem): void {
    this.clearCompletedStateTimer(item);
    item.status = 'stopped';
    item.progress = 0;
    item.uploadedBytes = 0;
    item.sessionId = null;
    item.nextChunkIndex = 0;
    item.totalChunks = Math.max(1, Math.ceil(item.size / item.chunkSize));
    item.activeRequest = null;
    item.abortMode = null;
    item.result = null;
    item.errorMessage = null;
    item.downloadLoading = false;
    item.hideUploadState = false;
  }

  private updateControlValue(): void {
    const value = this.items
      .map((item) => item.result)
      .filter((item): item is StorageUploadReference => !!item)
      .map((item) => this.cloneUploadValue(item));

    this.onChange(value);
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

  private markTouched(): void {
    if (this.touched) {
      return;
    }

    this.touched = true;
    this.onTouched();
  }

  private createLocalId(): string {
    return this.isBrowser && typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  }

  private scheduleCompletedStateHide(item: SicUploadItem): void {
    this.clearCompletedStateTimer(item);

    item.completedStateTimer = setTimeout(() => {
      item.hideUploadState = true;
      item.completedStateTimer = null;
      this.cdr.markForCheck();
    }, 5000);
  }

  private clearCompletedStateTimer(item: SicUploadItem): void {
    if (!item.completedStateTimer) {
      return;
    }

    clearTimeout(item.completedStateTimer);
    item.completedStateTimer = null;
  }

  private getFileExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.trim().toLowerCase();
    return extension && extension !== fileName.toLowerCase() ? extension : '';
  }

  private resolveItemCategory(item: SicUploadItem): Exclude<SicUploadCategory, 'all'> {
    if (item.file) {
      return this.resolveFileCategory(item.file) ?? 'document';
    }

    return this.resolveCategoryFromMetadata(item.contentType, item.fileName) ?? 'document';
  }

  private resolveFileCategory(file: File): Exclude<SicUploadCategory, 'all'> | null {
    return this.resolveCategoryFromMetadata(file.type || 'application/octet-stream', file.name);
  }

  private resolveCategoryFromMetadata(contentType: string, fileName: string): Exclude<SicUploadCategory, 'all'> | null {
    const extension = this.getFileExtension(fileName);

    if (contentType.startsWith('image/') || imageExtensions.has(extension)) {
      return 'image';
    }

    if (contentType.startsWith('video/') || videoExtensions.has(extension)) {
      return 'video';
    }

    if (documentExtensions.has(extension) || (!contentType.startsWith('image/') && !contentType.startsWith('video/'))) {
      return 'document';
    }

    return null;
  }

  private hasExtension(fileName: string, allowedExtensions: string[]): boolean {
    const extension = fileName.split('.').pop()?.trim().toLowerCase() ?? '';
    return allowedExtensions.includes(extension);
  }

  private revokePreviewUrl(localId: string): void {
    const previewUrl = this.previewUrls.get(localId);
    if (!previewUrl) {
      return;
    }

    URL.revokeObjectURL(previewUrl);
    this.previewUrls.delete(localId);
    this.previewLoadingIds.delete(localId);
  }

  private revokeAllPreviewUrls(): void {
    for (const previewUrl of this.previewUrls.values()) {
      URL.revokeObjectURL(previewUrl);
    }

    this.previewUrls.clear();
    this.previewLoadingIds.clear();
  }

  private buildSessionUrl(sessionId?: string): string {
    const baseUrl = `${environment.apiBaseUrl}/api/storage/upload/sessions`;
    return sessionId ? `${baseUrl}/${sessionId}` : baseUrl;
  }

  private async getItemBlob(item: SicUploadItem): Promise<Blob> {
    if (item.file) {
      return item.file;
    }

    if (!item.result?.accessUrl) {
      throw new Error('No file is available for preview or download.');
    }

    return this.fetchBlob(item.result.accessUrl);
  }

  private fetchBlob(url: string): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      if (!this.isBrowser) {
        reject(new Error('Preview requires a browser environment.'));
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      this.applyRequestHeaders(xhr, false);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as Blob);
          return;
        }

        reject(new Error(this.readResponseError(xhr)));
      };

      xhr.onerror = () => reject(new Error('Network error while downloading the file.'));
      xhr.onabort = () => reject(new Error('The file request was aborted.'));
      xhr.send();
    });
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
          resolve(responseText ? JSON.parse(responseText) as T : (undefined as T));
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

  private sendFormDataRequest<T>(
    method: string,
    url: string,
    body: FormData,
    onProgress: ((event: ProgressEvent<EventTarget>) => void) | null,
    item: SicUploadItem,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.isBrowser) {
        reject(new Error('Uploads require a browser environment.'));
        return;
      }

      const xhr = new XMLHttpRequest();
      item.activeRequest = xhr;
      xhr.open(method, url, true);
      this.applyRequestHeaders(xhr, false);

      if (onProgress) {
        xhr.upload.onprogress = onProgress;
      }

      xhr.onload = () => {
        item.activeRequest = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as T);
          return;
        }

        reject(new Error(this.readResponseError(xhr)));
      };

      xhr.onerror = () => {
        item.activeRequest = null;
        reject(new Error('Network error while uploading.'));
      };

      xhr.onabort = () => {
        item.activeRequest = null;
        reject(new Error('Upload request was aborted.'));
      };

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
      xhr.setRequestHeader('X-Language-Code', languageCode === 'th' || languageCode === 'en' ? languageCode : 'en');
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

  private resolveErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Upload failed.';
  }
}