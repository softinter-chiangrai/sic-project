import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  route?: string;
}

interface ProjectHealth {
  score: number;
  status: 'Green' | 'Yellow' | 'Red';
  factors: { name: string; value: number; weight: number }[];
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  user: string;
  time: string;
  icon: string;
  color: string;
  route?: string;
}

interface PendingApproval {
  id: string;
  type: string;
  code: string;
  title: string;
  dueDate: string;
  route: string;
}

interface Deadline {
  id: string;
  task: string;
  project: string;
  dueDate: string;
  daysLeft: number;
  status: string;
  route: string;
}

interface SystemStatus {
  label: string;
  status: 'Healthy' | 'Warning' | 'Error';
  value: string;
}

@Component({
  selector: 'app-pmrt24',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt24.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt24Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  isLoading = signal(false);
  lastUpdated = signal(new Date());

  // ===== Stats (Admin มองเห็นทุกอย่าง) =====
  stats = signal<StatCard[]>([
    { label: 'โครงการทั้งหมด', value: 12, icon: 'bi-briefcase-fill', color: 'var(--crm-primary)', route: '/feature/pm/project' },
    { label: 'กำลังดำเนินการ', value: 5, icon: 'bi-clock-fill', color: 'var(--crm-warning)', route: '/feature/pm/project' },
    { label: 'ล่าช้า', value: 2, icon: 'bi-exclamation-triangle-fill', color: 'var(--crm-danger)', route: '/feature/pm/project' },
    { label: 'แล้วเสร็จ', value: 5, icon: 'bi-check-circle-fill', color: 'var(--crm-success)', route: '/feature/pm/project' },
    { label: 'ผู้ใช้งานทั้งหมด', value: 15, icon: 'bi-people-fill', color: 'var(--crm-primary)', route: '/feature/pm/user' },
    { label: 'Bug ที่ยังไม่ปิด', value: 3, icon: 'bi-bug-fill', color: 'var(--crm-danger)', route: '/feature/pm/bug' },
    { label: 'ใบแจ้งหนี้ค้างชำระ', value: 2, icon: 'bi-wallet-fill', color: 'var(--crm-warning)', route: '/feature/pm/invoice' },
    { label: 'MA Ticket ที่ยังไม่ปิด', value: 1, icon: 'bi-headset', color: 'var(--crm-primary)', route: '/feature/pm/ma-ticket' },
  ]);

  // ===== Project Health =====
  projectHealth = signal<ProjectHealth>({
    score: 72,
    status: 'Yellow',
    factors: [
      { name: 'งานล่าช้า', value: 30, weight: 30 },
      { name: 'Bug Critical', value: 10, weight: 20 },
      { name: 'Manday เกิน', value: 15, weight: 20 },
      { name: 'Requirement เปลี่ยนบ่อย', value: 8, weight: 15 },
      { name: 'Invoice ค้าง', value: 5, weight: 10 },
      { name: 'MA Ticket ค้าง', value: 4, weight: 5 },
    ],
  });

  // ===== Pending Approvals =====
  pendingApprovals = signal<PendingApproval[]>([
    { id: '1', type: 'Requirement', code: 'REQ-002', title: 'จัดการข้อมูลลูกค้า', dueDate: '2024-02-27', route: '/feature/pm/approval/1' },
    { id: '2', type: 'Specification', code: 'SPEC-001', title: 'Customer Management', dueDate: '2024-03-01', route: '/feature/pm/approval/2' },
    { id: '3', type: 'Delivery', code: 'DEL-001', title: 'ระบบ CRM v1.0', dueDate: '2024-03-15', route: '/feature/pm/approval/3' },
    { id: '4', type: 'Change Request', code: 'CR-002', title: 'เปลี่ยนรูปแบบ Dashboard', dueDate: '2024-02-28', route: '/feature/pm/approval/4' },
    { id: '5', type: 'Invoice', code: 'INV-002', title: 'งวดที่ 2 (ส่งมอบ)', dueDate: '2024-04-30', route: '/feature/pm/approval/5' },
  ]);

  // ===== Deadlines =====
  deadlines = signal<Deadline[]>([
    { id: '1', task: 'พัฒนา Customer API', project: 'ระบบ CRM', dueDate: '2024-02-28', daysLeft: 3, status: 'In Progress', route: '/feature/pm/task/2' },
    { id: '2', task: 'พัฒนา Customer UI', project: 'ระบบ CRM', dueDate: '2024-03-05', daysLeft: 8, status: 'Todo', route: '/feature/pm/task/3' },
    { id: '3', task: 'ทดสอบระบบ Login', project: 'ระบบ CRM', dueDate: '2024-02-25', daysLeft: 0, status: 'Delayed', route: '/feature/pm/task/5' },
    { id: '4', task: 'ออกแบบ ER Diagram ระบบ HR', project: 'ระบบ HR', dueDate: '2024-02-28', daysLeft: 3, status: 'Delayed', route: '/feature/pm/task/4' },
  ]);

  // ===== Recent Activities =====
  activities = signal<RecentActivity[]>([
    { id: '1', type: 'approval', title: 'อนุมัติ Requirement REQ-001', user: 'สมชาย ใจดี', time: '2 ชั่วโมงที่แล้ว', icon: 'bi-check2-circle', color: 'var(--crm-success)', route: '/feature/pm/approval/1' },
    { id: '2', type: 'bug', title: 'แจ้ง Bug BUG-003', user: 'สมศักดิ์ รุ่งเรือง', time: '5 ชั่วโมงที่แล้ว', icon: 'bi-bug', color: 'var(--crm-danger)', route: '/feature/pm/bug/3' },
    { id: '3', type: 'task', title: 'สร้างงานใหม่ TASK-005', user: 'วิชัย พัฒนาชัย', time: '1 วันที่แล้ว', icon: 'bi-plus-circle', color: 'var(--crm-primary)', route: '/feature/pm/task/5' },
    { id: '4', type: 'delivery', title: 'ส่งมอบโครงการระบบ CRM', user: 'สมหญิง รักเรียน', time: '2 วันที่แล้ว', icon: 'bi-box-seam', color: 'var(--crm-success)', route: '/feature/pm/delivery/1' },
    { id: '5', type: 'ma', title: 'Ticket MA-002 ถูกปิด', user: 'มานี มีทรัพย์', time: '3 วันที่แล้ว', icon: 'bi-headset', color: 'var(--crm-warning)', route: '/feature/pm/ma-ticket/2' },
    { id: '6', type: 'user', title: 'ผู้ใช้ใหม่: วิชัย พัฒนาชัย', user: 'ระบบ', time: '4 วันที่แล้ว', icon: 'bi-person-plus', color: 'var(--crm-primary)', route: '/feature/pm/user' },
    { id: '7', type: 'contract', title: 'สัญญา CT-002 ใกล้หมดอายุ', user: 'ระบบ', time: '5 วันที่แล้ว', icon: 'bi-file-earmark-text', color: 'var(--crm-warning)', route: '/feature/pm/renewal/2' },
  ]);

  // ===== System Status =====
  systemStatus = signal<SystemStatus[]>([
    { label: 'API Status', status: 'Healthy', value: 'ปกติ' },
    { label: 'Database', status: 'Healthy', value: 'เชื่อมต่อปกติ' },
    { label: 'Storage', status: 'Warning', value: '75% ใช้แล้ว' },
    { label: 'ระบบแจ้งเตือน', status: 'Error', value: 'ล้มเหลว' },
  ]);

  // ===== Quick Actions =====
  quickActions = [
    { label: 'สร้างโครงการใหม่', icon: 'bi-plus-circle', route: '/feature/pm/project/new', color: 'primary' },
    { label: 'เพิ่ม Requirement', icon: 'bi-clipboard-plus', route: '/feature/pm/requirement/new', color: 'primary' },
    { label: 'สร้างงานใหม่', icon: 'bi-list-task', route: '/feature/pm/task/new', color: 'primary' },
    { label: 'แจ้ง Bug', icon: 'bi-bug', route: '/feature/pm/bug/new', color: 'danger' },
    { label: 'ออกใบแจ้งหนี้', icon: 'bi-receipt', route: '/feature/pm/invoice/new', color: 'primary' },
    { label: 'แจ้ง MA Ticket', icon: 'bi-headset', route: '/feature/pm/ma-ticket/new', color: 'warning' },
    { label: 'สร้าง User', icon: 'bi-person-plus', route: '/feature/pm/user/new', color: 'primary' },
    { label: 'ดู Audit Log', icon: 'bi-clock-history', route: '/feature/pm/audit', color: 'secondary' },
  ];

  // ===== Lifecycle =====
  ngOnInit() {
    // TODO: ดึงข้อมูลจริงจาก API
    this.updateLastUpdated();
  }

  updateLastUpdated() {
    this.lastUpdated.set(new Date());
  }

  // ===== Actions =====
  goToApproval(id: string) {
    this.router.navigate(['/feature/pm/approval', id]);
  }

  goToTask(id: string) {
    this.router.navigate(['/feature/pm/task', id]);
  }

  goToProject(id: string) {
    this.router.navigate(['/feature/pm/project', id]);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // ===== Utility =====
  getHealthStatusColor(status: string): string {
    const map: Record<string, string> = {
      Green: 'var(--crm-success)',
      Yellow: 'var(--crm-warning)',
      Red: 'var(--crm-danger)',
    };
    return map[status] || 'var(--crm-warning)';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Yellow'];
  }

  getDeadlineStatusClass(status: string): string {
    const map: Record<string, string> = {
      Todo: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Todo'];
  }

  getDaysClass(days: number): string {
    if (days <= 0) return 'text-red-500 font-bold';
    if (days <= 3) return 'text-orange-500 font-semibold';
    return 'text-emerald-500';
  }

  getSystemStatusClass(status: string): string {
    const map: Record<string, string> = {
      Healthy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Healthy'];
  }

  getQuickActionColorClass(color: string): string {
    const map: Record<string, string> = {
      primary: 'bg-[var(--crm-primary)] text-white hover:bg-[var(--crm-primary)]/80',
      danger: 'bg-[var(--crm-danger)] text-white hover:bg-[var(--crm-danger)]/80',
      warning: 'bg-[var(--crm-warning)] text-white hover:bg-[var(--crm-warning)]/80',
      secondary: 'bg-[var(--text-muted)] text-white hover:bg-[var(--text-muted)]/80',
    };
    return map[color] || map['primary'];
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
}

export default Pmrt24Component;