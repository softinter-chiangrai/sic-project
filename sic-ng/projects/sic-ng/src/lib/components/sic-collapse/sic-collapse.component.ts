import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'sic-collapse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-collapse.component.html',
  styleUrl: './sic-collapse.component.css',
})
export class SicCollapseComponent {
  @Input() label = '';
  @Input() expanded = false;

  @Output() expandedChange = new EventEmitter<boolean>();

  @HostBinding('class.sic-collapse-host') readonly hostClass = true;
  @HostBinding('class.sic-collapse--expanded') get isExpanded() {
    return this.expanded;
  }

  toggle(): void {
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }
}
