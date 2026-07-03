// navigation.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { CustomerStateService } from './customer-state.service';


@Injectable({ providedIn: 'root' })
export class NavigationService {
  constructor(
    private router: Router,
    private customerState: CustomerStateService,
  ) {}

  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    const customerId = this.customerState.getCustomerId();
    const projectId = this.customerState.getProjectId();
    const queryParams: any = { ...extras?.queryParams };

    if (customerId) {
      queryParams.customerId = customerId;

    }
    if (projectId) {
      queryParams.projectId = projectId;
    }

    return this.router.navigate(commands, {
      ...extras,
      queryParams,
      queryParamsHandling: extras?.queryParamsHandling || 'merge',
    });
  }

  navigateWithoutContext(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }
}