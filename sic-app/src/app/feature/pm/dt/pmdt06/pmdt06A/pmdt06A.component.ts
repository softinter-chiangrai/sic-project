// src/app/feature/pm/dt/pmdt06/pmdt06A/pmdt06A.component.ts

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  inject,
  signal,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { Subject, takeUntil } from 'rxjs';
import type { ChatMessage } from '../diagram.model';
import { DiagramService, PmChatResponse } from '../diagram.service';
import { DialogService } from '../../../../../core/services/dialog.service';


@Component({
  selector: 'app-pmdt06A',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './pmdt06A.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./pmdt06A.component.css'],
})
export class pmdt06AComponent implements AfterViewInit, OnDestroy {
  private _diagramId: string | null = null;
  @Input()
  set diagramId(value: string | null) {
    if (value && value !== this._diagramId) {
      this._diagramId = value;
      this.loadChatHistory(value);
    } else if (!value) {
      this._diagramId = null;
      this.messages.set([]);
    }
  }
  get diagramId(): string | null {
    return this._diagramId;
  }

  private diagramService = inject(DiagramService);
  private dialogService = inject(DialogService);
  private destroy$ = new Subject<void>();

  messages = signal<ChatMessage[]>([]);
  userInput = '';
  isLoading = signal(false);
  // ✅ เพิ่ม signal เก็บสถานะการคัดลอกของแต่ละข้อความ (key = message.id)
  copiedStatus = signal<Record<string, boolean>>({});

  chatContainer = viewChild<ElementRef>('chatContainer');

  ngAfterViewInit() {
    // Nothing extra needed
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChatHistory(diagramId: string) {
    if (!diagramId) return;
    this.diagramService
      .getChatHistory(diagramId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.messages.set(history);
          this.scrollToBottom();
        },
        error: () => {
          console.warn('Failed to load chat history for diagram:', diagramId);
          this.messages.set([]);
        },
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
          // No automatic import anymore
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

  // ฟังก์ชันดึง Mermaid code จากข้อความ
  getMermaidCode(content: string): string | null {
    const match = content.match(/```mermaid\s*([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  }

  // ✅ ฟังก์ชันคัดลอก Mermaid code (รับ messageId ด้วย)
  copyMermaidCode(content: string, messageId: string): void {
    const code = this.getMermaidCode(content);
    if (!code) return;

    // ฟังก์ชันที่เรียกเมื่อคัดลอกสำเร็จ
    const markAsCopied = () => {
      this.copiedStatus.update((status) => ({ ...status, [messageId]: true }));
      // เปลี่ยนกลับเป็น false หลังจาก 2 วินาที
      setTimeout(() => {
        this.copiedStatus.update((status) => ({ ...status, [messageId]: false }));
      }, 2000);
    };

    // ใช้ Clipboard API ถ้ารองรับ
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(code)
        .then(() => markAsCopied())
        .catch(() => this.fallbackCopy(code, markAsCopied));
    } else {
      // fallback สำหรับเบราว์เซอร์ที่ไม่รองรับ Clipboard API
      this.fallbackCopy(code, markAsCopied);
    }
  }

  // ✅ fallback copy (รับ callback เมื่อสำเร็จ)
  private fallbackCopy(text: string, onSuccess?: () => void): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (onSuccess) onSuccess();
    } catch (e) {
      console.warn('Copy failed', e);
    }
    textarea.remove();
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