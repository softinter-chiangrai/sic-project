// src/app/features/pmdt06/pmdt06D/pmdt06D.component.ts
import { Component, Input, signal, effect, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import mermaid from 'mermaid';

@Component({
  selector: 'app-pmdt06D',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pmdt06D.component.html',
  styleUrls: ['./pmdt06D.component.css']
})
export class Pmdt06DComponent implements OnChanges {
  @Input() script = '';
  @ViewChild('diagramContainer') diagramContainer!: ElementRef;

  error = signal<string | null>(null);
  private zoomLevel = 1;

  constructor() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
    });
  }

  ngOnChanges() {
    this.renderDiagram(this.script);
  }

  async renderDiagram(script: string) {
    const container = this.diagramContainer.nativeElement;
    container.innerHTML = '';
    this.error.set(null);

    if (!script || !script.trim()) {
      container.innerHTML = '<p class="text-[var(--text-muted)] text-sm">No diagram to display</p>';
      return;
    }

    try {
      const { svg } = await mermaid.render('mermaid-diagram', script);
      container.innerHTML = svg;
      // Apply zoom
      const svgElement = container.querySelector('svg');
      if (svgElement) {
        svgElement.style.transform = `scale(${this.zoomLevel})`;
        svgElement.style.transformOrigin = 'top left';
        svgElement.style.width = '100%';
        svgElement.style.height = 'auto';
      }
    } catch (err: any) {
      this.error.set(err.message || 'Invalid Mermaid syntax');
      container.innerHTML = `<pre class="text-sm text-red-500">${this.error()}</pre>`;
    }
  }

  zoomIn() {
    this.zoomLevel = Math.min(2, this.zoomLevel + 0.1);
    this.applyZoom();
  }

  zoomOut() {
    this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1);
    this.applyZoom();
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.applyZoom();
  }

  private applyZoom() {
    const svg = this.diagramContainer.nativeElement.querySelector('svg');
    if (svg) {
      svg.style.transform = `scale(${this.zoomLevel})`;
      svg.style.transformOrigin = 'top left';
    }
  }

  toggleFullscreen() {
    const container = this.diagramContainer.nativeElement.closest('.h-full');
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}