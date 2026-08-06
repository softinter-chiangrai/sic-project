import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/feature',
    pathMatch: 'full',
  },
  {
    path: 'mprt01',
    loadComponent: () => import('./rt/mprt01/mprt01.component').then((m) => m.Mprt01Component),
  },
  {
    path: 'mprt01a',
    loadComponent: () => import('./rt/mprt01a/mprt01a.component').then((m) => m.Mprt01aComponent),
  },
  {
    path: 'mprt01a/:marketplaceId',
    loadComponent: () => import('./rt/mprt01a/mprt01a.component').then((m) => m.Mprt01aComponent),
  },
  {
    path: 'mprt02',
    loadComponent: () => import('./rt/mprt02/mprt02.component').then((m) => m.Mprt02Component),
  },
  {
  path: 'mprt02/:marketplaceId',
    loadComponent: () => import('./rt/mprt02a/mprt02a.component').then((m) => m.Mprt02aComponent),
  },
  {
    path: 'MASTER_DATA/:appId/:programCode',
    loadComponent: () => import('./rt/mprt03/mprt03.component').then((m) => m.Mprt03Component),
  },
  {
    path: 'TRANSACTION_DATA/:appId/:programCode',
    loadComponent: () => import('./rt/mprt04/mprt04.component').then((m) => m.Mprt04Component),
  },
  {
    path: 'TRANSACTION_DATA/:appId/:programCode/new',
    loadComponent: () => import('./rt/mprt04a/mprt04a.component').then((m) => m.Mprt04aComponent),
  },
  {
    path: 'TRANSACTION_DATA/:appId/:programCode/:id',
    loadComponent: () => import('./rt/mprt04a/mprt04a.component').then((m) => m.Mprt04aComponent),
  },
];
