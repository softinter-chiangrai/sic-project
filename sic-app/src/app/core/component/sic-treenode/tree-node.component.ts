// src/app/feature/pm/rt/pmrt30/tree-node.component.ts

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

export interface TreeNode {
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

@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td class="px-4 py-3">
        <div class="flex items-center gap-2" [style.padding-left.px]="level * 32">
          <!-- ปุ่ม toggle ถ้ามีลูก -->
          @if (node.children.length > 0) {
            <button
              (click)="toggleExpand($event)"
              class="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i class="bi" [class.bi-chevron-right]="!isExpanded()" [class.bi-chevron-down]="isExpanded()"></i>
            </button>
          } @else {
            <span class="w-5"></span>
          }

          <!-- ไอคอน -->
          <i class="bi text-gray-500 dark:text-gray-400" [class]="node.icon || 'bi-file-earmark'"></i>

          <!-- ชื่อโปรแกรม (คลิกเพื่อขยาย/ย่อ) -->
          <span
            class="font-medium text-gray-800 dark:text-white cursor-pointer"
            (click)="toggleExpand($event)"
          >
            {{ node.name }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">({{ node.nameLocal }})</span>

          <!-- จำนวนลูก -->
          @if (node.children.length > 0) {
            <span class="text-xs text-gray-400 dark:text-gray-500">[{{ node.children.length }}]</span>
          }
        </div>
      </td>
      <td class="px-4 py-3">
        <span class="text-xs font-mono text-blue-600 dark:text-blue-400">{{ node.code }}</span>
      </td>
      <td class="px-4 py-3">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ node.sortOrder }}</span>
      </td>
      <td class="px-4 py-3">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ node.routePath || '-' }}</span>
      </td>
      <td class="px-4 py-3">
        <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
              [class.bg-emerald-100]="node.isActive"
              [class.text-emerald-700]="node.isActive"
              [class.bg-gray-200]="!node.isActive"
              [class.text-gray-600]="!node.isActive"
              [class.dark:bg-emerald-900/30]="node.isActive"
              [class.dark:text-emerald-400]="node.isActive"
              [class.dark:bg-gray-700]="!node.isActive"
              [class.dark:text-gray-400]="!node.isActive">
          {{ node.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
        </span>
      </td>
      <td class="px-4 py-3 text-center">
        <div class="flex items-center justify-center gap-1">
          <button
            (click)="onEdit.emit(node)"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
            title="แก้ไข"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            (click)="onPermissions.emit(node)"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"
            title="กำหนดสิทธิ์"
          >
            <i class="bi bi-shield-lock"></i>
          </button>
          <button
            (click)="onDelete.emit(node)"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            title="ลบ"
            [disabled]="node.children.length > 0"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>

    <!-- แสดงลูกเฉพาะเมื่อขยาย -->
    @if (isExpanded()) {
      @for (child of node.children; track child.id) {
        <app-tree-node
          [node]="child"
          [level]="level + 1"
          (edit)="onEdit.emit($event)"
          (delete)="onDelete.emit($event)"
          (permissions)="onPermissions.emit($event)"
        ></app-tree-node>
      }
    }
  `,
})
export class TreeNodeComponent {
  @Input() node!: TreeNode;
  @Input() level: number = 0;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() permissions = new EventEmitter<any>();

  isExpanded = signal(true);

  onEdit = this.edit;
  onDelete = this.delete;
  onPermissions = this.permissions;

  toggleExpand(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.node.children.length === 0) return;
    this.isExpanded.update((v) => !v);
  }
}