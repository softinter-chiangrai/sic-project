import { Routes } from '@angular/router';
import { burt01Resolver } from './rt/burt01/burt01.resolver';
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

  // ===== BURT02 - Permission Management =====
  {
    path: 'burt02',                         
    loadComponent: () => import('./rt/burt02/burt02.component').then((m) => m.Burt02Component),
  },
  {
    path: 'burt02/:id',                     
    loadComponent: () =>
      import('./rt/burt02/burt02A/burt02A.component').then((m) => m.Burt02AComponent),
  },

  // ===== BURT03 - Role Management =====
  {
    path: 'burt03',                         
    loadComponent: () => import('./rt/burt03/burt03.component').then((m) => m.Burt03Component),
  },

  // ===== BURT04 - Team Management =====
  {
    path: 'burt04',                         
    loadComponent: () => import('./rt/burt04/burt04.component').then((m) => m.Burt04AComponent),
  },
  {
    path: 'burt04/:id/edit',                
    loadComponent: () =>
      import('./rt/burt04/burt04A/burt04A.component').then((m) => m.Burt04AComponent),
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
  },
  {
    path: 'burt05/new',                     
    loadComponent: () =>
      import('./rt/burt05/burt05A/burt05A.component').then((m) => m.Burt05AComponent),
  },
  {
    path: 'burt05/:id/edit',                
    loadComponent: () =>
      import('./rt/burt05/burt05A/burt05A.component').then((m) => m.Burt05AComponent),
  },
  {
    path: 'burt05/:id/permissions',         
    loadComponent: () =>
      import('./rt/burt05/burt05A/burt05A.component').then((m) => m.Burt05AComponent),
  },
// sic-app/src/app/feature/bu/bu.routes.ts
{
  path: 'burt06',
  loadComponent: () => import('./rt/burt06/burt06.component').then((m) => m.Burt06Component),
},
{
  path: 'burt06/new',
  loadComponent: () => import('./rt/burt06/burt06A/burt06A.component').then((m) => m.Burt06AComponent),
},
{
  path: 'burt06/:id/edit',
  loadComponent: () => import('./rt/burt06/burt06A/burt06A.component').then((m) => m.Burt06AComponent),
},

  // ===== BURP01 - Activity Log =====
  {
    path: 'burp01',                         
    loadComponent: () => import('./rp/burp01/burp01.component').then((m) => m.Burp01Component),
  },

  // ===== Business Invite (ภายนอก) =====
  {
    path: 'invite',                         // ✅ ใช้ได้ผ่าน /feature/bu/invite
    loadComponent: () =>
      import('../../management/business/business-invite/business-invite.component').then(
        (m) => m.BusinessInviteComponent,
      ),
  },
];