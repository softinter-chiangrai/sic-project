import {
  Component, inject, signal, computed, OnInit, OnDestroy,
  Input, ViewChild, ElementRef, AfterViewInit, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

import { Pmdt06BComponent } from '../pmdt06B/pmdt06B.component';
import { Pmdt06CComponent } from '../pmdt06C/pmdt06C.component';
import { Pmdt06DComponent } from '../pmdt06D/pmdt06D.component';
import { Pmdt06FComponent } from '../pmdt06F/pmdt06F.component';
import { Pmdt06GComponent } from '../pmdt06G/pmdt06G.component';
import { DiagramService } from '../diagram.service';
import { DiagramModel, DiagramType, DIAGRAM_DEFAULTS, DIAGRAM_TYPES } from '../diagram.model';
import { DialogService } from '../../../../../core/services/dialog.service';

@Component({
  selector: 'app-pmdt06A',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DragDropModule,
    Pmdt06BComponent, Pmdt06CComponent, Pmdt06DComponent,
    Pmdt06FComponent, Pmdt06GComponent,
    MatDialogModule,
  ],
  templateUrl: './pmdt06A.component.html',
  styleUrls: ['./pmdt06A.component.css'],
})
export class Pmdt06AComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input({ required: true }) projectId!: string;

  private diagramService = inject(DiagramService);
  private dialog = inject(MatDialog);
  private dialogService = inject(DialogService);

  private destroy$ = new Subject<void>();
  private autoSave$ = new Subject<DiagramModel>();

  tabs = signal<DiagramModel[]>([]);
  activeTabId = signal<string | null>(null);
  filterType = signal<string>('all');
  diagramTypeOptions = DIAGRAM_TYPES;
  searchQuery = signal('');

  activeTab = computed(() => {
    const id = this.activeTabId();
    return this.tabs().find((t) => t.id === id) || null;
  });

  protected filteredTabs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.filterType();
    return this.tabs().filter((t) => {
      const matchQuery = !query || t.name.toLowerCase().includes(query) || t.diagramType.toLowerCase().includes(query);
      const matchType = type === 'all' || t.diagramType === type;
      return matchQuery && matchType;
    });
  });

  editorMode = signal<'visual' | 'text'>('visual');

  visualTypes = new Set(['Flowchart', 'DFD', 'ER', 'Use Case', 'Sequence']);

  isVisualType = computed(() => {
    const tab = this.activeTab();
    return tab ? this.visualTypes.has(tab.diagramType) : false;
  });

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  sidebarWidth = signal(224);
  previewWidth = signal<number>(0);
  isResizingSidebar = signal(false);
  isResizingPreview = signal(false);
  isResizing = signal(false);

  private startX = 0;
  private startSidebarWidth = 0;
  private startPreviewWidth = 0;
  private containerWidth = 0;

  private visualEditor?: Pmdt06FComponent;

  ngOnInit() {
    this.diagramService.tabs$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tabs) => {
        this.tabs.set(tabs);
        if (tabs.length > 0 && !this.activeTabId()) {
          this.activeTabId.set(tabs[0].id);
        }
      });

    this.autoSave$
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe((tab) => {
        this.diagramService.updateTab(tab).subscribe();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.containerWidth = this.containerRef.nativeElement.clientWidth;
      const initialPreview = this.containerWidth * 0.45;
      this.previewWidth.set(Math.max(300, Math.min(initialPreview, this.containerWidth - this.sidebarWidth() - 200)));
    }, 0);
  }

  selectTab(id: string) {
    this.activeTabId.set(id);
    this.diagramService.setActiveTab(id);
  }

  createTab() {
    if (!this.projectId) {
      this.dialogService.error('No project found', 'Please select a project first');
      return;
    }

    const dialogRef = this.dialog.open(CreateDiagramDialogComponent, {
      width: '450px',
      data: { name: '', type: 'Flowchart' as DiagramType },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { name, type } = result;
        const script = DIAGRAM_DEFAULTS[type as DiagramType] || '';
        this.diagramService.createTab(this.projectId!, name, type, script).subscribe({
          next: (tab) => {
            this.activeTabId.set(tab.id);
            this.dialogService.success('Diagram created', `"${name}" created`);
          },
          error: (err) => {
            const msg = err.error?.message || err.message || 'Error';
            this.dialogService.error('Create failed', msg);
          },
        });
      }
    });
  }

  closeTab(id: string, event: Event) {
    event.stopPropagation();
    this.diagramService.deleteTab(id).subscribe(() => {
      const tabs = this.tabs();
      if (this.activeTabId() === id) {
        const remaining = tabs.filter((t) => t.id !== id);
        this.activeTabId.set(remaining.length ? remaining[0].id : null);
      }
    });
  }

  updateDiagram(updated: DiagramModel) {
    this.tabs.update((tabs) => tabs.map((t) => (t.id === updated.id ? updated : t)));
    this.autoSave$.next(updated);
  }

  onTextDiagramChange(updated: DiagramModel) {
    this.updateDiagram(updated);
  }

  onGraphDataChange(data: any) {
    const tab = this.activeTab();
    if (tab) {
      const updated = { ...tab, graphData: data };
      this.updateDiagram(updated);
    }
  }

  onVisualEditorReady(editor: Pmdt06FComponent) {
    this.visualEditor = editor;
  }

  async toggleEditorMode() {
    const currentMode = this.editorMode();
    const tab = this.activeTab();

    if (currentMode === 'text' && tab) {
      // เปลี่ยนจาก Text -> Visual
      // ถ้ามี graphData อยู่แล้ว ใช้เลย
      const hasGraphData = tab.graphData && (
        typeof tab.graphData === 'string'
          ? tab.graphData.trim().length > 0
          : (tab.graphData?.xml && typeof tab.graphData.xml === 'string' && tab.graphData.xml.trim().length > 0)
      );
      if (hasGraphData) {
        // Visual Editor จะโหลด graphData อัตโนมัติผ่าน @Input
        this.editorMode.set('visual');
        return;
      }

      // ถ้าไม่มี graphData แต่มี mermaidScript ให้ถามผู้ใช้
      if (tab.mermaidScript) {
        const ok = await this.dialogService.confirm(
          'No Visual Data',
          'Do you want to generate visual diagram from current Mermaid script?'
        );
        if (ok && this.visualEditor) {
          await this.visualEditor.loadMermaidScript(tab.mermaidScript);
          this.editorMode.set('visual');
        } else {
          // ไม่อยาก generate ก็ให้อยู่ใน text mode ต่อไป
          this.editorMode.set('text');
        }
      } else {
        // ไม่มี script และไม่มี graphData
        this.editorMode.set('visual'); // ไปโหมด visual ว่าง
      }
    } else {
      // เปลี่ยนจาก Visual -> Text (ไม่มีอะไรต้องทำ)
      this.editorMode.set('text');
    }
  }

  drop(event: CdkDragDrop<DiagramModel[]>) {
    const tabs = this.tabs();
    const reorder = tabs.map((t) => ({ id: t.id, sortOrder: t.sortOrder }));
    moveItemInArray(reorder, event.previousIndex, event.currentIndex);
    this.diagramService.reorderTabs(reorder).subscribe();
  }

  async handleAiResponse(response: any) {
    if (response.action === 'create' && response.diagram) {
      if (!this.projectId) {
        this.dialogService.error('No project', 'Please select a project');
        return;
      }
      this.diagramService.createTab(
        this.projectId,
        response.diagram.name || 'AI Generated',
        response.diagram.type || 'Flowchart',
        response.diagram.script,
      ).subscribe({
        next: (tab) => {
          this.activeTabId.set(tab.id);
          this.dialogService.success('Diagram created', `"${response.diagram.name}" created`);
        },
        error: (err) => this.dialogService.error('Create failed', err.message),
      });
    } else if (response.action === 'update' && response.diagram) {
      const current = this.activeTab();
      if (current) {
        const updated = { ...current, mermaidScript: response.diagram.script, graphData: null };
        this.updateDiagram(updated);
        if (this.isVisualType()) {
          // ถ้าเป็น visual type และมี editor ให้โหลด script
          if (this.visualEditor) {
            await this.visualEditor.loadMermaidScript(response.diagram.script);
          }
          this.editorMode.set('visual');
        }
      }
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      Flowchart: 'bi-diagram-2', Sequence: 'bi-arrow-left-right', Class: 'bi-boxes',
      ER: 'bi-table', DFD: 'bi-diagram-3', State: 'bi-circle', Journey: 'bi-map',
      Mindmap: 'bi-diagram-3', Timeline: 'bi-clock-history', Requirement: 'bi-clipboard-check',
      C4: 'bi-layers', 'Git Graph': 'bi-git', Pie: 'bi-pie-chart', Gantt: 'bi-bar-chart',
    };
    return icons[type] || 'bi-file-earmark';
  }

  startResizeSidebar(event: MouseEvent) {
    event.preventDefault();
    this.isResizingSidebar.set(true);
    this.isResizing.set(true);
    this.startX = event.clientX;
    this.startSidebarWidth = this.sidebarWidth();
    document.body.style.cursor = 'col-resize';
  }

  startResizePreview(event: MouseEvent) {
    event.preventDefault();
    this.isResizingPreview.set(true);
    this.isResizing.set(true);
    this.startX = event.clientX;
    this.startPreviewWidth = this.previewWidth();
    document.body.style.cursor = 'col-resize';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizingSidebar() && !this.isResizingPreview()) return;
    const deltaX = event.clientX - this.startX;
    if (this.isResizingSidebar()) {
      const newWidth = this.startSidebarWidth + deltaX;
      this.sidebarWidth.set(Math.min(Math.max(newWidth, 200), Math.min(400, this.containerWidth - 300)));
    }
    if (this.isResizingPreview()) {
      const newWidth = this.startPreviewWidth - deltaX;
      this.previewWidth.set(Math.min(Math.max(newWidth, 250), this.containerWidth - this.sidebarWidth() - 200));
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isResizingSidebar() || this.isResizingPreview()) {
      this.isResizingSidebar.set(false);
      this.isResizingPreview.set(false);
      this.isResizing.set(false);
      document.body.style.cursor = '';
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.containerWidth = this.containerRef?.nativeElement?.clientWidth || this.containerWidth;
    const maxPreview = this.containerWidth - this.sidebarWidth() - 200;
    if (this.previewWidth() > maxPreview) {
      this.previewWidth.set(Math.max(250, maxPreview));
    }
  }
}

// ===== Dialog Component =====
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
  `,
})
export class CreateDiagramDialogComponent {
  diagramTypes = DIAGRAM_TYPES;
  constructor(
    public dialogRef: MatDialogRef<CreateDiagramDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string; type: DiagramType },
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