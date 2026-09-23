import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AI_MODEL_OPTIONS, AiModelOption } from '../../config/ai-models.config';
import { AiChatSession, AiNavigatorMessage, AiNavigatorService, AiRouteSuggestion } from '../../services/ai-navigator.service';
import { AiProjectPipelineService } from '../../services/ai-project-pipeline.service';
import { filesToAiAttachments } from '../../utils/ai-attachment.util';
import { DialogService } from '../../services/dialog.service';
import { DateTimeUtil } from '../../utils/datetime.util';

@Component({
  selector: 'sic-ai-navigator',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './sic-ai-navigator.component.html',
  styleUrl: './sic-ai-navigator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicAiNavigatorComponent implements OnInit {
  protected readonly navSvc = inject(AiNavigatorService);
  protected readonly pipelineSvc = inject(AiProjectPipelineService);
  protected readonly translate = inject(TranslateService);
  private readonly dialog = inject(DialogService);

  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('chatTextarea') chatTextarea?: ElementRef<HTMLTextAreaElement>;

  inputText = '';
  readonly attachedFiles = signal<File[]>([]);
  readonly isDraggingFile = signal<boolean>(false);

  // Draggable FAB state
  readonly fabOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  readonly isFabDragging = signal<boolean>(false);
  readonly fabTransform = computed(() => {
    const { x, y } = this.fabOffset();
    return `translate3d(${x}px, ${y}px, 0)`;
  });
  private dragStartPointer = { x: 0, y: 0 };
  private dragStartOffset = { x: 0, y: 0 };
  private didDragMove = false;

  /** History panel and model dropdown are mutually exclusive - one tri-state signal instead of
   *  two booleans that each toggle method had to remember to clear on the other. */
  private readonly activePanel = signal<'history' | 'model' | null>(null);
  readonly showHistory = computed(() => this.activePanel() === 'history');
  readonly showModelSelect = computed(() => this.activePanel() === 'model');

  readonly availableModels: AiModelOption[] = AI_MODEL_OPTIONS;

  ngOnInit(): void {
    try {
      const saved = localStorage.getItem('sic_ai_fab_offset');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          this.fabOffset.set(parsed);
        }
      }
    } catch { /* ignore */ }
  }

  onFabPointerDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    this.startFabDrag(event.clientX, event.clientY);
  }

  onFabTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.startFabDrag(touch.clientX, touch.clientY);
    }
  }

  private startFabDrag(clientX: number, clientY: number): void {
    this.isFabDragging.set(true);
    this.didDragMove = false;
    this.dragStartPointer = { x: clientX, y: clientY };
    this.dragStartOffset = { ...this.fabOffset() };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const curX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const curY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const deltaX = curX - this.dragStartPointer.x;
      const deltaY = curY - this.dragStartPointer.y;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        this.didDragMove = true;
      }

      this.fabOffset.set({
        x: this.dragStartOffset.x + deltaX,
        y: this.dragStartOffset.y + deltaY,
      });
    };

    const onEnd = () => {
      this.isFabDragging.set(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);

      if (this.didDragMove) {
        try {
          localStorage.setItem('sic_ai_fab_offset', JSON.stringify(this.fabOffset()));
        } catch { /* ignore */ }
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  onFabClick(event: MouseEvent): void {
    if (this.didDragMove) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.toggle();
  }

  toggle(): void {
    this.navSvc.toggle();
    if (this.navSvc.isOpen()) {
      queueMicrotask(() => {
        this.scrollToEnd();
        this.autoResizeTextarea();
        this.chatTextarea?.nativeElement.focus();
      });
    }
  }

  close(): void {
    this.activePanel.set(null);
    this.navSvc.close();
  }

  toggleHistory(): void {
    this.activePanel.update((p) => (p === 'history' ? null : 'history'));
  }

  closeHistory(): void {
    this.activePanel.set(null);
  }

  toggleModelSelect(): void {
    this.activePanel.update((p) => (p === 'model' ? null : 'model'));
  }

  selectModel(modelId: string): void {
    this.navSvc.setModel(modelId);
    this.activePanel.set(null);
  }

  getCurrentModelLabel(): string {
    const currentId = this.navSvc.selectedModel();
    const found = this.availableModels.find((m) => m.id === currentId);
    return found ? found.name.split(' (')[0] : currentId;
  }

  startNewChat(): void {
    this.navSvc.createNewSession();
    this.activePanel.set(null);
    this.inputText = '';
    this.attachedFiles.set([]);
    this.resetTextareaHeight();
    queueMicrotask(() => {
      this.scrollToEnd();
      this.chatTextarea?.nativeElement.focus();
    });
  }

  onSelectSession(session: AiChatSession): void {
    this.navSvc.selectSession(session.id);
    this.activePanel.set(null);
    queueMicrotask(() => this.scrollToEnd());
  }

  onDeleteSession(event: Event, sessionId: string): void {
    event.stopPropagation();
    this.navSvc.deleteSession(sessionId);
  }

  onClearAllHistory(): void {
    this.dialog
      .confirm(this.translate.instant('AI_NAV_HISTORY'), this.translate.instant('AI_NAV_CONFIRM_CLEAR'))
      .then((ok) => {
        if (ok) {
          this.navSvc.clearAllHistory();
          this.activePanel.set(null);
        }
      });
  }

  triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.attachedFiles.update((existing) => [...existing, ...files]);
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.attachedFiles.update((files) => files.filter((_, i) => i !== index));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      this.attachedFiles.update((existing) => [...existing, ...files]);
    }
  }

  async send(): Promise<void> {
    const text = this.inputText;
    const currentFiles = this.attachedFiles();

    if (!text.trim() && currentFiles.length === 0) return;
    if (this.navSvc.isSending()) return;

    this.inputText = '';
    this.attachedFiles.set([]);
    this.resetTextareaHeight();

    let attachments = undefined;
    if (currentFiles.length > 0) {
      attachments = await filesToAiAttachments(currentFiles);
    }

    this.navSvc.sendMessage(text, attachments);
    queueMicrotask(() => this.scrollToEnd());
  }

  autoResizeTextarea(): void {
    const el = this.chatTextarea?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  private resetTextareaHeight(): void {
    const el = this.chatTextarea?.nativeElement;
    if (el) {
      el.style.height = 'auto';
    }
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) return;
    event.preventDefault();
    this.send();
  }

  selectRoute(route: AiRouteSuggestion): void {
    this.navSvc.goTo(route.path);
  }

  trackMsg(index: number, msg: AiNavigatorMessage): string {
    return msg.id || (index + '-' + msg.role + '-' + (msg.timestamp || ''));
  }

  trackSession(_index: number, session: AiChatSession): string {
    return session.id;
  }

  formatDate(isoStr?: string): string {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const today = new Date();
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      return isToday ? DateTimeUtil.formatDate(d, 'HH:mm') : DateTimeUtil.formatDate(d, 'D MMM');
    } catch {
      return '';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showModelSelect() && !target.closest('.ai-nav-model-wrapper')) {
      this.activePanel.set(null);
    }
    if (this.showHistory() && !target.closest('.ai-nav-history-panel') && !target.closest('.ai-nav-header-icon-btn')) {
      this.activePanel.set(null);
    }
  }

  openProjectWizard(prompt?: string): void {
    this.navSvc.close();
    this.pipelineSvc.openWizard(prompt || this.inputText || '');
  }

  private scrollToEnd(): void {
    this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
