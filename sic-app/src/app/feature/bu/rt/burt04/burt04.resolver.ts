// src/app/feature/bu/rt/burt04/burt04.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { burt04Service } from './burt04.service';
import { Burt04PageData } from './burt04.model';

async function resolveBusinessId(service: burt04Service): Promise<string> {
  const existing = service.getBusinessId();
  if (existing) return existing;

  const businesses = await lastValueFrom(service.getMyBusinesses());
  if (!businesses || businesses.length === 0) return '';

  const defaultBiz = businesses.find((b) => b.isDefault) || businesses[0];
  service.setBusinessId(defaultBiz.id);
  return defaultBiz.id;
}

export const burt04Resolver: ResolveFn<Burt04PageData> = async () => {
  const service = inject(burt04Service);

  try {
    const businessId = await resolveBusinessId(service);
    if (!businessId) {
      return { businessId: '', roleOptions: [] };
    }

    const roles = await lastValueFrom(service.getComboboxRoles());
    return { businessId, roleOptions: roles.map((r) => r.text) };
  } catch (err) {
    console.error('Failed to load team page data:', err);
    return { businessId: '', roleOptions: [] };
  }
};
