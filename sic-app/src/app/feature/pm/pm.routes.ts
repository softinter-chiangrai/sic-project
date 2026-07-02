import { Routes } from '@angular/router';
import { CanDeactivateGuard } from '../../core/guard/can-deactivate.guard';
import { customerCreateResolver, customerEditResolver } from './rt/pmrt01/pmrt01A/pmrt01A.resolver';


export const PM_ROUTES: Routes = [
   // ===== Customer =====
  {
    path: 'pmrt01',
    loadComponent: () => import('./rt/pmrt01/pmrt01.component').then((m) => m.Pmrt01Component),
  },
  {
    path: 'pmrt01/new',
    loadComponent: () => import('./rt/pmrt01/pmrt01A/pmrt01A.component').then((m) => m.Pmrt01AComponent),
    resolve: { form: customerCreateResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'pmrt01/:id/edit',
    loadComponent: () => import('./rt/pmrt01/pmrt01A/pmrt01A.component').then((m) => m.Pmrt01AComponent),
    resolve: { form: customerEditResolver },
    canDeactivate: [CanDeactivateGuard],
  },

   // ===== Project =====
  {
    path: 'pmrt02',
    loadComponent: () => import('./rt/pmrt02/pmrt02.component').then((m) => m.Pmrt02Component),
  },
  {
    path: 'pmrt02/new',
    loadComponent: () => import('./rt/pmrt02/pmrt02A/pmrt02A.component').then((m) => m.Pmrt02AComponent),
  },
  {
    path: 'pmrt02/:id/edit',
    loadComponent: () => import('./rt/pmrt02/pmrt02A/pmrt02A.component').then((m) => m.Pmrt02AComponent),
  },

  // ===== Project Dashboard =====
{
  path: 'pmrt03/:id',
  loadComponent: () => import('./rt/pmrt03/pmrt03.component').then((m) => m.Pmrt03Component),
},

  // Contract 
{
  path: 'pmrt04',
  loadComponent: () => import('./rt/pmrt04/pmrt04.component').then((m) => m.Pmrt04Component),
},
{
  path: 'pmrt04/new',
  loadComponent: () => import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
},
{
  path: 'pmrt04/:id/edit',
  loadComponent: () => import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
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
  // ===== Test Case =====
  {
    path: 'test-case',
    loadComponent: () => import('./rt/pmrt16/pmrt16.component').then((m) => m.Pmrt16Component),
  },
  {
    path: 'test-case/new',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
  },
  {
    path: 'test-case/:id/edit',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
  },
  {
    path: 'test-case/:id/view',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
  },

  // ===== Test Execution (บันทึกผลการทดสอบ) =====
  {
    path: 'test-execution/:id',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
  },

  // ===== Bug / Issue =====
  {
    path: 'bug',
    loadComponent: () => import('./rt/pmrt17/pmrt17.component').then((m) => m.Pmrt17Component),
  },
  {
    path: 'bug/new',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
  },
  {
    path: 'bug/:id/edit',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
  },
  {
    path: 'bug/:id/view',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
  },
  // ===== Delivery =====
  {
    path: 'delivery',
    loadComponent: () => import('./rt/pmrt18/pmrt18.component').then((m) => m.Pmrt18Component),
  },
  {
    path: 'delivery/new',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
  },
  {
    path: 'delivery/:id/edit',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
  },
  {
    path: 'delivery/:id/view',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
  },
  {
    path: 'manual',
    loadComponent: () => import('./rt/pmrt19/pmrt19.component').then((m) => m.Pmrt19Component),
  },
  {
    path: 'manual/new',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
  },
  {
    path: 'manual/:id/edit',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
  },
  {
    path: 'manual/:id/view',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
  },
  // ===== Invoice =====
  {
    path: 'invoice',
    loadComponent: () => import('./rt/pmrt20/pmrt20.component').then((m) => m.Pmrt20Component),
  },
  {
    path: 'invoice/new',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
  },
  {
    path: 'invoice/:id/edit',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
  },
  {
    path: 'invoice/:id/view',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
  },
  // ===== Payment =====
  {
    path: 'payment',
    loadComponent: () => import('./rt/pmrt20A/pmrt20A.component').then((m) => m.Pmrt21Component),
  },
  {
    path: 'payment/new',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt21Component),
  },
  {
    path: 'payment/:id/edit',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt21Component),
  },
  {
    path: 'payment/:id/view',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt21Component),
  },
  {
    path: 'ma-ticket',
    loadComponent: () => import('./rt/pmrt21/pmrt21.component').then((m) => m.Pmrt21Component),
  },
  {
    path: 'ma-ticket/new',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
  },
  {
    path: 'ma-ticket/:id/edit',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
  },
  {
    path: 'ma-ticket/:id/view',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
  },
  // ===== Renewal / Extension =====
  {
    path: 'renewal',
    loadComponent: () => import('./rt/pmrt22/pmrt22.component').then((m) => m.Pmrt22Component),
  },
  {
    path: 'renewal/:id',
    loadComponent: () => import('./dt/pmdt22/pmdt22.component').then((m) => m.Pmdt22Component),
  },
  {
    path: 'renewal/:id/view',
    loadComponent: () => import('./dt/pmdt22/pmdt22.component').then((m) => m.Pmdt22Component),
  },
  // ===== Approval Center =====
  {
    path: 'approval',
    loadComponent: () => import('./rt/pmrt23/pmrt23.component').then((m) => m.Pmrt23Component),
  },
  {
    path: 'approval/:id',
    loadComponent: () => import('./dt/pmdt23/pmdt23.component').then((m) => m.Pmdt23Component),
  },
  // ===== dashboard=====
  {
    path: 'dashboard',
    loadComponent: () => import('./rt/pmrt24/pmrt24.component').then((m) => m.Pmrt24Component),
  },

  // ===== Document Version Control =====
  {
    path: 'version',
    loadComponent: () => import('./rt/pmrt25/pmrt25.component').then((m) => m.Pmrt25Component),
  },
  {
    path: 'version/new',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
  },
  {
    path: 'version/:id/edit',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
  },
  {
    path: 'version/:id/view',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
  },
  {
    path: 'version/history/:code',
    loadComponent: () => import('./rt/pmrt25/pmrt25.component').then((m) => m.Pmrt25Component),
  },
  {
    path: 'audit',
    loadComponent: () => import('./rt/pmrt26/pmrt26.component').then((m) => m.Pmrt26Component),
  },
];
