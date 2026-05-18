import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './core/auth/auth-callback.component';
import { authGuard } from './core/auth/auth.guard';
import { profileGuard } from './core/auth/profile.guard';
import { profileResolver } from './management/profile/profile.resolver';
import { businessGuard } from './core/auth/business.guard';
import { businessCreateResolver } from './management/business/business-create/business-create.resolver';
import { CanDeactivateGuard } from './core/guard/can-deactivate.guard';

export const routes: Routes = [
  { 
    path: 'auth/callback', 
    component: AuthCallbackComponent 
  },
  {
    path: '',
    loadComponent: () => import('./main/index/index').then((m) => m.Index),
    children: [
      {
        path: '',
        loadComponent: () => import('./main/index/home/home').then((m) => m.Home),
      },
      {
        path: 'product',
        loadComponent: () => import('./main/index/product/product').then((m) => m.Product),
      },
      {
        path: 'blog',
        loadComponent: () => import('./main/index/blog/blog').then((m) => m.Blog),
      },
      {
        path: 'contact',
        loadComponent: () => import('./main/index/contact/contact').then((m) => m.Contact),
      },
    ],
  },
  {
    path: 'feature',
    // canActivate: [authGuard],
    canActivate: [authGuard,profileGuard, businessGuard],
    loadComponent: () => import('./feature/feature').then((m) => m.Feature),
    children: [],
  },
  {
    path: 'management',
    canActivate: [authGuard],
    loadComponent: () => import('./management/management.component').then((m) => m.Management),
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./management/profile/profile.component').then((m) => m.Profile),
        resolve: { form: profileResolver },
      },
      {
        path: 'business',
        loadComponent: () => import('./management/business/business.component').then((m) => m.BusinessComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./management/business/business-options/business-options.component').then((m) => m.BusinessOptionsComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./management/business/business-create/business-create.component').then((m) => m.BusinessCreateComponent),
            resolve: { form: businessCreateResolver },
            canDeactivate: [CanDeactivateGuard]
          },
          {
            path: 'join',
            loadComponent: () => import('./management/business/business-join/business-join.component').then((m) => m.BusinessJoinComponent),
          }
        ],
      }
    ],
  },
  {
    path: 'tutorial',
    loadComponent: () => import('./tutorial/tutorial').then((m) => m.Tutorial),
  },
];
