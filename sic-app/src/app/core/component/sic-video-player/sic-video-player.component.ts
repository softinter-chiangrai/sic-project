import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sic-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-video-player.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sic-video-player.component.css',
})
export class SicVideoPlayerComponent {
  @Input({ required: true }) src!: string;
  @Input() poster?: string;
  @Input() autoplay = false;
  @Input() loop = false;
  @Input() muted = false;

  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;

  @HostBinding('class.sic-video-player-host') readonly hostClass = true;

  playing = false;

  togglePlay(): void {
    const video = this.videoRef?.nativeElement;

    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
      this.playing = true;
    } else {
      video.pause();
      this.playing = false;
    }
  }
}
