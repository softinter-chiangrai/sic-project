// src/app/feature/pm/rt/pmrt30/pmrt30.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DialogService } from '../../../../core/services/dialog.service';
import { Pmrt30Service, Program } from './pmrt30.service';
import { TreeNodeComponent } from '../../../../core/component/sic-treenode/tree-node.component';


interface TreeNode {
  id: string;
  code: string;
  name: string;
  nameLocal: string;
  icon: string;
  routePath: string;
  sortOrder: number;
  isActive: boolean;
  children: TreeNode[];
  parentProgramId?: string | null;
  level: number;
}

/** Helper: ดึงชื่อจาก Program หรือ TreeNode */
function getProgramName(program: Program | TreeNode): string {
  if ('name' in program) {
    return program.name; // TreeNode
  }
  return program.programNameEn || 'ไม่ระบุชื่อ'; // Program
}

@Component({
  selector: 'app-pmrt30',
  standalone: true,
  imports: [CommonModule, RouterModule, TreeNodeComponent],
  templateUrl: './pmrt30.component.html',
  styleUrl: './pmrt30.component.css',
})
export class Pmrt30Component implements OnInit {
  private service = inject(Pmrt30Service);
  private dialog = inject(DialogService);
  private router = inject(Router);

  isLoading = signal(false);
  programs = signal<Program[]>([]);
  treeData = signal<TreeNode[]>([]);

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

  buildTree(programs: Program[]) {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    programs.forEach((p) => {
      const node: TreeNode = {
        id: p.id!,
        code: p.programCode,
        name: p.programNameEn,
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

    const sortChildren = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      nodes.forEach((node) => sortChildren(node.children));
    };
    sortChildren(roots);

    this.treeData.set(roots);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/pmrt30/new']);
  }

  goToEdit(program: Program | TreeNode) {
    this.router.navigate(['/feature/pm/pmrt30', program.id, 'edit']);
  }

  goToPermissions(program: Program | TreeNode) {
    this.router.navigate(['/feature/pm/pmrt30', program.id, 'permissions']);
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

  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }
}

export default Pmrt30Component;