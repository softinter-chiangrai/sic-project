import { Routes } from '@angular/router';

export const BUDDY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full'
  },
  {
    path: 'chat',
    loadComponent: () => import('./buddy-chat/buddy-chat.component').then(m => m.BuddyChatComponent),
  },
  {
    path: 'documents',
    loadComponent: () => import('../rt/dort01/dort01.component').then(m => m.Dort01Component),
  },
  {
    path: 'documents/upload',
    loadComponent: () => import('../rt/dort02/dort02.component').then(m => m.Dort02Component),
  },
  {
    path: 'documents/:id',
    loadComponent: () => import('../rt/dort03/dort03.component').then(m => m.Dort03Component),
  },
  {
    path: 'categories',
    loadComponent: () => import('./category-management/category-management.component').then(m => m.CategoryManagementComponent),
  },
  {
    path: 'tags',
    loadComponent: () => import('./tag-management/tag-management.component').then(m => m.TagManagementComponent),
  },
  {
    path: 'context-management',
    loadComponent: () => import('./context-management/context-management.component').then(m => m.ContextManagementComponent),
  }
];
