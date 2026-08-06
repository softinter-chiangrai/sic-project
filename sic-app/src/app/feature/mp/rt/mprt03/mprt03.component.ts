import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { SicContainerComponent } from '../../../../core/component/sic-container/sic-container.component';
import { SicCardComponent } from '../../../../core/component/sic-card/sic-card.component';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicGridColumnConfig, SicGridPanelComponent, SicGridPanelConfig } from '../../../../core/component/sic-gridpanel/sic-gridpanel.component';

type DynamicField = {
  name: string;
  field: string;
  type: string;
  isRequired: boolean;
  labelEn: string;
  labelLocal: string;
  referenceEntity?: string | null;
  seqNo: number;
};

type DynamicSchema = {
  programCode: string;
  nameEn: string;
  nameLocal: string;
  template: string;
  entity: {
    name: string;
    description: string;
    labelEn: string;
    labelLocal: string;
    fields: DynamicField[];
  };
};

@Component({
  selector: 'app-mprt03',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    SicContainerComponent,
    SicCardComponent,
    SicButtonComponent,
    SicInputComponent,
    SicGridPanelComponent,
  ],
  templateUrl: './mprt03.component.html',
  styleUrl: './mprt03.component.css',
})
export class Mprt03Component implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  appId = '';
  programCode = '';
  keyword = '';

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  schema = signal<DynamicSchema | null>(null);
  gridConfig = signal<SicGridPanelConfig | null>(null);

  readonly title = computed(() => {
    const schema = this.schema();

    if (!schema) return 'Dynamic Master Data';

    return schema.nameLocal || schema.nameEn || schema.programCode;
  });

  readonly fields = computed(() => {
    return this.schema()?.entity?.fields ?? [];
  });

  readonly schemaApiUrl = computed(() => {
    if (!this.programCode) return '';

    return `${environment.apiBaseUrl}/api/dynamic/${this.programCode}/schema`;
  });

  readonly gridApiUrl = computed(() => {
    if (!this.programCode) return '';

    return `${environment.apiBaseUrl}/api/mprt03/${this.programCode}`;
  });

  readonly gridSaveApiUrl = computed(() => {
    if (!this.programCode) return '';

    return `${environment.apiBaseUrl}/api/mprt03/${this.programCode}/save`;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.appId = params.get('appId') ?? '';
      this.programCode = params.get('programCode') ?? '';

      this.clearMessage();
      this.schema.set(null);
      this.gridConfig.set(null);

      if (!this.appId || !this.programCode) {
        this.errorMessage.set('URL ไม่ถูกต้อง ต้องเป็น mp/{appId}/{programCode}');
        return;
      }

      this.loadSchema();
    });
  }

  loadSchema(): void {
    this.loading.set(true);
    this.clearMessage();

    this.http.get<DynamicSchema>(this.schemaApiUrl()).subscribe({
      next: (response) => {
        const sortedFields = [...(response.entity?.fields ?? [])].sort(
          (a, b) => (a.seqNo ?? 0) - (b.seqNo ?? 0)
        );

        this.schema.set({
          ...response,
          entity: {
            ...response.entity,
            fields: sortedFields,
          },
        });

        this.buildGridConfig();
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.getApiErrorMessage(error, 'โหลด schema ไม่สำเร็จ'));
        this.loading.set(false);
      },
    });
  }

  search(): void {
    this.buildGridConfig();
  }

  clearSearch(): void {
    this.keyword = '';
    this.buildGridConfig();
  }

  onGridRowsChange(rows: Record<string, unknown>[]): void {
    // ใช้สำหรับ debug หรือ future logic ได้
    // console.log('grid rows changed', rows);
  }

  onGridAction(event: {
    action: string;
    row?: Record<string, unknown> | null;
    rows?: Record<string, unknown>[];
    column?: SicGridColumnConfig | null;
  }): void {
    if (event.action === 'save') {
      this.successMessage.set('บันทึกข้อมูลสำเร็จ');
      return;
    }

    if (event.action === 'save-error') {
      this.errorMessage.set('บันทึกข้อมูลไม่สำเร็จ');
      return;
    }
  }

  private buildGridConfig(): void {
    const schema = this.schema();

    if (!schema || !this.programCode) return;

    const columns = this.buildGridColumns(schema.entity.fields);

    this.gridConfig.set({
      api: this.gridApiUrl(),
      saveApi: this.gridSaveApiUrl(),
      saveMethod: 'POST',

      id: 'id',
      pageable: true,
      pageNumber: 1,
      pageSize: 10,

      keyword: this.keyword.trim(),
      keywordParam: 'keyword',

      defaultSortField: 'created_date',
      defaultSortDescending: true,

      softDelete: true,

      createRowValue: () => this.buildCreateRowValue(schema.entity.fields),

      savePayload: (row, state) => {
        return this.buildSavePayload(row, state, schema.entity.fields);
      },

      columns,
    });
  }

  private buildGridColumns(fields: DynamicField[]): SicGridColumnConfig[] {
    const columns: SicGridColumnConfig[] = fields.map((field) => {
      const column: SicGridColumnConfig = {
        label: field.labelLocal || field.labelEn || field.name,
        name: field.field,
        type: this.mapToGridColumnType(field),
        editable: true,
        sortable: true,
        width: this.getColumnWidth(field),
        placeholder: field.labelLocal || field.labelEn || field.name,
      };
      
      if (this.isReferenceField(field)) {

        column.type = 'combobox';
        column.apiUrl = `${environment.apiBaseUrl}/api/mprt03/${field.referenceEntity}/options`;
        column.pageSize = 20;
        column.paging = true;
        column.clearable = !field.isRequired;
        column.placeholder = `เลือก${field.labelLocal || field.labelEn || field.name}`;
      }

      if (this.isBooleanField(field)) {
        column.checkedValue = true;
        column.uncheckedValue = false;
        column.width = 130;
      }

      return column;
    });

    columns.push({
      label: 'Row Version',
      name: 'row_version',
      type: 'text',
      editable: false,
      sortable: false,
      width: 130,
    });

    return columns;
  }

  private buildCreateRowValue(fields: DynamicField[]): Record<string, unknown> {
    const row: Record<string, unknown> = {};

    for (const field of fields) {
      row[field.field] = this.getDefaultValue(field);
    }

    return row;
  }

  private buildSavePayload(
    row: Record<string, unknown>,
    state: 4 | 3 | 2,
    fields: DynamicField[]
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      id: row['id'] ?? null,
      rowVersion: row['row_version'] ?? row['rowVersion'] ?? 0,
      state,
      data: {},
    };

    const data: Record<string, unknown> = {};

    for (const field of fields) {
      const value = row[field.field];

      data[field.name] = this.convertValueForApi(value, field.type);
    }

    payload['data'] = data;

    return payload;
  }

  private mapToGridColumnType(field: DynamicField): string {
    const type = (field.type || '').toLowerCase();

    switch (type) {
      case 'integer':
      case 'number':
        return 'number';

      case 'date':
        return 'date';

      case 'datetime':
        return 'date';

      case 'boolean':
        return 'checkbox';

      case 'reference':
      case 'referance':
        return 'combobox';

      default:
        return 'text';
    }
  }

  private getColumnWidth(field: DynamicField): number {
    const type = (field.type || '').toLowerCase();

    if (type === 'boolean') return 130;
    if (type === 'integer' || type === 'number') return 140;
    if (type === 'date' || type === 'datetime') return 160;
    if (type === 'reference' || type === 'referance') return 240;

    return 220;
  }

  private getDefaultValue(field: DynamicField): unknown {
    const type = (field.type || '').toLowerCase();

    switch (type) {
      case 'boolean':
        return false;

      case 'integer':
      case 'number':
        return null;

      case 'reference':
      case 'referance':
        return null;

      default:
        return '';
    }
  }

  private convertValueForApi(value: unknown, type: string): unknown {
    if (value === '' || value === undefined) {
      return null;
    }

    switch ((type || '').toLowerCase()) {
      case 'boolean':
        return value === true;

      case 'integer':
        return value === null ? null : Number.parseInt(String(value), 10);

      case 'number':
        return value === null ? null : Number(value);

      case 'reference':
      case 'referance':
        return value || null;

      default:
        return value;
    }
  }

  private isReferenceField(field: DynamicField): boolean {
    const type = (field.type || '').toLowerCase();

    return type === 'reference' || type === 'referance';
  }

  private isBooleanField(field: DynamicField): boolean {
    return (field.type || '').toLowerCase() === 'boolean';
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