import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { SicSidebarItem } from './sic-sidebar.model';

@Component({
  selector: 'sic-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-sidebar.component.html',
  styleUrl: './sic-sidebar.component.css',
})
export class SicSidebarComponent {
  @Input() items: SicSidebarItem[] = [];
  @Input() collapsed = false;
  @Input() activeLink?: string;

  @Output() itemSelect = new EventEmitter<SicSidebarItem>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  @HostBinding('class.sic-sidebar-host') readonly hostClass = true;
  @HostBinding('class.sic-sidebar--collapsed') get isCollapsed() {
    return this.collapsed;
  }

  expandedLabels = new Set<string>();

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  toggleExpand(item: SicSidebarItem): void {
    if (this.expandedLabels.has(item.label)) {
      this.expandedLabels.delete(item.label);
    } else {
      this.expandedLabels.add(item.label);
    }
  }

  isExpanded(item: SicSidebarItem): boolean {
    return this.expandedLabels.has(item.label);
  }

  selectItem(item: SicSidebarItem): void {
    if (item.children?.length) {
      this.toggleExpand(item);
      return;
    }

    this.itemSelect.emit(item);
  }
}
