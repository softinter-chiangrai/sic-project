// src/app/feature/bu/rt/burt07/burt07.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import { SicButtonComponent, SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { DialogService } from '../../../../core/services/dialog.service';
import { AiModelConfig, Burt07PageData } from './burt07.model';
import { Burt07Service } from './burt07.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AiModelsService } from '../../../../core/services/ai-models.service';

@Component({
  selector: 'app-burt07',
  standalone: true,
  imports: [CommonModule, RouterModule, SicButtonComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './burt07.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './burt07.component.css',
})
export class Burt07Component implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private service = inject(Burt07Service);
  private aiModelsSvc = inject(AiModelsService);
  private dialog = inject(DialogService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private langSub?: Subscription;

  isLoading = signal(false);
  models = signal<AiModelConfig[]>([]);
  totalItems = computed(() => this.models().length);

  gridConfig!: SicGridPanelConfig;

  private buildGridConfig(): SicGridPanelConfig {
    return {
      id: 'id',
      lazy: false,
      selectable: false,
      showToolbar: false,
      pageSize: 10,
      column: [
        { label: this.translate.instant('BURT07_COL_MODEL'), name: 'displayName', type: 'modelName', sortable: true, width: 260 },
        { label: this.translate.instant('BURT07_COL_PROVIDER'), name: 'providerLabel', type: 'provider', width: 160 },
        { label: this.translate.instant('BURT07_COL_MODEL_CODE'), name: 'modelCode', type: 'modelCode', width: 200 },
        { label: this.translate.instant('BURT07_COL_API_KEY'), name: 'apiKeyMasked', type: 'apiKey', align: 'center', width: 150 },
        { label: this.translate.instant('BURT07_COL_DEFAULT'), name: 'isDefault', type: 'defaultBadge', align: 'center', width: 110 },
        { label: this.translate.instant('BURT07_COL_STATUS'), name: 'isActive', type: 'statusBadge', sortable: true, width: 100 },
        { label: this.translate.instant('BURT07_COL_ACTION'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, width: 110 },
      ],
    };
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    const list = this.models();
    grid.setRows(list as unknown as SicGridRowData[], { totalElements: list.length }, request.requestId);
  }

  ngOnInit(): void {
    this.gridConfig = this.buildGridConfig();
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.gridConfig = this.buildGridConfig();
    });
    const page: Burt07PageData = this.route.snapshot.data['form'];
    this.models.set(page.models);
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  reload(grid?: SicGridPanelComponent): void {
    this.isLoading.set(true);
    this.service.getModels()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (models) => {
          this.models.set(models || []);
          grid?.reload();
        },
        error: (err) => {
          this.dialog.error(this.translate.instant('BURT07_LOAD_FAILED_TITLE'), err.error?.message || this.translate.instant('BURT07_GENERIC_ERROR_MSG'));
        },
      });
  }

  openCreateForm(): void {
    this.router.navigate(['/feature/bu/ai-model-config/new']);
  }

  openEditForm(model: AiModelConfig): void {
    this.router.navigate(['/feature/bu/ai-model-config', model.id, 'edit']);
  }

  deleteModel(model: AiModelConfig, grid: SicGridPanelComponent): void {
    this.dialog.confirm(
      this.translate.instant('BURT07_CONFIRM_DELETE_TITLE'),
      this.translate.instant('BURT07_CONFIRM_DELETE_MSG', { name: model.displayName }),
    ).then((confirmed) => {
      if (confirmed && model.id) {
        this.isLoading.set(true);
        this.service.deleteModel(model.id)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: () => {
              this.models.update((list) => list.filter((m) => m.id !== model.id));
              this.aiModelsSvc.refresh();
              this.dialog.success(this.translate.instant('BURT07_DELETE_SUCCESS_TITLE'), this.translate.instant('BURT07_DELETE_SUCCESS_MSG', { name: model.displayName }));
              grid.reload();
            },
            error: (err) => {
              this.dialog.error(this.translate.instant('BURT07_DELETE_FAILED_TITLE'), err.error?.message || this.translate.instant('BURT07_GENERIC_ERROR_MSG'));
            },
          });
      }
    });
  }

  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? this.translate.instant('BURT07_ACTIVE_TEXT') : this.translate.instant('BURT07_INACTIVE_TEXT');
  }
}
