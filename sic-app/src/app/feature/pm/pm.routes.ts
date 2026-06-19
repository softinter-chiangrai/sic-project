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

  // ===== phase =====
  {
    path: 'phase',
    loadComponent: () => import('./rt/pmrt04/pmrt04.component').then((m) => m.Pmrt04Component),
  },
  {
    path: 'phase/new',
    loadComponent: () => import('./dt/pmdt04/pmdt04.component').then((m) => m.Pmdt04Component),
  },
  {
    path: 'phase/:id/edit',
    loadComponent: () => import('./dt/pmdt04/pmdt04.component').then((m) => m.Pmdt04Component),
  },

   {
    path: 'requirement',
    loadComponent: () => import('./rt/pmrt05/pmrt05.component').then((m) => m.Pmrt05Component),
  },
  {
    path: 'requirement/new',
    loadComponent: () => import('./dt/pmdt05/pmdt05.component').then((m) => m.Pmdt05Component),
  },
  {
    path: 'requirement/:id/edit',
    loadComponent: () => import('./dt/pmdt05/pmdt05.component').then((m) => m.Pmdt05Component),
  },
  {
    path: 'requirement/:id/approval',
    loadComponent: () => import('./dt/pmdt05/pmdt05.component').then((m) => m.Pmdt05Component), // หรือหน้า approval แยก
  },
];