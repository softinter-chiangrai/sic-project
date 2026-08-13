// sic-specification-preview.component.ts
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface SpecificationPreviewData {
  specificationCode: string;
  title: string;
  module?: string;
  priority?: string;
  owner?: string;
  estimatedManday?: number;
  description: string;  // HTML content
  version: string;
  status: string;
  createdBy?: string;
  createdAt?: string;
  uploadGroupId?: string;
}

@Component({
  selector: 'sic-specification-preview',
  template: `
    <div class="spec-preview">
      <div class="spec-preview__header">
        <div class="spec-preview__badge">
          <span class="badge badge--code">{{ data.specificationCode }}</span>
          <span class="badge" [class]="'badge--' + getStatusClass(data.status)">{{ getStatusText(data.status) }}</span>
          <span class="badge badge--version">v{{ data.version }}</span>
        </div>
        <h1 class="spec-preview__title">{{ data.title }}</h1>
        <div class="spec-preview__meta">
          <span><i class="bi bi-person"></i> {{ data.owner || '-' }}</span>
          <span><i class="bi bi-calendar3"></i> {{ data.createdAt | sicDate : null : 'DD/MM/YYYY HH:mm' }}</span>
          <span><i class="bi bi-tag"></i> {{ data.priority || 'Medium' }}</span>
          <span><i class="bi bi-clock"></i> {{ data.estimatedManday || 0 }} Manday</span>
        </div>
      </div>
      <div class="spec-preview__body">
        <div class="content-body" [innerHTML]="sanitizeHtml(data.description)"></div>
      </div>
      <div class="spec-preview__footer">
        <span>เอกสารนี้ใช้เพื่อการตรวจสอบและอนุมัติ</span>
        <span>สร้างเมื่อ {{ data.createdAt | sicDate : null : 'DD/MM/YYYY HH:mm' }}</span>
      </div>
    </div>
  `,
  styles: [...]
})
export class SicSpecificationPreviewComponent {
  @Input() data!: SpecificationPreviewData;
  private sanitizer = inject(DomSanitizer);
  sanitizeHtml(html: string) { return this.sanitizer.bypassSecurityTrustHtml(html); }
  // ... methods
}