// src/app/feature/bu/rt/burt03/burt03.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import {
  SicOrganizationalChartComponent,
  SicOrganizationalChartEditDialog,
} from '../../../../core/component/sic-organizational-chart/sic-organizational-chart.component';
import { SicOrganizationalChartNode } from '../../../../core/component/sic-organizational-chart/sic-organizational-chart.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { Role } from './burt03.model';
import { burt03Service } from './burt03.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-burt03',
  standalone: true,
  imports: [CommonModule, RouterModule, SicOrganizationalChartComponent, TranslateModule],
  templateUrl: './burt03.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './burt03.component.css',
})
export class Burt03Component implements OnInit {
  private router = inject(Router);
  private dialog = inject(DialogService);
  private service = inject(burt03Service);
  private translate = inject(TranslateService);

  isLoading = signal(false);
  isSaving = signal(false);
  roles = signal<Role[]>([]);
  businessId = signal<string>('');

  // ✅ สร้าง Tree สำหรับแสดงแผนภูมิ
  treeData = computed(() => {
    const roles = this.roles();
    if (!roles || roles.length === 0) return null;

    const map = new Map<string, SicOrganizationalChartNode>();
    const roots: SicOrganizationalChartNode[] = [];

    roles.forEach((role) => {
      const node: SicOrganizationalChartNode = {
        id: role.id,
        roleCode: role.roleCode,
        // ✅ ใช้ roleName (แปลแล้ว) แทน roleNameEn
        nameEn: role.roleName,
        nameLocal: role.roleNameLocal,
        color: role.color || this.getColorForRole(role.roleCode),
        editable: true,
        children: [],
        _roleCode: role.roleCode,
        _sortOrder: role.sortOrder,
        _roleLevel: role.roleLevel,
      };
      map.set(role.id, node);
    });

    roles.forEach((role) => {
      const node = map.get(role.id)!;
      if (role.parentRoleId && map.has(role.parentRoleId)) {
        const parent = map.get(role.parentRoleId)!;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortChildren = (node: SicOrganizationalChartNode) => {
      node.children.sort((a, b) => {
        const roleA = roles.find((r) => r.id === a.id);
        const roleB = roles.find((r) => r.id === b.id);
        return (roleA?.sortOrder || 0) - (roleB?.sortOrder || 0);
      });
      node.children.forEach((child) => sortChildren(child));
    };
    roots.forEach((root) => sortChildren(root));

    if (roots.length === 1) return roots[0];

    return {
      id: 'root',
      roleCode: '',
      nameEn: '',
      nameLocal: '',
      color: 'transparent',
      editable: false,
      children: roots,
    };
  });

  flatRoles = computed(() => this.roles());
  hasData = computed(() => this.roles().length > 0);

  ngOnInit(): void {
    this.loadBusinessId();
  }

  loadBusinessId() {
    this.service.getMyBusinesses().subscribe({
      next: (businesses) => {
        if (businesses && businesses.length > 0) {
          const stored = localStorage.getItem('businessId');
          const matched = businesses.find((b) => b.id === stored);
          const activeBiz = matched || businesses.find((b) => b.isDefault) || businesses[0];
          this.businessId.set(activeBiz.id);
          localStorage.setItem('businessId', activeBiz.id);
          this.loadRoles();
        } else {
          this.dialog.error(this.translate.instant('BURT03_NO_BUSINESS_TITLE'), this.translate.instant('BURT03_SELECT_BUSINESS_MSG'));
          this.router.navigate(['/management/business']);
        }
      },
      error: () => {
        this.dialog.error(this.translate.instant('BURT03_ERROR_TITLE'), this.translate.instant('BURT03_LOAD_BUSINESS_FAILED_MSG'));
        this.router.navigate(['/management/business']);
      },
    });
  }

  loadRoles() {
    const bizId = this.businessId();
    if (!bizId) return;

    this.isLoading.set(true);
    this.service
      .getRoles(bizId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.roles.set(data);
        },
        error: (err) => {
          console.error('Load roles error', err);
          this.dialog.error(this.translate.instant('BURT03_LOAD_FAILED_TITLE'), this.translate.instant('BURT03_LOAD_ROLES_FAILED_MSG'));
        },
      });
  }

  // ===== Dialog: เพิ่มบทบาทระดับ Root =====
  openAddRootRoleDialog(): void {
    const draftNode: SicOrganizationalChartNode = {
      id: this.generateId(),
      roleCode: '',
      nameEn: '',
      nameLocal: '',
      color: this.getRandomColor(),
      children: [],
      editable: true,
    };

    this.dialog.open({
      type: 'confirm',
      component: SicOrganizationalChartEditDialog,
      componentInputs: {
        node: draftNode,
        onSave: (payload: {
          roleCode: string;
          nameEn: string;
          nameLocal: string;
          color: string;
        }) => {
          this.createRole({
            roleCode: payload.roleCode,
            nameEn: payload.nameEn,
            nameLocal: payload.nameLocal,
            parentId: null,
            color: payload.color,
          });
        },
      },
    });
  }

  // ===== สร้างบทบาท =====
  private createRole(data: {
    roleCode: string;
    nameEn: string;
    nameLocal: string;
    parentId: string | null;
    color: string;
  }) {
    const formattedRoleCode = data.roleCode.trim().toUpperCase();

    // Check duplicate roleCode locally
    const isDuplicate = this.roles().some(
      (r) => r.roleCode.toUpperCase() === formattedRoleCode
    );
    if (isDuplicate) {
      this.dialog.error(this.translate.instant('BURT03_SAVE_FAILED_TITLE'), this.translate.instant('BURT03_DUPLICATE_ROLE_CODE_MSG'));
      return;
    }

    const role: Role = {
      id: '',
      roleCode: formattedRoleCode,
      roleName: data.nameEn,
      roleNameEn: data.nameEn,
      roleNameLocal: data.nameLocal,
      roleLevel: this.calculateRoleLevel(data.parentId),
      sortOrder: this.calculateSortOrder(data.parentId),
      isActive: true,
      businessId: this.businessId(),
      parentRoleId: data.parentId || undefined,
      rowVersion: undefined,
      color: data.color,
    };

    this.isSaving.set(true);
    this.service
      .saveRole(role)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.dialog.success(this.translate.instant('BURT03_ADD_ROLE_SUCCESS_TITLE'), this.translate.instant('BURT03_ADD_ROLE_SUCCESS_MSG', { name: data.nameEn }));
          this.loadRoles();
        },
        error: (err) => {
          console.error('Create role error', err);
          let errorMessage = this.translate.instant('BURT03_GENERIC_ERROR_MSG');
          const errString = JSON.stringify(err);
          if (
            err.error?.message?.includes('already exists') ||
            err.message?.includes('already exists') ||
            errString.includes('already exists')
          ) {
            errorMessage = this.translate.instant('BURT03_DUPLICATE_ROLE_CODE_MSG');
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          this.dialog.error(this.translate.instant('BURT03_SAVE_FAILED_TITLE'), errorMessage);
          this.loadRoles();
        },
      });
  }

  // ===== Event: เพิ่ม Node ผ่านปุ่ม + ในแผนภูมิ =====
  onNodeAdded(event: { parentId: string; node: SicOrganizationalChartNode }): void {
    const newNode = event.node;
    const actualParentId = event.parentId === 'root' ? null : event.parentId;

    this.createRole({
      roleCode: newNode.roleCode || this.generateRoleCode(newNode.nameEn),
      nameEn: newNode.nameEn,
      nameLocal: newNode.nameLocal,
      parentId: actualParentId,
      color: newNode.color,
    });
  }

  // ===== Event: ลบ Node =====
  onNodeRemoved(event: { parentId: string; nodeId: string }): void {
    this.dialog.confirm(this.translate.instant('BURT03_CONFIRM_DELETE_TITLE'), this.translate.instant('BURT03_CONFIRM_DELETE_MSG')).then((confirmed) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.service.deleteRole(event.nodeId).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('BURT03_DELETE_SUCCESS_TITLE'), this.translate.instant('BURT03_DELETE_SUCCESS_MSG'));
            this.loadRoles();
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Delete error', err);
            this.dialog.error(this.translate.instant('BURT03_DELETE_FAILED_TITLE'), this.translate.instant('BURT03_DELETE_FAILED_MSG'));
            this.loadRoles();
          },
        });
      }
    });
  }

  // ===== Event: คลิกที่ Node (แก้ไข) =====
  onNodeClick(event: any): void {
    const node = event as SicOrganizationalChartNode;
    const role = this.roles().find((r) => r.id === node.id);
    if (!role) {
      this.dialog.error(this.translate.instant('BURT03_NOT_FOUND_TITLE'), this.translate.instant('BURT03_ROLE_NOT_FOUND_MSG'));
      return;
    }

    this.dialog.open({
      type: 'confirm',
      component: SicOrganizationalChartEditDialog,
      componentInputs: {
        node: {
          ...node,
          roleCode: role.roleCode,
          nameEn: role.roleNameEn,
          nameLocal: role.roleNameLocal,
          color: node.color || role.color,
        },
        onSave: (payload: {
          roleCode: string;
          nameEn: string;
          nameLocal: string;
          color: string;
        }) => {
          const formattedRoleCode = payload.roleCode.trim().toUpperCase();

          // Check duplicate roleCode locally
          const isDuplicate = this.roles().some(
            (r) => r.roleCode.toUpperCase() === formattedRoleCode && r.id !== role.id
          );
          if (isDuplicate) {
            this.dialog.error(this.translate.instant('BURT03_SAVE_FAILED_TITLE'), this.translate.instant('BURT03_DUPLICATE_ROLE_CODE_MSG'));
            return;
          }

          const updatedRole: Role = {
            ...role,
            roleCode: formattedRoleCode,
            roleName: payload.nameEn,
            roleNameEn: payload.nameEn,
            roleNameLocal: payload.nameLocal,
            color: payload.color,
            rowVersion: role.rowVersion,
          };

          this.isSaving.set(true);
          this.service
            .saveRole(updatedRole)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
              next: () => {
                this.dialog.success(this.translate.instant('BURT03_EDIT_SUCCESS_TITLE'), this.translate.instant('BURT03_EDIT_SUCCESS_MSG', { name: payload.nameEn }));
                this.loadRoles();
              },
              error: (err) => {
                console.error('Update role error', err);
                let errorMessage = this.translate.instant('BURT03_GENERIC_ERROR_MSG');
                const errString = JSON.stringify(err);
                if (
                  err.error?.message?.includes('already exists') ||
                  err.message?.includes('already exists') ||
                  errString.includes('already exists')
                ) {
                  errorMessage = this.translate.instant('BURT03_DUPLICATE_ROLE_CODE_MSG');
                } else if (err.error?.message) {
                  errorMessage = err.error.message;
                } else if (err.message) {
                  errorMessage = err.message;
                }
                this.dialog.error(this.translate.instant('BURT03_SAVE_FAILED_TITLE'), errorMessage);
                this.loadRoles();
              },
            });
        },
      },
    });
  }

  onNodeUpdated(event: { nodeId: string; node: SicOrganizationalChartNode }): void {}
  onDataChanged(root: SicOrganizationalChartNode): void {}

  // ===== Utility Methods =====

  private generateRoleCode(nameEn: string): string {
    if (!nameEn) return 'ROLE_' + Date.now();
    let code = nameEn.toUpperCase().replace(/\s+/g, '_');
    code = code.replace(/[^A-Z0-9_]/g, '');
    return code.length > 50 ? code.substring(0, 50) : code;
  }

  private calculateRoleLevel(parentId: string | null): string {
    if (!parentId) return '1';
    const parentRole = this.roles().find((r) => r.id === parentId);
    if (parentRole) {
      const parentLevel = parseInt(parentRole.roleLevel) || 0;
      return String(parentLevel + 1);
    }
    return '1';
  }

  private calculateSortOrder(parentId: string | null): number {
    let siblings: Role[] = [];
    if (!parentId) siblings = this.roles().filter((r) => !r.parentRoleId);
    else siblings = this.roles().filter((r) => r.parentRoleId === parentId);
    return siblings.length + 1;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getColorForRole(code: string): string {
    const specificColors: Record<string, string> = {
      ADMIN: '#FF6B6B',
      PM: '#4ECDC4',
      DEV: '#45B7D1',
      QA: '#FFA07A',
      BA: '#98D8C8',
      SA: '#F7DC6F',
      FIN: '#BB8FCE',
      CUSTOMER: '#85C1E9',
      TEAM_LEAD: '#F39C12',
      UIUX: '#9B59B6',
      MA_SUPPORT: '#1ABC9C',
      VIEWER: '#95A5A6',
    };
    if (code && specificColors[code]) {
      return specificColors[code];
    }
    const fallbackColors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
      '#F39C12',
      '#9B59B6',
      '#1ABC9C',
      '#E67E22',
      '#2ECC71',
      '#3498DB',
      '#E74C3C',
    ];
    if (code) {
      let hash = 0;
      for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
      }
      return fallbackColors[Math.abs(hash) % fallbackColors.length];
    }
    return fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
  }
}
