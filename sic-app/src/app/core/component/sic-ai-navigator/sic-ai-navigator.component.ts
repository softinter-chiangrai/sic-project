import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AI_MODEL_OPTIONS, AiModelOption } from '../../config/ai-models.config';
import { AiChatSession, AiNavigatorMessage, AiNavigatorService, AiRouteSuggestion } from '../../services/ai-navigator.service';
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
export class SicAiNavigatorComponent {
  protected readonly navSvc = inject(AiNavigatorService);
  protected readonly translate = inject(TranslateService);
  private readonly dialog = inject(DialogService);

  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('chatTextarea') chatTextarea?: ElementRef<HTMLTextAreaElement>;

  inputText = '';
  readonly attachedFiles = signal<File[]>([]);
  readonly isDraggingFile = signal<boolean>(false);

  /** History panel and model dropdown are mutually exclusive - one tri-state signal instead of
   *  two booleans that each toggle method had to remember to clear on the other. */
  private readonly activePanel = signal<'history' | 'model' | null>(null);
  readonly showHistory = computed(() => this.activePanel() === 'history');
  readonly showModelSelect = computed(() => this.activePanel() === 'model');

  readonly availableModels: AiModelOption[] = AI_MODEL_OPTIONS;

  toggle(): void {
    this.navSvc.toggle();
    if (this.navSvc.isOpen()) {
      queueMicrotask(() => {
        this.scrollToEnd();
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

    let attachments = undefined;
    if (currentFiles.length > 0) {
      attachments = await filesToAiAttachments(currentFiles);
    }

    this.navSvc.sendMessage(text, attachments);
    queueMicrotask(() => this.scrollToEnd());
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

  private scrollToEnd(): void {
    this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
