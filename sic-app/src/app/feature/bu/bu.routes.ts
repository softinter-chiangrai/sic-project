import { Routes } from '@angular/router';
import { burt01Resolver } from './rt/burt01/burt01.resolver';
import { burt02Resolver } from './rt/burt02/burt02.resolver';
import { burt02AResolver } from './rt/burt02/burt02A/burt02A.resolver';
import { burt03Resolver } from './rt/burt03/burt03.resolver';
import { burt04Resolver } from './rt/burt04/burt04.resolver';
import { burt04AResolver } from './rt/burt04/burt04A/burt04A.resolver';
import { burt05Resolver } from './rt/burt05/burt05.resolver';
import { burt05AResolver } from './rt/burt05/burt05A/burt05A.resolver';
import { burt06Resolver } from './rt/burt06/burt06.resolver';
import { burt06AResolver } from './rt/burt06/burt06A/burt06A.resolver';
import { CanDeactivateGuard } from '../../core/guard/can-deactivate.guard';

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

  // ===== BURT02 - Customer / Permission =====
  {
    path: 'burt02',
    loadComponent: () => import('./rt/burt02/burt02.component').then((m) => m.Burt02Component),
    resolve: { form: burt02Resolver },
  },
  {
    path: 'burt02/:id',
    loadComponent: () =>
      import('./rt/burt02/burt02A/burt02A.component').then((m) => m.Burt02AComponent),
    resolve: { form: burt02AResolver },
  },

  // ===== BURT03 - Role Management =====
  {
    path: 'burt03',
    loadComponent: () => import('./rt/burt03/burt03.component').then((m) => m.Burt03Component),
    resolve: { form: burt03Resolver },
  },

  // ===== BURT04 - Team Management =====
  {
    path: 'burt04',
    loadComponent: () => import('./rt/burt04/burt04.component').then((m) => m.Burt04AComponent),
    resolve: { form: burt04Resolver },
  },
  {
    path: 'burt04/:id/edit',
    loadComponent: () =>
      import('./rt/burt04/burt04A/burt04A.component').then((m) => m.Burt04AComponent),
    resolve: { form: burt04AResolver },
  },
  {
    path: 'burt04/add',
    redirectTo: '/management/business/invite',
    pathMatch: 'full',
  },

  // ===== BURT05 - Program Management =====
  {
    path: 'burt05',
    loadComponent: () => import('./rt/burt05/burt05.component').then((m) => m.Burt05Component),
    resolve: { form: burt05Resolver },
  },
  {
    path: 'burt05/new',
    loadComponent: () =>
      import('./rt/burt05/burt05A/burt05A.component').then((m) => m.Burt05AComponent),
    resolve: { form: burt05AResolver },
  },
  {
    path: 'burt05/:id/edit',
    loadComponent: () =>
      import('./rt/burt05/burt05A/burt05A.component').then((m) => m.Burt05AComponent),
    resolve: { form: burt05AResolver },
  },

  // ===== BURT06 - Member / Flow =====
  {
    path: 'burt06',
    loadComponent: () => import('./rt/burt06/burt06.component').then((m) => m.Burt06Component),
    resolve: { form: burt06Resolver },
  },
  {
    path: 'burt06/new',
    loadComponent: () => import('./rt/burt06/burt06A/burt06A.component').then((m) => m.Burt06AComponent),
    resolve: { form: burt06AResolver },
  },
  {
    path: 'burt06/:id/edit',
    loadComponent: () => import('./rt/burt06/burt06A/burt06A.component').then((m) => m.Burt06AComponent),
    resolve: { form: burt06AResolver },
  },

  // ===== BURP01 - Activity Log =====
  {
    path: 'burp01',
    loadComponent: () => import('./rp/burp01/burp01.component').then((m) => m.Burp01Component),
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