import { Routes } from '@angular/router';
import { burt01Resolver } from './rt/burt01/burt01.resolver';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/feature',
        pathMatch: 'full'
    },
    {
        path: 'burt01',
        loadComponent: () => import('./rt/burt01/burt01.component').then((m) => m.Burt01Component),
        resolve: { form: burt01Resolver },
    },
    {
        path: 'burt02',
        loadComponent: () => import('./rt/burt02/burt02.component').then((m) => m.Burt02Component)
    },
    {
        path: 'burt03',
        loadComponent: () => import('./rt/burt03/burt03.component').then((m) => m.Burt03Component)
    },
    {
        path: 'burt04',
        loadComponent: () => import('./rt/burt04/burt04.component').then((m) => m.Burt04Component)
    },
    {
        path: 'burp01',
        loadComponent: () => import('./rp/burp01/burp01.component').then((m) => m.Burp01Component)
    }
];
