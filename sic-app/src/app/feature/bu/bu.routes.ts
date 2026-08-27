import { Routes } from '@angular/router';
import { burt01Resolver } from './rt/burt01/burt01.resolver';
import { burt03Resolver } from './rt/burt03/burt03.resolver';
import { burt04Resolver } from './rt/burt04/burt04.resolver';
import { burt04AResolver } from './rt/burt04/burt04A/burt04A.resolver';
import { burt05Resolver } from './rt/burt05/burt05.resolver';
import { burt05AResolver } from './rt/burt05/burt05A/burt05A.resolver';
import { burt06Resolver } from './rt/burt06/burt06.resolver';
import { burt06AResolver } from './rt/burt06/burt06A/burt06A.resolver';
import { burp01Resolver } from './rp/burp01/burp01.resolver';
import { CanDeactivateGuard } from '../../core/guard/can-deactivate.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/feature',
    pathMatch: 'full',
  },
  {
    path: 'info',
    loadComponent: () => import('./rt/burt01/burt01.component').then((m) => m.Burt01Component),
    resolve: { form: burt01Resolver },
  },

  // ===== BURT02 - Role & Permission Management =====
  {
    path: 'permission',
    loadComponent: () => import('./rt/burt02/burt02.component').then((m) => m.Burt02Component),
  },
  {
    path: 'permission/:id',
    loadComponent: () =>
      import('./rt/burt02/burt02A/burt02A.component').then((m) => m.Burt02AComponent),
  },

  // ===== BURT03 - Role Management =====
  {
    path: 'role',
    loadComponent: () => import('./rt/burt03/burt03.component').then((m) => m.Burt03Component),
    resolve: { form: burt03Resolver },
  },

  // ===== BURT04 - Team Management =====
  {
    path: 'team',
    loadComponent: () => import('./rt/burt04/burt04.component').then((m) => m.Burt04AComponent),
    resolve: { form: burt04Resolver },
  },
  {
    path: 'team/:id/edit',
    loadComponent: () =>
      import('./rt/burt04/burt04A/burt04A.component').then((m) => m.Burt04AComponent),
    resolve: { form: burt04AResolver },
  },
  {
    path: 'team/add',
    redirectTo: '/management/business/invite',
    pathMatch: 'full',
  },

  // ===== BURT05 - Program Management =====
  {
    path: 'program',
    loadComponent: () => import('./rt/burt05/burt05.component').then((m) => m.Burt05Component),
    resolve: { form: burt05Resolver },
  },
  {
    path: 'program/new',
    loadComponent: () =>
      import('./rt/burt05/burt05A/burt05A.component').then((m) => m.Burt05AComponent),
    resolve: { form: burt05AResolver },
  },
  {
    path: 'program/:id/edit',
    loadComponent: () =>
      import('./rt/burt05/burt05A/burt05A.component').then((m) => m.Burt05AComponent),
    resolve: { form: burt05AResolver },
  },

  // ===== BURT06 - Member / Flow =====
  {
    path: 'approval-flow',
    loadComponent: () => import('./rt/burt06/burt06.component').then((m) => m.Burt06Component),
    resolve: { form: burt06Resolver },
  },
  {
    path: 'approval-flow/new',
    loadComponent: () => import('./rt/burt06/burt06A/burt06A.component').then((m) => m.Burt06AComponent),
    resolve: { form: burt06AResolver },
  },
  {
    path: 'approval-flow/:id/edit',
    loadComponent: () => import('./rt/burt06/burt06A/burt06A.component').then((m) => m.Burt06AComponent),
    resolve: { form: burt06AResolver },
  },

  // ===== BURP01 - Activity Log =====
  {
    path: 'activity-log',
    loadComponent: () => import('./rp/burp01/burp01.component').then((m) => m.Burp01Component),
    resolve: { form: burp01Resolver },
  },

  // ===== Business Invite =====
  {
    path: 'invite',
    loadComponent: () =>
      import('../../management/business/business-invite/business-invite.component').then(
        (m) => m.BusinessInviteComponent,
      ),
  },
];