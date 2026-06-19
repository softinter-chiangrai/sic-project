import { Routes } from '@angular/router';

export const PM_ROUTES: Routes = [
  // ===== Customer =====
  {
    path: 'customer',
    loadComponent: () => import('./rt/pmrt01/pmrt01.component').then((m) => m.Pmrt01Component),
  },
  {
    path: 'customer/new',
    loadComponent: () => import('./dt/pmdt01/pmdt01.component').then((m) => m.Pmdt01Component),
  },
  {
    path: 'customer/:id/edit',
    loadComponent: () => import('./dt/pmdt01/pmdt01.component').then((m) => m.Pmdt01Component),
  },

  // ===== Contract =====
  {
    path: 'contract',
    loadComponent: () => import('./rt/pmrt02/pmrt02.component').then((m) => m.Pmrt02Component),
  },
  {
    path: 'contract/new',
    loadComponent: () => import('./dt/pmdt02/pmdt02.component').then((m) => m.Pmdt02Component),
  },
  {
    path: 'contract/:id/edit',
    loadComponent: () => import('./dt/pmdt02/pmdt02.component').then((m) => m.Pmdt02Component),
  },

  // ===== Project =====
  {
    path: 'project',
    loadComponent: () => import('./rt/pmrt03/pmrt03.component').then((m) => m.Pmrt03Component),
  },
  {
    path: 'project/new',
    loadComponent: () => import('./dt/pmdt03/pmdt03.component').then((m) => m.Pmdt03Component),
  },
  {
    path: 'project/:id/edit',
    loadComponent: () => import('./dt/pmdt03/pmdt03.component').then((m) => m.Pmdt03Component),
  },
];