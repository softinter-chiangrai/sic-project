import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './core/auth/auth-callback.component';
import { authGuard } from './core/auth/auth.guard';
import { profileGuard } from './core/auth/profile.guard';
import { profileResolver } from './management/profile/profile.resolver';
import { businessGuard } from './core/auth/business.guard';
import { businessCreateResolver } from './management/business/business-create/business-create.resolver';
import { businessInviteResolver } from './management/business/business-invite/business-invite.resolver';
import { businessJoinResolver } from './management/business/business-join/business-join.resolver';
import { CanDeactivateGuard } from './core/guard/can-deactivate.guard';

export const routes: Routes = [
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },
  {
    path: '',
    loadComponent: () => import('./main/index/index.component').then((m) => m.Index),
    children: [
      {
        path: '',
        loadComponent: () => import('./main/index/home/home.component').then((m) => m.Home),
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./main/index/product/product.component').then((m) => m.Product),
      },
      {
        path: 'blog',
        loadComponent: () => import('./main/index/blog/blog.component').then((m) => m.Blog),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./main/index/contact/contact.component').then((m) => m.Contact),
      },
    ],
  },
  {
    path: 'feature',
    canActivate: [authGuard, profileGuard, businessGuard],
    loadComponent: () => import('./feature/feature.component').then((m) => m.Feature),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./feature/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'bu',
        loadChildren: () => import('./feature/bu/bu.routes').then((m) => m.routes),
      },
      {
        path: 'db',
        loadChildren: () => import('./feature/db/db.routes').then((m) => m.routes),
      },
      {
        path: 'su',
        loadChildren: () => import('./feature/bu/bu.routes').then((m) => m.routes),
      },
      {
        path: 'pm',
        loadChildren: () => import('./feature/pm/pm.routes').then((m) => m.PM_ROUTES),
      },
    ],
  },
  {
    path: 'management',
    canActivate: [authGuard],
    loadComponent: () => import('./management/management.component').then((m) => m.Management),
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./management/profile/profile.component').then((m) => m.Profile),
        resolve: { form: profileResolver },
      },
      {
        path: 'business',
        loadComponent: () =>
          import('./management/business/business.component').then((m) => m.BusinessComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./management/business/business-options/business-options.component').then(
                (m) => m.BusinessOptionsComponent,
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./management/business/business-create/business-create.component').then(
                (m) => m.BusinessCreateComponent,
              ),
            resolve: { form: businessCreateResolver },
            canDeactivate: [CanDeactivateGuard],
          },
          {
            path: 'join',
            loadComponent: () =>
              import('./management/business/business-join/business-join.component').then(
                (m) => m.BusinessJoinComponent,
              ),
            resolve: { form: businessJoinResolver },
            canDeactivate: [CanDeactivateGuard],
          },
          {
            path: 'invite',
            loadComponent: () =>
              import('./management/business/business-invite/business-invite.component').then(
                (m) => m.BusinessInviteComponent,
              ),
            resolve: { form: businessInviteResolver },
            canDeactivate: [CanDeactivateGuard],
          },
        ],
      },
    ],
  },
  {
    path: 'tutorial',
    loadComponent: () => import('./tutorial/tutorial.component').then((m) => m.TutorialComponent),
  },
];