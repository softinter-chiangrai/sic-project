// src/app/features/pmdt06/pmdt06B/pmdt06B.component.ts
import { Component, Input, Output, EventEmitter, signal, OnChanges, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import type { DiagramModel } from '../diagram.model';

@Component({
  selector: 'app-pmdt06B',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pmdt06B.component.html',
  styleUrls: ['./pmdt06B.component.css']
})
export class Pmdt06BComponent implements OnChanges, OnDestroy {
  @Input() diagram: DiagramModel | null = null;
  @Output() diagramChange = new EventEmitter<DiagramModel>();

  private scriptSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // History for undo/redo
  private history: string[] = [];
  private historyIndex = -1;
  private maxHistory = 50;

  script = signal('');
  diagramName = '';
  diagramType = '';
  isDirty = signal(false);

  ngOnChanges() {
    if (this.diagram) {
      const newScript = this.diagram.mermaidScript || '';
      this.script.set(newScript);
      this.diagramName = this.diagram.name || '';
      this.diagramType = this.diagram.diagramType || '';
      this.isDirty.set(false);
      // Reset history with current script
      this.history = [newScript];
      this.historyIndex = 0;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.scriptSubject.complete();
  }

  onScriptChange(newScript: string) {
    this.script.set(newScript);
    this.isDirty.set(true);
    this.scriptSubject.next(newScript);

    // Add to history (only if changed)
    if (this.history[this.historyIndex] !== newScript) {
      // Trim history if we're not at the end (i.e., after undo)
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      this.history.push(newScript);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
      this.historyIndex = this.history.length - 1;
    }
  }

  onNameChange() {
    this.isDirty.set(true);
    this.emitDiagramChange(this.script());
  }

  private emitDiagramChange(script: string) {
    if (this.diagram) {
      this.diagramChange.emit({
        ...this.diagram,
        mermaidScript: script,
        name: this.diagramName,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  saveDiagram() {
    if (this.diagram && this.isDirty()) {
      this.emitDiagramChange(this.script());
      this.isDirty.set(false);
    }
  }

  // Format: simple trim lines and remove excessive whitespace
  formatCode() {
    const current = this.script();
    const lines = current.split('\n');
    const formatted = lines
      .map(line => line.trimEnd())   // remove trailing spaces
      .join('\n');
    if (formatted !== current) {
      this.script.set(formatted);
      this.onScriptChange(formatted);
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const prev = this.history[this.historyIndex];
      this.script.set(prev);
      this.isDirty.set(true);
      this.scriptSubject.next(prev);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const next = this.history[this.historyIndex];
      this.script.set(next);
      this.isDirty.set(true);
      this.scriptSubject.next(next);
    }
  }

  // ✅ แก้ HostListener ให้เช็ค event.key
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    // ใช้ ctrlKey หรือ metaKey (สำหรับ Mac)
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          this.saveDiagram();
          break;
        case 'z':
          event.preventDefault();
          this.undo();
          break;
        case 'y':
          event.preventDefault();
          this.redo();
          break;
        default:
          break;
      }
    }
  }
}