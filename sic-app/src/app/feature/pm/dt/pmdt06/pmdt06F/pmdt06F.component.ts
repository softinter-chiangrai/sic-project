import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

import {
  Graph, Cell, Geometry, InternalEvent, KeyHandler, UndoManager, Codec,
  Point, Rectangle, Stylesheet, constants
} from '@maxgraph/core';
import * as xmlUtils from '@maxgraph/core';

import { MaxgraphEditorService } from '../services/maxgraph-editor.service';
import { MaxgraphToolboxService } from '../services/maxgraph-toolbox.service';
import { MaxgraphExportService } from '../services/maxgraph-export.service';
import { MermaidToMaxgraphService } from '../services/mermaid-to-maxgraph.service';
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
  }

  private initGraph(): void {
    const container = this.graphContainer.nativeElement;
    const graph = new Graph(container);

    graph.setPanning(true);
    graph.setConnectable(true);
    graph.setDropEnabled(true);
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

    constants.DEFAULT_HOTSPOT = 0.3;
    constants.VERTEX_SELECTION_COLOR = '#4A90D9';
    constants.EDGE_SELECTION_COLOR = '#4A90D9';

    this.undoManager = new UndoManager();
    const undoListener = (_sender: any, evt: any) => {
      this.undoManager!.undoableEditHappened(evt.getProperty('edit'));
    };
    graph.getDataModel().addListener(InternalEvent.UNDO, undoListener);
    graph.getView().addListener(InternalEvent.UNDO, undoListener);

    this.keyHandler = new KeyHandler(graph);
    this.keyHandler.bindControlKey(90, () => { this.undo(); });
    this.keyHandler.bindControlKey(89, () => { this.redo(); });

    graph.getSelectionModel().addListener(InternalEvent.CHANGE, () => {
      const cells = graph.getSelectionCells();
      if (cells.length > 0) {
        this.editorService.setSelectedCells(cells);
      }
    });

    graph.getDataModel().addListener(InternalEvent.CHANGE, () => {
      this.zoomLevel.set(Math.round(graph.getView().getScale() * 100));
      this.change$.next();
    });

    graph.addListener(InternalEvent.CLICK, (_sender: any, evt: any) => {
      const cell = evt.getProperty('cell');
      if (cell) {
        this.editorService.setSelectedCells([cell]);
      }
    });

    graph.addListener(InternalEvent.DOUBLE_CLICK, (_sender: any, evt: any) => {
      const cell = evt.getProperty('cell');
      if (cell) {
        graph.startEditingAtCell(cell);
      }
    });

    graph.addListener(InternalEvent.MOVE_CELLS, () => {
      this.change$.next();
    });

    graph.addListener(InternalEvent.RESIZE_CELLS, () => {
      this.change$.next();
    });

    graph.addListener(InternalEvent.CONNECT_CELL, () => {
      this.change$.next();
    });

    graph.container!.style.background = 'var(--bg)';

    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      graph.container!.style.background = '#1e1e1e';
    }

    const vertexStyle = graph.getStylesheet().getDefaultVertexStyle();
    vertexStyle['fontColor'] = 'var(--text-active)';
    vertexStyle['fillColor'] = 'var(--sidebar)';
    vertexStyle['strokeColor'] = 'var(--border)';
    vertexStyle['rounded'] = true;
    vertexStyle['shadow'] = false;

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
      this.keyHandler.destroy();
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
    if (!this.graph) return;

    try {
      const graph = this.graph;
      const xml = typeof data === 'string' ? data : data.xml || data;

      graph.getDataModel().clear();

      if (xml) {
        const doc = xmlUtils.parseXml(xml);
        const codec = new Codec(doc);
        codec.decode(doc.documentElement, graph.getDataModel());
      }
    } catch (err) {
      console.error('Failed to load graph data:', err);
    }
  }

  private emitGraphData(): void {
    if (!this.graph) return;

    try {
      const codec = new Codec();
      const node = codec.encode(this.graph.getDataModel());
      const xml = xmlUtils.getXml(node);
      this.graphDataChange.emit({ xml });
    } catch (err) {
      console.error('Failed to encode graph data:', err);
    }
  }

  loadMermaidScript(script: string): void {
    if (!this.graph) return;

    try {
      const data = this.mermaidService.parse(script, this.graph);
      if (!data || data.cells.length === 0) return;

      this.graphDataChange.emit({ xml: this.editorService.toXML() });
      this.change$.next();
    } catch (err) {
      console.error('Failed to import mermaid script:', err);
    }
  }

  importMermaid(): void {
    if (!this.graph || !this.diagram) return;

    const script = this.diagram.mermaidScript;
    if (!script || !script.trim()) return;

    this.loadMermaidScript(script);
  }

  handleAiResponse(response: any): void {
    if (!this.graph) return;

    const script = response?.diagram?.script || response?.script || '';
    if (!script.trim()) return;

    this.loadMermaidScript(script);
  }

  zoomIn(): void {
    if (!this.graph) return;
    const scale = Math.min(4, this.graph.getView().getScale() + 0.1);
    this.graph.zoomTo(scale);
    this.zoomLevel.set(Math.round(scale * 100));
  }

  zoomOut(): void {
    if (!this.graph) return;
    const scale = Math.max(0.2, this.graph.getView().getScale() - 0.1);
    this.graph.zoomTo(scale);
    this.zoomLevel.set(Math.round(scale * 100));
  }

  zoomToFit(): void {
    if (!this.graph) return;
    const b = this.graph.getGraphBounds();
    if (b) {
      const vb = this.graph.getView().getBounds();
      const scale = Math.min(
        vb.width / b.width,
        vb.height / b.height,
        1
      ) * 0.9;
      this.graph.zoomTo(scale);
      this.graph.center();
    }
    this.zoomLevel.set(Math.round(this.graph.getView().getScale() * 100));
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
    if (!this.graph) return;
    const cells = this.graph.getSelectionCells();
    if (cells.length > 0) {
      this.graph.removeCells(cells);
      this.change$.next();
    }
  }

  setEdgeStyle(style: 'straight' | 'orthogonal' | 'elbow' | 'curved'): void {
    if (!this.graph) return;
    this.activeEdgeStyle.set(style);
    this.setDefaultEdgeStyle(style);
  }

  private setDefaultEdgeStyle(style: 'straight' | 'orthogonal' | 'elbow' | 'curved'): void {
    if (!this.graph) return;

    const styleMap: Record<string, string> = {
      straight: 'straight',
      orthogonal: 'orthogonalEdgeStyle',
      elbow: 'elbowEdgeStyle',
      curved: 'curvedEdgeStyle',
    };

    const edgeStyleName = styleMap[style] || 'orthogonalEdgeStyle';

    const sheet = this.graph.getStylesheet();
    const defaultEdge = sheet.getDefaultEdgeStyle();
    defaultEdge['edgeStyle'] = edgeStyleName;

    if (style === 'curved') {
      defaultEdge['curved'] = true;
    } else {
      delete defaultEdge['curved'];
    }

    const parent = this.graph.getDefaultParent();
    const allChildren = this.graph.getDataModel().getChildren(parent);
    const cells = allChildren.filter((c: Cell) => c.isEdge());

    if (cells.length > 0) {
      this.graph.batchUpdate(() => {
        for (const cell of cells) {
          if (cell.isEdge()) {
            this.graph.getDataModel().setStyle(cell, cell.getStyle());
          }
        }
      });
    }
  }

  exportPNG(): void {
    if (!this.graph) return;
    try {
      this.exportService.exportPNG(this.graph);
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  }

  exportSVG(): void {
    if (!this.graph) return;
    try {
      this.exportService.exportSVG(this.graph);
    } catch (err) {
      console.error('SVG export failed:', err);
    }
  }

  exportPDF(): void {
    if (!this.graph) return;
    try {
      this.exportService.exportPDF(this.graph);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.graph) return;

    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    }

    if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault();
      this.redo();
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const cells = this.graph.getSelectionCells();
      if (cells.length > 0) {
        event.preventDefault();
        this.deleteSelected();
      }
    }
  }
}