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

   {
    path: 'change-request',
    loadComponent: () => import('./rt/pmrt06/pmrt06.component').then((m) => m.Pmrt06Component),
  },
  {
    path: 'change-request/new',
    loadComponent: () => import('./dt/pmdt06/pmdt06.component').then((m) => m.Pmdt06Component),
  },
  {
    path: 'change-request/:id/edit',
    loadComponent: () => import('./dt/pmdt06/pmdt06.component').then((m) => m.Pmdt06Component),
  },
  {
    path: 'specification',
    loadComponent: () => import('./rt/pmrt10/pmrt10.component').then((m) => m.Pmrt10Component),
  },
  {
    path: 'specification/new',
    loadComponent: () => import('./dt/pmdt10/pmdt10.component').then((m) => m.Pmdt10Component),
  },
  {
    path: 'specification/:id/edit',
    loadComponent: () => import('./dt/pmdt10/pmdt10.component').then((m) => m.Pmdt10Component),
  },
  {
    path: 'design-review',
    loadComponent: () => import('./rt/pmrt11/pmrt11.component').then((m) => m.Pmrt11Component),
  },
  {
    path: 'design-review/new',
    loadComponent: () => import('./dt/pmdt11/pmdt11.component').then((m) => m.Pmdt11Component),
  },
  {
    path: 'design-review/:id/edit',
    loadComponent: () => import('./dt/pmdt11/pmdt11.component').then((m) => m.Pmdt11Component),
  },
  // ===== Task =====
  {
    path: 'task',
    loadComponent: () => import('./rt/pmrt12/pmrt12.component').then((m) => m.Pmrt12Component),
  },
  {
    path: 'task/new',
    loadComponent: () => import('./dt/pmdt12/pmdt12.component').then((m) => m.Pmdt12Component),
  },
  {
    path: 'task/:id/edit',
    loadComponent: () => import('./dt/pmdt12/pmdt12.component').then((m) => m.Pmdt12Component),
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('./rt/pmrt13/pmrt13.component').then((m) => m.Pmrt13Component),
  },
   {
    path: 'my-tasks/:id/update',
    loadComponent: () => import('./dt/pmdt13/pmdt13.component').then((m) => m.Pmdt13Component),
  },
  

  // ===== Discussion =====
  {
    path: 'discussion',
    loadComponent: () => import('./dt/pmdt14/pmdt14.component').then((m) => m.Pmdt14Component),
  },
  {
    path: 'gantt',
    loadComponent: () => import('./rt/pmrt14/pmrt14.component').then((m) => m.Pmrt14Component),
  },
  {
    path: 'gantt/:id/update',
    loadComponent: () => import('./dt/pmdt15/pmdt15.component').then((m) => m.Pmdt15Component),
  },
];