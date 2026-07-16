import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { AiDiagramService } from './ai-diagram.service';
import { DrawioConnectorService } from './drawio-connector.service';

@Component({
  selector: 'app-pmdt06',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private drawioService: DrawioConnectorService,
    private aiService: AiDiagramService,
    private route: ActivatedRoute,
  ) {}

  ngAfterViewInit(): void {

    this.drawioService.init(
        this.iframe.nativeElement
    );

    this.drawioService.isReady$
      .subscribe(ready => {

        console.log('READY STATUS:', ready);

      });

}

  // รับ Message จาก Draw.io
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    this.drawioService.handleMessage(event);
  }

  // กดปุ่ม Generate ด้วย AI
  generateDiagram() {
    if (!this.aiPrompt.trim()) return;
    this.isGenerating = true;

    this.aiService.generateMermaid(this.aiPrompt).subscribe({
      next: (res) => {
        console.log('AI Mermaid:', res.mermaid);
        // ส่ง Mermaid ไปให้ Draw.io โหลดเลย
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

  // โหลด Diagram จาก Database
  loadExistingDiagram() {
    if (!this.currentTabId) return;
    this.isLoading = true;
    this.aiService.loadDiagram(this.currentTabId).subscribe({
      next: (res) => {
        if (res.xml) {
          this.drawioService.loadXml(res.xml);
        } else {
          // If the record exists but has no XML yet, load empty string to clear loading screen
          this.drawioService.loadXml('');
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // In case of error, load empty diagram so it doesn't spin forever
        this.drawioService.loadXml('');
      },
    });
  }

  // บันทึก Diagram ปัจจุบัน
  saveDiagram() {
    if (!this.currentTabId) {
      alert('Cannot save: No diagram ID is loaded.');
      return;
    }

    // ขอ XML จาก Draw.io
    this.drawioService.requestXml();

    // ปรับตรงนี้: ดักรับแค่ครั้งเดียว (take 1) เพื่อไม่ให้บั๊กเวลายูสเซอร์กดปุ่มเซฟรัวๆ
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
