// src/app/core/component/sic-entity-summary/sic-entity-summary.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface EntitySummaryCard {
  icon: string;
  label: string;
  value: string;
  sublabel?: string;
  variant?: 'default' | 'warning' | 'danger';
  actionLabel?: string;
  action?: () => void;
}

@Component({
  selector: 'sic-entity-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-entity-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicEntitySummaryComponent {
  @Input() cards: EntitySummaryCard[] = [];
  @Input() isLoading = false;

  variantClass(card: EntitySummaryCard): string {
    switch (card.variant) {
      case 'danger':
        return 'border-red-200 dark:border-red-900/40';
      case 'warning':
        return 'border-amber-200 dark:border-amber-900/40';
      default:
        return 'border-[var(--border)]';
    }
  }

  valueClass(card: EntitySummaryCard): string {
    switch (card.variant) {
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-[var(--text-active)]';
    }
  }
}
