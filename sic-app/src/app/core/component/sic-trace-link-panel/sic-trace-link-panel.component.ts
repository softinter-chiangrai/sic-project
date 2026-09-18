// src/app/core/component/sic-trace-link-panel/sic-trace-link-panel.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, OnChanges, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DialogService } from '../../services/dialog.service';
import { TRACE_RELATIONSHIP_LABEL, TraceLink, TraceLinkService } from '../../services/trace-link.service';
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
              const label = TRACE_RELATIONSHIP_LABEL[row.link.relationshipType];
              return {
                linkId: row.link.id,
                otherType: row.otherType,
                otherId: row.otherId,
                relationshipLabel: row.fromSource ? label.fromSource : label.fromTarget,
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
    let url = '';
    switch (type) {
      case 'DFD':
      case 'ER':
        url = `${base}/api/diagram/tabs/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({ code: data?.diagramCode || id.slice(0, 8), name: data?.name || `${type} Diagram` })),
          catchError(() => of({ code: id.slice(0, 8), name: `${type} Diagram` }))
        );
      case 'REQUIREMENT':
        url = `${base}/api/pm/requirement/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({ code: data?.requirementCode || 'REQ', name: data?.title || 'Requirement' })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Requirement' }))
        );
      case 'SPECIFICATION':
        url = `${base}/api/pm/specifications/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({ code: data?.specificationCode || 'SPEC', name: data?.title || 'Specification' })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Specification' }))
        );
      case 'TASK':
        url = `${base}/api/pm/tasks/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({ code: data?.taskCode || 'TASK', name: data?.taskName || 'Task' })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Task' }))
        );
      case 'CHANGE_REQUEST':
        url = `${base}/api/pm/change-requests/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({ code: data?.crCode || 'CR', name: data?.title || 'Change Request' })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Change Request' }))
        );
      case 'TEST_CASE':
        url = `${base}/api/pm/test-cases/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({ code: data?.testCaseCode || 'TC', name: data?.title || 'Test Case' })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Test Case' }))
        );
      case 'BUG':
        url = `${base}/api/pm/bugs/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({ code: data?.bugCode || 'BUG', name: data?.title || 'Bug' })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Bug' }))
        );
      case 'DESIGN_REVIEW':
        url = `${base}/api/pm/design-reviews/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({ code: data?.reviewCode || 'DR', name: data?.title || 'Design Review' })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Design Review' }))
        );
      default:
        return of({ code: id.slice(0, 8), name: id });
    }
  }

  private buildLink(type: string, id: string): string {
    const base = '/feature/pm';
    switch (type) {
      case 'DFD':
      case 'ER':
        return `${base}/diagram?tabId=${id}`;
      case 'REQUIREMENT':
        return `${base}/requirement/${id}/view`;
      case 'SPECIFICATION':
        return `${base}/specification/${id}/edit`;
      case 'TASK':
        return `${base}/task-board?taskId=${id}`;
      case 'TEST_CASE':
        return `${base}/test-case/${id}/edit`;
      case 'BUG':
        return `${base}/test-case/${id}/edit`;
      case 'CHANGE_REQUEST':
        return `${base}/change-request/${id}/edit`;
      case 'DESIGN_REVIEW':
        return `${base}/design-review/${id}/edit`;
      default:
        return '#';
    }
  }
}
