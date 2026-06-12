import { inject} from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { Burt01FormData, Burt01Model } from './burt01.model';
import { Burt01Form } from './burt01.form';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { Burt01Service } from './burt01.service';

export const burt01Resolver: ResolveFn<Burt01FormData> = (route, state) => {

  const fb = inject(FormBuilder);
  const service = inject(Burt01Service);
  const router = inject(Router);
  const form = Burt01Form.createForm(fb);

  return service.getBusinessInfo().pipe(
    tap((data: Burt01Model) => {
      if (data) {
        form.patchValue(data);
      }
    }),
    map(() => ({
      businessInfo: new SicFromData<Burt01Model>(form),
    })),
    catchError(err => {
      console.error('Failed to load profile:', err);
      router.navigate(['/not-found']);
      return EMPTY;
    })
  );
}
