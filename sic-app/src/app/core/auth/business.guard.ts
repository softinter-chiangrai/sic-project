import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const businessGuard: CanActivateFn = async (_route, _state) => {
    const platformId = inject(PLATFORM_ID);
    const router = inject(Router);
    const http = inject(HttpClient);
    const authService = inject(AuthService);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    if (!authService.isLoggedIn()) {
        return true;
    }

    try {
        const businesses: boolean = await firstValueFrom(
            http.get<boolean>(`${environment.apiBaseUrl}/api/business/activation`),
        );

        if (!businesses) {
            return router.parseUrl('/management/business');
        }
        return true;
    } catch (error) {
        console.error('[DEBUG] businessGuard caught an error:', error);
        return router.parseUrl('/management/business');
    }
};
