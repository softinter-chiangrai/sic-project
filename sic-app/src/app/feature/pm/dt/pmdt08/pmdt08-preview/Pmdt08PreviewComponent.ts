// src/app/feature/pm/dt/pmdt08/pmdt08-preview/pmdt08-preview.component.ts

import { Component, Input, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SicDatePipe } from '../../../../../core/pipes/sic-date.pipe';
import { PmSpecificationModel } from '../pmdt08.model';


@Component({
    selector: 'sic-specification-preview',
    standalone: true,
    imports: [CommonModule, SicDatePipe],
    template: `
    <div class="spec-preview">
      <div class="spec-preview__header">
        <div class="spec-preview__badge">
          <span class="badge badge--code">{{ data.specificationCode }}</span>
          <span class="badge" [class]="'badge--' + getStatusClass(data.status)">
            {{ getStatusText(data.status) }}
          </span>
          <span class="badge badge--version">v{{ data.version }}</span>
        </div>
        <h1 class="spec-preview__title">{{ data.title }}</h1>
        <div class="spec-preview__meta">
          <span><i class="bi bi-person"></i> {{ data.createdBy || '-' }}</span>
          <span><i class="bi bi-calendar3"></i> {{ data.createdAt | sicDate : null : 'DD/MM/YYYY HH:mm' }}</span>
          <span><i class="bi bi-briefcase"></i> {{ data.projectName || '-' }}</span>
          <span><i class="bi bi-tag"></i> {{ data.priority || 'Medium' }}</span>
          <span><i class="bi bi-person-badge"></i> {{ data.owner || '-' }}</span>
        </div>
      </div>

      <div class="spec-preview__body">
        <div class="spec-preview__section">
          <h3 class="section-title">📋 ข้อมูลทั่วไป</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">โมดูล</span>
              <span class="info-value">{{ data.module || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Manday โดยประมาณ</span>
              <span class="info-value">{{ data.estimatedManday || 0 }} วัน</span>
            </div>
            <div class="info-item">
              <span class="info-label">สถานะ</span>
              <span class="info-value" [class]="'status--' + getStatusClass(data.status)">
                {{ getStatusText(data.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="spec-preview__section">
          <h3 class="section-title">📝 รายละเอียด Specification</h3>
          <div class="content-body" [innerHTML]="sanitizeHtml(data.description)"></div>
        </div>
      </div>

      <div class="spec-preview__footer">
        <span class="text-muted">เอกสารนี้ใช้เพื่อการตรวจสอบและอนุมัติ</span>
        <span class="text-muted">สร้างเมื่อ {{ data.createdAt | sicDate : null : 'DD/MM/YYYY HH:mm' }}</span>
      </div>
    </div>
  `,
    styles: [`
    .spec-preview {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
      font-family: 'Sarabun', system-ui, sans-serif;
    }
    .spec-preview__header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .spec-preview__badge {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .badge--code {
      background: color-mix(in srgb, var(--crm-primary) 12%, transparent);
      color: var(--crm-primary);
      font-family: monospace;
    }
    .badge--version {
      background: var(--sidebar-hover);
      color: var(--text-muted);
    }
    .badge--draft { background: #f3f4f6; color: #6b7280; }
    .badge--review { background: #dbeafe; color: #2563eb; }
    .badge--approved { background: #d1fae5; color: #065f46; }
    .badge--released { background: #fef3c7; color: #92400e; }
    .spec-preview__title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-active);
      margin: 0 0 0.5rem 0;
    }
    .spec-preview__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .spec-preview__meta i { margin-right: 0.25rem; }
    .spec-preview__body {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .section-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-active);
      margin: 0 0 0.75rem 0;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--border);
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
    }
    .info-value {
      font-size: 0.9rem;
      color: var(--text-active);
    }
    .content-body {
      font-size: 0.95rem;
      line-height: 1.8;
      color: var(--text);
    }
    .content-body h1, .content-body h2, .content-body h3 {
      color: var(--text-active);
      margin: 0.75rem 0 0.5rem 0;
    }
    .content-body p { margin: 0 0 0.5rem 0; }
    .content-body ul, .content-body ol { padding-left: 1.5rem; margin: 0.5rem 0; }
    .content-body img { max-width: 100%; border-radius: 0.5rem; }
    .content-body blockquote {
      border-left: 3px solid var(--crm-primary);
      padding-left: 1rem;
      margin: 0.5rem 0;
      color: var(--text-muted);
    }
    .spec-preview__footer {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .text-muted { color: var(--text-muted); }
  `]
})
export class Pmdt08PreviewComponent implements OnChanges {
    @Input() data!: PmSpecificationModel;
    private sanitizer = inject(DomSanitizer);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {}
    }

    sanitizeHtml(html: string | null | undefined): SafeHtml {
        if (!html) return '';
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    getStatusClass(status?: string): string {
        const map: Record<string, string> = {
            Draft: 'draft',
            Review: 'review',
            Approved: 'approved',
            Released: 'released'
        };
        return map[status || 'Draft'] || 'draft';
    }

    getStatusText(status?: string): string {
        const map: Record<string, string> = {
            Draft: 'ร่าง',
            Review: 'ตรวจสอบ',
            Approved: 'อนุมัติ',
            Released: 'เผยแพร่'
        };
        return map[status || 'Draft'] || status || 'ร่าง';
    }
}