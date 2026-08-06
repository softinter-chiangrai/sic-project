import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { SicContainerComponent } from '../../../../core/component/sic-container/sic-container.component';
import { SicCardComponent } from '../../../../core/component/sic-card/sic-card.component';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';

type MarketplaceDetail = {
  id: string;
  appCode: string;
  appName: string;
  installed: boolean;
  installStatus: string;
  installedDate?: string | null;
  entities: MarketplaceEntity[];
  programs: MarketplaceProgram[];
  tables: MarketplaceTable[];
};

type MarketplaceEntity = {
  id: string;
  name: string;
  description: string;
  labelEn: string;
  labelLocal: string;
  fields: MarketplaceField[];
};

type MarketplaceField = {
  name: string;
  field: string;
  type: string;
  isRequired: boolean;
  labelEn: string;
  labelLocal: string;
  referenceEntity?: string | null;
  seqNo: number;
};

type MarketplaceProgram = {
  id: string;
  programCode: string;
  icon: string;
  nameEn: string;
  nameLocal: string;
  template: string;
  entityId: string;
  entityName: string;
};

type MarketplaceTable = {
  entityId: string;
  entityName: string;
  tableName: string;
  status: string;
};

@Component({
  selector: 'app-mprt02a',
  standalone: true,
  imports: [
    CommonModule,
    SicContainerComponent,
    SicCardComponent,
    SicButtonComponent,
  ],
  templateUrl: './mprt02a.component.html',
  styleUrl: './mprt02a.component.css',
})
export class Mprt02aComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  marketplaceId = '';

  loading = signal(false);
  actionLoading = signal(false);
  action = signal<'INSTALL' | 'UNINSTALL' | null>(null);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  detail = signal<MarketplaceDetail | null>(null);

  readonly detailApiUrl = computed(() => {
    if (!this.marketplaceId) return '';
    return `${environment.apiBaseUrl}/api/mprt02/marketplaces/${this.marketplaceId}`;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.marketplaceId = params.get('marketplaceId') ?? '';

      if (!this.marketplaceId) {
        this.errorMessage.set('ไม่พบ Marketplace ID');
        return;
      }

      this.loadDetail();
    });
  }

  loadDetail(): void {
    this.loading.set(true);
    this.clearMessage();

    this.http.get<MarketplaceDetail>(this.detailApiUrl()).subscribe({
      next: (response) => {
        this.detail.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.getApiErrorMessage(error, 'โหลดรายละเอียด Marketplace ไม่สำเร็จ'));
        this.loading.set(false);
      },
    });
  }

  install(): void {
    if (!this.marketplaceId) return;

    this.actionLoading.set(true);
    this.action.set('INSTALL');
    this.clearMessage();

    this.http
      .post(`${environment.apiBaseUrl}/api/mprt02/marketplaces/${this.marketplaceId}/install`, {})
      .subscribe({
        next: () => {
          this.successMessage.set('Install marketplace สำเร็จ');
          this.actionLoading.set(false);
          this.action.set(null);
          this.loadDetail();
        },
        error: (error) => {
          this.errorMessage.set(this.getApiErrorMessage(error, 'Install marketplace ไม่สำเร็จ'));
          this.actionLoading.set(false);
          this.action.set(null);
        },
      });
  }

  uninstall(): void {
    if (!this.marketplaceId) return;

    const confirmed = confirm(
      'ยืนยันการ Uninstall Marketplace นี้?\n\nระบบจะถอนการติดตั้งออกจาก Business ปัจจุบัน'
    );

    if (!confirmed) return;

    this.actionLoading.set(true);
    this.action.set('UNINSTALL');
    this.clearMessage();

    this.http
      .delete(`${environment.apiBaseUrl}/api/mprt02/marketplaces/${this.marketplaceId}/uninstall`)
      .subscribe({
        next: () => {
          this.successMessage.set('Uninstall marketplace สำเร็จ');
          this.actionLoading.set(false);
          this.action.set(null);
          this.loadDetail();
        },
        error: (error) => {
          this.errorMessage.set(this.getApiErrorMessage(error, 'Uninstall marketplace ไม่สำเร็จ'));
          this.actionLoading.set(false);
          this.action.set(null);
        },
      });
  }

  back(): void {
    this.router.navigate(['feature','mp','mprt02']);
  }

  openProgram(program: MarketplaceProgram): void {
    const detail = this.detail();

    if (!detail) return;
    
    this.router.navigate(['feature','mp',program.template, detail.id, program.programCode]);
  }

  trackByEntity(_: number, item: MarketplaceEntity): string {
    return item.id;
  }

  trackByField(_: number, item: MarketplaceField): string {
    return item.name;
  }

  trackByProgram(_: number, item: MarketplaceProgram): string {
    return item.id;
  }

  trackByTable(_: number, item: MarketplaceTable): string {
    return item.tableName;
  }

  private clearMessage(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private getApiErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.message ||
      error?.error?.title ||
      error?.message ||
      fallback
    );
  }
}