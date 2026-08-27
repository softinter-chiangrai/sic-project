import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ContactService } from './contact.service';
import { ContactForm } from './contact.form';
import { ContactModel, ContactPageData } from './contact.model';
import { SicFromData } from '../../../core/model/sic-from-data';

export const contactResolver: ResolveFn<ContactPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(ContactService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = ContactForm.createForm(fb);

  return {
    formData: new SicFromData<ContactModel>(form),
  };
};
