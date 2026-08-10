import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService, BreadcrumbItem } from '../../services/breadcrumb.service';

export interface SicBreadcrumbItem {
  label: string;
  link?: string;
  url?: string | null;
  icon?: string;
  isCurrent?: boolean;
}

@Component({
  selector: 'sic-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sic-breadcrumb.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sic-breadcrumb.component.css',
})
export class SicBreadcrumbComponent {
  private readonly breadcrumbService = inject(BreadcrumbService);

  @Input() items?: SicBreadcrumbItem[];
  @Input() separator = '/';

  @Output() itemClick = new EventEmitter<SicBreadcrumbItem>();

  @HostBinding('class.sic-breadcrumb-host') readonly hostClass = true;

  get displayItems(): SicBreadcrumbItem[] {
    if (this.items && this.items.length > 0) {
      return this.items;
    }
    return this.breadcrumbService.breadcrumbs().map((item) => ({
      label: item.label,
      link: item.url ?? undefined,
      url: item.url,
      icon: item.icon,
      isCurrent: item.isCurrent,
    }));
  }
}
