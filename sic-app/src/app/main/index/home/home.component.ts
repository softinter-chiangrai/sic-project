import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SicButtonComponent } from 'sic-ng';

@Component({
  selector: 'app-home',
  imports: [TranslateModule, SicButtonComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.css',
})
export class Home {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  login(): void {
    if (this.authService.isLoggedIn()) {
      void this.router.navigate(['feature']);
    } else {
      void this.authService.login('/feature/dashboard');
    }
  }

  scrollToFeatures(): void {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
