// src/app/core/component/sic-trace-link-panel/sic-trace-link-panel.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, OnChanges, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DialogService } from '../../services/dialog.service';
import { TRACE_RELATIONSHIP_LABEL, TraceLink, TraceLinkService, TraceRelationshipType } from '../../services/trace-link.service';
import { SicButtonComponent } from 'sic-ng';
import { SicTraceLinkPickerComponent } from '../sic-trace-link-picker/sic-trace-link-picker.component';

interface DisplayLink {
  linkId: string;
  otherType: string;
  otherId: string;
  relationshipLabel: string;
  name: string;
  code: string;
  routerLink: string;
}

// แสดงรายการความสัมพันธ์ (ทั้งสองทิศทาง: entity นี้เป็น source หรือ target ก็ได้) พร้อมปุ่มเพิ่ม/ลบ
// ใช้ฝังในฟอร์มของแต่ละ entity แทนการต้องไปสร้างความสัมพันธ์ผ่านหน้ากลาง
@Component({
  selector: 'sic-trace-link-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, SicButtonComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="rounded-xl border p-4" style="border-color: var(--border);">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-semibold text-[var(--text-active)] flex items-center gap-2">
          <i class="bi bi-link-45deg text-[var(--crm-primary)]"></i>
          {{ 'TRACE_LINK_PANEL_TITLE' | translate }}
        </span>
        <sic-button variant="outline" color="primary" size="sm" type="button" (click)="openPicker()" [disabled]="!entityId || !projectId">
          <i class="bi bi-plus-lg"></i> {{ 'TRACE_LINK_PANEL_ADD_BUTTON' | translate }}
        </sic-button>
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
              <button (click)="removeLink(link)" class="text-[var(--text-muted)] hover:text-[var(--crm-danger)] shrink-0" [title]="'TRACE_LINK_PANEL_REMOVE_TITLE' | translate">
                <i class="bi bi-x-lg"></i>
              </button>
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
    forkJoin({
      asSource: this.traceLinkService.getLinksBySource(this.entityType, this.entityId).pipe(catchError(() => of([]))),
      asTarget: this.traceLinkService.getLinksByTarget(this.entityType, this.entityId).pipe(catchError(() => of([]))),
    }).subscribe(({ asSource, asTarget }) => {
      const rows: { link: TraceLink; otherType: string; otherId: string; fromSource: boolean }[] = [
        ...asSource.map((link) => ({ link, otherType: link.targetType, otherId: link.targetId, fromSource: true })),
        ...asTarget.map((link) => ({ link, otherType: link.sourceType, otherId: link.sourceId, fromSource: false })),
      ];

      if (rows.length === 0) {
        this.links.set([]);
        this.loading.set(false);
        return;
      }

      forkJoin(
        rows.map((row) =>
          this.fetchItemDetails(row.otherType, row.otherId).pipe(
            map((details) => {
              return {
                linkId: row.link.id,
                otherType: row.otherType,
                otherId: row.otherId,
                relationshipLabel: this.getRelationshipLabel(row.link.relationshipType, row.fromSource),
                name: details.name,
                code: details.code,
                routerLink: this.buildLink(row.otherType, row.otherId),
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

  private fetchItemDetails(type: string, id: string) {
    const base = environment.apiBaseUrl;
    const t = (type || '').toUpperCase().trim();
    switch (t) {
      case 'DFD':
      case 'ER':
      case 'DIAGRAM':
      case 'FLOWCHART':
      case 'SEQUENCE':
      case 'USE_CASE':
      case 'CLASS':
        return this.http.get<any>(`${base}/api/diagram/tabs/${id}`).pipe(
          map((data) => {
            const code = data?.diagramCode || id.slice(0, 8);
            const title = data?.name || `${type} Diagram`;
            return { code, name: data?.diagramCode ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: `${type} Diagram` }))
        );
      case 'REQUIREMENT':
      case 'REQ':
        return this.http.get<any>(`${base}/api/pm/requirement/${id}`).pipe(
          map((data) => {
            const code = data?.requirementCode || 'REQ';
            const title = data?.title || 'Requirement';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Requirement' }))
        );
      case 'SPECIFICATION':
      case 'SPEC':
        return this.http.get<any>(`${base}/api/pm/specifications/${id}`).pipe(
          map((data) => {
            const code = data?.specificationCode || 'SPEC';
            const title = data?.title || 'Specification';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Specification' }))
        );
      case 'TASK':
        return this.http.get<any>(`${base}/api/pm/tasks/${id}`).pipe(
          map((data) => {
            const code = data?.taskCode || 'TASK';
            const title = data?.taskName || 'Task';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Task' }))
        );
      case 'CHANGE_REQUEST':
      case 'CR':
        return this.http.get<any>(`${base}/api/pm/change-requests/${id}`).pipe(
          map((data) => {
            const code = data?.crCode || 'CR';
            const title = data?.title || 'Change Request';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Change Request' }))
        );
      case 'TEST_CASE':
      case 'TESTCASE':
      case 'TC':
        return this.http.get<any>(`${base}/api/pm/test-cases/${id}`).pipe(
          map((data) => {
            const code = data?.testCaseCode || 'TC';
            const title = data?.title || 'Test Case';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Test Case' }))
        );
      case 'BUG':
        return this.http.get<any>(`${base}/api/pm/bugs/${id}`).pipe(
          map((data) => {
            const code = data?.bugCode || 'BUG';
            const title = data?.title || 'Bug';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Bug' }))
        );
      case 'DESIGN_REVIEW':
      case 'DESIGNREVIEW':
      case 'DR':
        return this.http.get<any>(`${base}/api/pm/design-reviews/${id}`).pipe(
          map((data) => {
            const code = data?.reviewCode || 'DR';
            const title = data?.title || 'Design Review';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Design Review' }))
        );
      case 'CONTRACT':
        return this.http.get<any>(`${base}/api/pm/contracts/${id}`).pipe(
          map((data) => {
            const code = data?.contractCode || 'CONTRACT';
            const title = data?.contractName || 'Contract';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Contract' }))
        );
      case 'DELIVERY':
        return this.http.get<any>(`${base}/api/pm/delivery/${id}`).pipe(
          map((data) => {
            const code = data?.deliveryCode || 'DELIVERY';
            const title = data?.title || 'Delivery';
            return { code, name: code ? `[${code}] ${title}` : title };
          }),
          catchError(() => of({ code: id.slice(0, 8), name: 'Delivery' }))
        );
      default:
        return of({ code: id.slice(0, 8), name: id });
    }
  }

  private buildLink(type: string, id: string): string {
    const base = '/feature/pm';
    const t = (type || '').toUpperCase().trim();
    switch (t) {
      case 'DFD':
      case 'ER':
      case 'DIAGRAM':
      case 'FLOWCHART':
      case 'SEQUENCE':
      case 'USE_CASE':
      case 'CLASS':
        return `${base}/diagram?tabId=${id}`;
      case 'REQUIREMENT':
      case 'REQ':
        return `${base}/requirement/${id}/view`;
      case 'SPECIFICATION':
      case 'SPEC':
        return `${base}/specification/${id}/edit`;
      case 'TASK':
        return `${base}/task-board?taskId=${id}`;
      case 'TEST_CASE':
      case 'TESTCASE':
      case 'TC':
        return `${base}/test-case/${id}/edit`;
      case 'BUG':
        return `${base}/test-case/${id}/edit`;
      case 'CHANGE_REQUEST':
      case 'CR':
        return `${base}/change-request/${id}/edit`;
      case 'DESIGN_REVIEW':
      case 'DESIGNREVIEW':
      case 'DR':
        return `${base}/design-review/${id}/edit`;
      case 'CONTRACT':
        return `${base}/contract`;
      case 'DELIVERY':
        return `${base}/delivery`;
      default:
        return '#';
    }
  }
}
