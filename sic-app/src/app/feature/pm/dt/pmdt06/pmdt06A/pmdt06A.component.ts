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
import { DiagramService, PmChatResponse } from '../diagram.service';

@Component({
  selector: 'app-pmdt06A',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './pmdt06A.component.html',
  styleUrls: ['./pmdt06A.component.css'],
})
export class pmdt06AComponent implements AfterViewInit, OnDestroy {
  @Input() diagramId!: string | null;
  @Output() aiResponse = new EventEmitter<{ action: string; script?: string; name?: string; type?: string }>();

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
      .subscribe({
        next: (history) => {
          this.messages.set(history);
          this.scrollToBottom();
        },
        error: () => {
          // silent fail
        }
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
        next: (response: PmChatResponse) => {
          const assistantMsg: ChatMessage = {
            id: response.id || crypto.randomUUID(),
            diagramId: response.diagramId || this.diagramId!,
            userId: response.createdBy || 'system',
            role: response.role || 'assistant',
            content: response.content,
            contextData: response.contextData,
            createdAt: response.createdDate || new Date().toISOString(),
          };
          this.messages.update((m) => [...m, assistantMsg]);
          this.isLoading.set(false);
          this.scrollToBottom();

          const content = assistantMsg.content;
          const mermaidMatch = content.match(/```mermaid\s*([\s\S]*?)```/);
          if (mermaidMatch) {
            const script = mermaidMatch[1].trim();
            const nameMatch = content.match(/(?:name|title)\s*[:：]\s*(.+)/i);
            const name = nameMatch ? nameMatch[1].trim() : 'AI Generated Diagram';
            const type = this.detectDiagramType(script);
            this.aiResponse.emit({
              action: 'update',
              script,
              name,
              type,
            });
          } else {
            this.aiResponse.emit({ action: 'message' });
          }
        },
        error: (err) => {
          console.error('Chat error:', err);
          this.isLoading.set(false);
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            diagramId: this.diagramId!,
            userId: 'system',
            role: 'assistant',
            content: '❌ เกิดข้อผิดพลาด กรุณาลองใหม่',
            createdAt: new Date().toISOString(),
          };
          this.messages.update((m) => [...m, errorMsg]);
          this.scrollToBottom();
        },
      });
  }

  private detectDiagramType(script: string): string {
    const lower = script.toLowerCase().trim();
    if (lower.startsWith('sequence')) return 'Sequence';
    if (lower.startsWith('classdiagram')) return 'Class';
    if (lower.startsWith('erdiagram') || lower.startsWith('er')) return 'ER';
    if (lower.startsWith('state')) return 'State';
    if (lower.startsWith('journey')) return 'Journey';
    if (lower.startsWith('mindmap')) return 'Mindmap';
    if (lower.startsWith('timeline')) return 'Timeline';
    if (lower.startsWith('requirement')) return 'Requirement';
    if (lower.startsWith('c4')) return 'C4';
    if (lower.startsWith('git')) return 'Git Graph';
    if (lower.startsWith('pie')) return 'Pie';
    if (lower.startsWith('gantt')) return 'Gantt';
    if (lower.includes('graph') || lower.includes('flowchart')) return 'Flowchart';
    return 'Flowchart';
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