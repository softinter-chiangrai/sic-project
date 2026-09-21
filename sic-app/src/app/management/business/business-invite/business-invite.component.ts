import { Component, inject, OnInit, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { BusinessInviteService } from './business-invite.service';
import { BusinessInviteFormData, InviteEmailModel, InviteTokenModel } from './business-invite.model';
import { DialogService } from '../../../core/services/dialog.service';
import { SicInputComponent, SicButtonComponent, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridLoadRequest, SicGridRowData } from 'sic-ng';
import { SicComboboxComponent } from '../../../core/component/sic-combobox/sic-combobox.component';
import { SicNumberComponent } from '../../../core/component/sic-number/sic-number.component';
import { environment } from '../../../../environments/environment';
import { CanComponentDeactivate } from '../../../core/guard/can-deactivate.guard';
import { ToForm } from '../../../core/types/form.type';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-business-invite',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicInputComponent,
    SicButtonComponent,
    SicComboboxComponent,
    SicNumberComponent,
    SicGridPanelComponent,
    SicGridPanelTemplate,
    TranslateModule,
  ],
  templateUrl: './business-invite.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './business-invite.component.css',
})
export class BusinessInviteComponent implements OnInit, CanComponentDeactivate {
  @ViewChild('grid') grid?: SicGridPanelComponent;

  readonly route = inject(ActivatedRoute);
  readonly service = inject(BusinessInviteService);
  readonly dialog = inject(DialogService);
  readonly router = inject(Router);
  readonly translate = inject(TranslateService);

  readonly apiBaseUrl = environment.apiBaseUrl;

  activeTab = signal<'email' | 'token'>('email');
  loading = signal(false);

  emailForm!: FormGroup<ToForm<InviteEmailModel>>;
  tokenForm!: FormGroup<ToForm<InviteTokenModel>>;

  pageDirty = () => this.emailForm.dirty || this.tokenForm.dirty;

  get inviteGridConfig(): SicGridPanelConfig {
    return {
      id: 'id',
      lazy: false,
      selectable: false,
      showToolbar: false,
      pageable: false,
      column: [
        { label: this.translate.instant('BUSINESS_INVITE_COL_TYPE'), name: 'inviteType', type: 'text', minWidth: 100, sortable: true },
        { label: this.translate.instant('BUSINESS_INVITE_ROLE_LABEL'), name: 'roleName', type: 'text', minWidth: 180, sortable: true },
        { label: this.translate.instant('BUSINESS_INVITE_COL_EMAIL_TOKEN'), name: 'inviteEmail', type: 'inviteContact', minWidth: 180 },
        { label: this.translate.instant('BUSINESS_INVITE_COL_STATUS'), name: 'isActivated', type: 'inviteStatus', minWidth: 160 },
        { label: this.translate.instant('BUSINESS_INVITE_COL_MANAGE'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 120 },
      ],
    };
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.loading.set(true);
    this.service.getInvites()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => {
          grid.setRows((list || []) as unknown as SicGridRowData[], { totalElements: list?.length || 0 }, request.requestId);
        },
        error: (error) => {
          const msg = error.error?.message || error.message || this.translate.instant('BUSINESS_INVITE_LOAD_FAIL_MSG');
          grid.setRows([], { totalElements: 0 }, request.requestId);
          grid.setLoadError(msg, request.requestId);
          this.dialog.error(this.translate.instant('BUSINESS_INVITE_ERROR_TITLE'), msg);
        },
      });
  }

  ngOnInit(): void {
    const data: BusinessInviteFormData = this.route.snapshot.data['form'];
    this.emailForm = data.emailForm;
    this.tokenForm = data.tokenForm;
  }

  setTab(tab: 'email' | 'token'): void {
    this.activeTab.set(tab);
  }

  submitEmail(): void {
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }
    this.loading.set(true);
    const v = this.emailForm.value;
    this.service.createInvite({
      roleId: v.roleId ?? '',
      inviteType: 'email',
      inviteEmail: v.inviteEmail ?? '',
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.emailForm.reset();
          this.grid?.reload();
        },
        error: async (error) => {
          const msg = error.error?.message || error.message || this.translate.instant('BUSINESS_INVITE_CREATE_EMAIL_FAIL_MSG');
          await this.dialog.error(this.translate.instant('BUSINESS_INVITE_ERROR_TITLE'), msg);
        },
      });
  }

  submitToken(): void {
    if (this.tokenForm.invalid) { this.tokenForm.markAllAsTouched(); return; }
    this.loading.set(true);
    const v = this.tokenForm.value;
    this.service.createInvite({
      roleId: v.roleId ?? '',
      inviteType: 'token',
      maxUses: v.maxUses ?? undefined,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.tokenForm.reset();
          this.grid?.reload();
        },
        error: async (error) => {
          const msg = error.error?.message || error.message || this.translate.instant('BUSINESS_INVITE_CREATE_TOKEN_FAIL_MSG');
          await this.dialog.error(this.translate.instant('BUSINESS_INVITE_ERROR_TITLE'), msg);
        },
      });
  }

  async onGridAction(event: { action: string; row?: Record<string, unknown> | null }): Promise<void> {
    const row = event.row;
    if (!row) return;

    if (event.action === 'revoke') {
      const label = row['inviteType'] === 'email' ? row['inviteEmail'] : row['inviteToken'];
      const ok = await this.dialog.confirm(this.translate.instant('BUSINESS_INVITE_CONFIRM_DELETE_TITLE'), this.translate.instant('BUSINESS_INVITE_CONFIRM_DELETE_MSG', { label }));
      if (!ok) return;
      this.service.deleteInvite(row['id'] as string).subscribe({
        next: () => this.grid?.reload(),
        error: async () => { await this.dialog.error(this.translate.instant('BUSINESS_INVITE_ERROR_TITLE'), this.translate.instant('BUSINESS_INVITE_DELETE_FAIL_MSG')); },
      });
    }

    if (event.action === 'copy') {
      const token = row['inviteToken'] as string;
      if (token) navigator.clipboard.writeText(token);
      await this.dialog.info(this.translate.instant('BUSINESS_INVITE_COPY_SUCCESS_TITLE'), this.translate.instant('BUSINESS_INVITE_COPY_SUCCESS_MSG'));
    }
  }

  onBack(): void {
    this.router.navigate(['/management/business']);
  }
}

