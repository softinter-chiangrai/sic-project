// src/app/core/component/sic-trace-link-panel/sic-trace-link-panel.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, OnChanges, inject, signal } from '@angular/core';
import { Router, RouterModule, UrlTree } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DialogService } from '../../services/dialog.service';
import { TRACE_RELATIONSHIP_LABEL, TraceLink, TraceLinkService, TraceRelationshipType } from '../../services/trace-link.service';
import { SicButtonComponent } from 'sic-ng';
import { SicTraceLinkPickerComponent } from '../sic-trace-link-picker/sic-trace-link-picker.component';
import { DIAGRAM_TRACE_TYPES, traceTargetDetails, traceTargetLink } from '../../utils/trace-target.util';

interface DisplayLink {
  linkId: string;
  otherType: string;
  otherId: string;
  relationshipLabel: string;
  name: string;
  code: string;
  routerLink: UrlTree; // a tree, not a string: some targets carry a query (?tabId=, ?taskId=) that a string routerLink would encode
}

// แสดงรายการความสัมพันธ์ (ทั้งสองทิศทาง: entity นี้เป็น source หรือ target ก็ได้) พร้อมปุ่มเพิ่ม/ลบ
// ใช้ฝังในฟอร์มของแต่ละ entity แทนการต้องไปสร้างความสัมพันธ์ผ่านหน้ากลาง
@Component({
  selector: 'sic-trace-link-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="rounded-xl border p-4" style="border-color: var(--border);">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-semibold text-[var(--text-active)] flex items-center gap-2">
          <i class="bi bi-link-45deg text-[var(--crm-primary)]"></i>
          {{ 'TRACE_LINK_PANEL_TITLE' | translate }}
        </span>
      </div>

      @if (loading()) {
        <p class="text-xs text-[var(--text-muted)]">{{ 'TRACE_LINK_PANEL_LOADING' | translate }}</p>
      } @else if (links().length === 0) {
        <p class="text-xs text-[var(--text-muted)]">{{ 'TRACE_LINK_PANEL_EMPTY' | translate }}</p>
      } @else {
        <ul class="space-y-1.5">
          @for (link of links(); track link.linkId) {
            <li class="flex items-center justify-between gap-2 text-sm">
              <a [routerLink]="link.routerLink" class="text-[var(--crm-primary)] hover:underline flex items-center gap-2 min-w-0">
                <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] shrink-0">{{ link.otherType }}</span>
                <span class="truncate">{{ link.relationshipLabel }} {{ link.name }}</span>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class SicTraceLinkPanelComponent implements OnChanges {
  @Input({ required: true }) entityType!: string;
  @Input() entityId?: string | null;
  @Input() projectId?: string | null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private traceLinkService = inject(TraceLinkService);
  private translate = inject(TranslateService);

  links = signal<DisplayLink[]>([]);
  loading = signal(false);

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    if (!this.entityType || !this.entityId) {
      this.links.set([]);
      return;
    }
    this.loading.set(true);
    const normalizedType = (this.entityType || '').toUpperCase().trim();
    const diagramTypes = DIAGRAM_TRACE_TYPES;
    const isDiag = diagramTypes.includes(normalizedType) || normalizedType === 'DIAGRAM';

    forkJoin({
      asSource: this.traceLinkService.getLinksBySource(this.entityType, this.entityId).pipe(catchError(() => of([]))),
      asTarget: this.traceLinkService.getLinksByTarget(this.entityType, this.entityId).pipe(catchError(() => of([]))),
      asSourceDiag: (isDiag && normalizedType !== 'DIAGRAM')
        ? this.traceLinkService.getLinksBySource('DIAGRAM', this.entityId).pipe(catchError(() => of([])))
        : of([] as TraceLink[]),
      asTargetDiag: (isDiag && normalizedType !== 'DIAGRAM')
        ? this.traceLinkService.getLinksByTarget('DIAGRAM', this.entityId).pipe(catchError(() => of([])))
        : of([] as TraceLink[]),
    }).subscribe(({ asSource, asTarget, asSourceDiag, asTargetDiag }) => {
      const allSource = [...asSource, ...asSourceDiag];
      const allTarget = [...asTarget, ...asTargetDiag];
      const seen = new Map<string, { link: TraceLink; otherType: string; otherId: string; fromSource: boolean }>();

      const addRow = (link: TraceLink, otherType: string, otherId: string, fromSource: boolean) => {
        const otherNorm = (otherType || '').toUpperCase().trim();
        const canonicalType = diagramTypes.includes(otherNorm) ? 'DIAGRAM' : otherNorm;
        const dedupeKey = `${fromSource ? 'SRC' : 'TGT'}:${canonicalType}:${otherId}:${link.relationshipType}`;
        const existing = seen.get(dedupeKey);
        if (!existing) {
          seen.set(dedupeKey, { link, otherType, otherId, fromSource });
        } else if (existing.otherType.toUpperCase().trim() === 'DIAGRAM' && diagramTypes.includes(otherNorm) && otherNorm !== 'DIAGRAM') {
          seen.set(dedupeKey, { link, otherType, otherId, fromSource });
        }
      };

      for (const link of allSource) {
        addRow(link, link.targetType, link.targetId, true);
      }
      for (const link of allTarget) {
        addRow(link, link.sourceType, link.sourceId, false);
      }

      const rows = Array.from(seen.values());

      if (rows.length === 0) {
        this.links.set([]);
        this.loading.set(false);
        return;
      }

      forkJoin(
        rows.map((row) =>
          traceTargetDetails(this.http, row.otherType, row.otherId).pipe(
            map((details) => {
              return {
                linkId: row.link.id,
                otherType: row.otherType,
                otherId: row.otherId,
                relationshipLabel: this.getRelationshipLabel(row.link.relationshipType, row.fromSource),
                name: details.name,
                code: details.code,
                routerLink: this.router.parseUrl(traceTargetLink(row.otherType, row.otherId)),
              } as DisplayLink;
            })
          )
        )
      ).subscribe((displayLinks) => {
        this.links.set(displayLinks);
        this.loading.set(false);
      });
    });
  }

  private getRelationshipLabel(type: TraceRelationshipType, fromSource: boolean): string {
    const relKey = `TRACE_REL_${type}_${fromSource ? 'SOURCE' : 'TARGET'}`;
    const translated = this.translate.instant(relKey);
    if (translated && translated !== relKey) return translated;
    const label = (TRACE_RELATIONSHIP_LABEL as Record<string, { fromTarget: string; fromSource: string }>)[type];
    return label ? (fromSource ? label.fromSource : label.fromTarget) : type;
  }

  openPicker(): void {
    if (!this.entityId || !this.projectId) return;
    this.dialogService.open({
      type: 'confirm',
      component: SicTraceLinkPickerComponent,
      componentInputs: {
        targetType: this.entityType,
        targetId: this.entityId,
        projectId: this.projectId,
        onLinked: () => this.load(),
      },
    });
  }

  removeLink(link: DisplayLink): void {
    this.dialogService.confirm(this.translate.instant('TRACE_LINK_PANEL_CONFIRM_REMOVE_TITLE'), this.translate.instant('TRACE_LINK_PANEL_CONFIRM_REMOVE_MSG')).then((ok) => {
      if (!ok) return;
      this.traceLinkService.deleteLink(link.linkId).subscribe({
        next: () => this.load(),
        error: () => this.dialogService.error(this.translate.instant('TRACE_LINK_PANEL_REMOVE_ERROR_TITLE'), this.translate.instant('TRACE_LINK_PANEL_GENERIC_ERROR_MSG')),
      });
    });
  }

}
