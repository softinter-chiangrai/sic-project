import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export const profileGuard: CanActivateFn = async (_route, _state) => {
    const platformId = inject(PLATFORM_ID);
    const router = inject(Router);
    const http = inject(HttpClient);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    const profile:boolean = await firstValueFrom(
        http.get<boolean>(`${environment.apiBaseUrl}/api/profile/activation`)
    );

    if (!profile) {
        return router.parseUrl('/management/profile');
    }
    return true;
};
