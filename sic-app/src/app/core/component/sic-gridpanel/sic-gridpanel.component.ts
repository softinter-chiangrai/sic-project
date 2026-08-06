import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { AsyncValidatorFn, FormControl, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { SicInputComponent } from '../sic-input/sic-input.component';
import { SicNumberComponent } from '../sic-number/sic-number.component';
import { SicInputAreaComponent } from '../sic-input-area/sic-input-area.component';
import { SicCheckboxComponent } from '../sic-checkbox/sic-checkbox.component';
import { SicDatepickerComponent } from '../sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../sic-timepicker/sic-timepicker.component';
import { SicComboboxComponent } from '../sic-combobox/sic-combobox.component';
import { SicRadioComponent, SicRadioOption } from '../sic-radio/sic-radio.component';
import { SicColorpickerComponent } from '../sic-colorpicker/sic-colorpicker.component';
import { SicInputUploadComponent } from '../sic-input-upload/sic-input-upload.component';
import { SicUploadCategory } from '../sic-upload/sic-upload.component';
import { TooltipDirective } from '../../directive/tooltip/tootop.directive';
import { DialogService } from '../../services/dialog.service';

const SIC_GRID_INPUT_IMPORTS = [
  SicInputComponent,
  SicNumberComponent,
  SicInputAreaComponent,
  SicCheckboxComponent,
  SicDatepickerComponent,
  SicTimepickerComponent,
  SicComboboxComponent,
  SicRadioComponent,
  SicColorpickerComponent,
  SicInputUploadComponent,
];

const SIC_GRID_TEMPLATE_IMPORTS = [TooltipDirective];

export type SicGridPanelTemplateSection = 'cell' | 'header' | 'footer';

export interface SicGridOption {
  label: string;
  value: unknown;
}

export interface SicGridColumnAction {
  name: string;
  label: string;
  variant?: 'default' | 'danger' | 'ghost';
}

export interface SicGridColumnConfig {
  label: string;
  name: string;
  type: string;
  editable?: boolean;
  sortable?: boolean;
  width?: number;
  placeholder?: string;
  hidden?: boolean;
  options?: SicGridOption[];
  apiUrl?: string;
  params?: Record<string, unknown>;
  valueField?: string;
  textField?: string;
  pageSize?: number;
  paging?: boolean;
  checkedValue?: unknown;
  uncheckedValue?: unknown;
  rows?: number;
  direction?: 'vertical' | 'horizontal';
  dateFormat?: string;
  clearable?: boolean;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  decimal?: number;
  multiple?: boolean | ((row: Record<string, unknown>, column: SicGridColumnConfig) => boolean);
  uploadCategory?: SicUploadCategory | ((row: Record<string, unknown>, column: SicGridColumnConfig) => SicUploadCategory);
  visibility?: 1 | 2 | 3 | 4 | ((row: Record<string, unknown>, column: SicGridColumnConfig) => 1 | 2 | 3 | 4);
  uploadGroupId?: string | null | ((row: Record<string, unknown>, column: SicGridColumnConfig) => string | null);
  accept?: string | ((row: Record<string, unknown>, column: SicGridColumnConfig) => string | undefined);
  businessId?: string | ((row: Record<string, unknown>, column: SicGridColumnConfig) => string | undefined);
  emptyText?: string | ((row: Record<string, unknown>, column: SicGridColumnConfig) => string | undefined);
  helperText?: string | ((row: Record<string, unknown>, column: SicGridColumnConfig) => string | undefined);
  hint?: string;
  validator?: ValidatorFn | ValidatorFn[] | null;
  validators?: ValidatorFn | ValidatorFn[] | null;
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  errorMessages?: Record<string, string>;
  buttonText?: string;
  actions?: SicGridColumnAction[];
  footerText?: string;
  customTemplate?: string;
}

export interface SicGridPanelConfig {
  api: string;
  id: string;
  defaultSortField?: string;
  defaultSortDescending?: boolean;
  pageable?: boolean;
  pageNumber?: number;
  pageSize?: number;
  pageNumberParam?: string;
  pageSizeParam?: string;
  keywordParam?: string;
  keyword?: string;
  params?: Record<string, unknown>;
  softDelete?: boolean;
  disableRow?: (row: Record<string, unknown>) => boolean;
  saveApi?: string;
  saveMethod?: 'POST' | 'PUT' | 'PATCH';
  savePayload?: (row: Record<string, unknown>, state: SicGridPersistState) => unknown;
  deleteApi?: string | ((row: Record<string, unknown>) => string);
  deleteMethod?: 'DELETE' | 'POST' | 'PUT' | 'PATCH';
  deletePayload?: (row: Record<string, unknown>) => unknown;
  createRowValue?: Record<string, unknown> | (() => Record<string, unknown>);
  column?: SicGridColumnConfig[];
  columns?: SicGridColumnConfig[];
}

interface SicGridPagingState {
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
}

interface SicGridResponse<TItem> {
  data?: TItem[];
  pageable?: SicGridPagingState;
}

interface SicGridControlState {
  touched: boolean;
  dirty: boolean;
}

type SicGridPagerItem = number | 'start-ellipsis' | 'end-ellipsis';

type SicGridCellControlKey = `${string}:${string}`;
type SicGridRowState = 'active' | 'new' | 'updated' | 'deleted';
type SicGridPersistState = 4 | 3 | 2;
type SicGridRowData = Record<string, unknown>;

@Directive({
  selector: 'ng-template[sicGridPanelTemplate]',
  standalone: true,
})
export class SicGridPanelTemplate {
  @Input('sicGridPanelTemplate') name = '';
  @Input() section: SicGridPanelTemplateSection = 'cell';

  constructor(readonly template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'sic-gridpanel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...SIC_GRID_TEMPLATE_IMPORTS,
    ...SIC_GRID_INPUT_IMPORTS,
  ],
  providers: [DatePipe],
  templateUrl: './sic-gridpanel.component.html',
  styleUrl: './sic-gridpanel.component.css',
})
export class SicGridPanelComponent implements OnChanges, AfterContentInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) config!: SicGridPanelConfig;

  @Output() readonly rowsChange = new EventEmitter<SicGridRowData[]>();
  @Output() readonly rowAction = new EventEmitter<{ action: string; row?: SicGridRowData | null; rows?: SicGridRowData[]; column?: SicGridColumnConfig | null }>();
  @Output() readonly softDeleteChange = new EventEmitter<{ id: unknown; deleted: boolean; row: SicGridRowData }>();

  @HostBinding('class.sic-gridpanel-host') readonly hostClass = true;

  @ContentChildren(SicGridPanelTemplate) templates?: QueryList<SicGridPanelTemplate>;
  @ViewChild('surface') private readonly surfaceRef?: ElementRef<HTMLDivElement>;

  readonly rows: SicGridRowData[] = [];
  readonly deletedRowIds = new Set<string>();
  readonly selectedRowIds = new Set<string>();

  loading = false;
  saving = false;
  reviewChangesOnly = false;
  errorMessage: string | null = null;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 1;
  sortField: string | null = null;
  sortDescending = false;
  gridTemplateColumns = '';

  private loadSubscription: Subscription | null = null;
  private readonly controlMap = new Map<SicGridCellControlKey, FormControl>();
  private readonly controlSubscriptions = new Map<SicGridCellControlKey, Subscription>();
  private readonly controlStateMap = new Map<SicGridCellControlKey, SicGridControlState>();
  private readonly selectionControlMap = new Map<string, FormControl>();
  private readonly selectionSubscriptions = new Map<string, Subscription>();
  private readonly originalRowSnapshots = new Map<string, string>();
  private readonly localAddedRows: SicGridRowData[] = [];
  private readonly localUpdatedRows = new Map<string, SicGridRowData>();
  private readonly radioOptionsCache = new WeakMap<SicGridColumnConfig, { source: SicGridOption[] | undefined; mapped: SicRadioOption[] }>();
  private readonly emptyColumnParams: Record<string, unknown> = {};
  private readonly emptyRadioOptions: SicRadioOption[] = [];
  private readonly rowKeys = new WeakMap<object, string>();
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly datePipe = inject(DatePipe);
  private readonly dialogService = inject(DialogService);
  private templatesReady = false;
  private rowKeySequence = 0;
  private pageBeforeReviewChanges = 1;
  private latestServerRows: SicGridRowData[] = [];
  private serverTotalElements = 0;
  private syncingSelectionState = false;
  private validationRequested = false;
  readonly selectAllControl = new FormControl(false);
  private readonly selectAllSubscription = this.selectAllControl.valueChanges.subscribe((checked) => {
    if (this.syncingSelectionState) {
      return;
    }

    this.toggleSelectAll(checked === true);
  });

  get visibleColumns(): SicGridColumnConfig[] {
    return (this.config?.column ?? this.config?.columns ?? []).filter((column) => !column.hidden);
  }

  get hasFooter(): boolean {
    return this.visibleColumns.some((column) => !!column.footerText || !!this.findTemplate(this.resolveTemplateName(column), 'footer'));
  }

  get showPager(): boolean {
    return this.config?.pageable !== false;
  }

  get hasUploadColumn(): boolean {
    return this.visibleColumns.some((column) => column.type === 'upload');
  }

  get hasPendingChanges(): boolean {
    return this.getTrackedRows().some((row) => {
      const state = this.getRowState(row);
      return state === 'new' || state === 'updated' || state === 'deleted';
    });
  }

  get canSaveChanges(): boolean {
    if (!this.hasPendingChanges || this.loading || this.saving) {
      return false;
    }

    if (!this.config.saveApi) {
      return false;
    }

    return true;
  }

  get isBusy(): boolean {
    return this.loading || this.saving;
  }

  get changedRowsCount(): number {
    return this.getChangedRows().length;
  }

  get canReviewChanges(): boolean {
    return this.reviewChangesOnly || this.changedRowsCount > 0;
  }

  get pagerItems(): SicGridPagerItem[] {
    if (this.totalPages <= 1) {
      return [1];
    }

    const windowSize = 5;
    const halfWindow = Math.floor(windowSize / 2);
    let startPage = Math.max(1, this.currentPage - halfWindow);
    let endPage = Math.min(this.totalPages, startPage + windowSize - 1);

    if (endPage - startPage + 1 < windowSize) {
      startPage = Math.max(1, endPage - windowSize + 1);
    }

    const items: SicGridPagerItem[] = [];

    if (startPage > 1) {
      items.push(1);
    }

    if (startPage > 2) {
      items.push('start-ellipsis');
    }

    for (let page = startPage; page <= endPage; page += 1) {
      items.push(page);
    }

    if (endPage < this.totalPages - 1) {
      items.push('end-ellipsis');
    }

    if (endPage < this.totalPages) {
      items.push(this.totalPages);
    }

    return items;
  }

  get selectedRows(): SicGridRowData[] {
    return this.rows.filter((row) => this.selectedRowIds.has(this.getRowKey(row)));
  }

  get selectedCount(): number {
    return this.selectedRows.length;
  }

  get canDeleteSelected(): boolean {
    return this.selectedRows.some((row) => !this.isRowDeleted(row) && !this.isRowDisabled(row));
  }

  get selectableCount(): number {
    return this.rows.filter((row) => !this.isRowDeleted(row) && !this.isRowDisabled(row)).length;
  }

  get deletedCount(): number {
    return this.getTrackedRows().filter((row) => this.getRowState(row) === 'deleted').length;
  }

  get newCount(): number {
    return this.getTrackedRows().filter((row) => this.getRowState(row) === 'new').length;
  }

  get updatedCount(): number {
    return this.getTrackedRows().filter((row) => this.getRowState(row) === 'updated').length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.currentPage = this.config?.pageNumber ?? 1;
      this.pageSize = this.config?.pageSize ?? 10;
      this.applyDefaultSort();
      this.deletedRowIds.clear();
      this.selectedRowIds.clear();
      this.localAddedRows.splice(0, this.localAddedRows.length);
      this.localUpdatedRows.clear();
      this.latestServerRows = [];
      this.serverTotalElements = 0;
      this.originalRowSnapshots.clear();
      this.controlStateMap.clear();
      this.validationRequested = false;
      this.updateGridTemplateColumns();
      if (this.config?.api) {
        this.loadRows(true);
      }
    }
  }

  ngAfterContentInit(): void {
    this.templatesReady = true;
    this.templates?.changes.subscribe(() => this.cdr.markForCheck());
  }

  ngAfterViewInit(): void {
    this.updateGridTemplateColumns();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    this.disposeControls();
    this.disposeSelectionControls();
    this.selectAllSubscription.unsubscribe();
  }

  @HostListener('window:resize')
  handleWindowResize(): void {
    this.updateGridTemplateColumns();
  }

  reload(): void {
    this.loadRows(false);
  }

  addRow(): void {
    if (this.loading) {
      return;
    }

    this.appendNewRow();
  }

  toggleReviewChanges(): void {
    if (!this.canReviewChanges) {
      return;
    }

    this.reviewChangesOnly = !this.reviewChangesOnly;

    if (this.reviewChangesOnly) {
      this.pageBeforeReviewChanges = this.currentPage;
      this.currentPage = 1;
      this.refreshRowsForCurrentMode();
      this.rowAction.emit({ action: 'review-changes', row: null, rows: this.getChangedRows(), column: null });
      return;
    }

    this.currentPage = Math.max(1, this.pageBeforeReviewChanges);
    this.rowAction.emit({ action: 'review-all', row: null, rows: this.getTrackedRows(), column: null });
    this.loadRows(false);
  }

  async saveChanges(): Promise<void> {
    if (!this.canSaveChanges) {
      return;
    }

    this.validationRequested = true;
    this.touchVisibleControls();
    if (this.hasVisibleInvalidControls()) {
      void this.dialogService.warn('Validation Error', 'Please check and correct invalid fields before saving.');
      this.cdr.markForCheck();
      return;
    }

    const trackedRows = this.getTrackedRows();
    const rowsToPersist = trackedRows.filter((row) => {
      const state = this.getRowState(row);
      return state === 'new' || state === 'updated' || state === 'deleted';
    }).sort((leftRow, rightRow) => {
      const leftState = this.getRowState(leftRow);
      const rightState = this.getRowState(rightRow);
      return this.getPersistPriority(leftState) - this.getPersistPriority(rightState);
    });
    const saveApi = this.config.saveApi;

    this.saving = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    try {
      if (!saveApi) {
        return;
      }

      const payload = rowsToPersist.map((row) => {
        const state = this.getRowState(row);
        return this.buildSavePayload(row, this.toEntityState(state));
      });
      const reloadPage = this.reviewChangesOnly ? this.pageBeforeReviewChanges : this.currentPage;

      await firstValueFrom(this.http.request(this.config.saveMethod ?? 'POST', saveApi, {
        body: payload,
      }));

      this.validationRequested = false;
      this.resetTrackedStateAfterSave(reloadPage);
      this.rowAction.emit({ action: 'save', row: null, rows: trackedRows, column: null });
      void this.dialogService.success('Save Complete', 'Grid data was saved successfully.');
      this.loadRows(false);
    } catch (error: any) {
      const message = error?.error?.message || error?.message || 'Unable to save grid data.';
      this.errorMessage = null;
      void this.dialogService.error('Grid Error', message);
      this.rowAction.emit({ action: 'save-error', row: null, rows: trackedRows, column: null });
      this.cdr.markForCheck();
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  deleteSelectedRows(): void {
    if (!this.canDeleteSelected) {
      return;
    }

    const rowsToDelete = this.selectedRows.filter((row) => !this.isRowDeleted(row) && !this.isRowDisabled(row));
    const localRowsToRemove = rowsToDelete.filter((row) => this.isLocalAddedRow(row));
    const persistedRowsToDelete = rowsToDelete.filter((row) => !this.isLocalAddedRow(row));

    persistedRowsToDelete.forEach((row) => {
      const rowKey = this.getRowKey(row);
      this.deletedRowIds.add(rowKey);
      this.persistRowChange(row);
      this.selectedRowIds.delete(rowKey);
      this.softDeleteChange.emit({ id: row[this.config.id], deleted: true, row });
      this.syncSelectionControlValue(row, false);
    });

    if (localRowsToRemove.length > 0) {
      this.removeLocalAddedRows(localRowsToRemove);
    }

    this.syncSelectAllState();
    this.rowsChange.emit(this.serializeRows());
    this.rowAction.emit({ action: 'soft-delete', row: null, rows: rowsToDelete, column: null });
  }

  sortBy(column: SicGridColumnConfig): void {
    if (column.sortable === false) {
      return;
    }

    if (this.sortField !== column.name) {
      this.sortField = column.name;
      this.sortDescending = false;
    } else if (this.sortDescending === false) {
      this.sortDescending = true;
    } else {
      this.applyDefaultSort();
    }

    if (this.reviewChangesOnly) {
      this.currentPage = 1;
      this.refreshRowsForCurrentMode();
      return;
    }

    this.loadRows(true);
  }

  goToPreviousPage(): void {
    if (this.currentPage <= 1 || this.loading) {
      return;
    }

    this.currentPage -= 1;

    if (this.reviewChangesOnly) {
      this.refreshRowsForCurrentMode();
      return;
    }

    this.loadRows(false);
  }

  goToNextPage(): void {
    if (this.currentPage >= this.totalPages || this.loading) {
      return;
    }

    this.currentPage += 1;

    if (this.reviewChangesOnly) {
      this.refreshRowsForCurrentMode();
      return;
    }

    this.loadRows(false);
  }

  goToPage(page: number): void {
    if (this.loading || page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;

    if (this.reviewChangesOnly) {
      this.refreshRowsForCurrentMode();
      return;
    }

    this.loadRows(false);
  }

  isRowDeleted(row: any): boolean {
    return this.deletedRowIds.has(this.getRowKey(row));
  }

  isRowDisabled(row: SicGridRowData): boolean {
    return this.config.disableRow?.(row) === true;
  }

  isRowSelected(row: any): boolean {
    return this.selectedRowIds.has(this.getRowKey(row));
  }

  canResetRow(row: SicGridRowData): boolean {
    const state = this.getRowState(row);
    return state === 'updated' || state === 'deleted';
  }

  isRowEditable(row: any): boolean {
    return !this.deletedRowIds.has(this.getRowKey(row)) && !this.isRowDisabled(row);
  }

  isCellEditable(row: any, column: SicGridColumnConfig): boolean {
    return column.editable === true && this.isRowEditable(row);
  }

  shouldRenderCellField(row: any, column: SicGridColumnConfig): boolean {
    return column.editable === true;
  }

  isCellReadonly(row: any, column: SicGridColumnConfig): boolean {
    return this.shouldRenderCellField(row, column) && (this.isRowDisabled(row) || this.isRowDeleted(row));
  }

  getRowState(row: any): SicGridRowState {
    const rowKey = this.getRowKey(row);
    if (this.deletedRowIds.has(rowKey)) {
      return 'deleted';
    }

    if (!this.originalRowSnapshots.has(rowKey)) {
      return 'new';
    }

    if (this.hasRowChanged(row)) {
      return 'updated';
    }

    return 'active';
  }

  toggleSoftDelete(row: any, column: SicGridColumnConfig): void {
    if (this.isRowDisabled(row)) {
      return;
    }

    if (this.isLocalAddedRow(row)) {
      this.removeLocalAddedRows([row]);
      this.rowsChange.emit(this.serializeRows());
      this.rowAction.emit({ action: 'remove', row, rows: [row], column });
      return;
    }

    const rowKey = this.getRowKey(row);
    const deleted = !this.deletedRowIds.has(rowKey);

    if (deleted) {
      this.deletedRowIds.add(rowKey);
    } else {
      this.deletedRowIds.delete(rowKey);
    }

    this.persistRowChange(row);
    this.rowsChange.emit(this.serializeRows());
    this.refreshRowsAfterTrackingChange();
    this.softDeleteChange.emit({ id: row[this.config.id], deleted, row });
    this.rowAction.emit({ action: deleted ? 'soft-delete' : 'restore', row, rows: [row], column });
  }

  triggerRowAction(action: SicGridColumnAction, row: any, column: SicGridColumnConfig): void {
    this.rowAction.emit({ action: action.name, row, rows: [row], column });
  }

  handleValueChange(row: any, column: SicGridColumnConfig, rawValue: unknown): void {
    row[column.name] = this.coerceValue(column, rawValue);
    this.syncControlValue(row, column, row[column.name]);
    this.rowsChange.emit(this.serializeRows());
    this.refreshRowsAfterTrackingChange();
  }

  resetRow(row: SicGridRowData): void {
    const rowKey = this.getRowKey(row);
    const wasDeleted = this.deletedRowIds.has(rowKey);
    const originalSnapshot = this.originalRowSnapshots.get(rowKey);
    if (!originalSnapshot) {
      return;
    }

    const originalRow = JSON.parse(originalSnapshot) as Record<string, unknown>;
    for (const key of Object.keys(row)) {
      if (key.startsWith('__')) {
        continue;
      }

      if (!(key in originalRow)) {
        delete row[key];
      }
    }

    Object.assign(row, originalRow);

    if (wasDeleted) {
      this.deletedRowIds.delete(rowKey);
      this.selectedRowIds.delete(rowKey);
      this.softDeleteChange.emit({ id: row[this.config.id], deleted: false, row });
      this.rowAction.emit({ action: 'restore', row, rows: [row], column: null });
    }

    this.visibleColumns.forEach((column) => {
      this.syncControlValue(row, column, this.getRowValue(row, column));
    });

    this.persistRowChange(row);
    this.rowsChange.emit(this.serializeRows());
    this.refreshRowsForCurrentMode();
  }

  trackRow = (_index: number, row: any): string => this.getRowKey(row);
  trackColumn = (_index: number, column: SicGridColumnConfig): string => `${column.name}-${column.type}`;

  formatCellValue(row: any, column: SicGridColumnConfig): string {
    const value = row[column.name];
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (column.type) {
      case 'date':
        return this.datePipe.transform(value, 'dd/MM/yyyy') ?? '-';
      case 'time':
        return this.datePipe.transform(`1970-01-01T${value}`, 'HH:mm') ?? `${value}`;
      case 'number':
        return typeof value === 'number' ? new Intl.NumberFormat().format(value) : `${value}`;
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'upload':
        return Array.isArray(value) && value.length > 0 ? `${value.length} file(s)` : '-';
      case 'combobox':
      case 'radio':
        return this.resolveOptionLabel(column, value);
      default:
        return `${value}`;
    }
  }

  getCellTemplate(column: SicGridColumnConfig): TemplateRef<unknown> | null {
    return this.findTemplate(this.resolveTemplateName(column), 'cell');
  }

  getHeaderTemplate(column: SicGridColumnConfig): TemplateRef<unknown> | null {
    return this.findTemplate(this.resolveTemplateName(column), 'header');
  }

  getFooterTemplate(column: SicGridColumnConfig): TemplateRef<unknown> | null {
    return this.findTemplate(this.resolveTemplateName(column), 'footer');
  }

  isBuiltInType(type: string): boolean {
    return ['text', 'area', 'number', 'date', 'time', 'color', 'upload', 'combobox', 'checkbox', 'radio', 'action', 'button'].includes(type);
  }

  resolveUploadMultiple(row: SicGridRowData, column: SicGridColumnConfig): boolean {
    return this.resolveColumnValue(column.multiple, row, column) ?? true;
  }

  resolveUploadCategory(row: SicGridRowData, column: SicGridColumnConfig): SicUploadCategory {
    return this.resolveColumnValue(column.uploadCategory, row, column) ?? 'all';
  }

  resolveUploadVisibility(row: SicGridRowData, column: SicGridColumnConfig): 1 | 2 | 3 | 4 {
    return this.resolveColumnValue(column.visibility, row, column) ?? 1;
  }

  resolveUploadGroupId(row: SicGridRowData, column: SicGridColumnConfig): string | null {
    return this.resolveColumnValue(column.uploadGroupId, row, column) ?? null;
  }

  resolveUploadAccept(row: SicGridRowData, column: SicGridColumnConfig): string | undefined {
    return this.resolveColumnValue(column.accept, row, column);
  }

  resolveUploadBusinessId(row: SicGridRowData, column: SicGridColumnConfig): string | undefined {
    return this.resolveColumnValue(column.businessId, row, column);
  }

  resolveUploadEmptyText(row: SicGridRowData, column: SicGridColumnConfig): string {
    return this.resolveColumnValue(column.emptyText, row, column) ?? '';
  }

  resolveUploadHelperText(row: SicGridRowData, column: SicGridColumnConfig): string {
    return this.resolveColumnValue(column.helperText, row, column) ?? '';
  }

  isSortedAsc(column: SicGridColumnConfig): boolean {
    return this.sortField === column.name && !this.sortDescending;
  }

  isSortedDesc(column: SicGridColumnConfig): boolean {
    return this.sortField === column.name && this.sortDescending;
  }

  getControl(row: any, column: SicGridColumnConfig): FormControl {
    const controlKey = this.getControlKey(row, column);
    const existing = this.controlMap.get(controlKey);
    if (existing) {
      this.syncControlDisabledState(row, column, existing);
      return existing;
    }

    const control = new FormControl(this.getRowValue(row, column), {
      validators: this.resolveValidators(column),
      asyncValidators: this.resolveAsyncValidators(column),
    });

    if (this.validationRequested) {
      control.markAsTouched();
      control.updateValueAndValidity({ emitEvent: false });
    }

    const savedState = this.controlStateMap.get(controlKey);
    if (savedState?.dirty) {
      control.markAsDirty({ onlySelf: true });
    }
    if (savedState?.touched) {
      control.markAsTouched({ onlySelf: true });
    }
    if (savedState) {
      control.updateValueAndValidity({ emitEvent: false });
    }

    const subscription = control.valueChanges.subscribe((value) => {
      row[column.name] = this.coerceValue(column, value);
      this.persistRowChange(row);
      this.controlStateMap.set(controlKey, {
        touched: control.touched,
        dirty: control.dirty,
      });
      this.rowsChange.emit(this.serializeRows());
      this.refreshRowsAfterTrackingChange();
    });

    this.controlMap.set(controlKey, control);
    this.controlSubscriptions.set(controlKey, subscription);
    this.syncControlDisabledState(row, column, control);

    return control;
  }

  getSelectionControl(row: any): FormControl {
    const rowKey = this.getRowKey(row);
    const existing = this.selectionControlMap.get(rowKey);
    if (existing) {
      this.syncSelectionControlDisabledState(row, existing);
      return existing;
    }

    const shouldBeSelected = !this.isRowDisabled(row) && !this.isRowDeleted(row) && this.selectedRowIds.has(rowKey);
    const control = new FormControl(shouldBeSelected);
    const subscription = control.valueChanges.subscribe((checked) => {
      if (this.syncingSelectionState) {
        return;
      }

      if (this.isRowDeleted(row)) {
        this.syncSelectionControlValue(row, false);
        return;
      }

      if (this.isRowDisabled(row)) {
        this.selectedRowIds.delete(rowKey);
        this.syncSelectionControlValue(row, false);
        return;
      }

      if (checked === true) {
        this.selectedRowIds.add(rowKey);
      } else {
        this.selectedRowIds.delete(rowKey);
      }

      this.syncSelectAllState();
      this.cdr.markForCheck();
    });

    this.selectionControlMap.set(rowKey, control);
    this.selectionSubscriptions.set(rowKey, subscription);
    this.syncSelectionControlDisabledState(row, control);
    return control;
  }

  toRadioOptions(column: SicGridColumnConfig): SicRadioOption[] {
    return (column.options ?? []).map((option) => ({
      value: option.value as string | number | boolean | null,
      text: option.label,
    }));
  }

  getColumnParams(column: SicGridColumnConfig): Record<string, unknown> {
    return column.params ?? this.emptyColumnParams;
  }

  getRadioOptions(column: SicGridColumnConfig): SicRadioOption[] {
    if (!column.options?.length) {
      return this.emptyRadioOptions;
    }

    const cached = this.radioOptionsCache.get(column);
    if (cached?.source === column.options) {
      return cached.mapped;
    }

    const mapped = this.toRadioOptions(column);
    this.radioOptionsCache.set(column, { source: column.options, mapped });
    return mapped;
  }

  protected resolveTemplateName(column: SicGridColumnConfig): string {
    return column.customTemplate || (this.isBuiltInType(column.type) ? column.name : column.type);
  }

  private loadRows(resetPage: boolean): void {
    if (!this.config?.api) {
      return;
    }

    if (resetPage) {
      this.currentPage = 1;
    }

    this.loading = true;
    this.errorMessage = null;
    this.loadSubscription?.unsubscribe();

    this.loadSubscription = this.http.get<any[] | SicGridResponse<any>>(this.config.api, {
      params: this.buildParams(),
    }).subscribe({
      next: (response) => {
        const normalized = this.normalizeResponse(response);
        const data = normalized.data ?? [];
        const pageable = normalized.pageable ?? {};
        const serverRows = data.map((row) => ({ ...row }));

        this.captureOriginalSnapshots(serverRows);

        const mergedServerRows = serverRows.map((row) => {
          const rowKey = this.getRowKey(row);
          const updatedRow = this.localUpdatedRows.get(rowKey);
          return updatedRow ? { ...row, ...updatedRow } : row;
        });

        this.latestServerRows = mergedServerRows;
        this.serverTotalElements = pageable.totalElements ?? data.length;
        this.currentPage = pageable.pageNumber ?? this.currentPage;
        this.pageSize = pageable.pageSize ?? this.pageSize;
        this.totalElements = this.serverTotalElements + this.localAddedRows.length;
        this.totalPages = this.resolveCombinedTotalPages();
        this.refreshVisibleRows();
        this.rebuildControls();
        this.rebuildSelectionControls();
        this.rowsChange.emit(this.serializeRows());
        this.updateGridTemplateColumns();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        const message = error?.error?.message || error?.message || 'Unable to load grid data.';
        this.errorMessage = null;
        this.loading = false;
        void this.dialogService.error('Grid Error', message);
        this.cdr.markForCheck();
      },
    });
  }

  private buildParams(): HttpParams {
    let params = new HttpParams();
    const config = this.config;

    for (const [key, value] of Object.entries(config.params ?? {})) {
      params = this.appendParam(params, key, value);
    }

    if (config.pageable !== false) {
      params = params
        .set(config.pageNumberParam ?? 'pageNumber', `${this.currentPage}`)
        .set(config.pageSizeParam ?? 'pageSize', `${this.pageSize}`);
    }

    if (config.keyword) {
      params = params.set(config.keywordParam ?? 'keyword', config.keyword);
    }

    if (this.sortField) {
      params = params
        .set('Sorts[0].Field', this.sortField)
        .set('Sorts[0].Descending', `${this.sortDescending}`);
    }

    return params;
  }

  private applyDefaultSort(): void {
    this.sortField = this.config?.defaultSortField ?? this.config?.id ?? null;
    this.sortDescending = this.config?.defaultSortDescending ?? false;
  }

  private touchVisibleControls(): void {
    this.controlMap.forEach((control) => {
      control.markAsTouched();
      control.updateValueAndValidity({ emitEvent: false });
    });

    this.captureCurrentControlStates();
  }

  private captureCurrentControlStates(): void {
    this.controlMap.forEach((control, controlKey) => {
      this.controlStateMap.set(controlKey, {
        touched: control.touched,
        dirty: control.dirty,
      });
    });
  }

  private hasVisibleInvalidControls(): boolean {
    for (const control of this.controlMap.values()) {
      if (control.invalid) {
        return true;
      }
    }

    return false;
  }

  private buildSavePayload(row: SicGridRowData, state: SicGridPersistState): unknown {
    if (this.config.savePayload) {
      return this.config.savePayload(row, state);
    }

    const payload = this.toSerializableRow(row);
    payload['State'] = state;
    return payload;
  }

  private toEntityState(state: SicGridRowState): SicGridPersistState {
    if (state === 'new') {
      return 4;
    }

    if (state === 'updated') {
      return 3;
    }

    return 2;
  }

  private getPersistPriority(state: SicGridRowState): number {
    if (state === 'deleted') {
      return 0;
    }

    if (state === 'updated') {
      return 1;
    }

    if (state === 'new') {
      return 2;
    }

    return 3;
  }

  private resolveDeleteApi(row: SicGridRowData): string | null {
    if (!this.config.deleteApi) {
      return null;
    }

    return typeof this.config.deleteApi === 'function'
      ? this.config.deleteApi(row)
      : this.config.deleteApi;
  }

  private buildDeletePayload(row: SicGridRowData): unknown {
    if (this.config.deletePayload) {
      return this.config.deletePayload(row);
    }

    const payload = this.toSerializableRow(row);
    return {
      [this.config.id]: payload[this.config.id],
      RowVersion: payload['rowVersion'] ?? payload['RowVersion'] ?? null,
    };
  }

  private appendParam(params: HttpParams, key: string, value: unknown): HttpParams {
    if (value === undefined || value === null) {
      return params;
    }

    if (Array.isArray(value)) {
      let nextParams = params;
      value.forEach((item, index) => {
        nextParams = this.appendParam(nextParams, `${key}[${index}]`, item);
      });
      return nextParams;
    }

    if (typeof value === 'object') {
      let nextParams = params;
      Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
        nextParams = this.appendParam(nextParams, `${key}.${nestedKey}`, nestedValue);
      });
      return nextParams;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return params.set(key, String(value));
    }

    return params;
  }

  private resolveValidators(column: SicGridColumnConfig): ValidatorFn[] {
    return this.normalizeValidatorFns(column.validator, column.validators);
  }

  private resolveAsyncValidators(column: SicGridColumnConfig): AsyncValidatorFn[] {
    return this.normalizeValidatorFns(column.asyncValidator, column.asyncValidators);
  }

  private normalizeValidatorFns<TValidator>(...validators: Array<TValidator | TValidator[] | null | undefined>): TValidator[] {
    return validators.flatMap((validator) => {
      if (!validator) {
        return [];
      }

      return Array.isArray(validator) ? validator : [validator];
    });
  }

  private normalizeResponse(response: any[] | SicGridResponse<any>): SicGridResponse<any> {
    if (Array.isArray(response)) {
      return {
        data: response,
        pageable: {
          pageNumber: 1,
          pageSize: response.length,
          totalElements: response.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: response.data ?? [],
      pageable: response.pageable ?? {
        pageNumber: 1,
        pageSize: response.data?.length ?? 0,
        totalElements: response.data?.length ?? 0,
        totalPages: 1,
      },
    };
  }

  private updateGridTemplateColumns(): void {
    const selectionColumnWidth = 72;
    const columns = this.visibleColumns;
    if (columns.length === 0) {
      this.gridTemplateColumns = `${selectionColumnWidth}px`;
      return;
    }

    const widths = columns.map((column) => this.resolveColumnWidth(column));
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    const hostWidth = this.surfaceRef?.nativeElement.clientWidth || this.getFallbackHostWidth();
    const totalGridWidth = totalWidth + selectionColumnWidth;

    if (hostWidth > 0 && totalGridWidth <= hostWidth) {
      const remainingWidth = `calc(100% - ${selectionColumnWidth}px)`;
      const proportionalColumns = widths
        .map((width) => 'minmax(0, calc(' + remainingWidth + ' * ' + (width / totalWidth).toFixed(6) + '))')
        .join(' ');
      this.gridTemplateColumns = `${selectionColumnWidth}px ${proportionalColumns}`;
      return;
    }

    this.gridTemplateColumns = `${selectionColumnWidth}px ${widths.map((width) => width.toString() + 'px').join(' ')}`;
  }

  private getFallbackHostWidth(): number {
    const nativeElement = this.surfaceRef?.nativeElement.parentElement;
    return nativeElement?.clientWidth ?? 0;
  }

  protected resolveColumnWidth(column: SicGridColumnConfig): number {
    if (typeof column.width === 'number' && column.width > 0) {
      return column.width;
    }

    switch (column.type) {
      case 'checkbox':
        return 90;
      case 'action':
      case 'button':
        return 150;
      case 'color':
        return 160;
      case 'upload':
        return 340;
      case 'number':
      case 'date':
      case 'time':
        return 130;
      default:
        return 180;
    }
  }

  private findTemplate(name: string, section: SicGridPanelTemplateSection): TemplateRef<unknown> | null {
    if (!this.templatesReady || !name) {
      return null;
    }

    return this.templates?.find((template) => template.name === name && template.section === section)?.template ?? null;
  }

  private resolveOptionLabel(column: SicGridColumnConfig, value: unknown): string {
    const optionLabel = column.options?.find((option) => option.value === value)?.label;
    if (optionLabel) {
      return optionLabel;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return '-';
  }

  private resolveColumnValue<TValue>(
    value: TValue | ((row: SicGridRowData, column: SicGridColumnConfig) => TValue) | undefined,
    row: SicGridRowData,
    column: SicGridColumnConfig,
  ): TValue | undefined {
    if (typeof value === 'function') {
      return (value as (row: SicGridRowData, column: SicGridColumnConfig) => TValue)(row, column);
    }

    return value;
  }

  private coerceValue(column: SicGridColumnConfig, rawValue: unknown): unknown {
    switch (column.type) {
      case 'number':
        return rawValue === '' || rawValue === null ? null : Number(rawValue);
      case 'checkbox':
        return rawValue;
      default:
        return rawValue;
    }
  }

  private rebuildControls(): void {
    this.disposeControls();

    this.rows.forEach((row) => {
      this.visibleColumns.forEach((column) => {
        if (!column.editable || column.type === 'action' || column.type === 'button') {
          return;
        }

        this.getControl(row, column);
      });
    });
  }

  private rebuildSelectionControls(): void {
    this.disposeSelectionControls();

    this.rows.forEach((row) => {
      this.getSelectionControl(row);
    });

    this.syncSelectAllState();
  }

  private syncControlValue(row: any, column: SicGridColumnConfig, value: unknown): void {
    const control = this.controlMap.get(this.getControlKey(row, column));
    if (!control || control.value === value) {
      return;
    }

    control.setValue(value, { emitEvent: false });
  }

  private disposeControls(): void {
    this.captureCurrentControlStates();
    this.controlSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.controlSubscriptions.clear();
    this.controlMap.clear();
  }

  private disposeSelectionControls(): void {
    this.selectionSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.selectionSubscriptions.clear();
    this.selectionControlMap.clear();
  }

  private toggleSelectAll(checked: boolean): void {
    this.rows.forEach((row) => {
      if (this.isRowDeleted(row) || this.isRowDisabled(row)) {
        this.selectedRowIds.delete(this.getRowKey(row));
        this.syncSelectionControlValue(row, false);
        return;
      }

      if (checked) {
        this.selectedRowIds.add(this.getRowKey(row));
      } else {
        this.selectedRowIds.delete(this.getRowKey(row));
      }

      this.syncSelectionControlValue(row, checked);
    });

    this.cdr.markForCheck();
  }

  private syncSelectAllState(): void {
    const selectableRows = this.rows.filter((row) => !this.isRowDeleted(row) && !this.isRowDisabled(row));
    const shouldSelectAll = selectableRows.length > 0 && selectableRows.every((row) => this.selectedRowIds.has(this.getRowKey(row)));
    this.syncSelectAllControlDisabledState();

    this.syncingSelectionState = true;
    this.selectAllControl.setValue(shouldSelectAll, { emitEvent: false });
    this.syncingSelectionState = false;
  }

  private syncSelectAllControlDisabledState(): void {
    const shouldDisable = this.loading || this.selectableCount === 0;
    if (shouldDisable) {
      this.syncingSelectionState = true;
      this.selectAllControl.setValue(false, { emitEvent: false });
      this.syncingSelectionState = false;
      this.selectAllControl.disable({ emitEvent: false });
      return;
    }

    this.selectAllControl.enable({ emitEvent: false });
  }

  private syncSelectionControlValue(row: any, checked: boolean): void {
    const control = this.selectionControlMap.get(this.getRowKey(row));
    if (!control || control.value === checked) {
      return;
    }

    this.syncingSelectionState = true;
    control.setValue(checked, { emitEvent: false });
    this.syncingSelectionState = false;
  }

  private syncSelectionControlDisabledState(row: any, control: FormControl): void {
    if (this.isRowDeleted(row) || this.isRowDisabled(row)) {
      this.selectedRowIds.delete(this.getRowKey(row));
      this.syncSelectionControlValue(row, false);
      control.disable({ emitEvent: false });
      return;
    }

    control.enable({ emitEvent: false });
  }

  private syncControlDisabledState(row: any, column: SicGridColumnConfig, control: FormControl): void {
    if (this.isCellReadonly(row, column)) {
      control.disable({ emitEvent: false });
      return;
    }

    control.enable({ emitEvent: false });
  }

  private appendNewRow(): void {
    const row = this.createEmptyRow();
    this.localAddedRows.push(row);
    this.totalElements = this.serverTotalElements + this.localAddedRows.length;
    this.totalPages = this.resolveCombinedTotalPages();

    if (this.reviewChangesOnly) {
      this.currentPage = this.resolveReviewTargetPage();
      this.refreshRowsForCurrentMode();
      this.rowsChange.emit(this.serializeRows());
      this.rowAction.emit({ action: 'add', row, rows: [row], column: null });
      return;
    }

    const targetPage = this.totalPages;
    if (this.showPager && this.currentPage !== targetPage) {
      this.currentPage = targetPage;
      this.loadRows(false);
      return;
    }

    this.refreshVisibleRows();
    this.rebuildControls();
    this.rebuildSelectionControls();

    this.syncSelectAllState();
    this.rowsChange.emit(this.serializeRows());
    this.rowAction.emit({ action: 'add', row, rows: [row], column: null });
    this.cdr.markForCheck();
  }

  private createEmptyRow(): Record<string, unknown> {
    const rowDefaults = typeof this.config.createRowValue === 'function'
      ? this.config.createRowValue()
      : (this.config.createRowValue ?? {});

    const row: Record<string, unknown> = {
      ...rowDefaults,
      [this.config.id]: rowDefaults[this.config.id] ?? null,
    };

    this.visibleColumns.forEach((column) => {
      if (column.name in row) {
        return;
      }

      switch (column.type) {
        case 'checkbox':
          row[column.name] = column.uncheckedValue ?? false;
          break;
        case 'number':
          row[column.name] = null;
          break;
        default:
          row[column.name] = null;
          break;
      }
    });

    return row;
  }

  private getControlKey(row: any, column: SicGridColumnConfig): SicGridCellControlKey {
    return `${this.getRowKey(row)}:${column.name}`;
  }

  private getRowValue(row: any, column: SicGridColumnConfig): unknown {
    const value = row[column.name];
    if (value === undefined) {
      return null;
    }

    return value;
  }

  private getRowKey(row: any): string {
    const explicitId = row?.[this.config.id];
    if (explicitId !== null && explicitId !== undefined && `${explicitId}`.trim() !== '') {
      return `${explicitId}`;
    }

    if (typeof row === 'object' && row !== null) {
      const existingKey = this.rowKeys.get(row);
      if (existingKey) {
        return existingKey;
      }

      this.rowKeySequence += 1;
      const generatedKey = `row-${this.rowKeySequence}`;
      this.rowKeys.set(row, generatedKey);
      return generatedKey;
    }

    return '';
  }

  private captureOriginalSnapshots(rows: SicGridRowData[]): void {
    rows.forEach((row) => {
      this.originalRowSnapshots.set(this.getRowKey(row), this.serializeComparableRow(row));
    });
  }

  private refreshVisibleRows(): void {
    if (this.reviewChangesOnly) {
      const changedRows = this.getSortedChangedRows();
      const totalPages = this.resolveReviewTotalPages();
      this.totalElements = changedRows.length;
      this.totalPages = totalPages;
      this.currentPage = Math.min(this.currentPage, totalPages);

      const pageStartIndex = this.showPager ? (this.currentPage - 1) * this.pageSize : 0;
      const pageEndIndex = this.showPager ? pageStartIndex + this.pageSize : changedRows.length;
      this.rows.splice(0, this.rows.length, ...changedRows.slice(pageStartIndex, pageEndIndex));
      return;
    }

    const localRows = this.resolveLocalRowsForCurrentPage();
    this.rows.splice(0, this.rows.length, ...this.latestServerRows, ...localRows);
  }

  private moveToPreviousPageIfEmpty(): void {
    if (this.currentPage <= 1 || this.rows.length > 0) {
      return;
    }

    this.currentPage -= 1;

    if (this.showPager) {
      this.loadRows(false);
      return;
    }

    this.refreshVisibleRows();
  }

  private resolveLocalRowsForCurrentPage(): SicGridRowData[] {
    const pageStartIndex = (this.currentPage - 1) * this.pageSize;
    const pageEndIndex = pageStartIndex + this.pageSize;
    const localStartIndex = Math.max(0, pageStartIndex - this.serverTotalElements);
    const localEndIndex = Math.max(0, pageEndIndex - this.serverTotalElements);

    return this.localAddedRows.slice(localStartIndex, localEndIndex);
  }

  private resolveCombinedTotalPages(): number {
    return this.showPager ? Math.max(1, Math.ceil((this.serverTotalElements + this.localAddedRows.length) / this.pageSize)) : 1;
  }

  private resetTrackedStateAfterSave(targetPage: number): void {
    this.deletedRowIds.clear();
    this.selectedRowIds.clear();
    this.localAddedRows.splice(0, this.localAddedRows.length);
    this.localUpdatedRows.clear();
    this.originalRowSnapshots.clear();
    this.controlStateMap.clear();
    this.latestServerRows = [];
    this.serverTotalElements = 0;
    this.reviewChangesOnly = false;
    this.currentPage = Math.max(1, targetPage);
    this.pageBeforeReviewChanges = this.currentPage;
    this.rows.splice(0, this.rows.length);
    this.totalElements = 0;
    this.totalPages = 1;
    this.disposeControls();
    this.disposeSelectionControls();
    this.syncSelectAllState();
  }

  private isLocalAddedRow(row: SicGridRowData): boolean {
    const rowKey = this.getRowKey(row);
    return !this.originalRowSnapshots.has(rowKey) && this.localAddedRows.some((localRow) => this.getRowKey(localRow) === rowKey);
  }

  private removeLocalAddedRows(rows: SicGridRowData[]): void {
    if (rows.length === 0) {
      return;
    }

    const previousPage = this.currentPage;

    const rowKeysToRemove = new Set(rows.map((row) => this.getRowKey(row)));
    const remainingLocalRows = this.localAddedRows.filter((row) => !rowKeysToRemove.has(this.getRowKey(row)));

    this.localAddedRows.splice(0, this.localAddedRows.length, ...remainingLocalRows);
    rowKeysToRemove.forEach((rowKey) => {
      this.selectedRowIds.delete(rowKey);
      this.deletedRowIds.delete(rowKey);
      this.localUpdatedRows.delete(rowKey);
    });

    this.totalElements = this.serverTotalElements + this.localAddedRows.length;
    this.totalPages = this.resolveCombinedTotalPages();
    this.currentPage = Math.min(this.currentPage, this.totalPages);

    if (this.reviewChangesOnly) {
      this.currentPage = Math.min(this.currentPage, this.resolveReviewTotalPages());
      this.refreshRowsForCurrentMode();
      return;
    }

    if (this.showPager && this.currentPage !== previousPage) {
      this.loadRows(false);
      return;
    }

    this.refreshVisibleRows();

    if (this.rows.length === 0 && this.currentPage > 1) {
      this.moveToPreviousPageIfEmpty();
      return;
    }

    this.rebuildControls();
    this.rebuildSelectionControls();
    this.cdr.markForCheck();
  }

  private persistRowChange(row: SicGridRowData): void {
    const rowKey = this.getRowKey(row);
    if (!this.originalRowSnapshots.has(rowKey)) {
      return;
    }

    if (this.hasRowChanged(row) || this.deletedRowIds.has(rowKey)) {
      this.localUpdatedRows.set(rowKey, { ...row });
      return;
    }

    this.localUpdatedRows.delete(rowKey);
  }

  private refreshRowsForCurrentMode(): void {
    this.refreshVisibleRows();
    this.rebuildControls();
    this.rebuildSelectionControls();
    this.syncSelectAllState();
    this.cdr.markForCheck();
  }

  private refreshRowsAfterTrackingChange(): void {
    if (!this.reviewChangesOnly) {
      return;
    }

    this.currentPage = Math.min(this.currentPage, this.resolveReviewTotalPages());
    this.refreshRowsForCurrentMode();
  }

  private hasRowChanged(row: any): boolean {
    const originalSnapshot = this.originalRowSnapshots.get(this.getRowKey(row));
    if (!originalSnapshot) {
      return false;
    }

    return originalSnapshot !== this.serializeComparableRow(row);
  }

  private serializeComparableRow(row: any): string {
    return JSON.stringify(this.toSerializableRow(row));
  }

  private toSerializableRow(row: SicGridRowData): Record<string, unknown> {
    const comparableEntries = Object.entries(row)
      .filter(([key]) => !key.startsWith('__'))
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

    return Object.fromEntries(comparableEntries);
  }

  private getTrackedRows(): SicGridRowData[] {
    const trackedRows = new Map<string, SicGridRowData>();

    [...this.rows, ...this.localAddedRows, ...this.localUpdatedRows.values()].forEach((row) => {
      trackedRows.set(this.getRowKey(row), row);
    });

    return Array.from(trackedRows.values());
  }

  private getChangedRows(): SicGridRowData[] {
    return this.getTrackedRows().filter((row) => {
      const state = this.getRowState(row);
      return state === 'new' || state === 'updated' || state === 'deleted';
    });
  }

  private getSortedChangedRows(): SicGridRowData[] {
    const changedRows = this.getChangedRows();
    if (!this.sortField) {
      return changedRows;
    }

    const sortField = this.sortField;

    return [...changedRows].sort((leftRow, rightRow) => {
      const leftIsEmpty = this.isEmptySortValue(leftRow[sortField]);
      const rightIsEmpty = this.isEmptySortValue(rightRow[sortField]);

      if (leftIsEmpty && rightIsEmpty) {
        return 0;
      }

      if (leftIsEmpty) {
        return 1;
      }

      if (rightIsEmpty) {
        return -1;
      }

      const comparison = this.compareSortValues(leftRow[sortField], rightRow[sortField]);
      return this.sortDescending ? comparison * -1 : comparison;
    });
  }

  private compareSortValues(leftValue: unknown, rightValue: unknown): number {
    if (leftValue === rightValue) {
      return 0;
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return leftValue - rightValue;
    }

    if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
      return Number(leftValue) - Number(rightValue);
    }

    return this.normalizeSortValue(leftValue).localeCompare(this.normalizeSortValue(rightValue), undefined, { numeric: true, sensitivity: 'base' });
  }

  private isEmptySortValue(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }

  private normalizeSortValue(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return `${value}`;
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    if (typeof value === 'symbol') {
      return value.description ?? value.toString();
    }

    return '';
  }

  private resolveReviewTotalPages(): number {
    return this.showPager ? Math.max(1, Math.ceil(this.getChangedRows().length / this.pageSize)) : 1;
  }

  private resolveReviewTargetPage(): number {
    return this.showPager ? Math.max(1, Math.ceil(this.getChangedRows().length / this.pageSize)) : 1;
  }

  private serializeRows(): any[] {
    return this.getTrackedRows().map((row) => ({
      ...row,
      __state: this.getRowState(row),
    }));
  }
}
