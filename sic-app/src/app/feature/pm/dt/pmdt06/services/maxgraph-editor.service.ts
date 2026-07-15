// src/app/feature/pm/dt/pmdt06/services/maxgraph-editor.service.ts
import { Injectable, inject, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Graph, Cell, Geometry, InternalEvent, KeyHandler, UndoManager, UndoableEdit,
  Codec, Point, Rectangle, Stylesheet
} from '@maxgraph/core';
import type { DiagramType } from '../diagram.model';
import { parseStyleString, stringifyStyleObject, type CellStyleObject } from '../services/style-utils';

export interface DiagramCellData {
  id: string;
  label: string;
  style: string;
  geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type?: 'vertex' | 'edge';
  source?: string;
  target?: string;
  edgeStyle?: string;
}

export interface GraphData {
  cells: DiagramCellData[];
  diagramType: DiagramType;
}

@Injectable({ providedIn: 'root' })
export class MaxgraphEditorService {
  private ngZone = inject(NgZone);

  private graphSubject = new BehaviorSubject<Graph | null>(null);
  private undoManager: UndoManager | null = null;
  private keyHandler: KeyHandler | null = null;
  private currentContainer: HTMLElement | null = null;
  private selectedCellsSubject = new BehaviorSubject<Cell[]>([]);

  graph$: Observable<Graph | null> = this.graphSubject.asObservable();
  selectedCells$: Observable<Cell[]> = this.selectedCellsSubject.asObservable();

  get graph(): Graph | null {
    return this.graphSubject.value;
  }

  createGraph(container: HTMLElement): Graph {
    this.currentContainer = container;

    const graph = new Graph(container);
    graph.setPanning(true);
    graph.setConnectable(true);
    graph.setDropEnabled(true);
    graph.vertexLabelsMovable = true;
    graph.edgeLabelsMovable = true;
    graph.setAllowLoops(true);
    graph.setMultigraph(false);
    graph.allowDanglingEdges = false;
    graph.cellsCloneable = true;
    graph.cellsDisconnectable = false;
    graph.autoSizeCells = true;
    graph.setHtmlLabels(true);

    this.initStylesheet(graph);

    this.undoManager = new UndoManager();
    this.setupUndoRedo(graph);
    this.setupKeyHandler(graph);

    this.graphSubject.next(graph);
    return graph;
  }

  destroy(): void {
    if (this.keyHandler) {
      this.keyHandler.onDestroy();
      this.keyHandler = null;
    }
    if (this.undoManager) {
      this.undoManager = null;
    }
    const graph = this.graph;
    if (graph) {
      graph.destroy();
      this.graphSubject.next(null);
    }
    this.currentContainer = null;
  }

  setGraph(graph: Graph): void {
    this.graphSubject.next(graph);
  }

  setSelectedCells(cells: Cell[]): void {
    this.selectedCellsSubject.next(cells);
  }

  zoomIn(): void {
    const graph = this.graph;
    if (graph) {
      graph.zoomIn();
    }
  }

  zoomOut(): void {
    const graph = this.graph;
    if (graph) {
      graph.zoomOut();
    }
  }

  zoomToFit(): void {
    const graph = this.graph;
    if (graph) {
      const b = graph.getGraphBounds();
      if (b) {
        const parent = graph.getDefaultParent();
        const children = parent.getChildren ? parent.getChildren() : [];
        const vb = graph.getView().getBounds(children);
        if (vb) {
          const scale = Math.min(
            vb.width / b.width,
            vb.height / b.height,
            1
          ) * 0.9;
          graph.zoomTo(scale);
          graph.center();
        }
      }
    }
  }

  zoomTo(scale: number): void {
    const graph = this.graph;
    if (graph) {
      graph.zoomTo(scale);
    }
  }

  undo(): void {
    if (this.undoManager) {
      this.undoManager.undo();
    }
  }

  redo(): void {
    if (this.undoManager) {
      this.undoManager.redo();
    }
  }

  getSelectedCell(): Cell | null {
    const graph = this.graph;
    if (!graph) return null;
    return graph.getSelectionCell() as Cell | null;
  }

  getSelectedCells(): Cell[] {
    const graph = this.graph;
    if (!graph) return [];
    return graph.getSelectionCells() as Cell[];
  }

  addCell(
    parent: Cell | null,
    label: string,
    style: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Cell | null {
    const graph = this.graph;
    if (!graph) return null;
    const styleObj = parseStyleString(style);
    return graph.insertVertex(parent, '', label, x, y, width, height, styleObj);
  }

  addEdge(
    parent: Cell | null,
    source: Cell | null,
    target: Cell | null,
    label: string,
    style: string
  ): Cell | null {
    const graph = this.graph;
    if (!graph) return null;
    const styleObj = parseStyleString(style);
    return graph.insertEdge(parent, '', label, source, target, styleObj);
  }

  removeCell(cell: Cell): void {
    const graph = this.graph;
    if (!graph) return;
    graph.batchUpdate(() => {
      graph.removeCells([cell]);
    });
  }

  removeCells(cells: Cell[]): void {
    const graph = this.graph;
    if (!graph) return;
    graph.batchUpdate(() => {
      graph.removeCells(cells);
    });
  }

  updateCellLabel(cell: Cell, label: string): void {
    const graph = this.graph;
    if (!graph) return;
    const model = graph.getDataModel();
    graph.batchUpdate(() => {
      model.setValue(cell, label);
    });
  }

  updateCellStyle(cell: Cell, style: CellStyleObject | string): void {
    const graph = this.graph;
    if (!graph) return;
    const model = graph.getDataModel();
    // แปลงเป็น object style
    let styleObj: CellStyleObject;
    if (typeof style === 'string') {
      styleObj = parseStyleString(style);
    } else {
      styleObj = style;
    }
    graph.batchUpdate(() => {
      model.setStyle(cell, styleObj);
    });
  }

  updateCellGeometry(
    cell: Cell,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const graph = this.graph;
    if (!graph) return;
    const model = graph.getDataModel();
    graph.batchUpdate(() => {
      const geo = cell.geometry?.clone() ?? new Geometry(x, y, width, height);
      if (cell.geometry) {
        geo.x = x;
        geo.y = y;
        geo.width = width;
        geo.height = height;
      }
      model.setGeometry(cell, geo);
    });
  }

  setEdgeStyle(cell: Cell, style: 'straight' | 'orthogonal' | 'elbow' | 'curved'): void {
    const styleMap: Record<string, string> = {
      straight: 'straight',
      orthogonal: 'orthogonalEdgeStyle',
      elbow: 'elbowEdgeStyle',
      curved: 'curvedEdgeStyle',
    };
    const edgeStyle = styleMap[style] || 'orthogonalEdgeStyle';
    // สร้าง style object ที่มีเฉพาะ edgeStyle
    const newStyle: CellStyleObject = { edgeStyle };
    this.updateCellStyle(cell, newStyle);
  }

  clearAll(): void {
    const graph = this.graph;
    if (!graph) return;
    const model = graph.getDataModel();
    const root = model.getRoot();
    if (!root) return;
    graph.batchUpdate(() => {
      // ใช้ root.getChildCount และ root.getChildAt
      const childCount = root.getChildCount ? root.getChildCount() : 0;
      const children: Cell[] = [];
      for (let i = 0; i < childCount; i++) {
        const child = root.getChildAt ? root.getChildAt(i) : null;
        if (child) children.push(child);
      }
      graph.removeCells(children);
    });
  }

  getGraphData(): GraphData {
    const graph = this.graph;
    const cells: DiagramCellData[] = [];
    if (!graph) return { cells, diagramType: 'Flowchart' };

    const model = graph.getDataModel();
    const root = model.getRoot();
    if (!root) return { cells, diagramType: 'Flowchart' };

    const childCount = root.getChildCount ? root.getChildCount() : 0;

    for (let i = 0; i < childCount; i++) {
      const cell = root.getChildAt ? root.getChildAt(i) : null;
      if (!cell) continue;
      const geo = cell.geometry;
      const styleObj = cell.style || {};
      const styleStr = stringifyStyleObject(styleObj);
      const cellData: DiagramCellData = {
        id: cell.id || '',
        label: cell.value ? String(cell.value) : '',
        style: styleStr,
        geometry: {
          x: geo?.x ?? 0,
          y: geo?.y ?? 0,
          width: geo?.width ?? 0,
          height: geo?.height ?? 0,
        },
        type: cell.isVertex() ? 'vertex' : 'edge',
      };
      if (cell.isEdge()) {
        const source = cell.source;
        const target = cell.target;
        cellData.source = source?.id ?? undefined;
        cellData.target = target?.id ?? undefined;
      }
      cells.push(cellData);
    }

    return { cells, diagramType: 'Flowchart' };
  }

  loadGraphData(data: GraphData): void {
    const graph = this.graph;
    if (!graph) return;
    this.clearAll();
    const model = graph.getDataModel();
    const cellMap = new Map<string, Cell>();

    graph.batchUpdate(() => {
      for (const cellData of data.cells) {
        const geo = new Geometry(
          cellData.geometry.x,
          cellData.geometry.y,
          cellData.geometry.width,
          cellData.geometry.height
        );
        const styleObj = parseStyleString(cellData.style);
        const cell = new Cell(cellData.label, geo, styleObj);
        cell.id = cellData.id;
        if (cellData.type === 'vertex') {
          cell.setVertex(true);
        } else {
          cell.setEdge(true);
          geo.relative = true;
        }
        model.add(cell, model.getRoot());
        cellMap.set(cell.id, cell);
      }

      for (const cellData of data.cells) {
        if (cellData.type === 'edge' && cellData.source && cellData.target) {
          const edge = cellMap.get(cellData.id);
          const source = cellMap.get(cellData.source);
          const target = cellMap.get(cellData.target);
          if (edge && source && target) {
            model.setTerminal(edge, source, true);
            model.setTerminal(edge, target, false);
          }
        }
      }
    });
  }

  toXML(): string {
    const graph = this.graph;
    if (!graph) return '';
    const codec = new Codec();
    const node = codec.encode(graph.getDataModel());
    if (!node) return '';
    const serializer = new XMLSerializer();
    return serializer.serializeToString(node);
  }

  fromXML(xml: string): void {
    const graph = this.graph;
    if (!graph) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const codec = new Codec(doc);
    const model = graph.getDataModel();
    graph.batchUpdate(() => {
      codec.decode(doc.documentElement!, model);
    });
  }

  getTemplateShapes(type: DiagramType): Partial<DiagramCellData>[] {
    const templates: Record<DiagramType, Partial<DiagramCellData>[]> = {
      Flowchart: [
        { label: 'Process', style: 'rounded=0;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
        { label: 'Decision', style: 'shape=diamond;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;fontSize=12;', geometry: { x: 0, y: 0, width: 100, height: 80 } },
        { label: 'Start/End', style: 'rounded=1;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;fontSize=12;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
        { label: 'Input/Output', style: 'shape=parallelogram;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=12;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
        { label: 'Document', style: 'shape=document;whiteSpace=wrap;fillColor=#FFF8E1;strokeColor=#F57F17;fontSize=12;', geometry: { x: 0, y: 0, width: 100, height: 60 } },
        { label: 'Database', style: 'shape=cylinder;whiteSpace=wrap;fillColor=#E0F2F1;strokeColor=#00695C;fontSize=12;', geometry: { x: 0, y: 0, width: 100, height: 60 } },
        { label: 'Subprocess', style: 'rounded=0;whiteSpace=wrap;fillColor=#FBE9E7;strokeColor=#BF360C;dashed=1;fontSize=12;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
      ],
      DFD: [
        { label: 'Process', style: 'shape=ellipse;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;', geometry: { x: 0, y: 0, width: 80, height: 80 } },
        { label: 'External Entity', style: 'rounded=0;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=12;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
        { label: 'Data Store', style: 'shape=datastore;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;fontSize=12;', geometry: { x: 0, y: 0, width: 100, height: 60 } },
        { label: 'Data Flow', style: 'whiteSpace=wrap;fontSize=11;fontColor=#1565C0;', geometry: { x: 0, y: 0, width: 80, height: 40 } },
      ],
      ER: [
        { label: 'Entity', style: 'rounded=0;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
        { label: 'Weak Entity', style: 'rounded=0;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;dashed=1;fontSize=12;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
        { label: 'Relationship', style: 'shape=diamond;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=12;', geometry: { x: 0, y: 0, width: 100, height: 80 } },
        { label: 'Attribute', style: 'shape=ellipse;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;fontSize=12;', geometry: { x: 0, y: 0, width: 80, height: 50 } },
        { label: 'Primary Key', style: 'rounded=0;whiteSpace=wrap;fillColor=#FFF8E1;strokeColor=#F57F17;fontSize=12;fontStyle=4;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
        { label: 'Foreign Key', style: 'rounded=0;whiteSpace=wrap;fillColor=#FBE9E7;strokeColor=#BF360C;dashed=1;fontSize=12;fontStyle=2;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
      ],
      'Use Case': [
        { label: 'Actor', style: 'shape=actor;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;', geometry: { x: 0, y: 0, width: 40, height: 60 } },
        { label: 'Use Case', style: 'shape=ellipse;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=12;', geometry: { x: 0, y: 0, width: 120, height: 50 } },
        { label: 'System Boundary', style: 'rounded=0;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;dashed=1;fontSize=12;', geometry: { x: 0, y: 0, width: 200, height: 150 } },
        { label: 'Include', style: 'edgeStyle=orthogonalEdgeStyle;dashed=0;fontSize=11;', geometry: { x: 0, y: 0, width: 80, height: 40 } },
        { label: 'Extend', style: 'edgeStyle=orthogonalEdgeStyle;dashed=1;fontSize=11;', geometry: { x: 0, y: 0, width: 80, height: 40 } },
      ],
      Sequence: [
        { label: 'Actor', style: 'shape=actor;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;', geometry: { x: 0, y: 0, width: 40, height: 60 } },
        { label: 'Lifeline', style: 'shape=lifeline;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;dashed=1;fontSize=11;', geometry: { x: 0, y: 0, width: 20, height: 200 } },
        { label: 'Activation', style: 'rounded=0;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=11;', geometry: { x: 0, y: 0, width: 16, height: 60 } },
        { label: 'Message', style: 'edgeStyle=orthogonalEdgeStyle;fontSize=11;', geometry: { x: 0, y: 0, width: 80, height: 40 } },
        { label: 'Return Message', style: 'edgeStyle=orthogonalEdgeStyle;dashed=1;fontSize=11;', geometry: { x: 0, y: 0, width: 80, height: 40 } },
      ],
      Class: [],
      State: [],
      Journey: [],
      Mindmap: [],
      Timeline: [],
      Requirement: [],
      C4: [],
      'Git Graph': [],
      Pie: [],
      Gantt: [],
    };
    return templates[type] ?? [];
  }

  private initStylesheet(graph: Graph): void {
    const stylesheet = graph.getStylesheet();
    const defaultVertex = stylesheet.getDefaultVertexStyle();
    if (defaultVertex) {
      defaultVertex['fontColor'] = '#333333';
      defaultVertex['fillColor'] = '#FFFFFF';
      defaultVertex['strokeColor'] = '#424242';
      defaultVertex['fontSize'] = 12;
      defaultVertex['fontStyle'] = 1;
    }
    const defaultEdge = stylesheet.getDefaultEdgeStyle();
    if (defaultEdge) {
      defaultEdge['strokeColor'] = '#424242';
      defaultEdge['fontColor'] = '#333333';
      defaultEdge['fontSize'] = 11;
      defaultEdge['edgeStyle'] = 'orthogonalEdgeStyle';
      defaultEdge['strokeWidth'] = 1.5;
    }
  }

  private setupUndoRedo(graph: Graph): void {
    const undoManager = this.undoManager!;
    const model = graph.getDataModel();
    const listener = (_sender: any, evt: any) => {
      const edit = evt.getProperty('edit') as UndoableEdit;
      if (edit) {
        undoManager.undoableEditHappened(edit);
      }
    };
    model.addListener(InternalEvent.UNDO, listener);
  }

  private setupKeyHandler(graph: Graph): void {
    const keyHandler = new KeyHandler(graph);
    this.keyHandler = keyHandler;

    keyHandler.bindControlKey(90, () => { this.undo(); });
    keyHandler.bindControlKey(89, () => { this.redo(); });
    keyHandler.bindControlKey(67, () => { /* graph.copySelection(); */ });
    keyHandler.bindControlKey(86, () => { /* graph.pasteSelection(); */ });
    keyHandler.bindControlKey(88, () => { /* graph.cutSelection(); */ });
    keyHandler.bindControlKey(65, () => { graph.selectAll(); });

    keyHandler.bindKey(46, () => {
      const cells = graph.getSelectionCells();
      if (cells.length > 0) {
        graph.removeCells(cells);
      }
    });
  }
}