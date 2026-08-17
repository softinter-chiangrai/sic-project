// src/app/feature/pm/pm.routes.ts

import { Routes } from '@angular/router';
import { CanDeactivateGuard } from '../../core/guard/can-deactivate.guard';
import { customerGuard } from '../../core/guard/customer.guard';
import { projectGuard } from '../../core/guard/project.guard';
import { customerCreateResolver, customerEditResolver } from './rt/pmrt01/pmrt01A/pmrt01A.resolver';
import { requirementGuard } from '../../core/guard/requirement.guard';
import { pmdt08CreateResolver, pmdt08EditResolver, pmdt08Resolver } from './dt/pmdt08/pmdt08.resolver';
import { editGuard } from '../../core/guard/edit.guard';
import { pmdt01Resolver } from './dt/pmdt01/pmdt01.resolver';
import { pmdt02Resolver } from './dt/pmdt02/pmdt02.resolver';
import { pmdt02AResolver } from './dt/pmdt02/pmdt02A/pmdt02A.resolver';
import { pmdt02BResolver } from './dt/pmdt02/pmdt02B/pmdt02B.resolver';
import { pmdt02CResolver } from './dt/pmdt02/pmdt02C/pmdt02C.resolver';
import { pmdt01ACreateResolver, pmdt01AEditResolver } from './dt/pmdt01/pmdt01A/pmdt01A.resolver';
import { pmdt03Resolver } from './dt/pmdt03/pmdt03.resolver';
import { pmdt03AResolver } from './dt/pmdt03/pmdt03A/pmdt03A.resolver';
import { pmdt04Resolver } from './dt/pmdt04/pmdt04.resolver';
import { pmdt04AResolver } from './dt/pmdt04/pmdt04A/pmdt04A.resolver';
import { pmdt05Resolver } from './dt/pmdt05/pmdt05.resolver';
import { pmdt06Resolver } from './dt/pmdt06/pmdt06.resolver';
import { pmdt06AResolver } from './dt/pmdt06/pmdt06A/pmdt06A.resolver';
import { pmdt07Resolver } from './dt/pmdt07/pmdt07.resolver';
import { pmdt07AResolver } from './dt/pmdt07/pmdt07A/pmdt07A.resolver';
import { pmdt08AResolver } from './dt/pmdt08/pmdt08A/pmdt08A.resolver';
import { pmdt09Resolver } from './dt/pmdt09/pmdt09.resolver';
import { pmdt09AResolver } from './dt/pmdt09/pmdt09A/pmdt09A.resolver';
import { pmdt10Resolver, pmdt10AResolver, pmdt10BResolver, pmdt10CResolver } from './dt/pmdt10/pmdt10.resolver';
import { pmdt11Resolver } from './dt/pmdt11/pmdt11.resolver';
import { pmdt12Resolver } from './dt/pmdt12/pmdt12.resolver';
import { pmdt13Resolver } from './dt/pmdt13/pmdt13.resolver';
import { pmdt13AResolver } from './dt/pmdt13/pmdt13A/pmdt13A.resolver';
import { pmdt14Resolver } from './dt/pmdt14/pmdt14.resolver';
import { pmdt15Resolver } from './dt/pmdt15/pmdt15.resolver';
import { pmdt17Resolver } from './dt/pmdt17/pmdt17.resolver';
import { pmdt18Resolver } from './dt/pmdt18/pmdt18.resolver';
import { pmdt19Resolver } from './dt/pmdt19/pmdt19.resolver';
import { pmdt20Resolver } from './dt/pmdt20/pmdt20.resolver';
import { pmdt20AResolver } from './dt/pmdt20A/pmdt20A.resolver';
import { pmdt21Resolver } from './dt/pmdt21/pmdt21.resolver';
import { pmdt22Resolver } from './dt/pmdt22/pmdt22.resolver';
import { pmdt25Resolver } from './dt/pmdt25/pmdt25.resolver';

import { pmrt01Resolver } from './rt/pmrt01/pmrt01.resolver';
import { pmrt02Resolver } from './rt/pmrt02/pmrt02.resolver';
import { pmrt02AResolver } from './rt/pmrt02/pmrt02A/pmrt02A.resolver';
import { pmrt03Resolver } from './rt/pmrt03/pmrt03.resolver';
import { pmrt04Resolver } from './rt/pmrt04/pmrt04.resolver';
import { pmrt04AResolver } from './rt/pmrt04/pmrt04A/pmrt04A.resolver';
import { pmrt04BResolver } from './rt/pmrt04/pmrt04B/pmrt04B.resolver';
import { pmrt05Resolver } from './rt/pmrt05/pmrt05.resolver';
import { pmrt11Resolver } from './rt/pmrt11/pmrt11.resolver';
import { pmrt12Resolver } from './rt/pmrt12/pmrt12.resolver';
import { pmrt13Resolver } from './rt/pmrt13/pmrt13.resolver';
import { pmrt17Resolver } from './rt/pmrt17/pmrt17.resolver';
import { pmrt18Resolver } from './rt/pmrt18/pmrt18.resolver';
import { pmrt19Resolver } from './rt/pmrt19/pmrt19.resolver';
import { pmrt20Resolver } from './rt/pmrt20/pmrt20.resolver';
import { pmrt20AResolver } from './rt/pmrt20A/pmrt20A.resolver';
import { pmrt21Resolver } from './rt/pmrt21/pmrt21.resolver';
import { pmrt22Resolver } from './rt/pmrt22/pmrt22.resolver';
import { pmrt24Resolver } from './rt/pmrt24/pmrt24.resolver';
import { pmrt25Resolver } from './rt/pmrt25/pmrt25.resolver';
import { pmrt26Resolver } from './rt/pmrt26/pmrt26.resolver';
import { ganttResolver } from '../../core/component/sic-gantt/gantt.resolver';

export const PM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rt/pmrt03/pmrt03.component').then(m => m.Pmrt03Component),
    resolve: { form: pmrt03Resolver },
  },
  // ===== Customer =====
  {
    path: 'pmrt01',
    loadComponent: () => import('./rt/pmrt01/pmrt01.component').then((m) => m.Pmrt01Component),
    resolve: { form: pmrt01Resolver },
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
    resolve: { form: pmrt02Resolver },
  },
  {
    path: 'pmrt02/new',
    loadComponent: () =>
      import('./rt/pmrt02/pmrt02A/pmrt02A.component').then((m) => m.Pmrt02AComponent),
    canActivate: [customerGuard],
    resolve: { form: pmrt02AResolver },
  },
  {
    path: 'pmrt02/:id/edit',
    loadComponent: () =>
      import('./rt/pmrt02/pmrt02A/pmrt02A.component').then((m) => m.Pmrt02AComponent),
    canActivate: [customerGuard],
    resolve: { form: pmrt02AResolver },
  },

  // ===== Project Dashboard =====
  {
    path: 'pmrt03',
    loadComponent: () => import('./rt/pmrt03/pmrt03.component').then((m) => m.Pmrt03Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt03Resolver },
  },

  // ===== Contract =====
  {
    path: 'pmrt04',
    loadComponent: () => import('./rt/pmrt04/pmrt04.component').then((m) => m.Pmrt04Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt04Resolver },
  },
  {
    path: 'pmrt04/new',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt04AResolver },
  },
  {
    path: 'pmrt04/:id/edit',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt04AResolver },
  },
  {
    path: 'pmrt04/renew/:id',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04B/pmrt04B.component').then((m) => m.Pmrt04BComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt04BResolver },
  },

  // ============================================================
  // ===== PHASE & MILESTONE MANAGEMENT =====
  // ============================================================

  // ---- Phase List ----
  {
    path: 'phase',
    loadComponent: () => import('./dt/pmdt01/pmdt01.component').then((m) => m.Pmdt01Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt01Resolver },
  },
  // ---- Phase Form (Create) ----
  {
    path: 'phase/new',
    loadComponent: () =>
      import('./dt/pmdt01/pmdt01A/pmdt01A.component').then((m) => m.Pmdt01AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt01ACreateResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  // ---- Phase Form (Edit) ----
  {
    path: 'phase/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt01/pmdt01A/pmdt01A.component').then((m) => m.Pmdt01AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt01AEditResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  // ---- Phase Detail ----
  {
    path: 'phase/:id',
    loadComponent: () => import('./dt/pmdt02/pmdt02.component').then((m) => m.Pmdt02Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt02Resolver },
  },

  // ---- Milestone Form ----
  {
    path: 'milestone/new',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02A/pmdt02A.component').then((m) => m.Pmdt02AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt02AResolver },
  },
  {
    path: 'milestone/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02A/pmdt02A.component').then((m) => m.Pmdt02AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt02AResolver },
  },

  // ---- WorkPackage Form ----
  {
    path: 'work-package/new',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02B/pmdt02B.component').then((m) => m.Pmdt02BComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt02BResolver },
  },
  {
    path: 'work-package/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02B/pmdt02B.component').then((m) => m.Pmdt02BComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt02BResolver },
  },

  // ---- Task Form ----
  {
    path: 'task/new',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02C/pmdt02C.component').then((m) => m.Pmdt02CComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt02CResolver },
  },
  {
    path: 'task/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt02/pmdt02C/pmdt02C.component').then((m) => m.Pmdt02CComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt02CResolver },
  },

  // ===== Approval =====
  {
    path: 'pmdt03',
    loadComponent: () => import('./dt/pmdt03/pmdt03.component').then((m) => m.Pmdt03Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt03Resolver },
  },
  {
    path: 'pmdt03/:id',
    loadComponent: () => import('./dt/pmdt03/pmdt03A/pmdt03A.component').then((m) => m.Pmdt03AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt03AResolver },
  },

  // ===== Requirement =====
  {
    path: 'requirement',
    loadComponent: () => import('./dt/pmdt04/pmdt04.component').then((m) => m.Pmdt04Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt04Resolver },
  },
  {
    path: 'requirement/new',
    loadComponent: () =>
      import('./dt/pmdt05/pmdt05.component').then((m) => m.Pmdt05Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt05Resolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'requirement/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt05/pmdt05.component').then((m) => m.Pmdt05Component),
    canActivate: [customerGuard, projectGuard, requirementGuard, editGuard],
    data: { targetType: 'REQUIREMENT' },
    resolve: { form: pmdt05Resolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'requirement/:id/view',
    loadComponent: () =>
      import('./dt/pmdt05/pmdt05.component').then((m) => m.Pmdt05Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { form: pmdt05Resolver },
  },
  {
    path: 'requirement/:id/approval',
    loadComponent: () =>
      import('./dt/pmdt04/pmdt04A/pmdt04A.component').then((m) => m.Pmdt04AComponent),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { form: pmdt04AResolver },
  },

  // ===== Requirement Dashboard (pmrt05) =====
  {
    path: 'pmrt05',
    loadComponent: () => import('./rt/pmrt05/pmrt05.component').then(m => m.Pmrt05Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { pageData: pmrt05Resolver },
  },

  // ===== Diagram =====
  {
    path: 'diagram',
    loadComponent: () => import('./dt/pmdt06/pmdt06.component').then((m) => m.Pmdt06Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { form: pmdt06Resolver },
  },

  // ===== Change Request =====
  {
    path: 'pmdt07',
    loadComponent: () => import('./dt/pmdt07/pmdt07.component').then(m => m.Pmdt07Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt07Resolver },
  },
  {
    path: 'pmdt07/new',
    loadComponent: () => import('./dt/pmdt07/pmdt07A/pmdt07A.component').then(m => m.Pmdt07AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt07AResolver },
  },
  {
    path: 'pmdt07/:id/edit',
    loadComponent: () => import('./dt/pmdt07/pmdt07A/pmdt07A.component').then(m => m.Pmdt07AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt07AResolver },
  },
  {
    path: 'pmdt07/:id/view',
    loadComponent: () => import('./dt/pmdt07/pmdt07A/pmdt07A.component').then(m => m.Pmdt07AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt07AResolver },
  },

  // ===== Specification Management =====
  {
    path: 'pmdt08',
    loadComponent: () => import('./dt/pmdt08/pmdt08.component').then(m => m.Pmdt08Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { form: pmdt08Resolver },
  },
  {
    path: 'pmdt08/new',
    loadComponent: () => import('./dt/pmdt08/pmdt08A/pmdt08A.component').then(m => m.Pmdt08AComponent),
    resolve: { form: pmdt08AResolver },
    canDeactivate: [CanDeactivateGuard],
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },
  {
    path: 'pmdt08/:id/edit',
    loadComponent: () => import('./dt/pmdt08/pmdt08A/pmdt08A.component').then(m => m.Pmdt08AComponent),
    resolve: { form: pmdt08AResolver },
    canDeactivate: [CanDeactivateGuard],
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },
  {
    path: 'pmdt08/:id/view',
    loadComponent: () => import('./dt/pmdt08/pmdt08A/pmdt08A.component').then(m => m.Pmdt08AComponent),
    resolve: { form: pmdt08AResolver },
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },
  {
    path: 'pmdt08A/new',
    loadComponent: () => import('./dt/pmdt08/pmdt08A/pmdt08A.component').then(m => m.Pmdt08AComponent),
    resolve: { form: pmdt08AResolver },
    canDeactivate: [CanDeactivateGuard],
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },
  {
    path: 'pmdt08A/:id/edit',
    loadComponent: () => import('./dt/pmdt08/pmdt08A/pmdt08A.component').then(m => m.Pmdt08AComponent),
    resolve: { form: pmdt08AResolver },
    canDeactivate: [CanDeactivateGuard],
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },
  {
    path: 'pmdt08A/:id/view',
    loadComponent: () => import('./dt/pmdt08/pmdt08A/pmdt08A.component').then(m => m.Pmdt08AComponent),
    resolve: { form: pmdt08AResolver },
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },
  {
    path: 'discussion',
    loadComponent: () => import('./dt/pmdt09/pmdt09.component').then(m => m.Pmdt09Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt09Resolver },
  },

  // ===== Test Scenario Management (pmdt10) =====
  {
    path: 'test-scenario',
    loadComponent: () => import('./dt/pmdt10/pmdt10.component').then(m => m.Pmdt10Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt10Resolver },
  },
  {
    path: 'pmdt10',
    loadComponent: () => import('./dt/pmdt10/pmdt10.component').then(m => m.Pmdt10Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt10Resolver },
  },
  {
    path: 'test-scenario/new',
    loadComponent: () => import('./dt/pmdt10/pmdt10A/pmdt10A.component').then(m => m.Pmdt10AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt10AResolver },
  },
  {
    path: 'test-scenario/:id/edit',
    loadComponent: () => import('./dt/pmdt10/pmdt10A/pmdt10A.component').then(m => m.Pmdt10AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt10AResolver },
  },
  {
    path: 'pmdt10/pmdt10A',
    loadComponent: () => import('./dt/pmdt10/pmdt10A/pmdt10A.component').then(m => m.Pmdt10AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt10AResolver },
  },
  {
    path: 'pmdt10/pmdt10A/:id/edit',
    loadComponent: () => import('./dt/pmdt10/pmdt10A/pmdt10A.component').then(m => m.Pmdt10AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt10AResolver },
  },

  // ===== Design Review =====
  {
    path: 'design-review',
    loadComponent: () => import('./rt/pmrt11/pmrt11.component').then((m) => m.Pmrt11Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt11Resolver },
  },
  {
    path: 'design-review/new',
    loadComponent: () => import('./dt/pmdt11/pmdt11.component').then((m) => m.Pmdt11Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { pageData: pmdt11Resolver },
  },
  {
    path: 'design-review/:id/edit',
    loadComponent: () => import('./dt/pmdt11/pmdt11.component').then((m) => m.Pmdt11Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { pageData: pmdt11Resolver },
  },

  // ===== Task (PMDT12) =====
  {
    path: 'task-list',
    loadComponent: () => import('./dt/pmdt12/pmdt12.component').then((m) => m.Pmdt12Component),
    canActivate: [customerGuard, projectGuard],
  },
  {
    path: 'pmdt12',
    loadComponent: () => import('./dt/pmdt12/pmdt12.component').then((m) => m.Pmdt12Component),
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
    resolve: { pageData: pmrt13Resolver },
  },
  {
    path: 'my-tasks/:id/update',
    loadComponent: () => import('./dt/pmdt13/pmdt13.component').then((m) => m.Pmdt13Component),
    canActivate: [customerGuard],
    resolve: { pageData: pmdt13Resolver },
  },

  // ===== Discussion =====
  {
    path: 'discussion',
    loadComponent: () => import('./dt/pmdt14/pmdt14.component').then((m) => m.Pmdt14Component),
    canActivate: [customerGuard],
    resolve: { pageData: pmdt14Resolver },
  },

  // ===== Gantt =====
  {
    path: 'gantt',
    loadComponent: () =>
      import('../../core/component/sic-gantt/sic-gantt.component').then((m) => m.SicGanttComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: ganttResolver },
  },
  {
    path: 'phase/:id/gantt',
    loadComponent: () =>
      import('../../core/component/sic-gantt/sic-gantt.component').then((m) => m.SicGanttComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: ganttResolver },
  },
  {
    path: 'gantt/:id/update',
    loadComponent: () => import('./dt/pmdt15/pmdt15.component').then((m) => m.Pmdt15Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt15Resolver },
  },

  // ===== Test Case =====
  {
    path: 'test-case',
    loadComponent: () => import('./dt/pmdt13/pmdt13.component').then((m) => m.Pmdt13Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt13Resolver },
  },
  {
    path: 'pmdt13',
    loadComponent: () => import('./dt/pmdt13/pmdt13.component').then((m) => m.Pmdt13Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt13Resolver },
  },
  {
    path: 'test-case/new',
    loadComponent: () => import('./dt/pmdt13/pmdt13A/pmdt13A.component').then((m) => m.Pmdt13AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt13AResolver },
  },
  {
    path: 'test-case/:id/edit',
    loadComponent: () => import('./dt/pmdt13/pmdt13A/pmdt13A.component').then((m) => m.Pmdt13AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt13AResolver },
  },
  {
    path: 'test-case/:id/view',
    loadComponent: () => import('./dt/pmdt13/pmdt13A/pmdt13A.component').then((m) => m.Pmdt13AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt13AResolver },
  },
  {
    path: 'test-execution/:id',
    loadComponent: () => import('./dt/pmdt13/pmdt13A/pmdt13A.component').then((m) => m.Pmdt13AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt13AResolver },
  },
  {
    path: 'pmdt13/pmdt13A',
    loadComponent: () => import('./dt/pmdt13/pmdt13A/pmdt13A.component').then((m) => m.Pmdt13AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt13AResolver },
  },
  {
    path: 'pmdt13/pmdt13A/:id',
    loadComponent: () => import('./dt/pmdt13/pmdt13A/pmdt13A.component').then((m) => m.Pmdt13AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt13AResolver },
  },

  // ===== Bug =====
  {
    path: 'bug',
    loadComponent: () => import('./rt/pmrt17/pmrt17.component').then((m) => m.Pmrt17Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt17Resolver },
  },
  {
    path: 'bug/new',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt17Resolver },
  },
  {
    path: 'bug/:id/edit',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt17Resolver },
  },
  {
    path: 'bug/:id/view',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt17Resolver },
  },

  // ===== Delivery =====
  {
    path: 'delivery',
    loadComponent: () => import('./rt/pmrt18/pmrt18.component').then((m) => m.Pmrt18Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt18Resolver },
  },
  {
    path: 'delivery/new',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt18Resolver },
  },
  {
    path: 'delivery/:id/edit',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt18Resolver },
  },
  {
    path: 'delivery/:id/view',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt18Resolver },
  },

  // ===== User Manual =====
  {
    path: 'manual',
    loadComponent: () => import('./rt/pmrt19/pmrt19.component').then((m) => m.Pmrt19Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt19Resolver },
  },
  {
    path: 'manual/new',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt19Resolver },
  },
  {
    path: 'manual/:id/edit',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt19Resolver },
  },
  {
    path: 'manual/:id/view',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt19Resolver },
  },

  // ===== Invoice =====
  {
    path: 'invoice',
    loadComponent: () => import('./rt/pmrt20/pmrt20.component').then((m) => m.Pmrt20Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt20Resolver },
  },
  {
    path: 'invoice/new',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt20Resolver },
  },
  {
    path: 'invoice/:id/edit',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt20Resolver },
  },
  {
    path: 'invoice/:id/view',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt20Resolver },
  },

  // ===== Payment =====
  {
    path: 'payment',
    loadComponent: () => import('./rt/pmrt20A/pmrt20A.component').then((m) => m.Pmrt21Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt20AResolver },
  },
  {
    path: 'payment/new',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt20AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt20AResolver },
  },
  {
    path: 'payment/:id/edit',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt20AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt20AResolver },
  },
  {
    path: 'payment/:id/view',
    loadComponent: () => import('./dt/pmdt20A/pmdt20A.component').then((m) => m.Pmdt20AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt20AResolver },
  },

  // ===== MA Ticket =====
  {
    path: 'ma-ticket',
    loadComponent: () => import('./rt/pmrt21/pmrt21.component').then((m) => m.Pmrt21Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt21Resolver },
  },
  {
    path: 'ma-ticket/new',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt21Resolver },
  },
  {
    path: 'ma-ticket/:id/edit',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt21Resolver },
  },
  {
    path: 'ma-ticket/:id/view',
    loadComponent: () => import('./dt/pmdt21/pmdt21.component').then((m) => m.Pmdt21Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt21Resolver },
  },

  // ===== Renewal =====
  {
    path: 'renewal',
    loadComponent: () => import('./rt/pmrt22/pmrt22.component').then((m) => m.Pmrt22Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt22Resolver },
  },
  {
    path: 'renewal/:id',
    loadComponent: () => import('./dt/pmdt22/pmdt22.component').then((m) => m.Pmdt22Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt22Resolver },
  },
  {
    path: 'renewal/:id/view',
    loadComponent: () => import('./dt/pmdt22/pmdt22.component').then((m) => m.Pmdt22Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt22Resolver },
  },

  // ===== Approval Center =====
  {
    path: 'approval',
    loadComponent: () => import('./dt/pmdt03/pmdt03.component').then((m) => m.Pmdt03Component),
    resolve: { form: pmdt03Resolver },
  },
  {
    path: 'approval/:id',
    loadComponent: () =>
      import('./dt/pmdt03/pmdt03A/pmdt03A.component').then((m) => m.Pmdt03AComponent),
    resolve: { form: pmdt03AResolver },
  },

  // ===== Dashboard =====
  {
    path: 'dashboard',
    loadComponent: () => import('./rt/pmrt24/pmrt24.component').then((m) => m.Pmrt24Component),
    canActivate: [customerGuard],
    resolve: { pageData: pmrt24Resolver },
  },

  // ===== Document Version Control =====
  {
    path: 'version',
    loadComponent: () => import('./rt/pmrt25/pmrt25.component').then((m) => m.Pmrt25Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt25Resolver },
  },
  {
    path: 'version/new',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt25Resolver },
  },
  {
    path: 'version/:id/edit',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt25Resolver },
  },
  {
    path: 'version/:id/view',
    loadComponent: () => import('./dt/pmdt25/pmdt25.component').then((m) => m.Pmdt25Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt25Resolver },
  },
  {
    path: 'version/history/:code',
    loadComponent: () => import('./rt/pmrt25/pmrt25.component').then((m) => m.Pmrt25Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmrt25Resolver },
  },

  // ===== Audit Log =====
  {
    path: 'audit',
    loadComponent: () => import('./rt/pmrt26/pmrt26.component').then((m) => m.Pmrt26Component),
    canActivate: [customerGuard],
    resolve: { pageData: pmrt26Resolver },
  },
];