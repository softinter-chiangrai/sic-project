// src/app/feature/bu/rt/burt05/burt05.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DialogService } from '../../../../core/services/dialog.service';
import { Program, TreeNode } from './burt05.model';
import { burt05Service } from './burt05.service';

/** FlatNode = TreeNode + level */
type FlatNode = TreeNode & { level: number };

/** Helper: ดึงชื่อจาก Program หรือ TreeNode */
function getProgramName(program: Program | TreeNode): string {
  if ('name' in program) {
    return program.name; // TreeNode
  }
  return program.programNameEn || 'ไม่ระบุชื่อ'; // Program
}

@Component({
  selector: 'app-burt05',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './burt05.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./burt05.component.css'],
})
export class Burt05Component implements OnInit {
  private service = inject(burt05Service);
  private dialog = inject(DialogService);
  private router = inject(Router);

  isLoading = signal(false);
  programs = signal<Program[]>([]);
  treeData = signal<TreeNode[]>([]);

  // เก็บ ID ของ node ที่ขยาย
  expandedIds = signal<Set<string>>(new Set());

  // คำนวณรายการ node ที่จะแสดง
  visibleNodes = computed<FlatNode[]>(() => {
    const tree = this.treeData();
    const expanded = this.expandedIds();
    const result: FlatNode[] = [];

    const flatten = (nodes: TreeNode[], level: number) => {
      for (const node of nodes) {
        result.push({ ...node, level });
        if (expanded.has(node.id) && node.children.length > 0) {
          flatten(node.children, level + 1);
        }
      }
    };

    flatten(tree, 0);
    return result;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.service.getPrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
        this.buildTree(programs);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการโปรแกรมได้');
      },
    });
  }

  /** สร้างต้นไม้จาก List ของ Program */
  buildTree(programs: Program[]) {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    programs.forEach((p) => {
      const node: TreeNode = {
        id: p.id!,
        code: p.programCode,
        name: p.programName,
        nameLocal: p.programNameLocal,
        icon: p.programIcon || 'bi bi-file',
        routePath: p.routePath || '',
        sortOrder: p.sortOrder || 0,
        isActive: p.isActive,
        children: [],
        parentProgramId: p.parentProgramId,
        level: 0,
      };
      map.set(p.id!, node);
    });

    programs.forEach((p) => {
      const node = map.get(p.id!);
      if (!node) return;

      if (p.parentProgramId && map.has(p.parentProgramId)) {
        const parent = map.get(p.parentProgramId)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        roots.push(node);
      }
    });

    // เรียงลำดับ
    const sortChildren = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      nodes.forEach((node) => sortChildren(node.children));
    };
    sortChildren(roots);

    this.treeData.set(roots);
    this.expandAll();
  }

  /** ขยายทุกโหนด */
  expandAll() {
    const allIds = this.getAllNodeIds(this.treeData());
    this.expandedIds.set(allIds);
  }

  /** ดึง ID ทั้งหมดจากต้นไม้ */
  getAllNodeIds(nodes: TreeNode[]): Set<string> {
    const ids = new Set<string>();
    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        ids.add(node.id);
        traverse(node.children);
      }
    };
    traverse(nodes);
    return ids;
  }

  /** สลับสถานะขยาย/ย่อ */
  toggleExpand(id: string) {
    this.expandedIds.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  /** ตรวจสอบว่าขยายอยู่หรือไม่ */
  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  // ---------- Navigation & Actions ----------
  goToAdd() {
    this.router.navigate(['/feature/bu/burt05/new']);
  }

  goToEdit(program: Program | TreeNode) {
    this.router.navigate(['/feature/bu/burt05', program.id, 'edit']);
  }

  goToPermissions(program: Program | TreeNode) {
    this.router.navigate(['/feature/bu/burt05', program.id, 'permissions']);
  }

  deleteProgram(program: Program | TreeNode) {
    const hasChildren = this.programs().some((p) => p.parentProgramId === program.id);
    if (hasChildren) {
      this.dialog.error('ไม่สามารถลบได้', 'โปรแกรมนี้มีโปรแกรมย่อย กรุณาลบโปรแกรมย่อยก่อน');
      return;
    }

    const programName = getProgramName(program);

    this.dialog
      .confirm('ยืนยันการลบ', `คุณต้องการลบโปรแกรม "${programName}" ใช่หรือไม่?`)
      .then((confirmed) => {
        if (confirmed) {
          this.service.deleteProgram(program.id!).subscribe({
            next: () => {
              this.dialog.success('ลบสำเร็จ', 'โปรแกรมถูกลบเรียบร้อย');
              this.loadData();
            },
            error: (err) => {
              this.dialog.error('ลบไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
        }
      });
  }

  // ✅ แก้ไขฟังก์ชันนี้ให้ใช้ CSS Variables แทน hard-coded colors
  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-[var(--crm-success)]/10 text-[var(--crm-success)]'   // สีเขียวของระบบ
      : 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]';     // สีเทาของระบบ
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }
}

