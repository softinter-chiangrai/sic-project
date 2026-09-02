import { Component, inject, Input, OnInit, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DocumentVersionModel } from './pmdt19A/pmdt19A.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { SicUploadComponent } from '../../../../core/component/sic-upload/sic-upload.component';

@Component({
  selector: 'app-pmdt19-view-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SicButtonComponent, SicDatePipe, SicUploadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-[min(92vw,48rem)] max-h-[85vh] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl flex flex-col" style="border-color: var(--border);">
      <!-- Header -->
      <div class="flex items-center justify-between border-b px-6 py-4" style="border-color: var(--border); background: color-mix(in srgb, var(--sidebar) 70%, var(--bg));">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] flex items-center justify-center text-xl">
            <i class="bi bi-file-earmark-text"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-[var(--text-active)] flex items-center gap-2">
              เนื้อหาเอกสาร (Document Version Content)
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--crm-primary)]/15 text-[var(--crm-primary)]">
                {{ version.versionNo }}
              </span>
            </h3>
            <p class="text-xs text-[var(--text-muted)]">
              ประเภท: <span class="font-medium text-[var(--text-active)]">{{ version.documentType }}</span> | 
              รหัส: <span class="font-medium text-[var(--text-active)]">{{ version.documentCode || '-' }}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-active)] hover:bg-[var(--sidebar-hover)] transition-colors"
          (click)="close()"
        >
          <i class="bi bi-x-lg text-lg"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- Metadata Summary Box -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[var(--sidebar)] border border-[var(--border)] text-xs">
          <div>
            <span class="text-[var(--text-muted)] block mb-1">ผู้บันทึกเวอร์ชันนี้:</span>
            <div class="flex items-center gap-1.5 font-medium text-[var(--text-active)] text-sm">
              <i class="bi bi-person text-[var(--crm-primary)]"></i>
              <span>{{ version.createdBy || 'System' }}</span>
            </div>
          </div>
          <div>
            <span class="text-[var(--text-muted)] block mb-1">วันที่บันทึก:</span>
            <div class="flex items-center gap-1.5 font-medium text-[var(--text-active)] text-sm">
              <i class="bi bi-clock text-[var(--crm-primary)]"></i>
              <span>{{ version.createdDate ? (version.createdDate | sicDate: null : 'DD/MM/YYYY HH:mm') : '-' }}</span>
            </div>
          </div>
          @if (version.changeSummary) {
            <div class="col-span-full pt-2 border-t border-[var(--border)]">
              <span class="text-[var(--text-muted)] block mb-1 font-semibold">สรุปการเปลี่ยนแปลง (Changelog):</span>
              <p class="text-[var(--text)] whitespace-pre-wrap leading-relaxed">{{ version.changeSummary }}</p>
            </div>
          }
        </div>

        <!-- Snapshot Content Display -->
        @if (parsedSnapshot()) {
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-[var(--text-active)] flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <i class="bi bi-journal-text text-[var(--crm-primary)]"></i>
              รายละเอียดเนื้อหาเอกสาร ณ เวอร์ชันนี้ (Document Details)
            </h4>

            <div class="space-y-3">
              <!-- Common fields: Title, Code, Priority, Type, etc. -->
              @if (parsedSnapshot().title || parsedSnapshot().requirementCode || parsedSnapshot().specificationCode || parsedSnapshot().code) {
                <div class="p-4 rounded-xl bg-[var(--sidebar)] border border-[var(--border)] space-y-2">
                  <div class="text-base font-bold text-[var(--text-active)]">
                    {{ parsedSnapshot().title || parsedSnapshot().name || parsedSnapshot().documentCode || version.documentCode }}
                  </div>
                  <div class="flex flex-wrap gap-2 pt-1">
                    @if (parsedSnapshot().requirementType || parsedSnapshot().specificationType || parsedSnapshot().type) {
                      <span class="px-2 py-0.5 rounded text-xs bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] font-medium">
                        ประเภท: {{ parsedSnapshot().requirementType || parsedSnapshot().specificationType || parsedSnapshot().type }}
                      </span>
                    }
                    @if (parsedSnapshot().priority) {
                      <span class="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-600 font-medium">
                        ความสำคัญ: {{ parsedSnapshot().priority }}
                      </span>
                    }
                    @if (parsedSnapshot().status) {
                      <span class="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600 font-medium">
                        สถานะเดิม: {{ parsedSnapshot().status }}
                      </span>
                    }
                  </div>
                </div>
              }

              <!-- Description -->
              @if (parsedSnapshot().description) {
                <div class="p-4 rounded-xl bg-[var(--sidebar)] border border-[var(--border)] space-y-2">
                  <span class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">รายละเอียดเนื้อหา (Description):</span>
                  <div class="text-sm text-[var(--text)] leading-relaxed formatted-content" [innerHTML]="sanitize(parsedSnapshot().description)"></div>
                </div>
              }

              <!-- Acceptance Criteria -->
              @if (parsedSnapshot().acceptanceCriteria) {
                <div class="p-4 rounded-xl bg-[var(--sidebar)] border border-[var(--border)] space-y-2">
                  <span class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">เกณฑ์การยอมรับ (Acceptance Criteria):</span>
                  <div class="text-sm text-[var(--text)] leading-relaxed formatted-content" [innerHTML]="sanitize(parsedSnapshot().acceptanceCriteria)"></div>
                </div>
              }

              <!-- Business Value / Notes -->
              @if (parsedSnapshot().businessValue) {
                <div class="p-4 rounded-xl bg-[var(--sidebar)] border border-[var(--border)] space-y-2">
                  <span class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">คุณค่าทางธุรกิจ (Business Value):</span>
                  <div class="text-sm text-[var(--text)] leading-relaxed">{{ parsedSnapshot().businessValue }}</div>
                </div>
              }

              <!-- Raw Snapshot JSON (Collapsible) -->
              <details class="group rounded-xl border border-[var(--border)] bg-[var(--sidebar)] p-3">
                <summary class="text-xs font-semibold text-[var(--text-muted)] cursor-pointer select-none flex items-center justify-between hover:text-[var(--text-active)]">
                  <span class="flex items-center gap-1.5">
                    <i class="bi bi-code-slash text-[var(--crm-primary)]"></i> ข้อมูล Snapshot ฉบับเต็ม (Raw Data JSON)
                  </span>
                  <i class="bi bi-chevron-down group-open:rotate-180 transition-transform"></i>
                </summary>
                <pre class="mt-3 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs font-mono overflow-x-auto text-[var(--text)] max-h-60 leading-relaxed">{{ formattedJson() }}</pre>
              </details>
            </div>
          </div>
        } @else if (version.snapshotData) {
          <!-- Raw Text / String -->
          <div class="p-4 rounded-xl bg-[var(--sidebar)] border border-[var(--border)] space-y-2">
            <span class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">ข้อมูลเนื้อหา Snapshot:</span>
            <div class="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed font-mono bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)]">
              {{ version.snapshotData }}
            </div>
          </div>
        } @else {
          <!-- Empty State for Snapshot -->
          <div class="text-center py-8 px-4 rounded-xl bg-[var(--sidebar)] border border-dashed border-[var(--border)] text-[var(--text-muted)] space-y-2">
            <i class="bi bi-journal-x text-4xl block opacity-30 text-[var(--crm-primary)]"></i>
            <div class="text-sm font-medium text-[var(--text-active)]">ไม่มีข้อมูล Snapshot เนื้อหาสำหรับเวอร์ชันนี้</div>
            <p class="text-xs">เวอร์ชันนี้อาจถูกสร้างขึ้นก่อนระบบ Snapshot หรือสร้างขึ้นแบบแมนนวล</p>
          </div>
        }

        <!-- Attached File Section if any -->
        @if (version.fileRefId || version.filePath) {
          <div class="p-4 rounded-xl bg-[var(--sidebar)] border border-[var(--border)] space-y-3">
            <h4 class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <i class="bi bi-paperclip text-[var(--crm-primary)]"></i>
              ไฟล์แนบประจำเวอร์ชัน (Attached File)
            </h4>
            @if (version.fileRefId) {
              <sic-upload [ngModel]="version.fileRefId" [disabled]="true"></sic-upload>
            } @else if (version.filePath) {
              <div class="flex items-center gap-2 text-sm text-[var(--crm-primary)]">
                <i class="bi bi-file-earmark"></i>
                <a [href]="version.filePath" target="_blank" class="hover:underline">{{ version.filePath }}</a>
              </div>
            }
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end border-t px-6 py-4" style="border-color: var(--border); background: color-mix(in srgb, var(--sidebar) 72%, var(--bg));">
        <sic-button variant="secondary" size="sm" (click)="close()">
          ปิดหน้าต่าง
        </sic-button>
      </div>
    </div>
  `,
  styles: [`
    .formatted-content :deep(p) {
      margin-bottom: 0.5rem;
    }
    .formatted-content :deep(ul), .formatted-content :deep(ol) {
      padding-left: 1.25rem;
      margin-bottom: 0.5rem;
    }
    .formatted-content :deep(ul) {
      list-style-type: disc;
    }
    .formatted-content :deep(ol) {
      list-style-type: decimal;
    }
    .formatted-content :deep(blockquote) {
      border-left: 3px solid var(--crm-primary);
      padding-left: 0.75rem;
      margin: 0.5rem 0;
      color: var(--text-muted);
    }
    .formatted-content :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5rem 0;
    }
    .formatted-content :deep(th), .formatted-content :deep(td) {
      border: 1px solid var(--border);
      padding: 0.35rem 0.5rem;
    }
  `]
})
export class Pmdt19ViewDialogComponent implements OnInit {
  @Input() version!: DocumentVersionModel;

  private readonly dialogService = inject(DialogService);
  private readonly sanitizer = inject(DomSanitizer);

  parsedSnapshot = signal<any>(null);
  formattedJson = signal<string>('');

  ngOnInit(): void {
    if (this.version?.snapshotData) {
      try {
        const parsed = typeof this.version.snapshotData === 'string'
          ? JSON.parse(this.version.snapshotData)
          : this.version.snapshotData;
        this.parsedSnapshot.set(parsed);
        this.formattedJson.set(JSON.stringify(parsed, null, 2));
      } catch (e) {
        this.parsedSnapshot.set(null);
        this.formattedJson.set(this.version.snapshotData);
      }
    }
  }

  sanitize(html: string): SafeHtml {
    if (!html) return '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  close(): void {
    this.dialogService.close(false);
  }
}
