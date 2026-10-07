import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { environment } from '../../../../../../environments/environment';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import type { PaginationResponse } from '../../../../../core/model/pagination.model';
import type { Contract } from '../../../rt/pmrt04/pmrt04.model';

/** สัญญา MA (ชนิด Maintenance Contract) บนหน้า MA Ticket: ดูวันหมดอายุ ต่อสัญญา และยกเลิกสัญญา */
const MA_CONTRACT_TYPE = 'Maintenance Contract';
const RENEWED = 'ต่อแล้ว';
const CANCELLED = 'ยกเลิก';
/** หน้ารายการนี้ เพื่อให้หน้าต่อสัญญากลับมาที่แท็บนี้หลังเสร็จ */
const RETURN_TO = '/feature/pm/ma-ticket?tab=contracts';

interface MaContractRow extends Contract {
  daysLeft: number | null;
}

@Component({
  selector: 'app-ma-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SicGridPanelComponent, SicGridPanelTemplate],
  templateUrl: './ma-contracts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaContractsComponent {
  private http = inject(HttpClient);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private translate = inject(TranslateService);
  private customerState = inject(CustomerStateService);

  protected readonly searchTerm = signal('');
  protected readonly showRenewed = signal(false);
  protected readonly total = signal(0);

  private grid: SicGridPanelComponent | null = null;
  private all: MaContractRow[] = [];

  protected readonly gridConfig = computed<SicGridPanelConfig>(() => ({
    id: 'id',
    selectable: false,
    showToolbar: false,
    lazy: false,
    pageSize: 10,
    column: [
      { label: this.translate.instant('PMDT17_MA_COL_CONTRACT_NO'), name: 'contractNo', type: 'code', width: 150 },
      { label: this.translate.instant('PMDT17_COL_CUSTOMER_PROJECT'), name: 'customerName', type: 'customerInfo', width: 220 },
      { label: this.translate.instant('PMDT17_MA_COL_PERIOD'), name: 'startDate', type: 'period', width: 190 },
      { label: this.translate.instant('PMDT17_MA_COL_EXPIRY'), name: 'daysLeft', type: 'expiry', width: 150 },
      { label: this.translate.instant('PMDT17_MA_COL_VALUE'), name: 'contractValue', type: 'money', width: 120 },
      { label: this.translate.instant('PMDT17_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', sortable: false, width: 130 },
    ],
  }));

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.grid = grid;
    let params = new HttpParams()
      .set('page', '1')
      .set('size', '1000')
      .set('contractType', MA_CONTRACT_TYPE)
      .set('latestOnly', String(!this.showRenewed()))
      .set('sortBy', 'endDate')
      .set('sortDirection', 'asc');
    if (this.searchTerm()) params = params.set('keyword', this.searchTerm());

    this.http.get<PaginationResponse<Contract>>(`${environment.apiBaseUrl}/api/pm/contracts`, { params }).subscribe({
      next: (res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.all = (res.data ?? []).map((c) => ({
          ...c,
          daysLeft: c.endDate ? Math.ceil((new Date(c.endDate).getTime() - today.getTime()) / 86400000) : null,
        }));
        this.render(request.requestId);
      },
      error: () => grid.setLoadError(this.translate.instant('PMDT17_MA_LOAD_FAILED'), request.requestId),
    });
  }

  /** กรองตามโครงการที่เลือกที่ navbar (เหมือนแท็บ Ticket) แล้วส่งเข้า grid */
  private render(requestId?: number): void {
    const selected = this.customerState.currentSelectedProjectIds();
    const rows = selected.length ? this.all.filter((c) => c.projectId && selected.includes(c.projectId)) : this.all;
    this.total.set(rows.length);
    this.grid?.setRows(rows as unknown as SicGridRowData[], { totalElements: rows.length }, requestId);
  }

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.grid?.reload();
  }

  protected toggleShowRenewed(): void {
    this.showRenewed.update((v) => !v);
    this.grid?.reload();
  }

  protected isCancelled(r: Contract): boolean {
    return r.renewalStatus === CANCELLED;
  }

  protected isRenewed(r: Contract): boolean {
    return r.renewalStatus === RENEWED;
  }

  protected canRenew(r: Contract): boolean {
    return !this.isCancelled(r) && !this.isRenewed(r);
  }

  protected expiryClass(r: MaContractRow): string {
    if (this.isCancelled(r)) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    if (this.isRenewed(r)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (r.daysLeft !== null && r.daysLeft < 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (r.daysLeft !== null && r.daysLeft <= 30) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  }

  protected expiryText(r: MaContractRow): string {
    if (this.isCancelled(r)) return this.translate.instant('PMDT17_MA_STATUS_CANCELLED');
    if (this.isRenewed(r)) return this.translate.instant('PMDT17_MA_STATUS_RENEWED');
    if (r.daysLeft === null) return '-';
    if (r.daysLeft < 0) return this.translate.instant('PMDT17_MA_EXPIRED_DAYS', { days: -r.daysLeft });
    return this.translate.instant('PMDT17_MA_DAYS_LEFT', { days: r.daysLeft });
  }

  protected view(id: string): void {
    this.navigation.navigate(['/feature/pm/contract', id, 'view']);
  }

  protected renew(id: string): void {
    this.navigation.navigate(['/feature/pm/contract/renew', id], { queryParams: { returnTo: RETURN_TO } });
  }

  protected newContract(): void {
    this.navigation.navigate(['/feature/pm/contract/new']);
  }

  protected cancel(r: Contract): void {
    this.dialog
      .confirm(
        this.translate.instant('PMDT17_MA_CONFIRM_CANCEL_TITLE'),
        this.translate.instant('PMDT17_MA_CONFIRM_CANCEL_MSG', { contractNo: r.contractNo }),
      )
      .then((confirmed) => {
        if (!confirmed) return;
        this.http.post(`${environment.apiBaseUrl}/api/pm/contracts/${r.id}/cancel`, {}).subscribe({
          next: () => {
            this.dialog.success(
              this.translate.instant('PMDT17_MA_CANCEL_SUCCESS_TITLE'),
              this.translate.instant('PMDT17_MA_CANCEL_SUCCESS_MSG', { contractNo: r.contractNo }),
            );
            this.grid?.reload();
          },
          error: (err) =>
            this.dialog.error(
              this.translate.instant('PMDT17_MA_CANCEL_FAILED_TITLE'),
              err?.error?.message || this.translate.instant('PMDT17_MA_CANCEL_FAILED_MSG'),
            ),
        });
      });
  }
}
