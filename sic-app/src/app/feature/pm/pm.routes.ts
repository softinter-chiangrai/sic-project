// src/app/feature/pm/pm.routes.ts
import { Routes } from '@angular/router';
import { CanDeactivateGuard } from '../../core/guard/can-deactivate.guard';
import { customerGuard } from '../../core/guard/customer.guard';
import { projectGuard } from '../../core/guard/project.guard';
import { customerCreateResolver, customerEditResolver } from './rt/pmrt01/pmrt01A/pmrt01A.resolver';

export const PM_ROUTES: Routes = [
  // ===== Customer =====
  {
    path: 'pmrt01',
    loadComponent: () => import('./rt/pmrt01/pmrt01.component').then((m) => m.Pmrt01Component),
  },
  {
    path: 'pmrt01/new',
    loadComponent: () =>
      import('./rt/pmrt01/pmrt01A/pmrt01A.component').then((m) => m.Pmrt01AComponent),
    resolve: { form: customerCreateResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'pmrt01/:id/edit',
    loadComponent: () =>
      import('./rt/pmrt01/pmrt01A/pmrt01A.component').then((m) => m.Pmrt01AComponent),
    resolve: { form: customerEditResolver },
    canDeactivate: [CanDeactivateGuard],
  },

  // ===== Project =====
  {
    path: 'pmrt02',
    loadComponent: () => import('./rt/pmrt02/pmrt02.component').then((m) => m.Pmrt02Component),
    canActivate: [customerGuard],
  },
  {
    path: 'pmrt02/new',
    loadComponent: () =>
      import('./rt/pmrt02/pmrt02A/pmrt02A.component').then((m) => m.Pmrt02AComponent),
    canActivate: [customerGuard],
  },
  {
    path: 'pmrt02/:id/edit',
    loadComponent: () =>
      import('./rt/pmrt02/pmrt02A/pmrt02A.component').then((m) => m.Pmrt02AComponent),
    canActivate: [customerGuard],
  },

  // ===== Project Dashboard =====
  {
    path: 'pmrt03',
    loadComponent: () => import('./rt/pmrt03/pmrt03.component').then((m) => m.Pmrt03Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Contract =====
  {
    path: 'pmrt04',
    loadComponent: () => import('./rt/pmrt04/pmrt04.component').then((m) => m.Pmrt04Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'pmrt04/new',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'pmrt04/:id/edit',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'pmrt04/renew/:id',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04B/pmrt04B.component').then((m) => m.pmrt04BComponent),
    canActivate: [customerGuard, projectGuard],
  },

  // ============================================================
  // ===== PHASE & MILESTONE MANAGEMENT (แก้ไข + เพิ่มใหม่) =====
  // ============================================================

  // ---- Phase List ----
  {
    path: 'phase',
    loadComponent: () => import('./dt/pmdt01/pmdt01.component').then((m) => m.Pmdt01Component),
    canActivate: [customerGuard, projectGuard],
  },
  // ---- Phase Form (Create) ----
  {
    path: 'phase/new',
    loadComponent: () =>
      import('./dt/pmdt01/pmdt01A/pmdt01A.component').then((m) => m.Pmdt01AComponent),
    canActivate: [customerGuard, projectGuard],
  },
  // ---- Phase Form (Edit) ----
  {
    path: 'phase/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt01/pmdt01A/pmdt01A.component').then((m) => m.Pmdt01AComponent),
    canActivate: [customerGuard, projectGuard],
  },
  // ---- Phase Detail ----
  {
    path: 'phase/:id',
    loadComponent: () => import('./dt/pmdt02/pmdt02.component').then((m) => m.Pmdt02Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ---- Milestone Form (ใช้ Pmdt02AComponent) ----
  {
    path: 'milestone/new',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02A/pmdt02A.component').then((m) => m.Pmdt02AComponent),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'milestone/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02A/pmdt02A.component').then((m) => m.Pmdt02AComponent),
    canActivate: [customerGuard, projectGuard],
  },

  // ---- WorkPackage Form (ใช้ Pmdt02BComponent) ----
  {
    path: 'work-package/new',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02B/pmdt02B.component').then((m) => m.Pmdt02BComponent),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'work-package/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02B/pmdt02B.component').then((m) => m.Pmdt02BComponent),
    canActivate: [customerGuard, projectGuard],
  },

  // ---- Task Form (ใช้ Pmdt02CComponent) ----
  {
    path: 'task/new',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02C/pmdt02C.component').then((m) => m.Pmdt02CComponent),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'task/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02C/pmdt02C.component').then((m) => m.Pmdt02CComponent),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Requirement (ใหม่ ใช้ pmdt04) =====
  {
    path: 'requirement',
    loadComponent: () => import('./dt/pmdt04/pmdt04.component').then((m) => m.Pmdt04Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'requirement/new',
    loadComponent: () =>
      import('./dt/pmdt04/pmdt04A/pmdt04A.component').then((m) => m.Pmdt04AComponent),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'requirement/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt04/pmdt04A/pmdt04A.component').then((m) => m.Pmdt04AComponent),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'requirement/:id/approval',
    loadComponent: () =>
      import('./dt/pmdt04/pmdt04A/pmdt04A.component').then((m) => m.Pmdt04AComponent),
    canActivate: [customerGuard, projectGuard],
  },

    // ===== Diagram =====
  {
    path: 'diagram',
    loadComponent: () => import('./dt/pmdt06/pmdt06.component').then((m) => m.Pmdt06Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'diagram/new',
    loadComponent: () =>
      import('./dt/pmdt06/pmdt06E/pmdt06E.component').then((m) => m.Pmdt06EComponent), 
    canActivate: [customerGuard, projectGuard],
  },

  // // ===== Change Request =====
  // {
  //   path: 'change-request',
  //   loadComponent: () => import('./rt/pmrt06/pmrt06.component').then((m) => m.Pmrt06Component),
  //   canActivate: [customerGuard, projectGuard],
  // },
  // {
  //   path: 'change-request/new',
  //   loadComponent: () => import('./dt/pmdt066/pmdt066.component').then((m) => m.Pmdt06Component),
  //   canActivate: [customerGuard, projectGuard],
  // },
  // {
  //   path: 'change-request/:id/edit',
  //   loadComponent: () => import('./dt/pmdt066/pmdt066.component').then((m) => m.Pmdt06Component),
  //   canActivate: [customerGuard, projectGuard],
  // },

  // ===== Specification =====
  {
    path: 'specification',
    loadComponent: () => import('./rt/pmrt10/pmrt10.component').then((m) => m.Pmrt10Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'specification/new',
    loadComponent: () => import('./dt/pmdt10/pmdt10.component').then((m) => m.Pmdt10Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'specification/:id/edit',
    loadComponent: () => import('./dt/pmdt10/pmdt10.component').then((m) => m.Pmdt10Component),
    canActivate: [customerGuard, projectGuard],
  },

 

  // ===== Design Review =====
  {
    path: 'design-review',
    loadComponent: () => import('./rt/pmrt11/pmrt11.component').then((m) => m.Pmrt11Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'design-review/new',
    loadComponent: () => import('./dt/pmdt11/pmdt11.component').then((m) => m.Pmdt11Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'design-review/:id/edit',
    loadComponent: () => import('./dt/pmdt11/pmdt11.component').then((m) => m.Pmdt11Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Task (เดิม) =====
  {
    path: 'task-list',
    loadComponent: () => import('./rt/pmrt12/pmrt12.component').then((m) => m.Pmrt12Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'task-list/new',
    loadComponent: () => import('./dt/pmdt12/pmdt12.component').then((m) => m.Pmdt12Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'task-list/:id/edit',
    loadComponent: () => import('./dt/pmdt12/pmdt12.component').then((m) => m.Pmdt12Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('./rt/pmrt13/pmrt13.component').then((m) => m.Pmrt13Component),
    canActivate: [customerGuard],
  },
  {
    path: 'my-tasks/:id/update',
    loadComponent: () => import('./dt/pmdt13/pmdt13.component').then((m) => m.Pmdt13Component),
    canActivate: [customerGuard],
  },

  // ===== Discussion =====
  {
    path: 'discussion',
    loadComponent: () => import('./dt/pmdt14/pmdt14.component').then((m) => m.Pmdt14Component),
    canActivate: [customerGuard],
  },

  // ===== Gantt =====
  {
    path: 'gantt',
    loadComponent: () =>
      import('../../core/component/sic-ganttchart/ganttchart.component').then(
        (m) => m.SicGanttchartComponent,
      ),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'gantt/:id/update',
    loadComponent: () => import('./dt/pmdt15/pmdt15.component').then((m) => m.Pmdt15Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Test Case =====
  {
    path: 'test-case',
    loadComponent: () => import('./rt/pmrt16/pmrt16.component').then((m) => m.Pmrt16Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'test-case/new',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'test-case/:id/edit',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'test-case/:id/view',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'test-execution/:id',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Bug =====
  {
    path: 'bug',
    loadComponent: () => import('./rt/pmrt17/pmrt17.component').then((m) => m.Pmrt17Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'bug/new',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'bug/:id/edit',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'bug/:id/view',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Delivery =====
  {
    path: 'delivery',
    loadComponent: () => import('./rt/pmrt18/pmrt18.component').then((m) => m.Pmrt18Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'delivery/new',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'delivery/:id/edit',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'delivery/:id/view',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== User Manual =====
  {
    path: 'manual',
    loadComponent: () => import('./rt/pmrt19/pmrt19.component').then((m) => m.Pmrt19Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'manual/new',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'manual/:id/edit',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'manual/:id/view',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Invoice =====
  {
    path: 'invoice',
    loadComponent: () => import('./rt/pmrt20/pmrt20.component').then((m) => m.Pmrt20Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'invoice/new',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'invoice/:id/edit',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'invoice/:id/view',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Payment =====
  {
    path: 'payment',
    loadComponent: () => import('./rt/pmrt20A/pmrt20A.component').then((m) => m.Pmrt21Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'payment/new',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'payment/:id/edit',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'payment/:id/view',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== MA Ticket =====
  {
    path: 'ma-ticket',
    loadComponent: () => import('./rt/pmrt21/pmrt21.component').then((m) => m.Pmrt21Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'ma-ticket/new',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'ma-ticket/:id/edit',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'ma-ticket/:id/view',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Renewal =====
  {
    path: 'renewal',
    loadComponent: () => import('./rt/pmrt22/pmrt22.component').then((m) => m.Pmrt22Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'renewal/:id',
    loadComponent: () => import('./dt/pmdt22/pmdt22.component').then((m) => m.Pmdt22Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'renewal/:id/view',
    loadComponent: () => import('./dt/pmdt22/pmdt22.component').then((m) => m.Pmdt22Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Approval Center =====
  {
    path: 'approval',
    loadComponent: () => import('./dt/pmdt03/pmdt03.component').then((m) => m.Pmdt03Component),
  },
  {
    path: 'approval/:id',
    loadComponent: () =>
      import('./dt/pmdt03/pmdt03A/pmdt03A.component').then((m) => m.Pmdt03AComponent),
  },

  // ===== Dashboard =====
  {
    path: 'dashboard',
    loadComponent: () => import('./rt/pmrt24/pmrt24.component').then((m) => m.Pmrt24Component),
    canActivate: [customerGuard],
  },

  // ===== Document Version Control =====
  {
    path: 'version',
    loadComponent: () => import('./rt/pmrt25/pmrt25.component').then((m) => m.Pmrt25Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'version/new',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'version/:id/edit',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'version/:id/view',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'version/history/:code',
    loadComponent: () => import('./rt/pmrt25/pmrt25.component').then((m) => m.Pmrt25Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ===== Audit Log =====
  {
    path: 'audit',
    loadComponent: () => import('./rt/pmrt26/pmrt26.component').then((m) => m.Pmrt26Component),
    canActivate: [customerGuard],
  },
];
