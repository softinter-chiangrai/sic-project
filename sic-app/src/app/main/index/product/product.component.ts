import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product',
  imports: [TranslateModule],
  templateUrl: './product.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product.component.css',
})
export class Product {

}
