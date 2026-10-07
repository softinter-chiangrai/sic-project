import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Pmdt19AService } from '../pmdt19A/pmdt19A.service';
import { DocumentVersionModel } from '../pmdt19A/pmdt19A.model';

export const pmdt19BResolver: ResolveFn<DocumentVersionModel | null> = (route) => {
  const router = inject(Router);
  const id = route.paramMap.get('id');
  if (!id) {
    router.navigate(['/not-found']);
    return null;
  }
  return inject(Pmdt19AService).getVersion(id).pipe(
    catchError((err) => {
      console.error('Failed to load document version:', err);
      router.navigate(['/not-found']);
      return of(null);
    }),
  );
};
