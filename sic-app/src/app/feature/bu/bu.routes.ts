import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/feature',
        pathMatch: 'full'
    },
    {
        path: 'budt01',
        loadComponent: () => import('./budt01/budt01.component').then((m) => m.Budt01Component)
    },
    {
        path: 'budt02',
        loadComponent: () => import('./budt02/budt02.component').then((m) => m.Budt02Component)
    },
    {
        path: 'budt03',
        loadComponent: () => import('./budt03/budt03.component').then((m) => m.Budt03Component)
    },
    {
        path: 'budt04',
        loadComponent: () => import('./budt04/budt04.component').then((m) => m.Budt04Component)
    }
];
