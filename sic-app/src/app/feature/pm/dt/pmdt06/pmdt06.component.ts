// src/app/feature/pm/dt/pmdt06/pmdt06.component.ts
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DiagramService } from './diagram.service';
import { DrawioConnectorService } from './drawio-connector.service';
import { pmdt06AComponent } from './pmdt06A/pmdt06A.component';

@Component({
  selector: 'app-pmdt06',
  standalone: true,
  imports: [CommonModule, FormsModule, pmdt06AComponent],
  templateUrl: './pmdt06.component.html',
  styleUrls: ['./pmdt06.component.css'],
})
export class Pmdt06Component implements AfterViewInit, OnDestroy {
  @ViewChild('drawioIframe') iframe!: ElementRef<HTMLIFrameElement>;

  private destroy$ = new Subject<void>();
  private drawioService = inject(DrawioConnectorService);
  private diagramService = inject(DiagramService);
  private route = inject(ActivatedRoute);

  isLoading = false;
  currentTabId: string | null = null;
  projectId: string | null = null;
  drawioReady = false;
  projectName = '';

  chatOpen = signal(false);
  unreadCount = 0;
  currentDiagram: any = null;

  ngAfterViewInit(): void {
    this.drawioService.init(this.iframe.nativeElement);

    this.drawioService.isReady$.pipe(takeUntil(this.destroy$)).subscribe((ready) => {
      this.drawioReady = ready;
      console.log('Draw.io ready status:', ready);
      if (ready && this.currentTabId) {
        this.loadExistingDiagram();
      }
    });

    // fallback 7 วินาที
    setTimeout(() => {
      if (!this.drawioReady) {
        console.warn('[Draw.io] Fallback: force ready after 7s');
        this.drawioReady = true;
        if (this.currentTabId) {
          this.loadExistingDiagram();
        }
      }
    }, 7000);

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.currentTabId = params['tabId'] || params['diagramId'] || null;
      this.projectId = params['projectId'] || null;
      if (this.projectId) {
        this.loadProjectName();
        if (!this.currentTabId) {
          this.diagramService.getTabs(this.projectId).subscribe({
            next: (tabs) => {
              if (tabs && tabs.length > 0) {
                this.currentTabId = tabs[0].id;
                if (this.drawioReady) this.loadExistingDiagram();
              }
            },
          });
        }
      }
      if (this.currentTabId && this.drawioReady) {
        this.loadExistingDiagram();
      }
    });
  }

  loadProjectName(): void {
    if (!this.projectId) return;
    this.diagramService.getProjectName(this.projectId).subscribe({
      next: (name) => (this.projectName = name),
      error: () => (this.projectName = 'Unknown Project'),
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    this.drawioService.handleMessage(event);
  }

  toggleChat(): void {
    this.chatOpen.update((v) => !v);
    if (this.chatOpen()) this.unreadCount = 0;
  }

  handleAiResponse(response: any): void {
    console.log('AI Response from chat:', response);
    if (response.action === 'update' && response.diagram) {
      this.loadExistingDiagram();
    }
  }

  loadExistingDiagram(): void {
    if (!this.currentTabId) return;
    this.isLoading = true;
    this.diagramService.getDiagram(this.currentTabId).subscribe({
      next: (diagram) => {
        if (this.projectId && diagram.projectId !== this.projectId) {
          alert('Error: Diagram does not belong to the selected project.');
          this.isLoading = false;
          this.drawioService.loadXml('');
          return;
        }
        this.currentDiagram = diagram;
        const xml = diagram.graphData?.xml || '';
        this.drawioService.loadXml(xml);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.drawioService.loadXml('');
      },
    });
  }

  saveDiagram(): void {
    if (!this.currentTabId) {
      alert('Cannot save: No diagram ID is loaded.');
      return;
    }

    this.drawioService.requestXml();

    this.drawioService.xml$.pipe(takeUntil(this.destroy$)).subscribe((xml) => {
      if (xml && this.currentTabId) {
        const name = this.currentDiagram?.name || 'Drawio Diagram';
        const diagramType = this.currentDiagram?.diagramType || 'Flowchart';
        const projectId = this.currentDiagram?.projectId || this.projectId;

        if (!projectId) {
          alert('Cannot save: Project ID is missing.');
          return;
        }

        const updatedTab = {
          ...this.currentDiagram,
          id: this.currentTabId,
          name,
          diagramType,
          projectId,
          graphData: { xml },
        };

        this.diagramService.updateTab(updatedTab as any).subscribe({
          next: (res) => {
            this.currentDiagram = res;
            alert('Diagram saved successfully!');
          },
          error: (err) => {
            console.error('Save failed:', err);
            alert('Save failed!');
          },
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
