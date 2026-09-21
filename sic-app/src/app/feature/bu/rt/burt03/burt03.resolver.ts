// src/app/feature/bu/rt/burt03/burt03.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { burt03Service } from './burt03.service';
import { Burt03PageData, Role } from './burt03.model';

async function resolveBusinessId(service: burt03Service): Promise<string | null> {
  const stored = localStorage.getItem('businessId');
  if (stored) return stored;

  const businesses = await lastValueFrom(service.getMyBusinesses());
  if (!businesses || businesses.length === 0) return null;

  const activeBiz = businesses.find((b) => b.isDefault) || businesses[0];
  localStorage.setItem('businessId', activeBiz.id);
  return activeBiz.id;
}

export const burt03Resolver: ResolveFn<Burt03PageData> = async () => {
  const service = inject(burt03Service);
  const router = inject(Router);

  try {
    const businessId = await resolveBusinessId(service);
    if (!businessId) {
      return { businessId: '', roles: [] };
    }

    const roles: Role[] = await lastValueFrom(service.getRoles(businessId));
    return { businessId, roles: roles ?? [] };
  } catch (err) {
    console.error('Failed to load roles:', err);
    router.navigate(['/not-found']);
    return { businessId: '', roles: [] };
  }
};
