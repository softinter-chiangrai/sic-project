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
        const profile: boolean = await firstValueFrom(
            http.get<boolean>(`${environment.apiBaseUrl}/api/profile/activation`)
        );

        if (!profile) {
            return router.parseUrl('/management/profile');
        }
        return true;
    } catch (error) {
        console.error('[DEBUG] profileGuard caught an error from .NET:', error);
        // Instead of logging out, redirect to profile management so the user can recreate their profile!
        return router.parseUrl('/management/profile');
    }
};
