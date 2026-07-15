import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-navbar.component.html',
  styleUrl: './sic-navbar.component.css',
})
export class SicNavbarComponent {
  @Input() sticky = false;

  @HostBinding('class.sic-navbar-host') readonly hostClass = true;
  @HostBinding('class.sic-navbar--sticky') get isSticky() {
    return this.sticky;
  }
}
