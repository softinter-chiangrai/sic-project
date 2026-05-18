import { inject} from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { ProfileForm } from './profile.form';
import { ProfileService } from './profile.service';
import { EmailVerifyModel, ProfileFormData, ProfileModel } from './profile.model';
import { SicFromData } from '../../core/model/sic-from-data';

export const profileResolver: ResolveFn<ProfileFormData> = (route, state) => {

  const fb = inject(FormBuilder);
  const service = inject(ProfileService);
  const router = inject(Router);
  const form = ProfileForm.createForm(fb);
  const formVerify = ProfileForm.createVerifyForm(fb);

  return service.getProfile().pipe(
    tap((data: ProfileModel) => {
      if (data) {
        form.patchValue(data);
      }
    }),
    map(() => ({
      profile: new SicFromData<ProfileModel>(form),
      verify: new SicFromData<EmailVerifyModel>(formVerify)
    })),
    catchError(err => {
      console.error('Failed to load profile:', err);
      router.navigate(['/not-found']);
      return EMPTY;
    })
  );
}
