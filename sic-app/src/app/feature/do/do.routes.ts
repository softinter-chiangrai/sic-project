import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/feature',
        pathMatch: 'full'
    },
    {
        path: 'buddy',
        loadComponent: () => import('./buddy/buddy.component').then((m) => m.BuddyComponent),
        loadChildren: () => import('./buddy/buddy.routes').then((m) => m.BUDDY_ROUTES),
    }
];
