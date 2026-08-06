import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'sic-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-tag.component.html',
  styleUrl: './sic-tag.component.css',
})
export class SicTagComponent {
  @Input() color: 'primary' | 'success' | 'danger' | 'warning' | 'neutral' = 'neutral';
  @Input() closable = false;

  @Output() closed = new EventEmitter<void>();

  @HostBinding('class') get hostClasses() {
    return `sic-tag-host sic-tag--${this.color}`;
  }
}
