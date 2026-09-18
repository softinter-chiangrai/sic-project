// src/app/core/component/sic-shortcut-help/sic-shortcut-help.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { KeyboardShortcutService } from '../../services/keyboard-shortcut.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'sic-shortcut-help',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './sic-shortcut-help.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicShortcutHelpComponent {
  protected readonly shortcutService = inject(KeyboardShortcutService);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const isHelpKey = (event.ctrlKey || event.metaKey) && event.key === '/';
    if (isHelpKey) {
      event.preventDefault();
      this.shortcutService.toggleHelp();
      return;
    }
    if (event.key === 'Escape' && this.shortcutService.isHelpOpen()) {
      this.shortcutService.closeHelp();
    }
  }

  close(): void {
    this.shortcutService.closeHelp();
  }
}
