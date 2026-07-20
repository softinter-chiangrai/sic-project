import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';

interface DiagramPage {
  id: string;
  name: string;
  xml: string; // xml เฉพาะหน้านั้น (รวม <diagram>...</diagram>)
}

@Component({
  selector: 'app-sql-export-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SicButtonComponent],
  template: `
    <div class="w-[min(92vw,40rem)] max-h-[80vh] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between border-b px-5 py-4" style="border-color: var(--border);">
        <h3 class="text-base font-semibold text-[var(--text-active)] flex items-center gap-2">
          <i class="bi bi-database-fill text-[var(--crm-primary)]"></i>
          Generate SQL
        </h3>
        <button type="button" class="text-[var(--text-muted)] hover:text-[var(--text-active)] transition-colors" (click)="close()">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4">
        <!-- Select Page -->
        <div>
          <label class="block text-sm font-medium text-[var(--text-active)] mb-1">Select Diagram Page</label>
          <select
            [(ngModel)]="selectedPageId"
            (change)="onPageChange()"
            class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]/20 focus:border-[var(--crm-primary)] appearance-none pr-8 transition-all"
          >
            @for (page of pages(); track page.id) {
              <option [value]="page.id">{{ page.name }}</option>
            }
          </select>
        </div>

        <!-- Vendor Selector -->
        <div>
          <label class="block text-sm font-medium text-[var(--text-active)] mb-1">Database Vendor</label>
          <select
            [(ngModel)]="vendor"
            class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]/20 focus:border-[var(--crm-primary)] appearance-none pr-8 transition-all"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
          </select>
        </div>

        <!-- Generate Button -->
        <div>
          <sic-button
            variant="primary"
            size="sm"
            [disabled]="loading() || !selectedPageId"
            (click)="generate()"
          >
            @if (loading()) {
              <i class="bi bi-arrow-repeat animate-spin"></i>
            } @else {
              <i class="bi bi-play-fill"></i>
            }
            {{ loading() ? 'Generating...' : 'Generate SQL' }}
          </sic-button>
        </div>

        <!-- SQL Output -->
        @if (sql()) {
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-[var(--text-active)]">Generated SQL</span>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="text-xs text-[var(--crm-primary)] hover:underline flex items-center gap-1"
                  (click)="copyToClipboard()"
                >
                  <i class="bi bi-clipboard"></i> Copy
                </button>
                <button
                  type="button"
                  class="text-xs text-[var(--crm-primary)] hover:underline flex items-center gap-1"
                  (click)="download()"
                >
                  <i class="bi bi-download"></i> Download .sql
                </button>
              </div>
            </div>
            <pre class="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm font-mono text-[var(--text)] overflow-auto max-h-60 whitespace-pre-wrap">{{ sql() }}</pre>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="border-t px-5 py-4 flex justify-end" style="border-color: var(--border);">
        <sic-button variant="secondary" size="sm" (click)="close()">Close</sic-button>
      </div>
    </div>
  `,
})
export class SqlExportDialogComponent implements OnInit {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  // รับ XML ทั้งไฟล์จาก parent
  @Input() xml: string = '';

  pages = signal<DiagramPage[]>([]);
  selectedPageId: string | null = null;
  vendor = 'postgresql';
  sql = signal<string>('');
  loading = signal(false);

  ngOnInit() {
    this.extractPages(this.xml);
    if (this.pages().length > 0) {
      this.selectedPageId = this.pages()[0].id;
    }
  }

  private extractPages(xml: string) {
  if (!xml) return;

  // ✅ ปรับ Regex ให้รองรับ:
  // 1. ช่องว่างก่อน/หลัง > 
  // 2. การจับคู่แบบ Non-greedy เพื่อไม่ให้จับข้ามหน้า
  const regex = /<diagram\b[^>]*>([\s\S]*?)<\/diagram>/g;
  const pages: DiagramPage[] = [];
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const fullTag = match[0];
    
    // ✅ ปรับ Regex ให้รองรับทั้ง Double Quote (") และ Single Quote (')
    // และรองรับช่องว่างรอบๆ เครื่องหมาย = 
    const idMatch = fullTag.match(/id\s*=\s*["']([^"']+)["']/i);
    const nameMatch = fullTag.match(/name\s*=\s*["']([^"']+)["']/i);

    const id = idMatch ? idMatch[1] : `page-${pages.length + 1}`;
    // ✅ Decode HTML entities ในชื่อหน้า (เช่น &amp; -> &)
    const rawName = nameMatch ? nameMatch[1] : `Page-${pages.length + 1}`;
    const name = this.decodeHtmlEntities(rawName);

    pages.push({ id, name, xml: fullTag });
  }

  // ✅ Fallback: ถ้า XML ไม่มีแท็ก <diagram> เลย (เช่น เป็น <mxGraphModel> เพียวๆ)
  if (pages.length === 0 && xml.trim().length > 0) {
    pages.push({ id: 'default', name: 'Default Page', xml });
  }

  this.pages.set(pages);
}

// ✅ ฟังก์ชันเสริมสำหรับ Decode ชื่อหน้าที่อาจมี HTML Entities
private decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

  onPageChange() {
    // เคลียร์ SQL เก่าเมื่อเปลี่ยนหน้า
    this.sql.set('');
  }

  generate() {
    if (!this.selectedPageId) {
      this.dialogService.warn('No page selected', 'Please select a diagram page.');
      return;
    }

    const selectedPage = this.pages().find(p => p.id === this.selectedPageId);
    if (!selectedPage) {
      this.dialogService.warn('Page not found', 'Selected page does not exist.');
      return;
    }

    this.loading.set(true);
    this.http.post<{ sql: string }>(
      `${environment.apiBaseUrl}/api/diagram/generate-sql`,
      { xml: selectedPage.xml, vendor: this.vendor }
    ).subscribe({
      next: (res) => {
        this.sql.set(res.sql);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.dialogService.error('Generation Failed', err.error?.message || 'Could not generate SQL.');
      }
    });
  }

  copyToClipboard() {
    const sql = this.sql();
    if (!sql) return;
    navigator.clipboard?.writeText(sql).then(() => {
      this.dialogService.success('Copied', 'SQL copied to clipboard.');
    }).catch(() => {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = sql;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      this.dialogService.success('Copied', 'SQL copied to clipboard.');
    });
  }

  download() {
    const sql = this.sql();
    if (!sql) return;
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema_${new Date().toISOString().slice(0,10)}.sql`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  close() {
    this.dialogService.close();
  }
}