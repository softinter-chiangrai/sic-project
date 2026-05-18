import { Component, Input, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'sic-profile-cropper',
  imports: [CommonModule],
  templateUrl: './sic-profile-cropper.html',
  styleUrl: './sic-profile-cropper.css',
})
export class SicProfileCropper implements AfterViewInit {
  readonly canvasSize = 280;
  private readonly dialogService = inject(DialogService);
  @Input() src: string | null = null;
  @Input() onCropResult?: (croppedDataUrl: string) => void | Promise<void>;
  @Input() onCancelCrop?: () => void;
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  private img: HTMLImageElement | null = null;
  private dragging = false;
  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  scale = 1;
  minScale = 1;
  maxScale = 4;
  isSubmitting = false;
  private baseScale = 1;

  get zoomPercent(): number {
    return Math.round((this.scale / this.baseScale) * 100);
  }

  ngAfterViewInit() {
    if (!this.src) return;
    this.img = new window.Image();
    this.img.onload = () => {
      this.ctx = this.canvasRef.nativeElement.getContext('2d');
      this.reset();
      this.draw();
    };
    this.img.src = this.src;
  }

  reset() {
    this.offsetX = 0;
    this.offsetY = 0;
    if (this.img) {
      this.baseScale = Math.max(
        this.canvasSize / this.img.width,
        this.canvasSize / this.img.height,
      );
      this.minScale = this.baseScale;
      this.maxScale = this.baseScale * 3.5;
      this.scale = this.baseScale;
    }
    this.draw();
  }

  draw() {
    if (!this.ctx || !this.img) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imgW = this.img.width * this.scale;
    const imgH = this.img.height * this.scale;
    const x = (this.canvasSize - imgW) / 2 + this.offsetX;
    const y = (this.canvasSize - imgH) / 2 + this.offsetY;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(
      this.canvasSize / 2,
      this.canvasSize / 2,
      this.canvasSize / 2,
      0,
      Math.PI * 2,
    );
    this.ctx.closePath();
    this.ctx.clip();
    this.ctx.drawImage(this.img, x, y, imgW, imgH);
    this.ctx.restore();
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale - delta * 0.1));
    this.draw();
  }

  onZoomChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.scale = Number(input.value);
    this.draw();
  }

  onDragEnd() {
    this.dragging = false;
  }

  onPointerDown(event: PointerEvent) {
    this.dragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    if (event.pointerId >= 0) {
      this.canvasRef.nativeElement.setPointerCapture(event.pointerId);
    }
  }

  onPointerMove(event: PointerEvent) {
    if (!this.dragging) return;

    event.preventDefault();
    this.offsetX += event.clientX - this.startX;
    this.offsetY += event.clientY - this.startY;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.draw();
  }

  onPointerUp(event: PointerEvent) {
    if (this.canvasRef.nativeElement.hasPointerCapture(event.pointerId)) {
      this.canvasRef.nativeElement.releasePointerCapture(event.pointerId);
    }

    this.onDragEnd();
  }

  onMouseDown(event: MouseEvent) {
    this.dragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.dragging) return;

    this.offsetX += event.clientX - this.startX;
    this.offsetY += event.clientY - this.startY;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.draw();
  }

  onMouseUp(event?: MouseEvent) {
    this.onDragEnd();
  }

  async doCrop() {
    if (!this.ctx || this.isSubmitting) return;

    this.isSubmitting = true;
    const canvas = this.canvasRef.nativeElement;
    const croppedDataUrl = canvas.toDataURL('image/png');
    this.dialogService.close(true);

    try {
      await this.onCropResult?.(croppedDataUrl);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancelCrop() {
    if (this.isSubmitting) {
      return;
    }

    this.onCancelCrop?.();
    this.dialogService.close(false);
  }
}
