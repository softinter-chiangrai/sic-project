import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

export interface SicTab {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'sic-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-tabs.component.html',
  styleUrl: './sic-tabs.component.css',
})
export class SicTabsComponent {
  @Input() tabs: SicTab[] = [];
  @Input() activeId?: string;

  @Output() activeIdChange = new EventEmitter<string>();

  @HostBinding('class.sic-tabs-host') readonly hostClass = true;

  selectTab(tab: SicTab): void {
    if (tab.disabled || tab.id === this.activeId) {
      return;
    }

    this.activeId = tab.id;
    this.activeIdChange.emit(tab.id);
  }

  handleKeydown(event: KeyboardEvent, index: number): void {
    const enabled = this.tabs.filter((t) => !t.disabled);

    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    event.preventDefault();
    const currentIdx = enabled.findIndex((t) => t.id === this.tabs[index].id);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = enabled[(currentIdx + delta + enabled.length) % enabled.length];

    if (next) {
      this.selectTab(next);
    }
  }
}
