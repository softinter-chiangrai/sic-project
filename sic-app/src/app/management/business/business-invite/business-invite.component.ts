import { Component, inject, OnInit, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessInviteService } from './business-invite.service';
import { BusinessInviteFormData, InviteEmailModel, InviteTokenModel } from './business-invite.model';
import { DialogService } from '../../../core/services/dialog.service';
import { SicInputComponent, SicButtonComponent, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridLoadRequest, SicGridRowData } from 'sic-ng';
import { SicComboboxComponent } from '../../../core/component/sic-combobox/sic-combobox.component';
import { SicNumberComponent } from '../../../core/component/sic-number/sic-number.component';
import { environment } from '../../../../environments/environment';
import { CanComponentDeactivate } from '../../../core/guard/can-deactivate.guard';
import { ToForm } from '../../../core/types/form.type';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './business-invite.component.css',
})
export class BusinessInviteComponent implements OnInit, CanComponentDeactivate {
  @ViewChild('grid') grid?: SicGridPanelComponent;

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
    id: 'id',
    lazy: false,
    selectable: false,
    showToolbar: false,
    pageable: false,
    column: [
      { label: 'ประเภท', name: 'inviteType', type: 'text', minWidth: 100, sortable: true },
      { label: 'ตำแหน่ง', name: 'roleName', type: 'text', minWidth: 180, sortable: true },
      { label: 'Email / Token', name: 'inviteEmail', type: 'inviteContact', minWidth: 180 },
      { label: 'สถานะ / ครั้งที่ใช้', name: 'isActivated', type: 'inviteStatus', minWidth: 160 },
      { label: 'จัดการ', name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 120 },
    ],
  };

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.service.getInvites().subscribe({
      next: (list) => {
        grid.setRows((list || []) as unknown as SicGridRowData[], { totalElements: list?.length || 0 }, request.requestId);
      },
      error: () => {
        grid.setRows([], { totalElements: 0 }, request.requestId);
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
      await this.dialog.info('คัดลอกสำเร็จ', 'Token ถูกคัดลอกไปยังคลิปบอร์ดแล้ว');
    }
  }

  onBack(): void {
    this.router.navigate(['/management/business']);
  }
}

