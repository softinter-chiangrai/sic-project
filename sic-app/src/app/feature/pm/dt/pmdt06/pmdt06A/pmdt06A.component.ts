// src/app/features/pmdt06/pmdt06A/pmdt06A.component.ts
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

import { Pmdt06BComponent } from '../pmdt06B/pmdt06B.component';
import { Pmdt06CComponent } from '../pmdt06C/pmdt06C.component';
import { Pmdt06DComponent } from '../pmdt06D/pmdt06D.component';
import { DiagramService } from '../diagram.service';
import { DiagramModel, DiagramType, DIAGRAM_DEFAULTS, DIAGRAM_TYPES } from '../diagram.model';

@Component({
  selector: 'app-pmdt06A',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, Pmdt06BComponent, Pmdt06CComponent, Pmdt06DComponent, MatDialogModule],
  templateUrl: './pmdt06A.component.html',
  styleUrls: ['./pmdt06A.component.css']
})
export class Pmdt06AComponent implements OnInit, OnDestroy {
  private diagramService = inject(DiagramService);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();
  private autoSave$ = new Subject<DiagramModel>();

  tabs = signal<DiagramModel[]>([]);
  activeTabId = signal<string | null>(null);
  searchQuery = signal('');

  activeTab = computed(() => {
    const id = this.activeTabId();
    return this.tabs().find(t => t.id === id) || null;
  });

  filteredTabs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.tabs();
    return this.tabs().filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.diagramType.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.diagramService.tabs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tabs => {
        this.tabs.set(tabs);
        if (tabs.length > 0 && !this.activeTabId()) {
          this.activeTabId.set(tabs[0].id);
        }
      });

    this.autoSave$
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe(tab => {
        this.diagramService.updateTab(tab).subscribe();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTab(id: string) {
    this.activeTabId.set(id);
    this.diagramService.setActiveTab(id);
  }

  createTab() {
    const dialogRef = this.dialog.open(CreateDiagramDialogComponent, {
      width: '450px',
      data: { name: '', type: 'Flowchart' as DiagramType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { name, type } = result;
        const script = DIAGRAM_DEFAULTS[type as DiagramType] || '';
        const projectId = this.diagramService['projectsSubject'].value[0]?.id || '';
        this.diagramService.createTab(projectId, name, type, script)
          .subscribe(tab => {
            this.activeTabId.set(tab.id);
          });
      }
    });
  }

  closeTab(id: string, event: Event) {
    event.stopPropagation();
    this.diagramService.deleteTab(id).subscribe(() => {
      const tabs = this.tabs();
      if (this.activeTabId() === id) {
        const remaining = tabs.filter(t => t.id !== id);
        this.activeTabId.set(remaining.length ? remaining[0].id : null);
      }
    });
  }

  updateDiagram(updated: DiagramModel) {
    this.tabs.update(tabs => tabs.map(t => t.id === updated.id ? updated : t));
    this.autoSave$.next(updated);
  }

  drop(event: CdkDragDrop<DiagramModel[]>) {
    const tabs = this.tabs();
    const reorder = tabs.map(t => ({ id: t.id, sortOrder: t.sortOrder }));
    moveItemInArray(reorder, event.previousIndex, event.currentIndex);
    this.diagramService.reorderTabs(reorder).subscribe();
  }

  handleAiResponse(response: any) {
    if (response.action === 'create' && response.diagram) {
      const projectId = this.diagramService['projectsSubject'].value[0]?.id || '';
      this.diagramService.createTab(
        projectId,
        response.diagram.name || 'AI Generated',
        response.diagram.type || 'Flowchart',
        response.diagram.script
      ).subscribe(tab => {
        this.activeTabId.set(tab.id);
      });
    } else if (response.action === 'update' && response.diagram) {
      const current = this.activeTab();
      if (current) {
        const updated = { ...current, mermaidScript: response.diagram.script };
        this.updateDiagram(updated);
      }
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      Flowchart: 'bi-diagram-2',
      Sequence: 'bi-arrow-left-right',
      Class: 'bi-boxes',
      ER: 'bi-table',
      DFD: 'bi-diagram-3',
      State: 'bi-circle',
      Journey: 'bi-map',
      Mindmap: 'bi-diagram-3',
      Timeline: 'bi-clock-history',
      Requirement: 'bi-clipboard-check',
      C4: 'bi-layers',
      'Git Graph': 'bi-git',
      Pie: 'bi-pie-chart',
      Gantt: 'bi-bar-chart',
    };
    return icons[type] || 'bi-file-earmark';
  }
}

// Create Diagram Dialog Component
@Component({
  selector: 'app-create-diagram-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h3 class="text-lg font-semibold mb-4">New Diagram</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[var(--text-muted)] mb-1">Name</label>
          <input [(ngModel)]="data.name" type="text" placeholder="My Diagram" class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm outline-none focus:border-[var(--crm-primary)]" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[var(--text-muted)] mb-1">Type</label>
          <select [(ngModel)]="data.type" class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm outline-none focus:border-[var(--crm-primary)]">
            @for (type of diagramTypes; track type) {
              <option [value]="type">{{ type }}</option>
            }
          </select>
        </div>
        <div class="flex gap-2 pt-2">
          <button (click)="cancel()" class="flex-1 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--sidebar-hover)] transition-colors">Cancel</button>
          <button (click)="confirm()" [disabled]="!data.name.trim()" class="flex-1 py-2 rounded-lg bg-[var(--crm-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">Create</button>
        </div>
      </div>
    </div>
  `
})
export class CreateDiagramDialogComponent {
  diagramTypes = DIAGRAM_TYPES;
  constructor(
    public dialogRef: MatDialogRef<CreateDiagramDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string; type: DiagramType }
  ) {}

  confirm() {
    if (this.data.name.trim()) {
      this.dialogRef.close({ name: this.data.name.trim(), type: this.data.type });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}