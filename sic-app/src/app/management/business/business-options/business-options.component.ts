import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-business-options',
  imports: [RouterLink, TranslateModule],
  templateUrl: './business-options.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './business-options.component.css',
})
export class BusinessOptionsComponent {

}
