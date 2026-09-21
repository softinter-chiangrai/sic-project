import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiNavigatorMessage, AiNavigatorService, AiRouteSuggestion } from '../../services/ai-navigator.service';

@Component({
  selector: 'sic-ai-navigator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-ai-navigator.component.html',
  styleUrl: './sic-ai-navigator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicAiNavigatorComponent {
  protected readonly navSvc = inject(AiNavigatorService);

  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;

  inputText = '';

  toggle(): void {
    this.navSvc.toggle();
  }

  close(): void {
    this.navSvc.close();
  }

  send(): void {
    const text = this.inputText;
    this.inputText = '';
    this.navSvc.sendMessage(text);
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
    return index + '-' + msg.role;
  }

  private scrollToEnd(): void {
    this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
