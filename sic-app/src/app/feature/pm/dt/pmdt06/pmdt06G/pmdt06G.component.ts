import { Component, inject, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaxgraphToolboxService } from '../services/maxgraph-toolbox.service';

interface ShapeItem {
  name: string;
  style: string;
  width: number;
  height: number;
  icon: string;
}

@Component({
  selector: 'app-pmdt06g',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pmdt06G.component.html',
  styleUrls: ['./pmdt06G.component.css'],
})
export class Pmdt06GComponent implements OnInit {
  @Input() diagramType = 'Flowchart';
  @Output() shapeSelect = new EventEmitter<{ name: string; style: string; width: number; height: number }>();

  private toolboxService = inject(MaxgraphToolboxService);

  shapes = signal<ShapeItem[]>([]);

  ngOnInit(): void {
    this.loadShapes();
  }

  private loadShapes(): void {
    const items = this.toolboxService.getShapesForType(this.diagramType);
    this.shapes.set(items);
  }

  onShapeClick(shape: ShapeItem): void {
    this.shapeSelect.emit({
      name: shape.name,
      style: shape.style,
      width: shape.width,
      height: shape.height,
    });
  }

  onDragStart(event: DragEvent, shape: ShapeItem): void {
    event.dataTransfer?.setData('application/x-maxgraph-shape', JSON.stringify({
      name: shape.name,
      style: shape.style,
      width: shape.width,
      height: shape.height,
    }));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }
}