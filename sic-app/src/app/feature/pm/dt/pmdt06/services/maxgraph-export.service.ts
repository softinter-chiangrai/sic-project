import { Injectable } from '@angular/core';
import { Graph } from '@maxgraph/core';

@Injectable({ providedIn: 'root' })
export class MaxgraphExportService {

  exportPNG(graph: Graph, filename: string = 'diagram.png'): void {
    try {
      const container = graph.container;
      if (!container) return;

      const svgEl = container.querySelector('svg');
      if (!svgEl) {
        console.error('No SVG element found in graph container');
        return;
      }

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);

      const img = new Image();
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          this.downloadDataUrl(dataUrl, filename);
        }
        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        console.error('Failed to load SVG for PNG export');
      };

      img.src = url;
    } catch (e) {
      console.error('PNG export failed:', e);
    }
  }

  exportSVG(graph: Graph, filename: string = 'diagram.svg'): void {
    try {
      const container = graph.container;
      if (!container) return;

      const svgEl = container.querySelector('svg');
      if (!svgEl) {
        console.error('No SVG element found in graph container');
        return;
      }

      const clone = svgEl.cloneNode(true) as SVGElement;
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(clone);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      this.downloadBlob(blob, filename);
    } catch (e) {
      console.error('SVG export failed:', e);
    }
  }

  exportPDF(graph: Graph, filename: string = 'diagram.pdf'): void {
    try {
      const container = graph.container;
      if (!container) return;

      const svgEl = container.querySelector('svg');
      if (!svgEl) {
        console.error('No SVG element found in graph container');
        return;
      }

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    @page { margin: 0; }
    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    svg { max-width: 100%; max-height: 100vh; }
  </style>
</head>
<body>
  ${svgStr}
  <script>
    window.onload = function() {
      window.print();
    };
  <\/script>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.focus();
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } else {
        this.downloadBlob(blob, filename.replace(/\.pdf$/i, '.html'));
      }
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  }

  private downloadDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}