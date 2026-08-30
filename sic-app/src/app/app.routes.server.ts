import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'feature/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'management/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/**',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
