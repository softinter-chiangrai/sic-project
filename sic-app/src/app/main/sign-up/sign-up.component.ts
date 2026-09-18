import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-up',
  imports: [TranslateModule],
  templateUrl: './sign-up.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sign-up.component.css',
})
export class SignUp {

}
