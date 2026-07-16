import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { AiDiagramService } from './ai-diagram.service';
import { DrawioConnectorService } from './drawio-connector.service';
import { Pmdt06CComponent } from './pmdt06C/pmdt06C.component';
import { DiagramService } from './diagram.service';

@Component({
  selector: 'app-pmdt06',
  standalone: true,
  imports: [CommonModule, FormsModule, Pmdt06CComponent],
  templateUrl: './pmdt06.component.html',
  styleUrls: ['./pmdt06.component.css'],
})
export class Pmdt06Component implements AfterViewInit {
  @ViewChild('drawioIframe') iframe!: ElementRef<HTMLIFrameElement>;

  aiPrompt = '';
  isGenerating = false;
  isLoading = false;
  currentTabId: string | null = null;
  projectId: string | null = null;
  drawioReady = false;
  projectName = '';

  chatOpen = signal(false);
  unreadCount = 0;

  private drawioService = inject(DrawioConnectorService);
  private aiService = inject(AiDiagramService);
  private route = inject(ActivatedRoute);
  private diagramService = inject(DiagramService);

  ngAfterViewInit(): void {
    this.drawioService.init(this.iframe.nativeElement);

    this.drawioService.isReady$.subscribe((ready) => {
      this.drawioReady = ready;
      console.log('Draw.io ready status:', ready);
    });

    this.route.queryParams.subscribe((params) => {
      this.currentTabId = params['tabId'] || params['diagramId'] || null;
      this.projectId = params['projectId'] || null;
      if (this.currentTabId) {
        this.loadExistingDiagram();
      }
      if (this.projectId) {
        this.loadProjectName();
      }
    });
  }

  loadProjectName(): void {
    if (!this.projectId) return;
    this.diagramService.getProjects().subscribe({
      next: (projects) => {
        const found = projects.find((p) => p.id === this.projectId);
        this.projectName = found?.name || 'Unknown Project';
      },
      error: () => {
        this.projectName = 'Unknown Project';
      },
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    this.drawioService.handleMessage(event);
  }

  toggleChat(): void {
    this.chatOpen.update((v) => !v);
    if (this.chatOpen()) {
      this.unreadCount = 0;
    }
  }

  clearPrompt(): void {
    this.aiPrompt = '';
  }

  handleAiResponse(response: any): void {
    console.log('AI Response from chat:', response);
    if (response.action === 'update' && response.diagram) {
      alert('Diagram updated by AI. Please use "Reload" to see changes.');
    }
  }

  onEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      return;
    }
    keyboardEvent.preventDefault();
    this.generateDiagram();
  }

  generateDiagram() {
    if (!this.aiPrompt.trim()) return;
    this.isGenerating = true;

    this.aiService.generateMermaid(this.aiPrompt).subscribe({
      next: (res) => {
        console.log('AI Mermaid:', res.mermaid);
        this.drawioService.loadMermaid(res.mermaid);
        this.isGenerating = false;
      },
      error: (err) => {
        console.error(err);
        alert('AI generation failed!');
        this.isGenerating = false;
      },
    });
  }

  loadExistingDiagram() {
    if (!this.currentTabId) return;
    this.isLoading = true;
    this.aiService.loadDiagram(this.currentTabId).subscribe({
      next: (res) => {
        if (res.xml) {
          this.drawioService.loadXml(res.xml);
        } else {
          this.drawioService.loadXml('');
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.drawioService.loadXml('');
      },
    });
  }

  saveDiagram() {
    if (!this.currentTabId) {
      alert('Cannot save: No diagram ID is loaded.');
      return;
    }

    this.drawioService.requestXml();

    this.drawioService.xml$.pipe(take(1)).subscribe((xml) => {
      if (xml && this.currentTabId) {
        this.aiService.saveDiagram(this.currentTabId, xml).subscribe({
          next: () => {
            alert('Diagram saved successfully!');
          },
          error: () => {
            alert('Save failed!');
          },
        });
      }
    });
  }
}