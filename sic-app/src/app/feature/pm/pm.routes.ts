// src/app/feature/pm/pm.routes.ts

import { Routes } from '@angular/router';
import { CanDeactivateGuard } from '../../core/guard/can-deactivate.guard';
import { customerGuard } from '../../core/guard/customer.guard';
import { projectGuard } from '../../core/guard/project.guard';
import { requirementGuard } from '../../core/guard/requirement.guard';

// PMDT Resolvers
import { pmdt01Resolver } from './dt/pmdt01/pmdt01.resolver';
import { pmdt01ACreateResolver, pmdt01AEditResolver } from './dt/pmdt01/pmdt01A/pmdt01A.resolver';
import { pmdt02Resolver } from './dt/pmdt02/pmdt02.resolver';
import { pmdt02AResolver } from './dt/pmdt02/pmdt02A/pmdt02A.resolver';
import { pmdt02BResolver } from './dt/pmdt02/pmdt02B/pmdt02B.resolver';
import { pmdt02CResolver } from './dt/pmdt02/pmdt02C/pmdt02C.resolver';
import { pmdt03Resolver } from './dt/pmdt03/pmdt03.resolver';
import { pmdt03AResolver } from './dt/pmdt03/pmdt03A/pmdt03A.resolver';
import { pmdt04Resolver } from './dt/pmdt04/pmdt04.resolver';
import { pmdt04AResolver } from './dt/pmdt04/pmdt04A/pmdt04A.resolver';
import { pmdt04BResolver } from './dt/pmdt04/pmdt04B/pmdt04B.resolver';
import { pmdt05Resolver } from './dt/pmdt05/pmdt05.resolver';
import { pmdt06Resolver } from './dt/pmdt06/pmdt06.resolver';
import { pmdt06AResolver } from './dt/pmdt06/pmdt06A/pmdt06A.resolver';
import { pmdt07Resolver, pmdt07CreateResolver, pmdt07EditResolver } from './dt/pmdt07/pmdt07.resolver';
import { pmdt07AResolver } from './dt/pmdt07/pmdt07A/pmdt07A.resolver';
import { pmdt08Resolver } from './dt/pmdt08/pmdt08.resolver';
import { pmdt09Resolver } from './dt/pmdt09/pmdt09.resolver';
import { pmdt09AResolver } from './dt/pmdt09/pmdt09A/pmdt09A.resolver';
import { pmdt11Resolver } from './dt/pmdt11/pmdt11.resolver';
import { pmdt12Resolver } from './dt/pmdt12/pmdt12.resolver';
import { pmdt12AResolver } from './dt/pmdt12/pmdt12A/pmdt12A.resolver';
import { pmdt12BResolver } from './dt/pmdt12/pmdt12B/pmdt12B.resolver';
import { pmdt14Resolver } from './dt/pmdt14/pmdt14.resolver';
import { pmdt14AResolver } from './dt/pmdt14/pmdt14A/pmdt14A.resolver';
import { pmdt15Resolver } from './dt/pmdt15/pmdt15.resolver';
import { pmdt15AResolver } from './dt/pmdt15/pmdt15A/pmdt15A.resolver';
import { pmdt16Resolver } from './dt/pmdt16/pmdt16.resolver';
import { pmdt16AResolver } from './dt/pmdt16/pmdt16A/pmdt16A.resolver';
import { pmdt17Resolver } from './dt/pmdt17/pmdt17.resolver';
import { pmdt17AResolver } from './dt/pmdt17/pmdt17A/pmdt17A.resolver';
import { pmdt18Resolver } from './dt/pmdt18/pmdt18.resolver';
import { pmdt18AResolver } from './dt/pmdt18/pmdt18A/pmdt18A.resolver';
import { pmdt19Resolver } from './dt/pmdt19/pmdt19.resolver';
import { pmdt19AResolver } from './dt/pmdt19/pmdt19A/pmdt19A.resolver';
import { pmdt20Resolver } from './dt/pmdt20/pmdt20.resolver';

// PMRT Resolvers
import { pmrt01Resolver } from './rt/pmrt01/pmrt01.resolver';
import { customerCreateResolver, customerEditResolver } from './rt/pmrt01/pmrt01A/pmrt01A.resolver';
import { pmrt02Resolver } from './rt/pmrt02/pmrt02.resolver';
import { pmrt02AResolver } from './rt/pmrt02/pmrt02A/pmrt02A.resolver';
import { pmrt03Resolver } from './rt/pmrt03/pmrt03.resolver';
import { pmrt04Resolver } from './rt/pmrt04/pmrt04.resolver';
import { pmrt04AResolver } from './rt/pmrt04/pmrt04A/pmrt04A.resolver';
import { pmrt04BResolver } from './rt/pmrt04/pmrt04B/pmrt04B.resolver';
import { pmrt05Resolver } from './rt/pmrt05/pmrt05.resolver';
import { pmrt06Resolver } from './rt/pmrt06/pmrt06.resolver';
import { pmrt07Resolver } from './rt/pmrt07/pmrt07.resolver';
import { ganttResolver } from '../../core/component/sic-gantt/gantt.resolver';

export const PM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rt/pmrt03/pmrt03.component').then(m => m.Pmrt03Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt03Resolver },
  },

  // ===== Customer =====
  {
    path: 'customer',
    loadComponent: () => import('./rt/pmrt01/pmrt01.component').then((m) => m.Pmrt01Component),
    resolve: { form: pmrt01Resolver },
  },
  {
    path: 'customer/new',
    loadComponent: () =>
      import('./rt/pmrt01/pmrt01A/pmrt01A.component').then((m) => m.Pmrt01AComponent),
    resolve: { form: customerCreateResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'customer/:id/edit',
    loadComponent: () =>
      import('./rt/pmrt01/pmrt01A/pmrt01A.component').then((m) => m.Pmrt01AComponent),
    resolve: { form: customerEditResolver },
    canDeactivate: [CanDeactivateGuard],
  },

  // ===== Project =====
  {
    path: 'project',
    loadComponent: () => import('./rt/pmrt02/pmrt02.component').then((m) => m.Pmrt02Component),
    canActivate: [customerGuard],
    resolve: { form: pmrt02Resolver },
  },
  {
    path: 'project/new',
    loadComponent: () =>
      import('./rt/pmrt02/pmrt02A/pmrt02A.component').then((m) => m.Pmrt02AComponent),
    canActivate: [customerGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { form: pmrt02AResolver },
  },
  {
    path: 'project/:id/edit',
    loadComponent: () =>
      import('./rt/pmrt02/pmrt02A/pmrt02A.component').then((m) => m.Pmrt02AComponent),
    canActivate: [customerGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { form: pmrt02AResolver },
  },

  // ===== Project Dashboard =====
  {
    path: 'project-dashboard',
    loadComponent: () => import('./rt/pmrt03/pmrt03.component').then((m) => m.Pmrt03Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt03Resolver },
  },

  // ===== Contract =====
  {
    path: 'contract',
    loadComponent: () => import('./rt/pmrt04/pmrt04.component').then((m) => m.Pmrt04Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt04Resolver },
  },
  {
    path: 'contract/new',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { form: pmrt04AResolver },
  },
  {
    path: 'contract/:id/edit',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { form: pmrt04AResolver },
  },
  {
    path: 'contract/:id/view',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04A/pmrt04A.component').then((m) => m.Pmrt04AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmrt04AResolver },
  },
  {
    path: 'contract/renew/:id',
    loadComponent: () =>
      import('./rt/pmrt04/pmrt04B/pmrt04B.component').then((m) => m.Pmrt04BComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { form: pmrt04BResolver },
  },

  // ===== Requirement Matrix =====
  {
    path: 'matrix',
    loadComponent: () => import('./rt/pmrt05/pmrt05.component').then(m => m.Pmrt05Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { pageData: pmrt05Resolver },
  },

  // ===== Executive Dashboard =====
  {
    path: 'executive-dashboard',
    loadComponent: () => import('./rt/pmrt06/pmrt06.component').then((m) => m.Pmrt06Component),
    canActivate: [customerGuard],
    resolve: { pageData: pmrt06Resolver },
  },

  // ===== Notification Center =====
  {
    path: 'notifications',
    loadComponent: () => import('./rt/pmrt07/pmrt07.component').then((m) => m.Pmrt07Component),
    resolve: { pageData: pmrt07Resolver },
  },

  // ============================================================
  // ===== PMDT01: PHASE MANAGEMENT =====
  // ============================================================
  {
    path: 'phase',
    loadComponent: () => import('./dt/pmdt01/pmdt01.component').then((m) => m.Pmdt01Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt01Resolver },
  },
  {
    path: 'phase/new',
    loadComponent: () =>
      import('./dt/pmdt01/pmdt01A/pmdt01A.component').then((m) => m.Pmdt01AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt01ACreateResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'phase/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt01/pmdt01A/pmdt01A.component').then((m) => m.Pmdt01AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt01AEditResolver },
    canDeactivate: [CanDeactivateGuard],
  },

  // ============================================================
  // ===== PMDT02: WBS & PHASE DETAIL =====
  // ============================================================
  {
    path: 'phase/:id',
    loadComponent: () => import('./dt/pmdt02/pmdt02.component').then((m) => m.Pmdt02Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt02Resolver },
  },
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

  // ============================================================
  // ===== PMDT03: APPROVAL CENTER =====
  // ============================================================
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

  // ============================================================
  // ===== PMDT04: REQUIREMENT MANAGEMENT =====
  // ============================================================
  {
    path: 'requirement',
    loadComponent: () => import('./dt/pmdt04/pmdt04.component').then((m) => m.Pmdt04Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt04Resolver },
  },
  {
    path: 'requirement/new',
    loadComponent: () =>
      import('./dt/pmdt04/pmdt04A/pmdt04A.component').then((m) => m.Pmdt04AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt04AResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'requirement/:id/edit',
    loadComponent: () =>
      import('./dt/pmdt04/pmdt04A/pmdt04A.component').then((m) => m.Pmdt04AComponent),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    data: { targetType: 'REQUIREMENT' },
    resolve: { form: pmdt04AResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'requirement/:id/view',
    loadComponent: () =>
      import('./dt/pmdt04/pmdt04A/pmdt04A.component').then((m) => m.Pmdt04AComponent),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { form: pmdt04AResolver },
  },
  {
    path: 'requirement/:id/approval',
    loadComponent: () =>
      import('./dt/pmdt04/pmdt04B/pmdt04B.component').then((m) => m.Pmdt04BComponent),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { form: pmdt04BResolver },
  },

  // ============================================================
  // ===== PMDT05: DIAGRAM MANAGEMENT =====
  // ============================================================
  {
    path: 'diagram',
    loadComponent: () => import('./dt/pmdt05/pmdt05.component').then((m) => m.Pmdt05Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { form: pmdt05Resolver },
  },

  // ============================================================
  // ===== PMDT06: CHANGE REQUEST =====
  // ============================================================
  {
    path: 'change-request',
    loadComponent: () => import('./dt/pmdt06/pmdt06.component').then(m => m.Pmdt06Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt06Resolver },
  },
  {
    path: 'change-request/new',
    loadComponent: () => import('./dt/pmdt06/pmdt06A/pmdt06A.component').then(m => m.Pmdt06AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { form: pmdt06AResolver },
  },
  {
    path: 'change-request/:id/edit',
    loadComponent: () => import('./dt/pmdt06/pmdt06A/pmdt06A.component').then(m => m.Pmdt06AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { form: pmdt06AResolver },
  },
  {
    path: 'change-request/:id/view',
    loadComponent: () => import('./dt/pmdt06/pmdt06A/pmdt06A.component').then(m => m.Pmdt06AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { form: pmdt06AResolver },
  },

  // ============================================================
  // ===== PMDT07: SPECIFICATION MANAGEMENT =====
  // ============================================================
  {
    path: 'specification',
    loadComponent: () => import('./dt/pmdt07/pmdt07.component').then(m => m.Pmdt07Component),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    resolve: { form: pmdt07Resolver },
  },
  {
    path: 'specification/new',
    loadComponent: () => import('./dt/pmdt07/pmdt07A/pmdt07A.component').then(m => m.Pmdt07AComponent),
    resolve: { form: pmdt07CreateResolver },
    canDeactivate: [CanDeactivateGuard],
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },
  {
    path: 'specification/:id/edit',
    loadComponent: () => import('./dt/pmdt07/pmdt07A/pmdt07A.component').then(m => m.Pmdt07AComponent),
    resolve: { form: pmdt07EditResolver },
    canDeactivate: [CanDeactivateGuard],
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },
  {
    path: 'specification/:id/view',
    loadComponent: () => import('./dt/pmdt07/pmdt07A/pmdt07A.component').then(m => m.Pmdt07AComponent),
    resolve: { form: pmdt07EditResolver },
    canActivate: [customerGuard, projectGuard, requirementGuard],
  },

  // ============================================================
  // ===== PMDT08: DISCUSSION =====
  // ============================================================
  {
    path: 'discussion',
    loadComponent: () => import('./dt/pmdt08/pmdt08.component').then((m) => m.Pmdt08Component),
    resolve: { form: pmdt08Resolver },
  },

  // ============================================================
  // ===== PMDT09: DESIGN REVIEW =====
  // ============================================================
  {
    path: 'design-review',
    loadComponent: () => import('./dt/pmdt09/pmdt09.component').then((m) => m.Pmdt09Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt09Resolver },
  },
  {
    path: 'design-review/new',
    loadComponent: () => import('./dt/pmdt09/pmdt09A/pmdt09A.component').then((m) => m.Pmdt09AComponent),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt09AResolver },
  },
  {
    path: 'design-review/:id/edit',
    loadComponent: () => import('./dt/pmdt09/pmdt09A/pmdt09A.component').then((m) => m.Pmdt09AComponent),
    canActivate: [customerGuard, projectGuard, requirementGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt09AResolver },
  },

  // ============================================================
  // ===== PMDT10: TASK BOARD =====
  // ============================================================
  {
    path: 'task-board',
    loadComponent: () => import('./dt/pmdt10/pmdt10.component').then((m) => m.Pmdt10Component),
    canActivate: [customerGuard, projectGuard],
  },

  // ============================================================
  // ===== PMDT11: GANTT SCHEDULE UPDATE =====
  // ============================================================
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
    loadComponent: () => import('./dt/pmdt11/pmdt11.component').then((m) => m.Pmdt11Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt11Resolver },
  },

  // ============================================================
  // ===== PMDT12: TEST MANAGEMENT =====
  // ============================================================
  {
    path: 'test-management',
    loadComponent: () => import('./dt/pmdt12/pmdt12.component').then((m) => m.Pmdt12Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt12Resolver },
  },
  {
    path: 'test-case/new',
    loadComponent: () => import('./dt/pmdt12/pmdt12A/pmdt12A.component').then((m) => m.Pmdt12AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt12AResolver },
  },
  {
    path: 'test-case/:id/edit',
    loadComponent: () => import('./dt/pmdt12/pmdt12A/pmdt12A.component').then((m) => m.Pmdt12AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt12AResolver },
  },
  {
    path: 'test-case/:id/view',
    loadComponent: () => import('./dt/pmdt12/pmdt12A/pmdt12A.component').then((m) => m.Pmdt12AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt12AResolver },
  },
  {
    path: 'test-execution/:id',
    loadComponent: () => import('./dt/pmdt12/pmdt12A/pmdt12A.component').then((m) => m.Pmdt12AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt12AResolver },
  },
  {
    path: 'test-scenario/new',
    loadComponent: () => import('./dt/pmdt12/pmdt12B/pmdt12B.component').then((m) => m.Pmdt12BComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt12BResolver },
  },
  {
    path: 'test-scenario/:id/edit',
    loadComponent: () => import('./dt/pmdt12/pmdt12B/pmdt12B.component').then((m) => m.Pmdt12BComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt12BResolver },
  },


  // ============================================================
  // ===== PMDT14: DELIVERY MANAGEMENT =====
  // ============================================================
  {
    path: 'delivery',
    loadComponent: () => import('./dt/pmdt14/pmdt14.component').then((m) => m.Pmdt14Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt14Resolver },
  },
  {
    path: 'delivery/new',
    loadComponent: () => import('./dt/pmdt14/pmdt14A/pmdt14A.component').then((m) => m.Pmdt14AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt14AResolver },
  },
  {
    path: 'delivery/:id/edit',
    loadComponent: () => import('./dt/pmdt14/pmdt14A/pmdt14A.component').then((m) => m.Pmdt14AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt14AResolver },
  },
  {
    path: 'delivery/:id/view',
    loadComponent: () => import('./dt/pmdt14/pmdt14A/pmdt14A.component').then((m) => m.Pmdt14AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt14AResolver },
  },

  // ============================================================
  // ===== PMDT15: USER MANUAL =====
  // ============================================================
  {
    path: 'manual',
    loadComponent: () => import('./dt/pmdt15/pmdt15.component').then((m) => m.Pmdt15Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt15Resolver },
  },
  {
    path: 'manual/new',
    loadComponent: () => import('./dt/pmdt15/pmdt15A/pmdt15A.component').then((m) => m.Pmdt15AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt15AResolver },
  },
  {
    path: 'manual/:id/edit',
    loadComponent: () => import('./dt/pmdt15/pmdt15A/pmdt15A.component').then((m) => m.Pmdt15AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt15AResolver },
  },

  // ============================================================
  // ===== PMDT16: INVOICE & PAYMENT =====
  // ============================================================
  {
    path: 'invoice',
    loadComponent: () => import('./dt/pmdt16/pmdt16.component').then((m) => m.Pmdt16Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt16Resolver },
  },
  {
    path: 'invoice/new',
    loadComponent: () => import('./dt/pmdt16/pmdt16A/pmdt16A.component').then((m) => m.Pmdt16AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt16AResolver },
  },
  {
    path: 'invoice/:id/edit',
    loadComponent: () => import('./dt/pmdt16/pmdt16A/pmdt16A.component').then((m) => m.Pmdt16AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt16AResolver },
  },
  {
    path: 'invoice/:id/view',
    loadComponent: () => import('./dt/pmdt16/pmdt16A/pmdt16A.component').then((m) => m.Pmdt16AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt16AResolver },
  },

  // ============================================================
  // ===== PMDT17: MA TICKET =====
  // ============================================================
  {
    path: 'ma-ticket',
    loadComponent: () => import('./dt/pmdt17/pmdt17.component').then((m) => m.Pmdt17Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt17Resolver },
  },
  {
    path: 'ma-ticket/new',
    loadComponent: () => import('./dt/pmdt17/pmdt17A/pmdt17A.component').then((m) => m.Pmdt17AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt17AResolver },
  },
  {
    path: 'ma-ticket/:id/edit',
    loadComponent: () => import('./dt/pmdt17/pmdt17A/pmdt17A.component').then((m) => m.Pmdt17AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt17AResolver },
  },
  {
    path: 'ma-ticket/:id/view',
    loadComponent: () => import('./dt/pmdt17/pmdt17A/pmdt17A.component').then((m) => m.Pmdt17AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt17AResolver },
  },

  // ============================================================
  // ===== PMDT18: RENEWAL MANAGEMENT =====
  // ============================================================
  {
    path: 'renewal',
    loadComponent: () => import('./dt/pmdt18/pmdt18.component').then((m) => m.Pmdt18Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt18Resolver },
  },
  {
    path: 'renewal/new',
    loadComponent: () => import('./dt/pmdt18/pmdt18A/pmdt18A.component').then((m) => m.Pmdt18AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt18AResolver },
  },
  {
    path: 'renewal/:id',
    loadComponent: () => import('./dt/pmdt18/pmdt18A/pmdt18A.component').then((m) => m.Pmdt18AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt18AResolver },
  },
  {
    path: 'renewal/:id/view',
    loadComponent: () => import('./dt/pmdt18/pmdt18A/pmdt18A.component').then((m) => m.Pmdt18AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt18AResolver },
  },

  // ============================================================
  // ===== PMDT19: DOCUMENT VERSION HISTORY =====
  // ============================================================
  {
    path: 'version',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt19Resolver },
  },
  {
    path: 'version/new',
    loadComponent: () => import('./dt/pmdt19/pmdt19A/pmdt19A.component').then((m) => m.Pmdt19AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt19AResolver },
  },
  {
    path: 'version/:id/edit',
    loadComponent: () => import('./dt/pmdt19/pmdt19A/pmdt19A.component').then((m) => m.Pmdt19AComponent),
    canActivate: [customerGuard, projectGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { pageData: pmdt19AResolver },
  },
  {
    path: 'version/:id/view',
    loadComponent: () => import('./dt/pmdt19/pmdt19A/pmdt19A.component').then((m) => m.Pmdt19AComponent),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt19AResolver },
  },
  {
    path: 'version/history/:code',
    loadComponent: () => import('./dt/pmdt19/pmdt19.component').then((m) => m.Pmdt19Component),
    canActivate: [customerGuard, projectGuard],
    resolve: { pageData: pmdt19Resolver },
  },

  // ============================================================
  // ===== PMDT20: AUDIT LOG =====
  // ============================================================
  {
    path: 'audit',
    loadComponent: () => import('./dt/pmdt20/pmdt20.component').then((m) => m.Pmdt20Component),
    canActivate: [customerGuard],
    resolve: { pageData: pmdt20Resolver },
  },
];