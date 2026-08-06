import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sic-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-navbar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sic-navbar.component.css',
})
export class SicNavbarComponent {
  @Input() sticky = false;

  @HostBinding('class.sic-navbar-host') readonly hostClass = true;
  @HostBinding('class.sic-navbar--sticky') get isSticky() {
    return this.sticky;
  }
}
