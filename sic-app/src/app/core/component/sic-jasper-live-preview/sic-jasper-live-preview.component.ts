// src/app/core/component/sic-jasper-live-preview/sic-jasper-live-preview.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnChanges, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, from, tap, map } from 'rxjs';

/**
 * The real Jasper PDF of a form while it is being edited: [body] is posted to [url] (a *-preview-pdf endpoint that fills the
 * report from the unsaved values and stores nothing) once typing pauses. The previous PDF stays on screen until the new one
 * is ready, so the view never flashes white.
 */
@Component({
  selector: 'sic-jasper-live-preview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full min-h-[70vh] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
      @if (src(); as s) {
        <iframe [src]="s" class="block w-full h-full min-h-[70vh] border-0" title="PDF preview"></iframe>
      } @else if (!error()) {
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
          <div class="w-8 h-8 border-[3px] border-[var(--border)] border-t-[var(--crm-primary)] rounded-full animate-spin"></div>
          {{ 'LIVE_PDF_GENERATING' | translate }}
        </div>
      }
      @if (loading() && src()) {
        <div class="absolute top-2 right-2 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--sidebar)]/90 border border-[var(--border)] text-xs text-[var(--text-muted)] shadow-sm">
          <div class="w-3 h-3 border-2 border-[var(--border)] border-t-[var(--crm-primary)] rounded-full animate-spin"></div>
          {{ 'LIVE_PDF_UPDATING' | translate }}
        </div>
      }
      @if (error(); as e) {
        <div class="absolute bottom-2 inset-x-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500">{{ e }}</div>
      }
    </div>
  `,
})
export class SicJasperLivePreviewComponent implements OnChanges {
  @Input({ required: true }) url!: string;
  @Input() body: unknown;

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private changes = new Subject<string>();
  private objectUrl: string | null = null;

  src = signal<SafeResourceUrl | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.objectUrl && URL.revokeObjectURL(this.objectUrl));
    this.changes
      .pipe(
        distinctUntilChanged(),
        debounceTime(1200), // quiet time after the last keystroke before a new PDF is asked for
        tap(() => this.loading.set(true)),
        // a newer change cancels the request still running
        switchMap((json) =>
          this.http.post(this.url, JSON.parse(json), { responseType: 'blob' }).pipe(
            map((blob) => ({ blob: blob as Blob | null, err: null as string | null })),
            catchError((e) => from(this.messageOf(e)).pipe(map((err) => ({ blob: null, err })))),
          ),
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(({ blob, err }) => {
        this.loading.set(false);
        this.error.set(err);
        if (!blob) return;
        const old = this.objectUrl;
        this.objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        this.src.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl + '#toolbar=0&navpanes=0'));
        if (old) URL.revokeObjectURL(old);
      });
  }

  ngOnChanges(): void {
    this.changes.next(JSON.stringify(this.body ?? {}));
  }

  /** the backend sends its message as JSON inside the error blob */
  private async messageOf(e: any): Promise<string> {
    try {
      const text = e?.error instanceof Blob ? await e.error.text() : '';
      return JSON.parse(text)?.message || e?.message || 'Error';
    } catch {
      return e?.message || 'Error';
    }
  }
}
