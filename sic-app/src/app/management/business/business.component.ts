import { Component, ChangeDetectionStrategy } from '@angular/core';
import {RouterModule } from '@angular/router';

@Component({
  selector: 'app-business',
  imports: [RouterModule],
  templateUrl: './business.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './business.component.css',
})
export class BusinessComponent {

}
