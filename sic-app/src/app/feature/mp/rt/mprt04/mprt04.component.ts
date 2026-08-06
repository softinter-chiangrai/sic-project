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

type DynamicSchema = {
  title?: string;
  programCode?: string;
  entity: {
    name: string;
    labelEn: string;
    labelLocal: string;
    fields: DynamicField[];
  };
};

type DynamicField = {
  name: string;
  field: string;
  type: string;
  labelEn: string;
  labelLocal: string;
  seqNo: number;
};

type PaginationResponse = {
  data: Record<string, unknown>[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    totalRow?: number;
    totalPage?: number;
    totalElements?: number;
    totalPages?: number;
  };
};

@Component({
  selector: 'app-mprt04',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SicContainerComponent,
    SicCardComponent,
    SicButtonComponent,
    SicInputComponent,
  ],
  templateUrl: './mprt04.component.html',
  styleUrl: './mprt04.component.css',
})
export class Mprt04Component implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  appId = '';
  programCode = '';

  keyword = '';
  pageNumber = 1;
  pageSize = 10;

  loading = signal(false);
  schema = signal<DynamicSchema | null>(null);
  rows = signal<Record<string, unknown>[]>([]);
  totalRow = signal(0);
  errorMessage = signal<string | null>(null);

  fields = computed(() => {
    return (this.schema()?.entity?.fields ?? [])
      .sort((a, b) => a.seqNo - b.seqNo);
  });

  title = computed(() => {
    const entity = this.schema()?.entity;
    return entity?.labelLocal || entity?.labelEn || this.programCode;
  });

  totalPage = computed(() => {
    return Math.max(1, Math.ceil(this.totalRow() / this.pageSize));
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.appId = params.get('appId') ?? '';
      this.programCode = params.get('programCode') ?? '';

      this.pageNumber = 1;
      this.loadSchema();
      this.search();
    });
  }

  loadSchema(): void {
    this.http
      .get<DynamicSchema>(`${environment.apiBaseUrl}/api/dynamic/${this.programCode}/schema`)
      .subscribe({
        next: response => this.schema.set(response),
        error: error => this.errorMessage.set(this.getApiErrorMessage(error, 'โหลด schema ไม่สำเร็จ')),
      });
  }

  search(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http
      .post<PaginationResponse>(
        `${environment.apiBaseUrl}/api/dynamic/${this.programCode}/search`,
        {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          keyword: this.keyword.trim(),
        }
      )
      .subscribe({
        next: response => {
          this.rows.set(response.data ?? []);
          this.totalRow.set(
            response.pageable?.totalRow ??
            response.pageable?.totalElements ??
            0
          );
          this.loading.set(false);
        },
        error: error => {
          this.errorMessage.set(this.getApiErrorMessage(error, 'ค้นหาไม่สำเร็จ'));
          this.loading.set(false);
        },
      });
  }

  clearSearch(): void {
    this.keyword = '';
    this.pageNumber = 1;
    this.search();
  }

  add(): void {
    this.router.navigate([
      'feature',
      'mp',
      'TRANSACTION_DATA',
      this.appId,
      this.programCode,
      'new',
    ]);
  }

  edit(row: Record<string, unknown>): void {
    this.router.navigate([
      'feature',
      'mp',
      'TRANSACTION_DATA',
      this.appId,
      this.programCode,
      row['id'],
    ]);
  }

  prevPage(): void {
    if (this.pageNumber <= 1) return;

    this.pageNumber--;
    this.search();
  }

  nextPage(): void {
    if (this.pageNumber >= this.totalPage()) return;

    this.pageNumber++;
    this.search();
  }

  getDisplayValue(row: Record<string, unknown>, field: DynamicField): string {
    const value = row[field.field] ?? row[field.name];

    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (field.type?.toUpperCase() === 'DATE') {
      return this.formatDate(value);
    }

    if (field.type?.toUpperCase() === 'NUMBER') {
      return this.formatNumber(value);
    }

    return String(value);
  }

  trackByRow(_: number, row: Record<string, unknown>): string {
    return String(row['id']);
  }

  trackByField(_: number, field: DynamicField): string {
    return field.field;
  }

  private formatDate(value: unknown): string {
    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('th-TH');
  }

  private formatNumber(value: unknown): string {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return String(value);
    }

    return number.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private getApiErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.title || error?.message || fallback;
  }
}