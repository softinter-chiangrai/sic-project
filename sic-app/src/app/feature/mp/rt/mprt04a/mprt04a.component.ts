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
import { SicNumberComponent } from '../../../../core/component/sic-number/sic-number.component';
import { SicDatepickerComponent } from '../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicCheckboxComponent } from '../../../../core/component/sic-checkbox/sic-checkbox.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

type DynamicSchema = {
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
  format?: string;
  require?: boolean;
  isRequired?: boolean;
  labelEn: string;
  labelLocal: string;
  seqNo: number;
  referenceEntity?: string;
  reference_entity?: string;
};

type TransactionResponse = {
  id: string;
  header: Record<string, unknown>;
  details: DetailRow[];
};

type DetailRow = {
  id: string | null;
  state: 0 | 2 | 3 | 4;
  data: Record<string, unknown>;
};

@Component({
  selector: 'app-mprt04a',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SicContainerComponent,
    SicCardComponent,
    SicButtonComponent,
    SicInputComponent,
    SicNumberComponent,
    SicDatepickerComponent,
    SicCheckboxComponent,
    SicComboboxComponent,
  ],
  templateUrl: './mprt04a.component.html',
  styleUrl: './mprt04a.component.css',
})
export class Mprt04aComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  appId = '';
  programCode = '';
  id: string | null = null;

  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);

  headerSchema = signal<DynamicSchema | null>(null);
  detailSchema = signal<DynamicSchema | null>(null);

  headerForm = signal<Record<string, unknown>>({});
  detailRows = signal<DetailRow[]>([]);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  isCreateMode = computed(() => !this.id || this.id === 'new');

  headerFields = computed(() => {
    return (this.headerSchema()?.entity?.fields ?? [])
      .slice()
      .sort((a, b) => a.seqNo - b.seqNo);
  });

  detailFields = computed(() => {
    return (this.detailSchema()?.entity?.fields ?? [])
      .filter(field => !this.isHeaderRelationField(field))
      .slice()
      .sort((a, b) => a.seqNo - b.seqNo);
  });

  visibleDetailRows = computed(() => {
    return this.detailRows().filter(x => x.state !== 2);
  });

  title = computed(() => {
    const entity = this.headerSchema()?.entity;
    return entity?.labelLocal || entity?.labelEn || this.programCode;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.appId = params.get('appId') ?? '';
      this.programCode = params.get('programCode') ?? '';
      this.id = params.get('id');

      this.clearMessage();
      this.headerForm.set({});
      this.detailRows.set([]);

      this.loadHeaderSchema();
      this.loadDetailSchema();

      if (!this.isCreateMode()) {
        this.loadTransaction();
      }
    });
  }

  loadHeaderSchema(): void {
    this.http
      .get<DynamicSchema>(`${environment.apiBaseUrl}/api/dynamic/${this.programCode}/schema`)
      .subscribe({
        next: response => this.headerSchema.set(response),
        error: error => this.errorMessage.set(this.getApiErrorMessage(error, 'โหลด header schema ไม่สำเร็จ')),
      });
  }

  loadDetailSchema(): void {
    this.http
      .get<DynamicSchema>(`${environment.apiBaseUrl}/api/mprt04/${this.programCode}/detail-schema`)
      .subscribe({
        next: response => this.detailSchema.set(response),
        error: error => this.errorMessage.set(this.getApiErrorMessage(error, 'โหลด detail schema ไม่สำเร็จ')),
      });
  }

  loadTransaction(): void {
    if (!this.id || this.isCreateMode()) return;

    this.loading.set(true);

    this.http
      .get<TransactionResponse>(`${environment.apiBaseUrl}/api/mprt04/${this.programCode}/${this.id}`)
      .subscribe({
        next: response => {
          this.headerForm.set(response.header ?? {});
          this.detailRows.set((response.details ?? []).map(row => ({
            id: row.id,
            state: 0,
            data: row.data ?? {},
          })));
          this.loading.set(false);
        },
        error: error => {
          this.errorMessage.set(this.getApiErrorMessage(error, 'โหลดข้อมูลไม่สำเร็จ'));
          this.loading.set(false);
        },
      });
  }

  save(): void {
    this.saving.set(true);
    this.clearMessage();

    const payload = {
      id: this.isCreateMode() ? null : this.id,
      header: this.buildHeaderPayload(),
      details: this.detailRows().map(row => ({
        id: row.id,
        state: row.state,
        data: this.buildDetailPayload(row),
      })),
    };

    this.http
      .post<{ id: string; status: string }>(
        `${environment.apiBaseUrl}/api/mprt04/${this.programCode}/save`,
        payload
      )
      .subscribe({
        next: response => {
          this.saving.set(false);
          this.successMessage.set('บันทึกสำเร็จ');

          if (this.isCreateMode()) {
            this.router.navigate([
              'feature',
              'mp',
              'TRANSACTION_DATA',
              this.appId,
              this.programCode,
              response.id,
            ]);
            return;
          }

          this.loadTransaction();
        },
        error: error => {
          this.errorMessage.set(this.getApiErrorMessage(error, 'บันทึกไม่สำเร็จ'));
          this.saving.set(false);
        },
      });
  }

  delete(): void {
    if (!this.id || this.isCreateMode()) return;

    const confirmed = confirm('ยืนยันการลบเอกสารนี้?');

    if (!confirmed) return;

    this.deleting.set(true);
    this.clearMessage();

    this.http
      .delete(`${environment.apiBaseUrl}/api/mprt04/${this.programCode}/${this.id}`)
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.back();
        },
        error: error => {
          this.errorMessage.set(this.getApiErrorMessage(error, 'ลบไม่สำเร็จ'));
          this.deleting.set(false);
        },
      });
  }

  addDetailRow(): void {
    const visibleRows = this.visibleDetailRows();
    const lineNo = visibleRows.length + 1;

    const data: Record<string, unknown> = {
      lineNo,
      quantity: 1,
      vatRate: 7,
      discountAmount: 0,
      vat_rate: 7,
      discount_amount: 0,
    };

    this.detailRows.update(rows => [
      ...rows,
      {
        id: null,
        state: 4,
        data,
      },
    ]);
  }

  removeDetailRow(row: DetailRow): void {
    if (row.state === 4) {
      this.detailRows.update(rows => rows.filter(x => x !== row));
      this.calculateHeaderTotal();
      return;
    }

    this.detailRows.update(rows =>
      rows.map(x => x === row ? { ...x, state: 2 } : x)
    );

    this.calculateHeaderTotal();
  }

  setHeaderValue(field: DynamicField, value: unknown): void {
    this.headerForm.update(current => ({
      ...current,
      [field.name]: value,
      [field.field]: value,
    }));
  }

  getHeaderValue(field: DynamicField): unknown {
    const data = this.headerForm();

    return data[field.name] ?? data[field.field] ?? '';
  }

  setDetailValue(row: DetailRow, field: DynamicField, value: unknown): void {
    const nextState: 0 | 2 | 3 | 4 = row.state === 4 ? 4 : 3;

    this.detailRows.update(rows =>
      rows.map(item => {
        if (item !== row) return item;

        return {
          ...item,
          state: nextState,
          data: {
            ...item.data,
            [field.name]: value,
            [field.field]: value,
          },
        };
      })
    );
  }

  getDetailValue(row: DetailRow, field: DynamicField): unknown {
    return row.data[field.name] ?? row.data[field.field] ?? '';
  }

  calculateDetailRow(row: DetailRow): void {
    const quantity = Number(row.data['quantity'] ?? 0);
    const unitPrice = Number(row.data['unitPrice'] ?? row.data['unit_price'] ?? 0);
    const discount = Number(row.data['discountAmount'] ?? row.data['discount_amount'] ?? 0);
    const vatRate = Number(row.data['vatRate'] ?? row.data['vat_rate'] ?? 0);

    const amountBeforeVat = Math.max(0, quantity * unitPrice - discount);
    const vatAmount = amountBeforeVat * vatRate / 100;
    const totalAmount = amountBeforeVat + vatAmount;

    this.setDetailValue(row, this.fakeField('amountBeforeVat', 'amount_before_vat'), amountBeforeVat);
    this.setDetailValue(row, this.fakeField('vatAmount', 'vat_amount'), vatAmount);
    this.setDetailValue(row, this.fakeField('totalAmount', 'total_amount'), totalAmount);

    this.calculateHeaderTotal();
  }

  calculateHeaderTotal(): void {
    const rows = this.visibleDetailRows();

    const subTotal = rows.reduce((sum, row) => {
      return sum + Number(row.data['amountBeforeVat'] ?? row.data['amount_before_vat'] ?? 0);
    }, 0);

    const vatAmount = rows.reduce((sum, row) => {
      return sum + Number(row.data['vatAmount'] ?? row.data['vat_amount'] ?? 0);
    }, 0);

    const totalAmount = rows.reduce((sum, row) => {
      return sum + Number(row.data['totalAmount'] ?? row.data['total_amount'] ?? 0);
    }, 0);

    this.headerForm.update(current => ({
      ...current,
      subTotalAmount: subTotal,
      sub_total_amount: subTotal,
      vatAmount,
      vat_amount: vatAmount,
      totalAmount,
      total_amount: totalAmount,
    }));
  }

  back(): void {
    this.router.navigate([
      'feature',
      'mp',
      'TRANSACTION_DATA',
      this.appId,
      this.programCode,
    ]);
  }

  getLabel(field: DynamicField): string {
    return field.labelLocal || field.labelEn || field.name;
  }

  isRequired(field: DynamicField): boolean {
    return field.require === true || field.isRequired === true;
  }

  isAuto(field: DynamicField): boolean {
    return this.normalizeType(field) === 'AUTO';
  }

  isReference(field: DynamicField): boolean {
    const type = this.normalizeType(field);

    return type === 'REFERENCE' || type === 'REFERANCE';
  }

  isDate(field: DynamicField): boolean {
    return this.normalizeType(field) === 'DATE';
  }

  isNumber(field: DynamicField): boolean {
    const type = this.normalizeType(field);

    return type === 'NUMBER' || type === 'INTEGER';
  }

  isInteger(field: DynamicField): boolean {
    return this.normalizeType(field) === 'INTEGER';
  }

  isBoolean(field: DynamicField): boolean {
    return this.normalizeType(field) === 'BOOLEAN';
  }

  isText(field: DynamicField): boolean {
    return !this.isAuto(field) &&
      !this.isReference(field) &&
      !this.isDate(field) &&
      !this.isNumber(field) &&
      !this.isBoolean(field);
  }

  getReferenceApiUrl(field: DynamicField): string {
    const referenceEntity = this.getReferenceEntity(field);

    if (!referenceEntity) return '';

    return `${environment.apiBaseUrl}/api/mprt03/${encodeURIComponent(referenceEntity)}/options`;
  }

  trackByField(_: number, field: DynamicField): string {
    return field.field;
  }

  trackByDetailRow(index: number, row: DetailRow): string {
    return row.id ?? `new-${index}`;
  }

  private buildHeaderPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    for (const field of this.headerFields()) {
      if (this.isAuto(field)) continue;

      payload[field.name] = this.getHeaderValue(field);
    }

    return payload;
  }

  private buildDetailPayload(row: DetailRow): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    for (const field of this.detailFields()) {
      if (this.isAuto(field)) continue;

      payload[field.name] = this.getDetailValue(row, field);
    }

    return payload;
  }

  private isHeaderRelationField(field: DynamicField): boolean {
    const headerEntityName = this.headerSchema()?.entity?.name?.trim();

    if (!headerEntityName) return false;

    const referenceEntity = this.getReferenceEntity(field);
    const referenceEntityName = referenceEntity?.split('.').pop()?.trim();

    if (
      this.isReference(field) &&
      referenceEntityName &&
      referenceEntityName.toLowerCase() === headerEntityName.toLowerCase()
    ) {
      return true;
    }

    const expectedName = `${headerEntityName}Id`;
    const expectedField = `${this.toSnakeCase(headerEntityName)}_id`;

    return field.name?.toLowerCase() === expectedName.toLowerCase()
      || field.field?.toLowerCase() === expectedField.toLowerCase();
  }

  private getReferenceEntity(field: DynamicField): string | null {
    return field.referenceEntity ?? field.reference_entity ?? null;
  }

  private toSnakeCase(value: string): string {
    return value
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  private fakeField(name: string, field: string): DynamicField {
    return {
      name,
      field,
      type: 'number',
      labelEn: name,
      labelLocal: name,
      seqNo: 0,
    };
  }

  private normalizeType(field: DynamicField): string {
    return (field.type || '').trim().toUpperCase();
  }

  private clearMessage(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private getApiErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.title || error?.message || fallback;
  }
}