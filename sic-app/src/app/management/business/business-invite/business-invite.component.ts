import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessInviteService } from './business-invite.service';
import { BusinessInviteFormData, InviteEmailModel, InviteTokenModel } from './business-invite.model';
import { DialogService } from '../../../core/services/dialog.service';
import { SicInputComponent } from '../../../core/component/sic-input/sic-input.component';
import { SicButtonComponent } from '../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../core/component/sic-combobox/sic-combobox.component';
import { SicNumberComponent } from '../../../core/component/sic-number/sic-number.component';
import { environment } from '../../../../environments/environment';
import { CanComponentDeactivate } from '../../../core/guard/can-deactivate.guard';
import { ToForm } from '../../../core/types/form.type';
import { SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate } from '../../../core/component/sic-gridpanel/sic-gridpanel.component';

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
  ],
  templateUrl: './business-invite.component.html',
  styleUrl: './business-invite.component.css',
})
export class BusinessInviteComponent implements OnInit, CanComponentDeactivate {
  @ViewChild(SicGridPanelComponent) grid?: SicGridPanelComponent;

  readonly route = inject(ActivatedRoute);
  readonly service = inject(BusinessInviteService);
  readonly dialog = inject(DialogService);
  readonly router = inject(Router);

  readonly apiBaseUrl = environment.apiBaseUrl;

  activeTab = signal<'email' | 'token'>('email');
  loading = signal(false);

  emailForm!: FormGroup<ToForm<InviteEmailModel>>;
  tokenForm!: FormGroup<ToForm<InviteTokenModel>>;

  pageDirty = () => this.emailForm.dirty || this.tokenForm.dirty;

  readonly inviteGridConfig: SicGridPanelConfig = {
    api: `${environment.apiBaseUrl}/api/business/invite`,
    id: 'id',
    pageable: false,
    columns: [
      { label: 'ประเภท', name: 'inviteType', type: 'text', width: 100, sortable: true },
      { label: 'ตำแหน่ง', name: 'roleName', type: 'text', width: 180, sortable: true },
      { label: 'Email / Token', name: 'inviteEmail', type: 'text', customTemplate: 'inviteContact' },
      { label: 'สถานะ / ครั้งที่ใช้', name: 'isActivated', type: 'text', width: 160, customTemplate: 'inviteStatus' },
      { label: '', name: 'rowActions', type: 'text', width: 180, customTemplate: 'inviteActions' },
    ],
  };

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
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.emailForm.reset();
        this.grid?.reload();
      },
      error: async () => {
        this.loading.set(false);
        await this.dialog.error('เกิดข้อผิดพลาด', 'ไม่สามารถสร้าง Email Invite ได้');
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
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.tokenForm.reset();
        this.grid?.reload();
      },
      error: async () => {
        this.loading.set(false);
        await this.dialog.error('เกิดข้อผิดพลาด', 'ไม่สามารถสร้าง Token Invite ได้');
      },
    });
  }

  async onGridAction(event: { action: string; row?: Record<string, unknown> | null }): Promise<void> {
    const row = event.row;
    if (!row) return;

    if (event.action === 'revoke') {
      const label = row['inviteType'] === 'email' ? row['inviteEmail'] : row['inviteToken'];
      const ok = await this.dialog.confirm('ยืนยันการลบ', `ลบ invite ${label}?`);
      if (!ok) return;
      this.service.deleteInvite(row['id'] as string).subscribe({
        next: () => this.grid?.reload(),
        error: async () => { await this.dialog.error('เกิดข้อผิดพลาด', 'ไม่สามารถลบ Invite ได้'); },
      });
    }

    if (event.action === 'copy') {
      const token = row['inviteToken'] as string;
      if (token) navigator.clipboard.writeText(token);
    }
  }

  onBack(): void {
    this.router.navigate(['/management/business']);
  }
}

