// navigation.service.ts
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CustomerStateService } from './customer-state.service';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  constructor(
    private router: Router,
    private customerState: CustomerStateService,
  ) {}

  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }

  navigateWithoutContext(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }
}
