// src/app/feature/pm/dt/pmdt05/sql-export-dialog.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { DialogService } from '../../../../core/services/dialog.service';

import { DiagramPage } from './pmdt05.model';

export interface DiagramSqlHistoryItem {
  id: string;
  tabId: string;
  pageName: string;
  versionNo: number;
  generationType: 'FULL' | 'MIGRATION';
  vendor: string;
  engine: string;
  summaryNote?: string;
  generatedSql: string;
  createdAt: string;
  createdBy?: string;
}

@Component({
  selector: 'app-sql-export-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SicButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div
      class="w-[min(94vw,46rem)] max-h-[88vh] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl flex flex-col"
    >
      <!-- Header with Tabs -->
      <div
        class="border-b px-5 pt-4 pb-0 flex flex-col gap-3"
        style="border-color: var(--border);"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-[var(--text-active)] flex items-center gap-2">
            <i class="bi bi-database-fill text-[var(--crm-primary)]"></i>
            ER Diagram SQL Generator
          </h3>
          <button
            type="button"
            class="text-[var(--text-muted)] hover:text-[var(--text-active)] transition-colors"
            (click)="close()"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex gap-4 border-b border-[var(--border)]">
          <button
            type="button"
            class="pb-2.5 text-sm font-medium transition-all relative flex items-center gap-1.5"
            [ngClass]="
              activeTab() === 'generate'
                ? 'text-[var(--crm-primary)] font-semibold border-b-2 border-[var(--crm-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-active)]'
            "
            (click)="activeTab.set('generate')"
          >
            <i class="bi bi-lightning-charge-fill"></i>
            Generate SQL
          </button>
          <button
            type="button"
            class="pb-2.5 text-sm font-medium transition-all relative flex items-center gap-1.5"
            [ngClass]="
              activeTab() === 'history'
                ? 'text-[var(--crm-primary)] font-semibold border-b-2 border-[var(--crm-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-active)]'
            "
            (click)="openHistoryTab()"
          >
            <i class="bi bi-clock-history"></i>
            History Log
            @if (histories().length > 0) {
              <span class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] font-bold">
                {{ histories().length }}
              </span>
            }
          </button>
        </div>
      </div>

      <!-- Tab: Generate SQL -->
      @if (activeTab() === 'generate') {
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <!-- Select Page & Vendor Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--text-active)] mb-1"
                >Select ER Diagram Page</label
              >
              <select
                [(ngModel)]="selectedPageId"
                (change)="onPageChange()"
                class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]/20 focus:border-[var(--crm-primary)] appearance-none pr-8 transition-all"
              >
                @for (page of pages(); track page.id) {
                  <option [value]="page.id">{{ page.name }}</option>
                }
              </select>
              @if (pages().length === 0) {
                <p class="text-xs text-[var(--text-muted)] mt-1">
                  ไม่พบ ER Diagram (ชื่อหน้าต้องมีคำว่า ER, er, database, schema)
                </p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-[var(--text-active)] mb-1"
                >Database Vendor</label
              >
              <select
                [(ngModel)]="vendor"
                class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]/20 focus:border-[var(--crm-primary)] appearance-none pr-8 transition-all"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>
          </div>

          <!-- Smart Mode Banner -->
          <div class="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)]/30 space-y-2">
            @if (histories().length === 0) {
              <div class="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <i class="bi bi-stars text-lg"></i>
                <div>
                  <span class="block text-sm font-semibold">Initial Setup Mode (v1)</span>
                  <span class="block text-xs text-[var(--text-muted)]">
                    ระบบจะสร้าง Full Database Schema (CREATE TABLE) สำหรับเริ่มต้นโปรเจกต์
                  </span>
                </div>
              </div>
            } @else {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5 text-[var(--crm-primary)]">
                  <i class="bi bi-arrow-repeat text-lg"></i>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold">Auto Migration Mode (v{{ histories()[0].versionNo + 1 }})</span>
                      <span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[var(--crm-primary)]/10 text-[var(--crm-primary)]">
                        อิงจากประวัติทั้งหมด v1 - v{{ histories()[0].versionNo }}
                      </span>
                    </div>
                    <span class="block text-xs text-[var(--text-muted)] mt-0.5">
                      ระบบจะนำประวัติ Script ทั้งหมดที่เคยรันมาวิเคราะห์ เพื่อเจนเฉพาะคำสั่ง ALTER TABLE / ADD COLUMN ใหม่ให้โดยไม่พังข้อมูลเดิม
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Engine Selection (Parser vs AI) -->
          <div class="flex items-center justify-between p-3 rounded-lg border border-[var(--border)]">
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-[var(--text-active)]">Engine:</span>
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" value="ai" [(ngModel)]="engine" />
                <span><i class="bi bi-stars text-amber-500"></i> AI (Smart types & constraints)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" value="parser" [(ngModel)]="engine" />
                <span>Parser (Direct XML)</span>
              </label>
            </div>

            <sic-button
              variant="primary"
              size="sm"
              [disabled]="loading() || !selectedPageId"
              (click)="generate()"
            >
              @if (loading()) {
                <i class="bi bi-arrow-repeat animate-spin mr-1"></i> Generating...
              } @else {
                <i class="bi bi-play-fill mr-1"></i> Generate SQL
              }
            </sic-button>
          </div>

          <!-- SQL Output Display -->
          @if (sql()) {
            <div class="space-y-2 pt-2 border-t border-[var(--border)]">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-[var(--text-active)]">Generated SQL Result</span>
                  @if (lastGeneratedVersion()) {
                    <span class="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      v{{ lastGeneratedVersion() }} (Saved)
                    </span>
                  }
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="text-xs px-2.5 py-1 rounded bg-[var(--bg-muted)] text-[var(--crm-primary)] hover:bg-[var(--crm-primary)]/10 font-medium flex items-center gap-1 transition-all"
                    (click)="copyToClipboard(sql())"
                  >
                    <i class="bi" [ngClass]="copied() ? 'bi-check-lg text-emerald-500' : 'bi-clipboard'"></i>
                    <span [ngClass]="copied() ? 'text-emerald-500 font-semibold' : ''">{{ copied() ? 'Copied!' : 'Copy' }}</span>
                  </button>
                  <button
                    type="button"
                    class="text-xs px-2.5 py-1 rounded bg-[var(--bg-muted)] text-[var(--crm-primary)] hover:bg-[var(--crm-primary)]/10 font-medium flex items-center gap-1 transition-all"
                    (click)="downloadSql(sql(), 'generated_schema')"
                  >
                    <i class="bi bi-download"></i> Download .sql
                  </button>
                </div>
              </div>
              <pre
                class="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)]/20 text-xs font-mono text-[var(--text)] overflow-auto max-h-64 whitespace-pre-wrap select-all"
                >{{ sql() }}</pre
              >
            </div>
          }
        </div>
      }

      <!-- Tab: History Log -->
      @if (activeTab() === 'history') {
        <div class="flex-1 overflow-y-auto p-5 space-y-3">
          @if (loadingHistory()) {
            <div class="py-12 text-center text-[var(--text-muted)] flex flex-col items-center gap-2">
              <i class="bi bi-arrow-repeat animate-spin text-2xl text-[var(--crm-primary)]"></i>
              <span class="text-sm">Loading history log...</span>
            </div>
          } @else if (histories().length === 0) {
            <div class="py-12 text-center text-[var(--text-muted)] flex flex-col items-center gap-2">
              <i class="bi bi-clock-history text-3xl opacity-40"></i>
              <p class="text-sm">ยังไม่มีประวัติการ Generate SQL สำหรับหน้านี้</p>
              <button
                type="button"
                class="text-xs text-[var(--crm-primary)] underline hover:opacity-80"
                (click)="activeTab.set('generate')"
              >
                คลิกที่นี่เพื่อเริ่ม Generate เวอร์ชันแรก
              </button>
            </div>
          } @else {
            <div class="space-y-3">
              @for (item of histories(); track item.id) {
                <div
                  class="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--crm-primary)]/40 transition-all space-y-2.5 shadow-sm"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 text-xs font-bold rounded bg-[var(--crm-primary)]/10 text-[var(--crm-primary)]">
                        v{{ item.versionNo }}
                      </span>
                      <span
                        class="px-2 py-0.5 text-xs font-semibold rounded"
                        [ngClass]="
                          item.generationType === 'MIGRATION'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        "
                      >
                        {{ item.generationType }}
                      </span>
                      <span class="text-xs text-[var(--text-muted)]">
                        ({{ item.vendor }} / {{ item.engine }})
                      </span>
                    </div>

                    <div class="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <i class="bi bi-calendar3"></i>
                      {{ item.createdAt | date: 'medium' }}
                      @if (item.createdBy) {
                        <span class="text-[var(--text-active)] ml-1">by {{ item.createdBy }}</span>
                      }
                    </div>
                  </div>

                  @if (item.summaryNote) {
                    <p class="text-xs text-[var(--text-muted)] italic">
                      {{ item.summaryNote }}
                    </p>
                  }

                  <!-- Actions for this history item -->
                  <div class="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      class="text-xs text-[var(--crm-primary)] hover:underline flex items-center gap-1 font-medium"
                      (click)="togglePreview(item.id)"
                    >
                      <i class="bi" [ngClass]="previewHistoryId() === item.id ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                      {{ previewHistoryId() === item.id ? 'Hide SQL Script' : 'Preview SQL Script' }}
                    </button>

                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="text-xs px-2 py-1 rounded bg-[var(--bg-muted)] text-[var(--text-active)] hover:bg-[var(--crm-primary)]/10 hover:text-[var(--crm-primary)] transition-all flex items-center gap-1"
                        (click)="copyToClipboard(item.generatedSql)"
                      >
                        <i class="bi bi-clipboard"></i> Copy
                      </button>
                      <button
                        type="button"
                        class="text-xs px-2 py-1 rounded bg-[var(--bg-muted)] text-[var(--text-active)] hover:bg-[var(--crm-primary)]/10 hover:text-[var(--crm-primary)] transition-all flex items-center gap-1"
                        (click)="downloadSql(item.generatedSql, 'v' + item.versionNo + '_' + item.generationType.toLowerCase())"
                      >
                        <i class="bi bi-download"></i> Download
                      </button>
                    </div>
                  </div>

                  <!-- Expanded Preview -->
                  @if (previewHistoryId() === item.id) {
                    <pre
                      class="w-full p-3 mt-2 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)]/30 text-xs font-mono text-[var(--text)] overflow-auto max-h-48 whitespace-pre-wrap select-all"
                      >{{ item.generatedSql }}</pre
                    >
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Footer -->
      <div class="border-t px-5 py-3.5 flex justify-between items-center" style="border-color: var(--border);">
        <span class="text-xs text-[var(--text-muted)]">
          @if (tabId) {
            Tab ID: <code class="font-mono text-[11px]">{{ tabId }}</code>
          }
        </span>
        <sic-button variant="secondary" size="sm" (click)="close()">Close</sic-button>
      </div>
    </div>
  `,
})
export class SqlExportDialogComponent implements OnInit {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  @Input() xml: string = '';
  @Input() tabId: string = '';

  activeTab = signal<'generate' | 'history'>('generate');
  pages = signal<DiagramPage[]>([]);
  histories = signal<DiagramSqlHistoryItem[]>([]);
  selectedPageId: string | null = null;
  vendor = 'postgresql';
  engine: 'parser' | 'ai' = 'ai';
  genMode: 'FULL' | 'MIGRATION' = 'FULL';
  selectedBaseVersionId: string | null = null;

  sql = signal<string>('');
  lastGeneratedVersion = signal<number | null>(null);
  loading = signal(false);
  loadingHistory = signal(false);
  previewHistoryId = signal<string | null>(null);

  ngOnInit() {
    this.extractPages(this.xml);
    if (this.pages().length > 0) {
      this.selectedPageId = this.pages()[0].id;
    }
    if (this.tabId) {
      this.loadHistory();
    }
  }

  openHistoryTab() {
    this.activeTab.set('history');
    if (this.tabId) {
      this.loadHistory();
    }
  }

  loadHistory() {
    if (!this.tabId) return;
    this.loadingHistory.set(true);

    this.http.get<DiagramSqlHistoryItem[]>(`${environment.apiBaseUrl}/api/ai/sql-history/${this.tabId}`).subscribe({
      next: (items) => {
        this.histories.set(items || []);
        if (items && items.length > 0) {
          // If migration is chosen, default to latest version
          this.selectedBaseVersionId = items[0].id;
          this.genMode = 'MIGRATION'; // default to migration if history exists
        }
        this.loadingHistory.set(false);
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        this.loadingHistory.set(false);
      },
    });
  }

  private extractPages(xml: string) {
    if (!xml) return;

    const regex = /<diagram\b[^>]*>([\s\S]*?)<\/diagram>/g;
    const allPages: DiagramPage[] = [];
    let match;

    while ((match = regex.exec(xml)) !== null) {
      const fullTag = match[0];
      const idMatch = fullTag.match(/id\s*=\s*["']([^"']+)["']/i);
      const nameMatch = fullTag.match(/name\s*=\s*["']([^"']+)["']/i);

      const id = idMatch ? idMatch[1] : `page-${allPages.length + 1}`;
      const rawName = nameMatch ? nameMatch[1] : `Page-${allPages.length + 1}`;
      const name = this.decodeHtmlEntities(rawName);

      if (this.isErDiagramPage(name)) {
        allPages.push({ id, name, xml: fullTag });
      }
    }

    this.pages.set(allPages);
  }

  private isErDiagramPage(name: string): boolean {
    const erKeywords = ['ER', 'ERD', 'Entity', 'Database', 'Schema', 'Table'];
    const upperName = name.toUpperCase();
    return erKeywords.some((keyword) => upperName.includes(keyword.toUpperCase()));
  }

  private decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  onPageChange() {
    this.sql.set('');
    this.lastGeneratedVersion.set(null);
  }

  togglePreview(id: string) {
    this.previewHistoryId.update((curr) => (curr === id ? null : id));
  }

  generate() {
    if (!this.selectedPageId) {
      this.dialogService.warn('No page selected', 'Please select a diagram page.');
      return;
    }

    const selectedPage = this.pages().find((p) => p.id === this.selectedPageId);
    if (!selectedPage) {
      this.dialogService.warn('Page not found', 'Selected page does not exist.');
      return;
    }

    this.loading.set(true);

    const endpoint =
      this.engine === 'ai'
        ? `${environment.apiBaseUrl}/api/ai/generate-sql-from-er`
        : `${environment.apiBaseUrl}/api/diagram/generate-sql`;

    const payload = {
      xml: selectedPage.xml,
      vendor: this.vendor,
      pageName: selectedPage.name,
      tabId: this.tabId,
      mode: this.genMode,
      engine: this.engine,
      baseVersionId: this.selectedBaseVersionId,
    };

    console.log('📤 Sending Generate Request:', payload);

    this.http.post<{ sql: string; versionNo?: number; message?: string }>(endpoint, payload).subscribe({
      next: (res) => {
        console.log('✅ Response:', res);
        this.sql.set(res.sql);
        if (res.versionNo) {
          this.lastGeneratedVersion.set(res.versionNo);
        }
        this.loading.set(false);
        if (this.tabId) {
          this.loadHistory(); // Refresh history log in background
        }
        this.dialogService.success('Success', res.message || 'SQL generated and saved to history.');
      },
      error: (err) => {
        console.error('❌ Generation Error:', err);
        this.loading.set(false);
        const msg = err.error?.message || err.message || 'Could not generate SQL.';
        this.dialogService.error('Generation Failed', msg);
      },
    });
  }

  copyToClipboard(sqlText: string) {
    if (!sqlText) return;

    navigator.clipboard
      ?.writeText(sqlText)
      .then(() => {
        this.dialogService.success('Copied', 'SQL copied to clipboard.');
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = sqlText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        this.dialogService.success('Copied', 'SQL copied to clipboard.');
      });
  }

  downloadSql(sqlText: string, prefix = 'schema') {
    if (!sqlText) return;

    const blob = new Blob([sqlText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  close() {
    this.dialogService.close();
  }
}
