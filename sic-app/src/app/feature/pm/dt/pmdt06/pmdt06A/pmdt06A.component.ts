// src/app/features/pmdt06/pmdt06A/pmdt06A.component.ts
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { Subject, takeUntil } from 'rxjs';
import type { ChatMessage } from '../diagram.model';
import { DiagramService } from '../diagram.service';

@Component({
  selector: 'app-pmdt06A',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './pmdt06A.component.html',
  styleUrls: ['./pmdt06A.component.css'],
})
export class pmdt06AComponent implements AfterViewInit, OnDestroy {
  @Input() diagramId!: string | null;
  @Output() aiResponse = new EventEmitter<any>();

  private diagramService = inject(DiagramService);
  private destroy$ = new Subject<void>();

  messages = signal<ChatMessage[]>([]);
  userInput = '';
  isLoading = signal(false);

  chatContainer = viewChild<ElementRef>('chatContainer');

  ngAfterViewInit() {
    if (this.diagramId) {
      this.loadChatHistory(this.diagramId);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChatHistory(diagramId: string) {
    this.diagramService
      .getChatHistory(diagramId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((history) => {
        this.messages.set(history);
        this.scrollToBottom();
      });
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading() || !this.diagramId) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      diagramId: this.diagramId,
      userId: 'current-user',
      role: 'user',
      content: this.userInput.trim(),
      createdAt: new Date().toISOString(),
    };
    this.messages.update((m) => [...m, userMessage]);
    const input = this.userInput.trim();
    this.userInput = '';
    this.isLoading.set(true);
    this.scrollToBottom();

    this.diagramService
      .sendChatMessage(this.diagramId, input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            diagramId: this.diagramId!,
            userId: 'system',
            role: 'assistant',
            content: response.message.content,
            contextData: response.message.contextData,
            createdAt: new Date().toISOString(),
          };
          this.messages.update((m) => [...m, assistantMsg]);
          this.isLoading.set(false);
          this.scrollToBottom();

          if (response.diagram) {
            this.aiResponse.emit({
              action: response.action || 'update',
              diagram: response.diagram,
            });
          }
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  clearChat() {
    if (!this.diagramId) return;
    this.diagramService
      .clearChatHistory(this.diagramId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.messages.set([]);
      });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = this.chatContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }
}
