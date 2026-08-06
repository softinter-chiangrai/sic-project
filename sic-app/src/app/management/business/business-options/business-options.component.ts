import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-business-options',
  imports: [RouterLinkWithHref],
  templateUrl: './business-options.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './business-options.component.css',
})
export class BusinessOptionsComponent {

}
