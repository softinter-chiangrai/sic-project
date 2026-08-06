import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { SicContainerComponent } from '../../../../core/component/sic-container/sic-container.component';
import { SicCardComponent } from '../../../../core/component/sic-card/sic-card.component';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';

type MarketplaceItem = {
  id: string;
  appCode: string;
  appName: string;
  installed: boolean;
  installStatus: string;
  entityCount: number;
  programCount: number;
  installedDate?: string | null;
};

@Component({
  selector: 'app-mprt02',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SicContainerComponent,
    SicCardComponent,
    SicButtonComponent,
    SicInputComponent,
  ],
  templateUrl: './mprt02.component.html',
  styleUrl: './mprt02.component.css',
})
export class Mprt02Component implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  keyword = '';

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  items = signal<MarketplaceItem[]>([]);

  readonly apiUrl = computed(() => {
    const params = new URLSearchParams();

    if (this.keyword.trim()) {
      params.set('keyword', this.keyword.trim());
    }

    const query = params.toString();

    return `${environment.apiBaseUrl}/api/mprt02/marketplaces${query ? `?${query}` : ''}`;
  });

  readonly installedCount = computed(() => {
    return this.items().filter((x) => x.installed).length;
  });

  readonly notInstalledCount = computed(() => {
    return this.items().filter((x) => !x.installed).length;
  });

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get<MarketplaceItem[]>(this.apiUrl()).subscribe({
      next: (response) => {
        this.items.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message ||
            error?.error?.title ||
            error?.message ||
            'โหลด Marketplace ไม่สำเร็จ'
        );
        this.loading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.keyword = '';
    this.search();
  }

  openDetail(item: MarketplaceItem): void {
    this.router.navigate(['feature','mp','mprt02', item.id]);
  }

  trackById(_: number, item: MarketplaceItem): string {
    return item.id;
  }
}