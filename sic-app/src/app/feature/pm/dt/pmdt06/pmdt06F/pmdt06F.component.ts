// src/app/feature/pm/dt/pmdt06/pmdt06F/pmdt06F.component.ts
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { Cell, Codec, Graph, InternalEvent, KeyHandler, UndoManager } from '@maxgraph/core';

import { MaxgraphEditorService } from '../services/maxgraph-editor.service';
import { MaxgraphExportService } from '../services/maxgraph-export.service';
import { MaxgraphToolboxService } from '../services/maxgraph-toolbox.service';
import { MermaidToMaxgraphService } from '../services/mermaid-to-maxgraph.service';
import { parseStyleString } from '../services/style-utils';

import type { DiagramModel } from '../diagram.model';

interface EdgeStyleOption {
  value: 'straight' | 'orthogonal' | 'elbow' | 'curved';
  label: string;
}

@Component({
  selector: 'app-pmdt06f',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pmdt06F.component.html',
  styleUrls: ['./pmdt06F.component.css'],
})
export class Pmdt06FComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) diagram: DiagramModel | null = null;
  @Input() graphData: any = null;

  @Output() graphDataChange = new EventEmitter<any>();
  @Output() editorReady = new EventEmitter<Graph>();

  @ViewChild('graphContainer') graphContainer!: ElementRef<HTMLDivElement>;

  private editorService = inject(MaxgraphEditorService);
  private toolboxService = inject(MaxgraphToolboxService);
  private exportService = inject(MaxgraphExportService);
  private mermaidService = inject(MermaidToMaxgraphService);

  private destroy$ = new Subject<void>();
  private change$ = new Subject<void>();

  graph: Graph | null = null;
  keyHandler: KeyHandler | null = null;
  undoManager: UndoManager | null = null;

  // Event listeners สำหรับ Drag & Drop
  private dragOverHandler: ((e: DragEvent) => void) | null = null;
  private dropHandler: ((e: DragEvent) => void) | null = null;

  zoomLevel = signal(100);
  activeEdgeStyle = signal<'straight' | 'orthogonal' | 'elbow' | 'curved'>('orthogonal');
  showExport = signal(false);

  edgeStyles: EdgeStyleOption[] = [
    { value: 'straight', label: 'Straight' },
    { value: 'orthogonal', label: 'Orthogonal' },
    { value: 'elbow', label: 'Elbow' },
    { value: 'curved', label: 'Curved' },
  ];

  ngAfterViewInit(): void {
    this.change$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
      this.emitGraphData();
    });

    this.initGraph();

    // ========== ผูก Drag & Drop Events ==========
    const containerEl = this.graphContainer.nativeElement;
    this.dragOverHandler = this.onDragOver.bind(this);
    this.dropHandler = this.onDrop.bind(this);
    containerEl.addEventListener('dragover', this.dragOverHandler);
    containerEl.addEventListener('drop', this.dropHandler);

    // ========== ปรับพื้นหลังให้มองเห็น ==========
    if (this.graph) {
      const isDark = document.documentElement.classList.contains('dark');
      this.graph.container!.style.background = isDark ? '#2d2d2d' : '#f5f5f5';
      this.graph.container!.style.backgroundImage = `
        radial-gradient(circle, var(--border) 1px, transparent 1px)
      `;
      this.graph.container!.style.backgroundSize = '20px 20px';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graphData'] && !changes['graphData'].firstChange && this.graph) {
      const current = changes['graphData'].currentValue;
      if (current != null) {
        this.loadGraphData(current);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.change$.complete();
    this.cleanupGraph();

    // ลบ Drag & Drop listeners
    if (this.dragOverHandler) {
      this.graphContainer?.nativeElement.removeEventListener('dragover', this.dragOverHandler);
    }
    if (this.dropHandler) {
      this.graphContainer?.nativeElement.removeEventListener('drop', this.dropHandler);
    }
  }

  private initGraph(): void {
    const container = this.graphContainer.nativeElement;
    const graph = new Graph(container);

    // ตั้งค่าการทำงานพื้นฐาน
    graph.setPanning(true);
    graph.setConnectable(true);
    graph.setDropEnabled(true);
    graph.setEnabled(true);                     // ✅ เปิดใช้งานกราฟ (default true)
    graph.allowDanglingEdges = false;
    graph.setMultigraph(false);
    graph.cellsDisconnectable = true;
    graph.cellsDeletable = true;
    graph.cellsMovable = true;
    graph.cellsResizable = true;
    graph.cellsSelectable = true;
    graph.cellsEditable = true;
    graph.cellsBendable = true;
    graph.setHtmlLabels(true);
    graph.vertexLabelsMovable = true;
    graph.edgeLabelsMovable = true;

    // ตั้งค่า default edge style
    const sheet = graph.getStylesheet();
    const defaultEdge = sheet.getDefaultEdgeStyle();
    defaultEdge['edgeStyle'] = 'orthogonalEdgeStyle';

    // UndoManager
    this.undoManager = new UndoManager();
    const undoListener = (_sender: any, evt: any) => {
      this.undoManager!.undoableEditHappened(evt.getProperty('edit'));
    };
    graph.getDataModel().addListener(InternalEvent.UNDO, undoListener);
    graph.getView().addListener(InternalEvent.UNDO, undoListener);

    // Keyboard shortcuts
    this.keyHandler = new KeyHandler(graph);
    this.keyHandler.bindControlKey(90, () => this.undo());
    this.keyHandler.bindControlKey(89, () => this.redo());

    // Selection change
    graph.getSelectionModel().addListener(InternalEvent.CHANGE, () => {
      const cells = graph.getSelectionCells();
      if (cells.length > 0) {
        this.editorService.setSelectedCells(cells);
      }
    });

    // Data model change -> emit update
    graph.getDataModel().addListener(InternalEvent.CHANGE, () => {
      this.zoomLevel.set(Math.round(graph.getView().getScale() * 100));
      this.change$.next();
    });

    // Click -> select
    graph.addListener(InternalEvent.CLICK, (_sender: any, evt: any) => {
      const cell = evt.getProperty('cell');
      if (cell) {
        this.editorService.setSelectedCells([cell]);
      }
    });

    // Double click -> edit label
    graph.addListener(InternalEvent.DOUBLE_CLICK, (_sender: any, evt: any) => {
      const cell = evt.getProperty('cell');
      if (cell) {
        graph.startEditingAtCell(cell);
      }
    });

    // Move/Resize/Connect -> emit change
    graph.addListener(InternalEvent.MOVE_CELLS, () => this.change$.next());
    graph.addListener(InternalEvent.RESIZE_CELLS, () => this.change$.next());
    graph.addListener(InternalEvent.CONNECT_CELL, () => this.change$.next());

    // ตั้งค่าพื้นหลังเริ่มต้น (จะปรับอีกครั้งใน ngAfterViewInit)
    graph.container!.style.background = '#f5f5f5';
    graph.container!.style.backgroundImage = `
      radial-gradient(circle, #d0d0d0 1px, transparent 1px)
    `;
    graph.container!.style.backgroundSize = '20px 20px';

    // Default vertex style
    const vertexStyle = graph.getStylesheet().getDefaultVertexStyle();
    vertexStyle['fontColor'] = 'var(--text-active)';
    vertexStyle['fillColor'] = 'var(--sidebar)';
    vertexStyle['strokeColor'] = 'var(--border)';
    vertexStyle['rounded'] = true;
    vertexStyle['shadow'] = false;

    // Default edge style
    const edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
    edgeStyle['strokeColor'] = 'var(--text-muted)';
    edgeStyle['fontColor'] = 'var(--text-muted)';
    edgeStyle['endArrow'] = 'classic';
    edgeStyle['rounded'] = true;
    edgeStyle['edgeStyle'] = 'orthogonalEdgeStyle';

    this.graph = graph;

    if (this.graphData) {
      this.loadGraphData(this.graphData);
    }

    this.editorReady.emit(graph);
    this.editorService.setGraph(graph);

    graph.batchUpdate(() => {
      this.setDefaultEdgeStyle('orthogonal');
    });
  }

  private cleanupGraph(): void {
    if (this.keyHandler) {
      this.keyHandler.onDestroy();
      this.keyHandler = null;
    }
    if (this.undoManager) {
      this.undoManager.destroy();
      this.undoManager = null;
    }
    if (this.graph) {
      this.graph.destroy();
      this.graph = null;
    }
  }

  private loadGraphData(data: any): void {
    const graph = this.graph;
    if (!graph) return;

    try {
      const xml = typeof data === 'string' ? data : data.xml || data;

      graph.getDataModel().clear();

      if (xml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        const codec = new Codec(doc);
        codec.decode(doc.documentElement, graph.getDataModel());
      }
    } catch (err) {
      console.error('Failed to load graph data:', err);
    }
  }

  private emitGraphData(): void {
    const graph = this.graph;
    if (!graph) return;

    try {
      const codec = new Codec();
      const node = codec.encode(graph.getDataModel());
      if (node) {
        const serializer = new XMLSerializer();
        const xml = serializer.serializeToString(node);
        this.graphDataChange.emit({ xml });
      }
    } catch (err) {
      console.error('Failed to encode graph data:', err);
    }
  }

  loadMermaidScript(script: string): void {
    const graph = this.graph;
    if (!graph) return;

    try {
      const data = this.mermaidService.parse(script, graph);
      if (!data || data.cells.length === 0) return;

      this.editorService.loadGraphData(data);
      this.graphDataChange.emit({ xml: this.editorService.toXML() });
      this.change$.next();
    } catch (err) {
      console.error('Failed to import mermaid script:', err);
    }
  }

  importMermaid(): void {
    const graph = this.graph;
    if (!graph || !this.diagram) return;

    const script = this.diagram.mermaidScript;
    if (!script || !script.trim()) return;

    this.loadMermaidScript(script);
  }

  handleAiResponse(response: any): void {
    const graph = this.graph;
    if (!graph) return;

    const script = response?.diagram?.script || response?.script || '';
    if (!script.trim()) return;

    this.loadMermaidScript(script);
  }

  // ========== Drag & Drop Methods ==========
  private onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  private onDrop(event: DragEvent): void {
    event.preventDefault();
    const graph = this.graph;
    if (!graph) return;

    const rawData = event.dataTransfer?.getData('application/x-maxgraph-shape');
    if (!rawData) return;

    try {
      const shape = JSON.parse(rawData);
      const containerRect = this.graphContainer.nativeElement.getBoundingClientRect();
      const view = graph.getView();
      const scale = view.getScale();
      const translate = view.getTranslate();

      // คำนวณพิกัดในระบบของ Graph
      const x = (event.clientX - containerRect.left) / scale - translate.x;
      const y = (event.clientY - containerRect.top) / scale - translate.y;

      const parent = graph.getDefaultParent();
      const styleObj = parseStyleString(shape.style);

      graph.batchUpdate(() => {
        graph.insertVertex(
          parent,
          null,
          shape.name,
          x - shape.width / 2,
          y - shape.height / 2,
          shape.width,
          shape.height,
          styleObj
        );
      });

      this.change$.next();

    } catch (err) {
      console.error('Drop failed:', err);
    }
  }

  // ========== Zoom & Tools ==========
  zoomIn(): void {
    const graph = this.graph;
    if (!graph) return;
    const scale = Math.min(4, graph.getView().getScale() + 0.1);
    graph.zoomTo(scale);
    this.zoomLevel.set(Math.round(scale * 100));
  }

  zoomOut(): void {
    const graph = this.graph;
    if (!graph) return;
    const scale = Math.max(0.2, graph.getView().getScale() - 0.1);
    graph.zoomTo(scale);
    this.zoomLevel.set(Math.round(scale * 100));
  }

  zoomToFit(): void {
    const graph = this.graph;
    if (!graph) return;
    const b = graph.getGraphBounds();
    if (b) {
      const parent = graph.getDefaultParent();
      const children = parent.getChildren ? parent.getChildren() : [];
      const vb = graph.getView().getBounds(children);
      if (vb) {
        const scale = Math.min(vb.width / b.width, vb.height / b.height, 1) * 0.9;
        graph.zoomTo(scale);
        graph.center();
      }
    }
    this.zoomLevel.set(Math.round(graph.getView().getScale() * 100));
  }

  undo(): void {
    if (this.undoManager && this.undoManager.canUndo()) {
      this.undoManager.undo();
      this.change$.next();
    }
  }

  redo(): void {
    if (this.undoManager && this.undoManager.canRedo()) {
      this.undoManager.redo();
      this.change$.next();
    }
  }

  deleteSelected(): void {
    const graph = this.graph;
    if (!graph) return;
    const cells = graph.getSelectionCells();
    if (cells.length > 0) {
      graph.removeCells(cells);
      this.change$.next();
    }
  }

  setEdgeStyle(style: 'straight' | 'orthogonal' | 'elbow' | 'curved'): void {
    const graph = this.graph;
    if (!graph) return;
    this.activeEdgeStyle.set(style);
    this.setDefaultEdgeStyle(style);
  }

  private setDefaultEdgeStyle(style: 'straight' | 'orthogonal' | 'elbow' | 'curved'): void {
    const graph = this.graph;
    if (!graph) return;

    const styleMap: Record<string, string> = {
      straight: 'straight',
      orthogonal: 'orthogonalEdgeStyle',
      elbow: 'elbowEdgeStyle',
      curved: 'curvedEdgeStyle',
    };

    const edgeStyleName = styleMap[style] || 'orthogonalEdgeStyle';

    const sheet = graph.getStylesheet();
    const defaultEdge = sheet.getDefaultEdgeStyle();
    defaultEdge['edgeStyle'] = edgeStyleName;

    if (style === 'curved') {
      defaultEdge['curved'] = true;
    } else {
      delete defaultEdge['curved'];
    }

    const parent = graph.getDefaultParent();
    const allChildren = parent.getChildren ? parent.getChildren() : [];
    const cells = allChildren.filter((c: Cell) => c.isEdge());

    if (cells.length > 0) {
      graph.batchUpdate(() => {
        for (const cell of cells) {
          if (cell.isEdge()) {
            const currentStyle = cell.style || {};
            const newStyle = { ...currentStyle, edgeStyle: edgeStyleName };
            if (style === 'curved') {
              newStyle['curved'] = true;
            } else {
              delete newStyle['curved'];
            }
            graph.getDataModel().setStyle(cell, newStyle);
          }
        }
      });
    }
  }

  exportPNG(): void {
    const graph = this.graph;
    if (!graph) return;
    try {
      this.exportService.exportPNG(graph);
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  }

  exportSVG(): void {
    const graph = this.graph;
    if (!graph) return;
    try {
      this.exportService.exportSVG(graph);
    } catch (err) {
      console.error('SVG export failed:', err);
    }
  }

  exportPDF(): void {
    const graph = this.graph;
    if (!graph) return;
    try {
      this.exportService.exportPDF(graph);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const graph = this.graph;
    if (!graph) return;

    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    }

    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'y' || (event.key === 'z' && event.shiftKey))
    ) {
      event.preventDefault();
      this.redo();
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      const cells = graph.getSelectionCells();
      if (cells.length > 0) {
        event.preventDefault();
        this.deleteSelected();
      }
    }
  }
}