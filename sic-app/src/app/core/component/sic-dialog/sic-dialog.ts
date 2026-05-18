import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { SicButton } from '../sic-button/sic-button';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'sic-dialog',
  imports: [NgComponentOutlet, SicButton],
  templateUrl: './sic-dialog.html',
})
export class SicDialog {
  readonly dialogService = inject(DialogService);
  readonly state = this.dialogService.state;

  readonly iconClass = computed(() => {
    switch (this.state()?.type) {
      case 'success':
        return 'bi bi-check-circle-fill';
      case 'warn':
        return 'bi bi-exclamation-triangle-fill';
      case 'confirm':
        return 'bi bi-patch-question-fill';
      case 'error':
        return 'bi bi-x-octagon-fill';
      default:
        return 'bi bi-info-circle-fill';
    }
  });

  readonly iconContainerClass = computed(() => {
    switch (this.state()?.type) {
      case 'success':
        return 'bg-[color-mix(in_srgb,var(--crm-success)_14%,var(--bg))] text-[var(--crm-success)]';
      case 'warn':
        return 'bg-[color-mix(in_srgb,var(--crm-warning)_16%,var(--bg))] text-[var(--crm-warning)]';
      case 'confirm':
        return 'bg-[color-mix(in_srgb,var(--crm-primary)_14%,var(--bg))] text-[var(--crm-primary)]';
      case 'error':
        return 'bg-[color-mix(in_srgb,var(--crm-danger)_14%,var(--bg))] text-[var(--crm-danger)]';
      default:
        return 'bg-[color-mix(in_srgb,var(--crm-success)_14%,var(--bg))] text-[var(--crm-success)]';
    }
  });

  readonly confirmButtonVariant = computed(() => {
    switch (this.state()?.type) {
      case 'success':
        return 'success' as const;
      case 'warn':
        return 'outline' as const;
      case 'confirm':
        return 'primary' as const;
      case 'error':
        return 'danger' as const;
      default:
        return 'success' as const;
    }
  });

  close(result = false): void {
    this.dialogService.close(result);
  }
}
