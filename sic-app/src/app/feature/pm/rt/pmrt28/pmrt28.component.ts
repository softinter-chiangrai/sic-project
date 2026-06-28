// src/app/feature/pm/rt/pmrt28/pmrt28.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import {
  SicOrganizationalChartComponent,
  SicOrganizationalChartEditDialog,
} from '../../../../core/component/sic-organizational-chart/sic-organizational-chart.component';
import { SicOrganizationalChartNode } from '../../../../core/component/sic-organizational-chart/sic-organizational-chart.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { Pmrt28Service, Role } from './pmrt28.service';

@Component({
  selector: 'app-pmrt28',
  standalone: true,
  imports: [CommonModule, RouterModule, SicOrganizationalChartComponent],
  templateUrl: './pmrt28.component.html',
  styleUrl: './pmrt28.component.css',
})
export class Pmrt28Component implements OnInit {
  private router = inject(Router);
  private dialog = inject(DialogService);
  private service = inject(Pmrt28Service);

  isLoading = signal(false);
  isSaving = signal(false);
  roles = signal<Role[]>([]);
  businessId = signal<string>('');

  treeData = computed(() => {
    const roles = this.roles();
    if (!roles || roles.length === 0) return null;

    const map = new Map<string, SicOrganizationalChartNode>();
    const roots: SicOrganizationalChartNode[] = [];

    roles.forEach((role) => {
      const node: SicOrganizationalChartNode = {
        id: role.id,
        roleCode: role.roleCode,
        nameEn: role.roleNameEn,
        nameLocal: role.roleNameLocal,
        // ✅ ใช้ color จาก DB ถ้ามี ถ้าไม่มีให้คำนวณจาก roleCode (fallback)
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
    const stored = localStorage.getItem('businessId');
    if (stored) {
      this.businessId.set(stored);
      this.loadRoles();
      return;
    }

    this.service.getMyBusinesses().subscribe({
      next: (businesses) => {
        if (businesses && businesses.length > 0) {
          const defaultBiz = businesses.find((b) => b.isDefault) || businesses[0];
          this.businessId.set(defaultBiz.id);
          localStorage.setItem('businessId', defaultBiz.id);
          this.loadRoles();
        } else {
          this.dialog.error('ไม่พบธุรกิจ', 'กรุณาเลือกธุรกิจก่อน');
          this.router.navigate(['/management/business']);
        }
      },
      error: () => {
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลธุรกิจได้');
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
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการบทบาทได้');
        },
      });
  }

  // ✅ เปิด dialog เพิ่มบทบาทระดับ root (ไม่มี parent)
  openAddRootRoleDialog(): void {
    const draftNode: SicOrganizationalChartNode = {
      id: this.generateId(),
      roleCode: '',
      nameEn: '',
      nameLocal: '',
      color: this.getRandomColor(), // สุ่มสีใหม่ทุกครั้ง
      children: [],
      editable: true,
    };

    this.dialog.open({
      type: 'confirm',
      component: SicOrganizationalChartEditDialog,
      componentInputs: {
        node: draftNode,
        onSave: (payload: { roleCode: string; nameEn: string; nameLocal: string; color: string }) => {
          this.createRole({
            roleCode: payload.roleCode,
            nameEn: payload.nameEn,
            nameLocal: payload.nameLocal,
            parentId: null,
            color: payload.color, // ✅ ส่งสี
          });
        },
      },
    });
  }

  // ✅ สร้างบทบาทใหม่ (ทั้ง root และลูก)
  private createRole(data: {
    roleCode: string;
    nameEn: string;
    nameLocal: string;
    parentId: string | null;
    color: string;
  }) {
    const role: Role = {
      id: '',
      roleCode: data.roleCode.toUpperCase(),
      roleNameEn: data.nameEn,
      roleNameLocal: data.nameLocal,
      roleLevel: this.calculateRoleLevel(data.parentId),
      sortOrder: this.calculateSortOrder(data.parentId),
      isActive: true,
      businessId: this.businessId(),
      parentRoleId: data.parentId || undefined,
      rowVersion: undefined,
      color: data.color, // ✅ ส่งสีไปบันทึก
    };

    this.isSaving.set(true);
    this.service
      .saveRole(role)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.dialog.success('เพิ่มบทบาทสำเร็จ', `เพิ่มบทบาท "${data.nameEn}" เรียบร้อย`);
          this.loadRoles(); // โหลดใหม่
        },
        error: (err) => {
          console.error('Create role error', err);
          let errorMessage = 'เกิดข้อผิดพลาด';
          if (err.error?.message) errorMessage = err.error.message;
          else if (err.message) errorMessage = err.message;
          this.dialog.error('เพิ่มบทบาทไม่สำเร็จ', errorMessage);
          // ✅ รีเฟรชข้อมูลเพื่อลบ node ที่เพิ่มไปแล้ว (กรณี error)
          this.loadRoles();
        },
      });
  }

  // ✅ เมื่อเพิ่ม node ผ่านปุ่ม + ในแผนภูมิ
  onNodeAdded(event: { parentId: string; node: SicOrganizationalChartNode }): void {
    const newNode = event.node;
    const actualParentId = event.parentId === 'root' ? null : event.parentId;

    this.createRole({
      roleCode: newNode.roleCode || this.generateRoleCode(newNode.nameEn),
      nameEn: newNode.nameEn,
      nameLocal: newNode.nameLocal,
      parentId: actualParentId,
      color: newNode.color, // ✅ ส่งสี
    });
  }

  // ✅ เมื่อลบ node
  onNodeRemoved(event: { parentId: string; nodeId: string }): void {
    this.dialog
      .confirm('ยืนยันการลบ', 'คุณต้องการลบบทบาทนี้ใช่หรือไม่?')
      .then((confirmed) => {
        if (confirmed) {
          this.isLoading.set(true);
          this.service.deleteRole(event.nodeId).subscribe({
            next: () => {
              this.dialog.success('ลบสำเร็จ', 'บทบาทถูกลบเรียบร้อย');
              this.loadRoles();
            },
            error: (err) => {
              this.isLoading.set(false);
              console.error('Delete error', err);
              this.dialog.error('ลบไม่สำเร็จ', 'ไม่สามารถลบบทบาทได้');
              this.loadRoles(); // รีเฟรชเมื่อ error
            },
          });
        }
      });
  }

  // ✅ เมื่อคลิกที่ node (แก้ไข)
  onNodeClick(event: any): void {
    const node = event as SicOrganizationalChartNode;
    const role = this.roles().find((r) => r.id === node.id);
    if (!role) {
      this.dialog.error('ไม่พบข้อมูล', 'ไม่พบบทบาทนี้ในระบบ');
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
          color: node.color || role.color, // ใช้สีที่มี
        },
        onSave: (payload: { roleCode: string; nameEn: string; nameLocal: string; color: string }) => {
          const updatedRole: Role = {
            ...role,
            roleCode: payload.roleCode.toUpperCase(),
            roleNameEn: payload.nameEn,
            roleNameLocal: payload.nameLocal,
            color: payload.color, // ✅ ส่งสีที่เลือกกลับไป
            rowVersion: role.rowVersion,
          };

          this.isSaving.set(true);
          this.service
            .saveRole(updatedRole)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
              next: () => {
                this.dialog.success('แก้ไขสำเร็จ', `อัปเดตบทบาท "${payload.nameEn}" เรียบร้อย`);
                this.loadRoles();
              },
              error: (err) => {
                console.error('Update role error', err);
                let errorMessage = 'เกิดข้อผิดพลาด';
                if (err.error?.message) errorMessage = err.error.message;
                else if (err.message) errorMessage = err.message;
                this.dialog.error('แก้ไขไม่สำเร็จ', errorMessage);
                this.loadRoles(); // รีเฟรชเมื่อ error
              },
            });
        },
      },
    });
  }

  onNodeUpdated(event: { nodeId: string; node: SicOrganizationalChartNode }): void {}
  onDataChanged(root: SicOrganizationalChartNode): void {}

  // ===== Utility methods =====

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

  // ✅ ฟังก์ชันสำหรับ fallback (ถ้า DB ไม่มีสี) – ปรับให้ไม่คืนสีเทาเสมอ
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
    // fallback สีสันสดใส
    const fallbackColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E9', '#F39C12', '#9B59B6',
      '#1ABC9C', '#E67E22', '#2ECC71', '#3498DB', '#E74C3C'
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