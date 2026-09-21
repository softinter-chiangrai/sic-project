// src/app/feature/bu/rt/burt02/burt02.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { burt03Service } from '../burt03/burt03.service';
import { burt04Service } from '../burt04/burt04.service';
import { Burt02PageData, RolePermissionSummary } from './burt02.model';

export const burt02Resolver: ResolveFn<Burt02PageData> = async () => {
  const roleService = inject(burt03Service);
  const memberService = inject(burt04Service);

  const businessId = localStorage.getItem('businessId');
  if (!businessId) {
    return { roles: [] };
  }

  try {
    const roles = await lastValueFrom(roleService.getRoles(businessId));

    let userCountMap = new Map<string, number>();
    try {
      const res = await lastValueFrom(memberService.getMembers(businessId, 0, 1000));
      const members = res?.data || [];
      members.forEach((member) => {
        const roleIds = member.roleIds || [];
        roleIds.forEach((roleId) => {
          userCountMap.set(roleId, (userCountMap.get(roleId) || 0) + 1);
        });
      });
    } catch {
      // Fallback: userCount = 0 for every role, still show the role list.
      userCountMap = new Map<string, number>();
    }

    const mapped: RolePermissionSummary[] = roles.map((r) => ({
      roleId: r.id,
      roleCode: r.roleCode,
      roleName: r.roleName || r.roleNameEn || r.roleCode,
      userCount: userCountMap.get(r.id) || 0,
      isActive: r.isActive,
      permissions: [],
    }));

    return { roles: mapped };
  } catch (err) {
    console.error('Failed to load roles:', err);
    return { roles: [] };
  }
};
