// src/app/feature/pm/dt/pmdt06/services/mermaid-to-maxgraph.service.ts
import { Injectable } from '@angular/core';
import { Cell, Graph } from '@maxgraph/core';
import * as dagre from '@dagrejs/dagre';
import mermaid from 'mermaid';
import type { DiagramType } from '../diagram.model';
import { parseStyleString, stringifyStyleObject } from '../services/style-utils';
import type { GraphData } from './maxgraph-editor.service';

@Injectable({ providedIn: 'root' })
export class MermaidToMaxgraphService {
  constructor() {
    // เริ่มต้น Mermaid ครั้งเดียว (สำคัญมาก)
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
  }

  // เปลี่ยนเป็น async Promise เนื่องจาก Mermaid parse แบบ async
  async parse(script: string, graph: Graph): Promise<GraphData> {
    const model = graph.getDataModel();
    const cellMap = new Map<string, Cell>();
    const cells: GraphData['cells'] = [];

    try {
      // 1. ให้ Mermaid Parse ข้อความเป็น AST โดยตรง
      const diagram = await mermaid.mermaidAPI.getDiagramFromText(script);
      const type = this.mapDiagramType(diagram.type);

      graph.batchUpdate(() => {
        // ลบเซลล์ทั้งหมดใน default layer
        const parent = graph.getDefaultParent();
        const childCount = parent.getChildCount ? parent.getChildCount() : 0;
        const children: Cell[] = [];
        for (let i = 0; i < childCount; i++) {
          const child = parent.getChildAt ? parent.getChildAt(i) : null;
          if (child) children.push(child);
        }
        if (children.length > 0) {
          graph.removeCells(children, true);
        }

        // 2. ส่งต่อ AST (diagram.db) ไปยังฟังก์ชันแปลงข้อมูล
        switch (type) {
          case 'Flowchart':
            this.parseFlowchartFromAST(diagram.db, graph, model, cellMap, cells);
            break;
          case 'Sequence':
            this.parseSequenceFromAST(diagram.db, graph, model, cellMap, cells);
            break;
          case 'ER':
            this.parseERFromAST(diagram.db, graph, model, cellMap, cells);
            break;
          case 'Class':
            this.parseClassFromAST(diagram.db, graph, model, cellMap, cells);
            break;
          default:
            this.parseFlowchartFromAST(diagram.db, graph, model, cellMap, cells);
            break;
        }
      });

      return { cells, diagramType: type };
    } catch (error) {
      console.error('Mermaid Parse Error:', error);
      throw new Error('ไม่สามารถแปลง Mermaid script ได้ ตรวจสอบ syntax อีกครั้ง');
    }
  }

  private mapDiagramType(type: string): DiagramType {
    if (type === 'flowchart-v2' || type === 'graph' || type === 'flowchart') return 'Flowchart';
    if (type === 'sequence') return 'Sequence';
    if (type === 'er') return 'ER';
    if (type === 'classDiagram') return 'Class';
    return 'Flowchart';
  }

  // ==================== 1. FLOWCHART ====================
  private parseFlowchartFromAST(
    db: any,
    graph: Graph,
    model: any,
    cellMap: Map<string, Cell>,
    cells: GraphData['cells']
  ): void {
    const parent = graph.getDefaultParent();
    const verticesData = db.getVertices ? db.getVertices() : db.vertices;
    const edgesData = db.getEdges ? db.getEdges() : db.edges;
    const direction = db.dir || 'TD'; // TD, LR, BT, RL

    // 1. สร้าง Vertices
    if (verticesData instanceof Map) {
      verticesData.forEach((vertex: any, id: string) => {
        const label = vertex.text || id;
        const shape = vertex.type || 'rect';

        let styleStr = 'rounded=0;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;';
        if (shape === 'round' || shape === 'rounded') {
          styleStr = 'rounded=1;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;fontSize=12;';
        } else if (shape === 'diamond' || shape === 'rhombus') {
          styleStr = 'shape=diamond;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;fontSize=12;';
        }

        const styleObj = parseStyleString(styleStr);
        const w = shape === 'diamond' ? 100 : 120;
        const h = shape === 'diamond' ? 80 : 50;

        const cell = graph.insertVertex(parent, id, label, 0, 0, w, h, styleObj);
        cellMap.set(id, cell);
        cells.push({ id, label, style: stringifyStyleObject(styleObj), geometry: { x: 0, y: 0, width: w, height: h }, type: 'vertex' });
      });
    }

    // 2. สร้าง Edges
    if (Array.isArray(edgesData)) {
      edgesData.forEach((edge: any, index: number) => {
        const source = cellMap.get(edge.start);
        const target = cellMap.get(edge.end);
        if (!source || !target) return;

        const isDashed = edge.stroke === 'dashed' || edge.stroke === 'dotted';
        const edgeStyle = `edgeStyle=orthogonalEdgeStyle;${isDashed ? 'dashed=1;' : ''}fontSize=11;`;
        const styleObj = parseStyleString(edgeStyle);
        const edgeId = `edge_${edge.start}_${edge.end}_${index}`;

        const edgeCell = graph.insertEdge(parent, edgeId, edge.text || '', source, target, styleObj);
        cellMap.set(edgeId, edgeCell);
        cells.push({
          id: edgeId, label: edge.text || '', style: stringifyStyleObject(styleObj),
          geometry: { x: 0, y: 0, width: 80, height: 40 }, type: 'edge', source: edge.start, target: edge.end
        });
      });
    }

    // 3. ใช้ Dagre จัดการ Layout
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: direction, align: 'UL', nodesep: 40, ranksep: 50 });
    g.setDefaultEdgeLabel(() => ({}));

    cellMap.forEach((cell, id) => {
      // ✅ แก้ไข: เพิ่มการตรวจสอบ cell.geometry !== null
      if (cell.isVertex() && cell.geometry) {
        g.setNode(id, { width: cell.geometry.width, height: cell.geometry.height });
      }
    });
    
    cells.filter(c => c.type === 'edge').forEach(edge => {
      if (edge.source && edge.target) g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    // 4. อัปเดตตำแหน่ง x, y
    cellMap.forEach((cell, id) => {
      // ✅ แก้ไข: เพิ่มการตรวจสอบ cell.geometry !== null
      if (cell.isVertex() && cell.geometry) {
        const pos = g.node(id);
        const w = cell.geometry.width || 120;
        const h = cell.geometry.height || 50;
        const x = pos.x - w / 2;
        const y = pos.y - h / 2;
        
        cell.geometry.x = x; 
        cell.geometry.y = y;
        
        const cellData = cells.find(c => c.id === id);
        if (cellData?.geometry) { 
          cellData.geometry.x = x; 
          cellData.geometry.y = y; 
        }
      }
    });
  }

  // ==================== 2. SEQUENCE DIAGRAM ====================
  private parseSequenceFromAST(
    db: any,
    graph: Graph,
    model: any,
    cellMap: Map<string, Cell>,
    cells: GraphData['cells']
  ): void {
    const parent = graph.getDefaultParent();
    const actorsMap = db.getActors ? db.getActors() : db.actors;
    const messages = db.getMessages ? db.getMessages() : db.messages;
    
    const actorIds = actorsMap instanceof Map ? Array.from(actorsMap.keys()) : Object.keys(actorsMap || {});
    const spacingX = 160;
    const actorY = 40;
    const lifelineHeight = 60 + (messages?.length || 0) * 50 + 40;

    // 1. สร้าง Actors และ Lifelines
    actorIds.forEach((id: string, index: number) => {
      const actorData = actorsMap instanceof Map ? actorsMap.get(id) : actorsMap[id];
      const name = actorData?.name || id;
      const x = 60 + index * spacingX;

      const actorStyle = parseStyleString('shape=actor;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;');
      const actorCell = graph.insertVertex(parent, `actor_${id}`, name, x, actorY, 40, 50, actorStyle);
      cellMap.set(`actor_${id}`, actorCell);
      cells.push({ id: `actor_${id}`, label: name, style: stringifyStyleObject(actorStyle), geometry: { x, y: actorY, width: 40, height: 50 }, type: 'vertex' });

      const lfStyle = parseStyleString('shape=line;strokeWidth=2;strokeColor=#1565C0;dashed=1;');
      const lfCell = graph.insertVertex(parent, `lf_${id}`, '', x + 20, actorY + 60, 0, lifelineHeight, lfStyle);
      cellMap.set(`lf_${id}`, lfCell);
      cells.push({ id: `lf_${id}`, label: '', style: stringifyStyleObject(lfStyle), geometry: { x: x + 20, y: actorY + 60, width: 0, height: lifelineHeight }, type: 'vertex' });
    });

    // 2. สร้าง Messages (Edges)
    if (Array.isArray(messages)) {
      messages.forEach((msg: any, index: number) => {
        const source = cellMap.get(`lf_${msg.from}`);
        const target = cellMap.get(`lf_${msg.to}`);
        if (!source || !target) return;

        const isDashed = msg.type === 'Dotted' || msg.type === 'Dashed';
        const edgeStyle = `edgeStyle=orthogonalEdgeStyle;${isDashed ? 'dashed=1;' : ''}fontSize=11;endArrow=block;`;
        const styleObj = parseStyleString(edgeStyle);
        const edgeId = `msg_${index}`;

        const edgeCell = graph.insertEdge(parent, edgeId, msg.message || '', source, target, styleObj);
        cellMap.set(edgeId, edgeCell);
        cells.push({
          id: edgeId, label: msg.message || '', style: stringifyStyleObject(styleObj),
          geometry: { x: 0, y: 0, width: 80, height: 30 }, type: 'edge', source: `lf_${msg.from}`, target: `lf_${msg.to}`
        });
      });
    }
  }

  // ==================== 3. ER DIAGRAM ====================
  private parseERFromAST(
    db: any,
    graph: Graph,
    model: any,
    cellMap: Map<string, Cell>,
    cells: GraphData['cells']
  ): void {
    const parent = graph.getDefaultParent();
    const entitiesMap = db.getEntities ? db.getEntities() : db.entities;
    const relationships = db.getRelationships ? db.getRelationships() : db.relations;

    const entityIds = entitiesMap instanceof Map ? Array.from(entitiesMap.keys()) : Object.keys(entitiesMap || {});
    const startX = 50, startY = 50, spacingX = 220, spacingY = 180;

    // 1. สร้าง Entities
    entityIds.forEach((id: string, index: number) => {
      const ent = entitiesMap instanceof Map ? entitiesMap.get(id) : entitiesMap[id];
      const name = ent.name || id;
      
      let attrText = '';
      if (Array.isArray(ent.attributes)) {
        attrText = ent.attributes.map((attr: any) => {
          const type = attr.attributeType ? ` : ${attr.attributeType}` : '';
          const comment = attr.comment ? ` /* ${attr.comment} */` : '';
          return `${attr.attributeName}${type}${comment}`;
        }).join('\n');
      }
      const label = attrText ? `${name}\n────────────────\n${attrText}` : name;
      const h = Math.max(60, 40 + (ent.attributes?.length || 0) * 20);

      const x = startX + (index % 3) * spacingX;
      const y = startY + Math.floor(index / 3) * spacingY;

      const styleObj = parseStyleString('rounded=0;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;fontSize=12;align=left;spacingLeft=5;');
      const cell = graph.insertVertex(parent, `ent_${id}`, label, x, y, 180, h, styleObj);
      cellMap.set(`ent_${id}`, cell);
      cells.push({ id: `ent_${id}`, label, style: stringifyStyleObject(styleObj), geometry: { x, y, width: 180, height: h }, type: 'vertex' });
    });

    // 2. สร้าง Relationships
    if (Array.isArray(relationships)) {
      relationships.forEach((rel: any, index: number) => {
        const source = cellMap.get(`ent_${rel.entityA}`);
        const target = cellMap.get(`ent_${rel.entityB}`);
        if (!source || !target) return;

        const cardMap: Record<string, string> = { 'ZERO_OR_ONE': '0..1', 'ONE_OR_MORE': '1..*', 'ZERO_OR_MORE': '0..*', 'ONLY_ONE': '1' };
        const fromCard = cardMap[rel.roleA] || rel.roleA || '';
        const toCard = cardMap[rel.roleB] || rel.roleB || '';
        const edgeLabel = rel.name ? `${fromCard} -- ${rel.name} -- ${toCard}` : `${fromCard} -- ${toCard}`;

        const styleObj = parseStyleString('edgeStyle=orthogonalEdgeStyle;fontSize=11;fontColor=#333333;');
        const edgeId = `rel_${index}`;
        const edgeCell = graph.insertEdge(parent, edgeId, edgeLabel, source, target, styleObj);
        cellMap.set(edgeId, edgeCell);
        cells.push({
          id: edgeId, label: edgeLabel, style: stringifyStyleObject(styleObj),
          geometry: { x: 0, y: 0, width: 80, height: 30 }, type: 'edge', source: `ent_${rel.entityA}`, target: `ent_${rel.entityB}`
        });
      });
    }
  }

  // ==================== 4. CLASS DIAGRAM ====================
  private parseClassFromAST(
    db: any,
    graph: Graph,
    model: any,
    cellMap: Map<string, Cell>,
    cells: GraphData['cells']
  ): void {
    const parent = graph.getDefaultParent();
    const classesMap = db.getClasses ? db.getClasses() : db.classes;
    const relations = db.getRelations ? db.getRelations() : db.relations;

    const classIds = classesMap instanceof Map ? Array.from(classesMap.keys()) : Object.keys(classesMap || {});
    const startX = 50, startY = 50, spacingX = 240, spacingY = 200;

    // 1. สร้าง Classes
    classIds.forEach((id: string, index: number) => {
      const cls = classesMap instanceof Map ? classesMap.get(id) : classesMap[id];
      const name = cls.label || cls.id || id;
      
      let membersText = '';
      if (Array.isArray(cls.members)) {
        membersText = cls.members.map((m: any) => {
          const vis = m.visibility === 'PUBLIC' ? '+' : m.visibility === 'PRIVATE' ? '-' : m.visibility === 'PROTECTED' ? '#' : '~';
          if (m.type === 'method') {
            return `${vis} ${m.name}(${m.parameters || ''})${m.returnType ? `: ${m.returnType}` : ''}`;
          } else {
            return `${vis} ${m.name}${m.type ? `: ${m.type}` : ''}`;
          }
        }).join('\n');
      }

      const divider = '─'.repeat(24);
      const label = membersText ? `${name}\n${divider}\n${membersText}` : name;
      const h = Math.max(60, 40 + (cls.members?.length || 0) * 20);

      const x = startX + (index % 3) * spacingX;
      const y = startY + Math.floor(index / 3) * spacingY;

      const styleObj = parseStyleString('rounded=0;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#7B1FA2;fontSize=12;align=left;spacingLeft=5;');
      const cell = graph.insertVertex(parent, `cls_${id}`, label, x, y, 200, h, styleObj);
      cellMap.set(`cls_${id}`, cell);
      cells.push({ id: `cls_${id}`, label, style: stringifyStyleObject(styleObj), geometry: { x, y, width: 200, height: h }, type: 'vertex' });
    });

    // 2. สร้าง Relations
    if (Array.isArray(relations)) {
      relations.forEach((rel: any, index: number) => {
        const source = cellMap.get(`cls_${rel.id1}`);
        const target = cellMap.get(`cls_${rel.id2}`);
        if (!source || !target) return;

        let edgeStyle = 'edgeStyle=orthogonalEdgeStyle;fontSize=11;';
        const relType = rel.relation?.toUpperCase() || '';

        if (relType.includes('EXTENSION') || relType.includes('INHERITANCE')) {
          edgeStyle += 'endArrow=block;endFill=1;';
        } else if (relType.includes('COMPOSITION')) {
          edgeStyle += 'endArrow=diamond;endFill=1;';
        } else if (relType.includes('AGGREGATION')) {
          edgeStyle += 'endArrow=diamond;endFill=0;';
        } else {
          edgeStyle += 'endArrow=block;endFill=0;'; // Association
        }

        if (relType.includes('DEPENDENCY') || relType.includes('REALIZATION')) {
          edgeStyle += 'dashed=1;';
        }

        const styleObj = parseStyleString(edgeStyle);
        const edgeId = `crel_${index}`;
        const edgeCell = graph.insertEdge(parent, edgeId, rel.name || '', source, target, styleObj);
        cellMap.set(edgeId, edgeCell);
        cells.push({
          id: edgeId, label: rel.name || '', style: stringifyStyleObject(styleObj),
          geometry: { x: 0, y: 0, width: 80, height: 30 }, type: 'edge', source: `cls_${rel.id1}`, target: `cls_${rel.id2}`
        });
      });
    }
  }
}