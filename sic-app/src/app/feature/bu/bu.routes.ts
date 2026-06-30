import { Routes } from '@angular/router';
import { burt01Resolver } from './rt/burt01/burt01.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/feature',
    pathMatch: 'full',
  },
  {
    path: 'burt01',
    loadComponent: () => import('./rt/burt01/burt01.component').then((m) => m.Burt01Component),
    resolve: { form: burt01Resolver },
  },
  // ===== Permission Management (BURT02) =====
  {
    path: 'bu/burt02', // ✅ เปลี่ยนจาก 'pmrt27'
    loadComponent: () => import('./rt/pmrt27/pmrt27.component').then((m) => m.Pmrt27Component),
  },
  {
    path: 'bu/burt02/:id', // ✅ เปลี่ยนจาก 'pmrt27/:id'
    loadComponent: () =>
      import('./rt/pmrt27/pmrt27A/pmrt27A.component').then((m) => m.Pmrt27AComponent),
  },

  // ===== Role Management (BURT03) =====
  {
    path: 'bu/burt03', // ✅ เปลี่ยนจาก 'pmrt28'
    loadComponent: () => import('./rt/pmrt28/pmrt28.component').then((m) => m.Pmrt28Component),
  },

  // ===== Team Management (BURT04) =====
  {
    path: 'bu/burt04', // ✅ เปลี่ยนจาก 'pmrt29'
    loadComponent: () => import('./rt/pmrt29/pmrt29.component').then((m) => m.Pmrt29Component),
  },
  // pm.routes.ts
  {
    path: 'management/business/invite', // คงเดิม (Business Invite)
    loadComponent: () =>
      import('../../management/business/business-invite/business-invite.component').then(
        (m) => m.BusinessInviteComponent,
      ),
  },
  {
    path: 'bu/burt04/add', // ✅ เปลี่ยนจาก 'pmrt29/add'
    redirectTo: '/management/business/invite',
    pathMatch: 'full',
  },
  {
    path: 'bu/burt04/:id/edit', // ✅ เปลี่ยนจาก 'pmrt29/:id/edit'
    loadComponent: () =>
      import('./rt/pmrt29/pmrt29A/pmrt29A.component').then((m) => m.Pmrt29AComponent),
  },

  // ===== Program Management (BURT05) =====
  {
    path: 'bu/burt05', // ✅ เปลี่ยนจาก 'pmrt30'
    loadComponent: () => import('./rt/pmrt30/pmrt30.component').then((m) => m.Pmrt30Component),
  },
  {
    path: 'bu/burt05/new', // ✅ เปลี่ยนจาก 'pmrt30/new'
    loadComponent: () =>
      import('./rt/pmrt30/pmrt30A/pmrt30A.component').then((m) => m.Pmrt30AComponent),
  },
  {
    path: 'bu/burt05/:id/edit', // ✅ เปลี่ยนจาก 'pmrt30/:id/edit'
    loadComponent: () =>
      import('./rt/pmrt30/pmrt30A/pmrt30A.component').then((m) => m.Pmrt30AComponent),
  },
  {
    path: 'bu/burt05/:id/permissions', // ✅ เปลี่ยนจาก 'pmrt30/:id/permissions'
    loadComponent: () =>
      import('./rt/pmrt30/pmrt30A/pmrt30A.component').then((m) => m.Pmrt30AComponent),
  },
  {
    path: 'burp01',
    loadComponent: () => import('./rp/burp01/burp01.component').then((m) => m.Burp01Component),
  },
];
