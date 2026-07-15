import {
  Component, OnInit, OnDestroy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { AdminService, VllmStatus } from '../../services/admin.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Access guard
  isAdmin = false;

  // Engine state
  status: VllmStatus | null = null;
  models: string[] = [];
  selectedModel = '';
  selectedDevice: 'gpu' | 'cpu' = 'gpu';

  // Logs
  vllmLogs = '';
  downloadLogs = '';
  activeLogTab: 'engine' | 'download' = 'engine';

  // Download
  downloadRepoId = '';
  isDownloading = false;

  // Feedback
  actionMessage = '';
  actionError = '';
  isActioning = false;

  // Polling
  private statusPoll$?: Subscription;
  private logPoll$?: Subscription;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) return;

    this.loadModels();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.statusPoll$?.unsubscribe();
    this.logPoll$?.unsubscribe();
  }

  private startPolling(): void {
    // Poll status every 4 seconds
    this.statusPoll$ = interval(4000).pipe(
      startWith(0),
      switchMap(() => this.adminService.getVllmStatus())
    ).subscribe({
      next: (s) => { this.status = s; this.cdr.detectChanges(); },
      error: () => {}
    });

    // Poll logs every 4 seconds
    this.logPoll$ = interval(4000).pipe(
      startWith(0),
      switchMap(() =>
        this.activeLogTab === 'engine'
          ? this.adminService.getVllmLogs()
          : this.adminService.getDownloadLogs()
      )
    ).subscribe({
      next: (l) => {
        if (this.activeLogTab === 'engine') this.vllmLogs = l.logs;
        else this.downloadLogs = l.logs;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadModels(): void {
    this.adminService.getModels().subscribe({
      next: (res) => {
        this.models = res.models;
        if (this.models.length > 0 && !this.selectedModel) {
          this.selectedModel = this.models[0];
        }
        this.cdr.detectChanges();
      }
    });
  }

  switchLogTab(tab: 'engine' | 'download'): void {
    this.activeLogTab = tab;
    // fetch immediately on tab switch
    const fetch$ = tab === 'engine'
      ? this.adminService.getVllmLogs()
      : this.adminService.getDownloadLogs();
    fetch$.subscribe({ next: (l) => {
      if (tab === 'engine') this.vllmLogs = l.logs;
      else this.downloadLogs = l.logs;
      this.cdr.detectChanges();
    }});
  }

  onStart(): void {
    if (!this.selectedModel || this.isActioning) return;
    this.isActioning = true;
    this.actionMessage = '';
    this.actionError = '';
    this.adminService.startVllm(this.selectedModel, this.selectedDevice).subscribe({
      next: (res) => { this.actionMessage = res.status; this.isActioning = false; this.cdr.detectChanges(); },
      error: (err) => { this.actionError = err?.error?.detail || 'Failed to start engine.'; this.isActioning = false; this.cdr.detectChanges(); }
    });
  }

  onStop(): void {
    if (this.isActioning) return;
    this.isActioning = true;
    this.actionMessage = '';
    this.actionError = '';
    this.adminService.stopVllm().subscribe({
      next: (res) => { this.actionMessage = res.status; this.isActioning = false; this.cdr.detectChanges(); },
      error: (err) => { this.actionError = err?.error?.detail || 'Failed to stop engine.'; this.isActioning = false; this.cdr.detectChanges(); }
    });
  }

  onDownload(): void {
    if (!this.downloadRepoId.trim() || this.isDownloading) return;
    this.isDownloading = true;
    this.actionMessage = '';
    this.actionError = '';
    this.activeLogTab = 'download';
    this.adminService.downloadModel(this.downloadRepoId.trim()).subscribe({
      next: (res) => {
        this.actionMessage = res.status;
        this.isDownloading = false;
        this.loadModels();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionError = err?.error?.detail || 'Failed to start download.';
        this.isDownloading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDeleteModel(modelName: string): void {
    if (!confirm(`Delete model "${modelName}" from disk?`)) return;
    this.adminService.deleteModel(modelName).subscribe({
      next: (res) => { this.actionMessage = res.status; this.loadModels(); this.cdr.detectChanges(); },
      error: (err) => { this.actionError = err?.error?.detail || 'Failed to delete model.'; this.cdr.detectChanges(); }
    });
  }
}
