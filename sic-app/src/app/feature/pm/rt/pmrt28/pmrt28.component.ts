// pmrt28.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SicOrganizationalChartComponent } from '../../../../core/component/sic-organizational-chart/sic-organizational-chart.component';
import type { SicOrganizationalChartNode } from '../../../../core/component/sic-organizational-chart/sic-organizational-chart.model';


interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  userNames: string[];
  isActive: boolean;
}

@Component({
  selector: 'app-pmrt28',
  standalone: true,
  imports: [CommonModule, RouterModule, SicOrganizationalChartComponent],
  templateUrl: './pmrt28.component.html',
})
export class Pmrt28Component implements OnInit {
  private router = inject(Router);

  // ข้อมูลบทบาท (signal)
  roles = signal<Role[]>([
    { id: 'role-001', code: 'ADMIN', name: 'Administrator', description: 'ผู้ดูแลระบบสูงสุด', userNames: ['สมชาย ใจดี', 'นารี วัฒนา'], isActive: true },
    { id: 'role-002', code: 'PM', name: 'Project Manager', description: 'ผู้จัดการโครงการ', userNames: ['สมชาย ใจดี', 'ประวิทย์ สุขสันต์'], isActive: true },
    { id: 'role-003', code: 'DEV', name: 'Developer', description: 'นักพัฒนา', userNames: ['สมหญิง รักเรียน', 'ประวิทย์ สุขสันต์', 'จันทร์จิรา ใจดี'], isActive: true },
    { id: 'role-004', code: 'QA', name: 'QA Tester', description: 'ผู้ทดสอบ', userNames: ['วิชัย มากมี'], isActive: false },
    { id: 'role-005', code: 'BA', name: 'Business Analyst', description: 'นักวิเคราะห์ธุรกิจ', userNames: ['นารี วัฒนา'], isActive: true },
    { id: 'role-006', code: 'SA', name: 'System Analyst', description: 'นักวิเคราะห์ระบบ', userNames: ['ประวิทย์ สุขสันต์'], isActive: true },
    { id: 'role-007', code: 'FIN', name: 'Finance', description: 'การเงิน', userNames: [], isActive: true },
    { id: 'role-008', code: 'CUSTOMER', name: 'Customer', description: 'ลูกค้า', userNames: ['จันทร์จิรา ใจดี'], isActive: true },
  ]);

  // จำนวนบทบาททั้งหมด (computed)
  flatRoles = computed(() => this.roles());

  // แปลง roles ให้เป็นโครงสร้างต้นไม้สำหรับ sic-organizational-chart
  treeData = computed<SicOrganizationalChartNode>(() => this.buildTree(this.roles()));

  ngOnInit(): void {}

  // สร้างโครงสร้างต้นไม้ โดยมี root node และ children เป็นทุกบทบาท
  private buildTree(roles: Role[]): SicOrganizationalChartNode {
    const root: SicOrganizationalChartNode = {
      id: 'root',
      nameEn: 'Organization',
      nameLocal: 'องค์กร',
      color: '#4A90E2',
      children: roles.map(role => ({
        id: role.id,
        nameEn: role.code,
        nameLocal: role.name,
        color: this.getColorForRole(role.id),
        children: [],  // ไม่มี hierarchy เพิ่มเติม
        // editable: true // ถ้าต้องการให้แก้ไขได้
      }))
    };
    return root;
  }

  // กำหนดสีตาม id (เพื่อให้สีคงที่)
  private getColorForRole(id: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#E67E22', '#2ECC71', '#9B59B6'];
    const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  // ===== Event Handlers =====
  onNodeAdded(event: { parentId: string; node: SicOrganizationalChartNode }) {
    console.log('✅ Node added:', event);
    // TODO: สร้าง Role ใหม่และเพิ่มใน roles signal
    // ตัวอย่าง: this.roles.update(prev => [...prev, newRole]);
    // จากนั้น system จะ rebuild tree โดยอัตโนมัติ
  }

  onNodeRemoved(event: { parentId: string; nodeId: string }) {
    console.log('🗑️ Node removed:', event);
    // TODO: ลบ Role ที่มี id ตรงกับ event.nodeId
    // this.roles.update(prev => prev.filter(r => r.id !== event.nodeId));
  }

  onNodeUpdated(event: { nodeId: string; node: SicOrganizationalChartNode }) {
    console.log('✏️ Node updated:', event);
    // TODO: อัปเดต Role ที่มี id ตรงกับ event.nodeId
    // this.roles.update(prev => prev.map(r => r.id === event.nodeId ? { ...r, code: event.node.nameEn, name: event.node.nameLocal } : r));
  }

  onDataChanged(event: SicOrganizationalChartNode) {
    console.log('📊 Data changed:', event);
    // TODO: เมื่อ tree เปลี่ยนแปลงทั้งหมด อาจต้อง sync กลับไปที่ roles
    // เนื่องจาก treeData เป็น computed จาก roles การเปลี่ยนแปลง tree โดยตรงจะไม่สะท้อนกลับ
    // ควรให้ onNodeAdded/Updated/Removed จัดการ update roles แทน
  }

  // ===== Navigation =====
  goToAddRole() {
    this.router.navigate(['/feature/pm/pmrt28/add']);
  }

  goToEditRole(roleId: string) {
    this.router.navigate(['/feature/pm/pmrt28', roleId, 'edit']);
  }

  goToAssignRole(roleId: string) {
    this.router.navigate(['/feature/pm/pmrt28', roleId, 'assign']);
  }
}