import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const profileGuard: CanActivateFn = async (_route, _state) => {
    const platformId = inject(PLATFORM_ID);
    const router = inject(Router);
    const http = inject(HttpClient);
    const authService = inject(AuthService);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    try {
        const response = await firstValueFrom(
            http.get<{ profileComplete?: boolean } | boolean>(`${environment.apiBaseUrl}/api/profile/activation`)
        );

        const isComplete = typeof response === 'boolean' ? response : (response?.profileComplete ?? false);

        if (!isComplete) {
            return router.parseUrl('/management/profile');
        }
        return true;
    } catch (error) {
        console.error('[DEBUG] profileGuard caught an error:', error);
        return router.parseUrl('/management/profile');
    }
};
