import { Component } from '@angular/core';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-buddy',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './buddy.component.html',
  styleUrls: ['./buddy.component.css']
})
export class BuddyComponent {}
