// src/app/feature/pm/dt/pmdt06/services/mermaid-to-maxgraph.service.ts
import { Injectable } from '@angular/core';
import { Graph, Cell } from '@maxgraph/core';
import type { DiagramType } from '../diagram.model';
import type { GraphData } from './maxgraph-editor.service';
import { parseStyleString, stringifyStyleObject } from '../services/style-utils';

interface MermaidNode {
  id: string;
  label: string;
  shape: string;
}

interface MermaidEdge {
  from: string;
  to: string;
  label: string;
  style: string;
}

@Injectable({ providedIn: 'root' })
export class MermaidToMaxgraphService {

  parse(script: string, graph: Graph): GraphData {
    const type = this.detectType(script);
    const model = graph.getDataModel();
    const cellMap = new Map<string, Cell>();
    const cells: GraphData['cells'] = [];

    graph.batchUpdate(() => {
      // ลบเฉพาะ vertex/edge ใน default layer – ไม่ลบ layer ตัวเอง
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

      switch (type) {
        case 'Flowchart':
          this.parseFlowchart(script, graph, model, cellMap, cells);
          break;
        case 'Sequence':
          this.parseSequence(script, graph, model, cellMap, cells);
          break;
        case 'ER':
          this.parseER(script, graph, model, cellMap, cells);
          break;
        case 'Class':
          this.parseClass(script, graph, model, cellMap, cells);
          break;
        default:
          this.parseFlowchart(script, graph, model, cellMap, cells);
          break;
      }
    });

    return { cells, diagramType: type };
  }

  private detectType(script: string): DiagramType {
    const firstLine = script.trim().split('\n')[0]?.trim() ?? '';
    if (/^graph\s+(TD|LR|BT|RL)/i.test(firstLine)) return 'Flowchart';
    if (/^sequenceDiagram/i.test(firstLine)) return 'Sequence';
    if (/^erDiagram/i.test(firstLine)) return 'ER';
    if (/^classDiagram/i.test(firstLine)) return 'Class';
    if (/^flowchart\s+(TD|LR|BT|RL)/i.test(firstLine)) return 'Flowchart';
    return 'Flowchart';
  }

  private parseFlowchart(
    script: string,
    graph: Graph,
    model: any, // เปลี่ยนจาก GraphDataModel
    cellMap: Map<string, Cell>,
    cells: GraphData['cells']
  ): void {
    const lines = script.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const nodes = new Map<string, MermaidNode>();
    const edges: MermaidEdge[] = [];
    const direction = script.includes('LR') ? 'LR' : 'TD';
    const parent = graph.getDefaultParent();

    for (const line of lines) {
      if (/^(graph|flowchart)\s+(TD|LR|BT|RL)/i.test(line)) continue;

      const nodeMatch = line.match(/^(\w[\w\d]*)\s*\[([^\]]*)\]/);
      if (nodeMatch) { nodes.set(nodeMatch[1], { id: nodeMatch[1], label: nodeMatch[2], shape: 'rectangle' }); continue; }

      const nodeRoundMatch = line.match(/^(\w[\w\d]*)\s*\(([^)]*)\)/);
      if (nodeRoundMatch) { nodes.set(nodeRoundMatch[1], { id: nodeRoundMatch[1], label: nodeRoundMatch[2], shape: 'rounded' }); continue; }

      const nodeDiamondMatch = line.match(/^(\w[\w\d]*)\s*\{([^}]*)\}/);
      if (nodeDiamondMatch) { nodes.set(nodeDiamondMatch[1], { id: nodeDiamondMatch[1], label: nodeDiamondMatch[2], shape: 'diamond' }); continue; }

      const edgeWithLabel = line.match(/^(\w[\w\d]*)\s*(-->|==>|-.->|==>)\s*\|([^|]*)\|\s*(\w[\w\d]*)/);
      if (edgeWithLabel) {
        if (!nodes.has(edgeWithLabel[1])) nodes.set(edgeWithLabel[1], { id: edgeWithLabel[1], label: edgeWithLabel[1], shape: 'rectangle' });
        if (!nodes.has(edgeWithLabel[4])) nodes.set(edgeWithLabel[4], { id: edgeWithLabel[4], label: edgeWithLabel[4], shape: 'rectangle' });
        edges.push({ from: edgeWithLabel[1], to: edgeWithLabel[4], label: edgeWithLabel[3], style: 'orthogonalEdgeStyle' });
        continue;
      }

      const edgeSimple = line.match(/^(\w[\w\d]*)\s*(-->|==>|-.->)\s*(\w[\w\d]*)/);
      if (edgeSimple) {
        if (!nodes.has(edgeSimple[1])) nodes.set(edgeSimple[1], { id: edgeSimple[1], label: edgeSimple[1], shape: 'rectangle' });
        if (!nodes.has(edgeSimple[3])) nodes.set(edgeSimple[3], { id: edgeSimple[3], label: edgeSimple[3], shape: 'rectangle' });
        edges.push({ from: edgeSimple[1], to: edgeSimple[3], label: '', style: 'orthogonalEdgeStyle' });
        continue;
      }

      const edgeWithLabelArrow = line.match(/^(\w[\w\d]*)\s*(-+>|=>)\s*\|\s*([^|]*)\s*\|\s*(\w[\w\d]*)/);
      if (edgeWithLabelArrow) {
        if (!nodes.has(edgeWithLabelArrow[1])) nodes.set(edgeWithLabelArrow[1], { id: edgeWithLabelArrow[1], label: edgeWithLabelArrow[1], shape: 'rectangle' });
        if (!nodes.has(edgeWithLabelArrow[4])) nodes.set(edgeWithLabelArrow[4], { id: edgeWithLabelArrow[4], label: edgeWithLabelArrow[4], shape: 'rectangle' });
        edges.push({ from: edgeWithLabelArrow[1], to: edgeWithLabelArrow[4], label: edgeWithLabelArrow[3], style: 'orthogonalEdgeStyle' });
      }
    }

    const nodeArray = Array.from(nodes.values());
    const spacingX = 180;
    const spacingY = 100;
    const startX = 50;
    const startY = 50;

    for (let i = 0; i < nodeArray.length; i++) {
      const node = nodeArray[i];
      let style: string;
      let w = 120;
      let h = 50;

      switch (node.shape) {
        case 'rounded':
          style = 'rounded=1;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;fontSize=12;';
          break;
        case 'diamond':
          style = 'shape=diamond;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;fontSize=12;';
          w = 100; h = 80;
          break;
        default:
          style = 'rounded=0;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;';
          break;
      }

      const x = direction === 'LR' ? startX + i * spacingX : startX + (i % 4) * spacingX;
      const y = direction === 'LR' ? startY : startY + Math.floor(i / 4) * spacingY;

      const styleObj = parseStyleString(style);
      const cell = graph.insertVertex(parent, node.id, node.label, x, y, w, h, styleObj);
      cellMap.set(node.id, cell);
      cells.push({ id: node.id, label: node.label, style: stringifyStyleObject(styleObj), geometry: { x, y, width: w, height: h }, type: 'vertex' });
    }

    for (const edge of edges) {
      const source = cellMap.get(edge.from);
      const target = cellMap.get(edge.to);
      if (!source || !target) continue;
      const edgeStyle = `edgeStyle=${edge.style};fontSize=11;`;
      const styleObj = parseStyleString(edgeStyle);
      const edgeId = `edge_${edge.from}_${edge.to}_${Date.now()}_${Math.random()}`;
      const edgeCell = graph.insertEdge(parent, edgeId, edge.label, source, target, styleObj);
      cellMap.set(edgeId, edgeCell);
      cells.push({ id: edgeId, label: edge.label, style: stringifyStyleObject(styleObj), geometry: { x: 0, y: 0, width: 80, height: 40 }, type: 'edge', source: edge.from, target: edge.to });
    }
  }

  private parseSequence(
    script: string,
    graph: Graph,
    model: any, // เปลี่ยนจาก GraphDataModel
    cellMap: Map<string, Cell>,
    cells: GraphData['cells']
  ): void {
    const lines = script.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const participants: string[] = [];
    const messages: { from: string; to: string; label: string; dashed: boolean }[] = [];
    let seqStarted = false;
    const parent = graph.getDefaultParent();

    for (const line of lines) {
      if (/^sequenceDiagram/i.test(line)) { seqStarted = true; continue; }
      if (!seqStarted) continue;

      const participantMatch = line.match(/^participant\s+(\w[\w\d]*)/i);
      if (participantMatch) { participants.push(participantMatch[1]); continue; }

      const actorMatch = line.match(/^actor\s+(\w[\w\d]*)/i);
      if (actorMatch) { participants.push(actorMatch[1]); continue; }

      const msgSolid = line.match(/^(\w[\w\d]*)\s*->>\s*(\w[\w\d]*)\s*:\s*(.+)/);
      if (msgSolid) {
        if (!participants.includes(msgSolid[1])) participants.push(msgSolid[1]);
        if (!participants.includes(msgSolid[2])) participants.push(msgSolid[2]);
        messages.push({ from: msgSolid[1], to: msgSolid[2], label: msgSolid[3], dashed: false });
        continue;
      }

      const msgDashed = line.match(/^(\w[\w\d]*)\s*-->>\s*(\w[\w\d]*)\s*:\s*(.+)/);
      if (msgDashed) {
        if (!participants.includes(msgDashed[1])) participants.push(msgDashed[1]);
        if (!participants.includes(msgDashed[2])) participants.push(msgDashed[2]);
        messages.push({ from: msgDashed[1], to: msgDashed[2], label: msgDashed[3], dashed: true });
        continue;
      }

      const msgNoLabel = line.match(/^(\w[\w\d]*)\s*(->>|-->>)\s*(\w[\w\d]*)/);
      if (msgNoLabel) {
        if (!participants.includes(msgNoLabel[1])) participants.push(msgNoLabel[1]);
        if (!participants.includes(msgNoLabel[3])) participants.push(msgNoLabel[3]);
        messages.push({ from: msgNoLabel[1], to: msgNoLabel[3], label: '', dashed: msgNoLabel[2].startsWith('--') });
      }
    }

    const actorX = 50;
    const spacingX = 150;
    const actorY = 50;
    const lifelineHeight = 50 + messages.length * 40 + 50;

    for (let i = 0; i < participants.length; i++) {
      const x = actorX + i * spacingX;

      const actorStyleObj = parseStyleString('shape=actor;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;');
      const actorCell = graph.insertVertex(parent, `actor_${participants[i]}`, participants[i], x, actorY, 40, 60, actorStyleObj);
      cellMap.set(`actor_${participants[i]}`, actorCell);
      cells.push({ id: `actor_${participants[i]}`, label: participants[i], style: stringifyStyleObject(actorStyleObj), geometry: { x, y: actorY, width: 40, height: 60 }, type: 'vertex' });

      const lfStyleObj = parseStyleString('shape=lifeline;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;dashed=1;fontSize=11;');
      const lifelineCell = graph.insertVertex(parent, `lifeline_${participants[i]}`, '', x + 10, actorY + 70, 20, lifelineHeight, lfStyleObj);
      cellMap.set(`lifeline_${participants[i]}`, lifelineCell);
      cells.push({ id: `lifeline_${participants[i]}`, label: '', style: stringifyStyleObject(lfStyleObj), geometry: { x: x + 10, y: actorY + 70, width: 20, height: lifelineHeight }, type: 'vertex' });
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const source = cellMap.get(`actor_${msg.from}`);
      const target = cellMap.get(`actor_${msg.to}`);
      if (!source || !target) continue;
      const edgeStyle = msg.dashed ? 'edgeStyle=orthogonalEdgeStyle;dashed=1;fontSize=11;' : 'edgeStyle=orthogonalEdgeStyle;fontSize=11;';
      const styleObj = parseStyleString(edgeStyle);
      const edgeId = `msg_${msg.from}_${msg.to}_${i}`;
      const edgeCell = graph.insertEdge(parent, edgeId, msg.label, source, target, styleObj);
      cellMap.set(edgeId, edgeCell);
      cells.push({ id: edgeId, label: msg.label, style: stringifyStyleObject(styleObj), geometry: { x: 0, y: 0, width: 80, height: 40 }, type: 'edge', source: `actor_${msg.from}`, target: `actor_${msg.to}` });
    }
  }

  private parseER(
    script: string,
    graph: Graph,
    model: any, // เปลี่ยนจาก GraphDataModel
    cellMap: Map<string, Cell>,
    cells: GraphData['cells']
  ): void {
    const lines = script.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const entities: { name: string; attrs: string[] }[] = [];
    const relations: { from: string; to: string; fromCard: string; toCard: string; label: string }[] = [];
    let erStarted = false;
    let currentEntity: string | null = null;
    let currentAttrs: string[] = [];
    const parent = graph.getDefaultParent();

    for (const line of lines) {
      if (/^erDiagram/i.test(line)) { erStarted = true; continue; }
      if (!erStarted) continue;

      if (line.includes('{')) {
        const match = line.match(/^(\w[\w\d_]*)\s*\{/);
        if (match) {
          if (currentEntity) entities.push({ name: currentEntity, attrs: currentAttrs });
          currentEntity = match[1];
          currentAttrs = [];
        }
        continue;
      }

      if (line === '}') {
        if (currentEntity) { entities.push({ name: currentEntity, attrs: currentAttrs }); currentEntity = null; currentAttrs = []; }
        continue;
      }

      if (currentEntity && !line.includes('||') && !line.includes('}|')) {
        const attrMatch = line.match(/^\s*(\w[\w\d\s]*)/);
        if (attrMatch) currentAttrs.push(attrMatch[1].trim());
        continue;
      }

      const relMatch = line.match(/^(\w[\w\d_]*)\s+(\|\||[|}]o|\|[|}]|o[{|]|\{o|o\|)\s*--\s*(o\{|\|\||o\|)\s+(\w[\w\d_]*)\s*:\s*(.+)/);
      if (relMatch) {
        const cardMap: Record<string, string> = { '||': '1', '|o': '0..1', 'o|': '0..1', 'o{': '0..*', '|{': '1..*', '}o': '0..*', '{o': '0..*' };
        relations.push({ from: relMatch[1], to: relMatch[4], fromCard: cardMap[relMatch[2]] || relMatch[2], toCard: cardMap[relMatch[3]] || relMatch[3], label: relMatch[5] });
        continue;
      }

      const relSimple = line.match(/^(\w[\w\d_]*)\s+(\|[\|{o}]|o[\|{])\s*--\s*(\|[\|{o}]|o[\|{])\s+(\w[\w\d_]*)\s*:\s*(.*)/);
      if (relSimple) relations.push({ from: relSimple[1], to: relSimple[4], fromCard: relSimple[2], toCard: relSimple[3], label: relSimple[5] ?? '' });
    }

    if (currentEntity) entities.push({ name: currentEntity, attrs: currentAttrs });

    const startX = 50;
    const startY = 50;
    const spacingX = 200;
    const spacingY = 150;

    for (let i = 0; i < entities.length; i++) {
      const ent = entities[i];
      const x = startX + (i % 3) * spacingX;
      const y = startY + Math.floor(i / 3) * spacingY;
      const label = ent.attrs.length > 0 ? `${ent.name}\n${ent.attrs.join('\n')}` : ent.name;
      const h = Math.max(50, 30 + ent.attrs.length * 20);
      const styleObj = parseStyleString('rounded=0;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;');
      const cell = graph.insertVertex(parent, `entity_${ent.name}`, label, x, y, 140, h, styleObj);
      cellMap.set(`entity_${ent.name}`, cell);
      cells.push({ id: `entity_${ent.name}`, label, style: stringifyStyleObject(styleObj), geometry: { x, y, width: 140, height: h }, type: 'vertex' });
    }

    for (const rel of relations) {
      const source = cellMap.get(`entity_${rel.from}`);
      const target = cellMap.get(`entity_${rel.to}`);
      if (!source || !target) continue;
      const edgeLabel = `${rel.fromCard}--${rel.label}--${rel.toCard}`;
      const styleObj = parseStyleString('edgeStyle=orthogonalEdgeStyle;fontSize=11;');
      const edgeId = `rel_${rel.from}_${rel.to}_${Date.now()}`;
      const edgeCell = graph.insertEdge(parent, edgeId, edgeLabel, source, target, styleObj);
      cellMap.set(edgeId, edgeCell);
      cells.push({ id: edgeId, label: edgeLabel, style: stringifyStyleObject(styleObj), geometry: { x: 0, y: 0, width: 80, height: 40 }, type: 'edge', source: `entity_${rel.from}`, target: `entity_${rel.to}` });
    }
  }

  private parseClass(
    script: string,
    graph: Graph,
    model: any, // เปลี่ยนจาก GraphDataModel
    cellMap: Map<string, Cell>,
    cells: GraphData['cells']
  ): void {
    const lines = script.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const classes: { name: string; members: string[] }[] = [];
    const relations: { from: string; to: string; type: string; label: string }[] = [];
    let classStarted = false;
    let currentClass: string | null = null;
    let currentMembers: string[] = [];
    const parent = graph.getDefaultParent();

    for (const line of lines) {
      if (/^classDiagram/i.test(line)) { classStarted = true; continue; }
      if (!classStarted) continue;

      const classDef = line.match(/^class\s+(\w[\w\d]*)(\s*\{)?/);
      if (classDef) {
        if (currentClass) classes.push({ name: currentClass, members: currentMembers });
        currentClass = classDef[1];
        currentMembers = [];
        if (!classDef[2]) { classes.push({ name: currentClass, members: currentMembers }); currentClass = null; currentMembers = []; }
        continue;
      }

      if (line === '}') {
        if (currentClass) { classes.push({ name: currentClass, members: currentMembers }); currentClass = null; currentMembers = []; }
        continue;
      }

      if (currentClass) {
        const memberMatch = line.match(/^[+#~-]?\s*(\w[\w\d<>[\], ]*)\s+(\w[\w\d]*)\s*\(([^)]*)\)\s*$/);
        if (memberMatch) { currentMembers.push(`+ ${memberMatch[2]}(${memberMatch[3]}): ${memberMatch[1]}`); continue; }
        const attrMatch = line.match(/^[+#~-]?\s*(\w[\w\d<>[\], ]+)\s+(\w[\w\d]*)\s*$/);
        if (attrMatch) { currentMembers.push(`+ ${attrMatch[2]}: ${attrMatch[1]}`); continue; }
        currentMembers.push(line);
        continue;
      }

      const relMatch = line.match(/^(\w[\w\d]*)\s*(<\|--|--\|>|\*--|o--|<\.\.|\.\.|--|--\|)\s*(\w[\w\d]*)\s*:\s*(.*)/);
      if (relMatch) {
        relations.push({ from: relMatch[1], to: relMatch[3], type: relMatch[2], label: relMatch[4] ?? '' });
        if (!classes.find(c => c.name === relMatch[1])) classes.push({ name: relMatch[1], members: [] });
        if (!classes.find(c => c.name === relMatch[3])) classes.push({ name: relMatch[3], members: [] });
        continue;
      }

      const relSimple = line.match(/^(\w[\w\d]*)\s*(<\|--|--\|>|\*--|o--|<\.\.|\.\.|--|--\|)\s*(\w[\w\d]*)/);
      if (relSimple) {
        relations.push({ from: relSimple[1], to: relSimple[3], type: relSimple[2], label: '' });
        if (!classes.find(c => c.name === relSimple[1])) classes.push({ name: relSimple[1], members: [] });
        if (!classes.find(c => c.name === relSimple[3])) classes.push({ name: relSimple[3], members: [] });
      }
    }

    if (currentClass) classes.push({ name: currentClass, members: currentMembers });

    const startX = 50;
    const startY = 50;
    const spacingX = 200;
    const spacingY = 180;

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const x = startX + (i % 3) * spacingX;
      const y = startY + Math.floor(i / 3) * spacingY;
      const header = cls.name;
      const divider = '─'.repeat(20);
      const body = cls.members.length > 0 ? cls.members.join('\n') : '';
      const label = body ? `${header}\n${divider}\n${body}` : header;
      const h = Math.max(50, 40 + cls.members.length * 20);
      const styleObj = parseStyleString('rounded=0;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;');
      const cell = graph.insertVertex(parent, `class_${cls.name}`, label, x, y, 160, h, styleObj);
      cellMap.set(`class_${cls.name}`, cell);
      cells.push({ id: `class_${cls.name}`, label, style: stringifyStyleObject(styleObj), geometry: { x, y, width: 160, height: h }, type: 'vertex' });
    }

    for (const rel of relations) {
      const source = cellMap.get(`class_${rel.from}`);
      const target = cellMap.get(`class_${rel.to}`);
      if (!source || !target) continue;

      let edgeStyle = 'edgeStyle=orthogonalEdgeStyle;fontSize=11;';
      if (rel.type.includes('..')) edgeStyle = 'edgeStyle=orthogonalEdgeStyle;dashed=1;fontSize=11;';
      if (rel.type.includes('*')) edgeStyle += 'endArrow=openThin;';
      if (rel.type.includes('o')) edgeStyle += 'endFill=0;startFill=0;';

      const styleObj = parseStyleString(edgeStyle);
      const edgeId = `rel_${rel.from}_${rel.to}_${Date.now()}`;
      const edgeCell = graph.insertEdge(parent, edgeId, rel.label, source, target, styleObj);
      cellMap.set(edgeId, edgeCell);
      cells.push({ id: edgeId, label: rel.label, style: stringifyStyleObject(styleObj), geometry: { x: 0, y: 0, width: 80, height: 40 }, type: 'edge', source: `class_${rel.from}`, target: `class_${rel.to}` });
    }
  }
}