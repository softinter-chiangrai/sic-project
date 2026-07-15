import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

export interface SicBreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'sic-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-breadcrumb.component.html',
  styleUrl: './sic-breadcrumb.component.css',
})
export class SicBreadcrumbComponent {
  @Input() items: SicBreadcrumbItem[] = [];
  @Input() separator = '/';

  @Output() itemClick = new EventEmitter<SicBreadcrumbItem>();

  @HostBinding('class.sic-breadcrumb-host') readonly hostClass = true;
}
