import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { SicContainerComponent } from '../../../../core/component/sic-container/sic-container.component';
import { SicCardComponent } from '../../../../core/component/sic-card/sic-card.component';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';

type MarketplaceDetail = {
  id: string;
  appCode: string;
  appName: string;
  entityCount: number;
  programCount: number;
  installCount: number;
  canDelete: boolean;
  entities: {
    id: string;
    name: string;
    labelEn: string;
    labelLocal: string;
    fieldCount: number;
  }[];
  programs: {
    id: string;
    programCode: string;
    nameEn: string;
    nameLocal: string;
    entityName: string;
  }[];
};

@Component({
  selector: 'app-mprt01a',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SicContainerComponent,
    SicCardComponent,
    SicButtonComponent,
    SicInputComponent,
  ],
  templateUrl: './mprt01a.component.html',
  styleUrl: './mprt01a.component.css',
})
export class Mprt01aComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  marketplaceId: string | null = null;

  loading = signal(false);
  saving = signal(false);
  importing = signal(false);
  deleting = signal(false);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  detail = signal<MarketplaceDetail | null>(null);

  appCode = '';
  appName = '';
  importJson = '';

  readonly isCreateMode = computed(() => !this.marketplaceId);

  readonly detailApiUrl = computed(() => {
    if (!this.marketplaceId) return '';
    return `${environment.apiBaseUrl}/api/mprt01/marketplaces/${this.marketplaceId}`;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.marketplaceId = params.get('marketplaceId');

      if (this.marketplaceId) {
        this.loadDetail();
      }
    });
  }

  loadDetail(): void {
    if (!this.marketplaceId) return;

    this.loading.set(true);
    this.clearMessage();

    this.http.get<MarketplaceDetail>(this.detailApiUrl()).subscribe({
      next: (response) => {
        this.detail.set(response);
        this.appCode = response.appCode;
        this.appName = response.appName;
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.getApiErrorMessage(error, 'โหลดรายละเอียดไม่สำเร็จ'));
        this.loading.set(false);
      },
    });
  }

  save(): void {
    this.clearMessage();

    if (!this.appCode.trim()) {
      this.errorMessage.set('กรุณาระบุ App Code');
      return;
    }

    if (!this.appName.trim()) {
      this.errorMessage.set('กรุณาระบุ App Name');
      return;
    }

    this.saving.set(true);

    this.http.post<{ id: string; status: string }>(
      `${environment.apiBaseUrl}/api/mprt01/marketplaces`,
      {
        id: this.marketplaceId,
        appCode: this.appCode,
        appName: this.appName,
      }
    ).subscribe({
      next: (response) => {
        this.successMessage.set('บันทึกข้อมูลสำเร็จ');
        this.saving.set(false);

        if (!this.marketplaceId) {
          this.router.navigate(['/mprt01a', response.id]);
          return;
        }

        this.loadDetail();
      },
      error: (error) => {
        this.errorMessage.set(this.getApiErrorMessage(error, 'บันทึกข้อมูลไม่สำเร็จ'));
        this.saving.set(false);
      },
    });
  }

  importMarketplace(): void {
    this.clearMessage();

    if (!this.importJson.trim()) {
      this.errorMessage.set('กรุณาวาง JSON สำหรับ Import');
      return;
    }

    let payload: unknown;

    try {
      payload = JSON.parse(this.importJson);
    } catch {
      this.errorMessage.set('JSON ไม่ถูกต้อง');
      return;
    }

    this.importing.set(true);

    this.http.post<any>(
      `${environment.apiBaseUrl}/api/mprt01/marketplaces/import`,
      payload
    ).subscribe({
      next: (response) => {
        this.successMessage.set('Import สำเร็จ');
        this.importing.set(false);

        const id = response?.id || response?.marketplaceId;

        if (id) {
          this.router.navigate(['/mprt01a', id]);
          return;
        }

        this.router.navigate(['/mprt01']);
      },
      error: (error) => {
        this.errorMessage.set(this.getApiErrorMessage(error, 'Import ไม่สำเร็จ'));
        this.importing.set(false);
      },
    });
  }

  deleteMarketplace(): void {
    const detail = this.detail();

    if (!this.marketplaceId || !detail) return;

    if (!detail.canDelete) {
      this.errorMessage.set('ลบไม่ได้ เพราะ Marketplace นี้ถูก Install แล้ว');
      return;
    }

    const confirmed = confirm(`ยืนยันการลบ Marketplace: ${detail.appName}?`);

    if (!confirmed) return;

    this.deleting.set(true);
    this.clearMessage();

    this.http.delete(`${environment.apiBaseUrl}/api/mprt01/marketplaces/${this.marketplaceId}`)
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.router.navigate(['/mprt01']);
        },
        error: (error) => {
          this.errorMessage.set(this.getApiErrorMessage(error, 'ลบข้อมูลไม่สำเร็จ'));
          this.deleting.set(false);
        },
      });
  }

  back(): void {
    this.router.navigate(['feature','mp','mprt01']);
  }

  formatJson(): void {
    this.clearMessage();

    if (!this.importJson.trim()) return;

    try {
      this.importJson = JSON.stringify(JSON.parse(this.importJson), null, 2);
    } catch {
      this.errorMessage.set('JSON ไม่ถูกต้อง');
    }
  }

  trackByEntity(_: number, item: MarketplaceDetail['entities'][number]): string {
    return item.id;
  }

  trackByProgram(_: number, item: MarketplaceDetail['programs'][number]): string {
    return item.id;
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