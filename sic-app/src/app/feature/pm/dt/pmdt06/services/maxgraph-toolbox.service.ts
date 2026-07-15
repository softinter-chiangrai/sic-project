import { Injectable } from '@angular/core';
import type { DiagramType } from '../diagram.model';

export interface ToolDefinition {
  name: string;
  icon: string;
  style: string;
  width: number;
  height: number;
  shapeType: 'vertex' | 'edge';
  category?: string;
}

@Injectable({ providedIn: 'root' })
export class MaxgraphToolboxService {

  private toolboxMap: Record<string, ToolDefinition[]> = {
    Flowchart: [
      {
        name: 'Process',
        icon: 'view_module',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;',
        width: 120, height: 50, shapeType: 'vertex', category: 'Flowchart',
      },
      {
        name: 'Decision',
        icon: 'change_history',
        style: 'shape=diamond;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;fontSize=12;',
        width: 100, height: 80, shapeType: 'vertex', category: 'Flowchart',
      },
      {
        name: 'Start/End',
        icon: 'radio_button_checked',
        style: 'rounded=1;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;fontSize=12;',
        width: 120, height: 50, shapeType: 'vertex', category: 'Flowchart',
      },
      {
        name: 'Input/Output',
        icon: 'swap_horiz',
        style: 'shape=parallelogram;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=12;',
        width: 120, height: 50, shapeType: 'vertex', category: 'Flowchart',
      },
      {
        name: 'Document',
        icon: 'description',
        style: 'shape=document;whiteSpace=wrap;fillColor=#FFF8E1;strokeColor=#F57F17;fontSize=12;',
        width: 100, height: 60, shapeType: 'vertex', category: 'Flowchart',
      },
      {
        name: 'Database',
        icon: 'storage',
        style: 'shape=cylinder;whiteSpace=wrap;fillColor=#E0F2F1;strokeColor=#00695C;fontSize=12;',
        width: 100, height: 60, shapeType: 'vertex', category: 'Flowchart',
      },
      {
        name: 'Subprocess',
        icon: 'layers',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#FBE9E7;strokeColor=#BF360C;dashed=1;fontSize=12;',
        width: 120, height: 50, shapeType: 'vertex', category: 'Flowchart',
      },
    ],
    DFD: [
      {
        name: 'Process',
        icon: 'circle',
        style: 'shape=ellipse;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;',
        width: 80, height: 80, shapeType: 'vertex', category: 'DFD',
      },
      {
        name: 'External Entity',
        icon: 'account_box',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=12;',
        width: 120, height: 50, shapeType: 'vertex', category: 'DFD',
      },
      {
        name: 'Data Store',
        icon: 'dns',
        style: 'shape=datastore;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;fontSize=12;',
        width: 100, height: 60, shapeType: 'vertex', category: 'DFD',
      },
      {
        name: 'Data Flow',
        icon: 'arrow_forward',
        style: 'whiteSpace=wrap;fontSize=11;fontColor=#1565C0;',
        width: 80, height: 40, shapeType: 'edge', category: 'DFD',
      },
    ],
    ER: [
      {
        name: 'Entity',
        icon: 'view_module',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;',
        width: 120, height: 50, shapeType: 'vertex', category: 'ER',
      },
      {
        name: 'Weak Entity',
        icon: 'view_module',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;dashed=1;fontSize=12;',
        width: 120, height: 50, shapeType: 'vertex', category: 'ER',
      },
      {
        name: 'Relationship',
        icon: 'change_history',
        style: 'shape=diamond;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=12;',
        width: 100, height: 80, shapeType: 'vertex', category: 'ER',
      },
      {
        name: 'Attribute',
        icon: 'circle',
        style: 'shape=ellipse;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;fontSize=12;',
        width: 80, height: 50, shapeType: 'vertex', category: 'ER',
      },
      {
        name: 'Primary Key',
        icon: 'vpn_key',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#FFF8E1;strokeColor=#F57F17;fontSize=12;fontStyle=4;',
        width: 120, height: 50, shapeType: 'vertex', category: 'ER',
      },
      {
        name: 'Foreign Key',
        icon: 'vpn_key',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#FBE9E7;strokeColor=#BF360C;dashed=1;fontSize=12;fontStyle=2;',
        width: 120, height: 50, shapeType: 'vertex', category: 'ER',
      },
    ],
    'Use Case': [
      {
        name: 'Actor',
        icon: 'person',
        style: 'shape=actor;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;',
        width: 40, height: 60, shapeType: 'vertex', category: 'Use Case',
      },
      {
        name: 'Use Case',
        icon: 'circle',
        style: 'shape=ellipse;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=12;',
        width: 120, height: 50, shapeType: 'vertex', category: 'Use Case',
      },
      {
        name: 'System Boundary',
        icon: 'crop_square',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#E8F5E9;strokeColor=#2E7D32;dashed=1;fontSize=12;',
        width: 200, height: 150, shapeType: 'vertex', category: 'Use Case',
      },
      {
        name: 'Include',
        icon: 'arrow_forward',
        style: 'edgeStyle=orthogonalEdgeStyle;dashed=0;fontSize=11;',
        width: 80, height: 40, shapeType: 'edge', category: 'Use Case',
      },
      {
        name: 'Extend',
        icon: 'arrow_forward',
        style: 'edgeStyle=orthogonalEdgeStyle;dashed=1;fontSize=11;',
        width: 80, height: 40, shapeType: 'edge', category: 'Use Case',
      },
    ],
    Sequence: [
      {
        name: 'Actor',
        icon: 'person',
        style: 'shape=actor;whiteSpace=wrap;fillColor=#E3F2FD;strokeColor=#1565C0;fontSize=12;',
        width: 40, height: 60, shapeType: 'vertex', category: 'Sequence',
      },
      {
        name: 'Lifeline',
        icon: 'more_vert',
        style: 'shape=lifeline;whiteSpace=wrap;fillColor=#FFF3E0;strokeColor=#E65100;dashed=1;fontSize=11;',
        width: 20, height: 200, shapeType: 'vertex', category: 'Sequence',
      },
      {
        name: 'Activation',
        icon: 'view_stream',
        style: 'rounded=0;whiteSpace=wrap;fillColor=#F3E5F5;strokeColor=#6A1B9A;fontSize=11;',
        width: 16, height: 60, shapeType: 'vertex', category: 'Sequence',
      },
      {
        name: 'Message',
        icon: 'arrow_forward',
        style: 'edgeStyle=orthogonalEdgeStyle;fontSize=11;',
        width: 80, height: 40, shapeType: 'edge', category: 'Sequence',
      },
      {
        name: 'Return Message',
        icon: 'arrow_back',
        style: 'edgeStyle=orthogonalEdgeStyle;dashed=1;fontSize=11;',
        width: 80, height: 40, shapeType: 'edge', category: 'Sequence',
      },
    ],
  };

  getShapesForType(type: string): ToolDefinition[] {
    switch (type) {
      case 'Flowchart': return this.toolboxMap['Flowchart'];
      case 'DFD': return this.toolboxMap['DFD'];
      case 'ER': return this.toolboxMap['ER'];
      case 'Use Case': return this.toolboxMap['Use Case'];
      case 'Sequence': return this.toolboxMap['Sequence'];
      default: return this.toolboxMap['Flowchart'];
    }
  }

  getAllTypes(): string[] {
    return Object.keys(this.toolboxMap);
  }

  getToolboxForType(type: DiagramType): ToolDefinition[] {
    return this.getShapesForType(type);
  }
}