// pmrt28.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  userNames: string[];    // เปลี่ยนจาก userCount เป็น userNames
  isActive: boolean;
}

@Component({
  selector: 'app-pmrt28',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt28.component.html',
})
export class Pmrt28Component implements OnInit {
  private router = inject(Router);

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

  ngOnInit() {}

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