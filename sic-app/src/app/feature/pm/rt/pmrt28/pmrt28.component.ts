// pmrt28.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SicOrganizationalChartComponent } from '../../../../core/component/sic-organizational-chart/sic-organizational-chart.component';
import { SicOrganizationalChartNode } from '../../../../core/component/sic-organizational-chart/sic-organizational-chart.model';
import { DialogService } from '../../../../core/services/dialog.service';
interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  parentRoleId?: string;
  userNames: string[];
  isActive: boolean;
}

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

  // ===== ข้อมูลบทบาทแบบ Flat =====
  // TODO: โหลดจาก API จริง
  public flatRoles: Role[] = [
    {
      id: 'role-001',
      code: 'ADMIN',
      name: 'Administrator',
      description: 'ผู้ดูแลระบบสูงสุด',
      parentRoleId: undefined,
      userNames: ['สมชาย ใจดี', 'นารี วัฒนา'],
      isActive: true,
    },
    {
      id: 'role-002',
      code: 'PM',
      name: 'Project Manager',
      description: 'ผู้จัดการโครงการ',
      parentRoleId: 'role-001',
      userNames: ['สมชาย ใจดี', 'ประวิทย์ สุขสันต์'],
      isActive: true,
    },
    {
      id: 'role-003',
      code: 'DEV',
      name: 'Developer',
      description: 'นักพัฒนา',
      parentRoleId: 'role-002',
      userNames: ['สมหญิง รักเรียน', 'ประวิทย์ สุขสันต์', 'จันทร์จิรา ใจดี'],
      isActive: true,
    },
    {
      id: 'role-004',
      code: 'QA',
      name: 'QA Tester',
      description: 'ผู้ทดสอบ',
      parentRoleId: 'role-002',
      userNames: ['วิชัย มากมี'],
      isActive: false,
    },
    {
      id: 'role-005',
      code: 'BA',
      name: 'Business Analyst',
      description: 'นักวิเคราะห์ธุรกิจ',
      parentRoleId: 'role-002',
      userNames: ['นารี วัฒนา'],
      isActive: true,
    },
    {
      id: 'role-006',
      code: 'SA',
      name: 'System Analyst',
      description: 'นักวิเคราะห์ระบบ',
      parentRoleId: 'role-002',
      userNames: ['ประวิทย์ สุขสันต์'],
      isActive: true,
    },
    {
      id: 'role-007',
      code: 'FIN',
      name: 'Finance',
      description: 'การเงิน',
      parentRoleId: 'role-001',
      userNames: [],
      isActive: true,
    },
    {
      id: 'role-008',
      code: 'CUSTOMER',
      name: 'Customer',
      description: 'ลูกค้า',
      parentRoleId: 'role-001',
      userNames: ['จันทร์จิรา ใจดี'],
      isActive: true,
    },
  ];

  // ===== สร้าง Tree Data =====
  get treeData(): SicOrganizationalChartNode {
    const map = new Map<string, SicOrganizationalChartNode>();
    const roots: SicOrganizationalChartNode[] = [];

    this.flatRoles.forEach((role) => {
      const node: SicOrganizationalChartNode = {
        id: role.id,
        nameEn: role.name,
        nameLocal: role.name,
        color: this.getColorForRole(role.code),
        editable: true,
        children: [],
      };
      map.set(role.id, node);
    });

    this.flatRoles.forEach((role) => {
      const node = map.get(role.id)!;
      if (role.parentRoleId && map.has(role.parentRoleId)) {
        const parent = map.get(role.parentRoleId)!;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    if (roots.length === 1) {
      return roots[0];
    } else {
      return {
        id: 'root',
        nameEn: 'บทบาททั้งหมด',
        nameLocal: 'บทบาททั้งหมด',
        color: '#4ECDC4',
        editable: false,
        children: roots,
      };
    }
  }

  private getColorForRole(code: string): string {
    const colors: Record<string, string> = {
      ADMIN: '#FF6B6B',
      PM: '#4ECDC4',
      DEV: '#45B7D1',
      QA: '#FFA07A',
      BA: '#98D8C8',
      SA: '#F7DC6F',
      FIN: '#BB8FCE',
      CUSTOMER: '#85C1E9',
    };
    return colors[code] || '#95A5A6';
  }

  // ===== Event Handlers =====
  onNodeAdded(event: { parentId: string; node: SicOrganizationalChartNode }): void {
    console.log('➕ Node added:', event);
    this.dialog.success('เพิ่มบทบาท', `เพิ่มบทบาท "${event.node.nameEn}" เรียบร้อย`).then(() => {
      // TODO: เรียก API สร้างบทบาทใหม่
      // แล้ว reload ข้อมูล
    });
  }

  onNodeRemoved(event: { parentId: string; nodeId: string }): void {
    console.log('❌ Node removed:', event);
    this.dialog
      .confirm('ยืนยันการลบ', `คุณต้องการลบบทบาทนี้ใช่หรือไม่?`)
      .then((confirmed: boolean) => {
        if (confirmed) {
          // TODO: เรียก API ลบบทบาท
          this.dialog.warn('ลบบทบาท', `ลบบทบาท ID: ${event.nodeId} เรียบร้อย`);
          // reload tree
        }
      });
  }

  onNodeUpdated(event: { nodeId: string; node: SicOrganizationalChartNode }): void {
    console.log('✏️ Node updated:', event);
    // TODO: เรียก API อัปเดตบทบาท
    this.dialog.success('อัปเดตบทบาท', `อัปเดตบทบาท "${event.node.nameEn}" เรียบร้อย`);
    // reload tree
  }

  onDataChanged(root: SicOrganizationalChartNode): void {
    console.log('🔄 Data changed:', root);
    // ใช้เมื่อต้องการบันทึกทั้ง Tree
  }

  // ===== ปุ่มเพิ่มบทบาท =====
  goToAddRole(): void {
    this.router.navigate(['/feature/pm/pmrt28/add']);
  }

  // ===== เมื่อคลิกที่ Node =====
  onNodeClick(event: any): void {
    const node = event as SicOrganizationalChartNode;
    this.dialog
      .confirm('จัดการบทบาท', `คุณต้องการแก้ไขข้อมูลบทบาท "${node.nameEn}" หรือกำหนดผู้ใช้?`)
      .then((result: boolean) => {
        if (result) {
          this.router.navigate(['/feature/pm/pmrt28', node.id, 'edit']);
        } else {
          this.router.navigate(['/feature/pm/pmrt28', node.id, 'assign']);
        }
      });
  }

  ngOnInit(): void {
    // TODO: โหลดข้อมูลจริงจาก API
    console.log('Pmrt28Component initialized');
  }
}