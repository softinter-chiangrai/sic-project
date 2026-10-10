import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { BusinessService } from '../services/business.service';

export const businessGuard: CanActivateFn = async (_route, _state) => {
    const platformId = inject(PLATFORM_ID);
    const router = inject(Router);
    const http = inject(HttpClient);
    const authService = inject(AuthService);
    const businessService = inject(BusinessService);

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

        // หน้า feature อ่าน businessId จาก localStorage → ตั้งให้ถ้ายังไม่มี (เข้าหน้าตรงๆ หลัง login)
        if (!businessService.getCurrentBusinessId()) {
            const mine = await firstValueFrom(businessService.getMyBusinesses());
            const active = mine.find((b) => b.isDefault) || mine[0];
            if (active) businessService.setCurrentBusinessId(active.id);
        }
        return true;
    } catch (error) {
        console.error('[DEBUG] businessGuard caught an error:', error);
        return router.parseUrl('/management/business');
    }
};
