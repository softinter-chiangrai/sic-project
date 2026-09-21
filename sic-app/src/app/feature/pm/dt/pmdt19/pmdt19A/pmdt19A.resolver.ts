import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt19AService } from './pmdt19A.service';
import { Pmdt19AForm } from './pmdt19A.form';
import { DocumentVersionModel, Pmdt19APageData } from './pmdt19A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt19AResolver: ResolveFn<Pmdt19APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt19AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');
  const form = Pmdt19AForm.createForm(fb);

  const projectId = route.queryParams['projectId'];
  const documentType = route.queryParams['documentType'];
  const documentId = route.queryParams['documentId'];
  const documentCode = route.queryParams['documentCode'];
  if (projectId || documentType || documentId || documentCode) {
    form.patchValue({
      ...(projectId ? { projectId } : {}),
      ...(documentType ? { documentType } : {}),
      ...(documentId ? { documentId } : {}),
      ...(documentCode ? { documentCode } : {}),
    } as any);
  }

  if (!id) {
    return { formData: new SicFromData<DocumentVersionModel>(form), isEdit: false, id: null };
  }

  try {
    const data = await lastValueFrom(service.getVersion(id));
    if (!data) {
      router.navigate(['/not-found']);
      return { formData: new SicFromData<DocumentVersionModel>(form), isEdit: false, id: null };
    }
    form.patchValue(data as any);
    return {
      formData: new SicFromData<DocumentVersionModel>(form, form.getRawValue() as DocumentVersionModel),
      isEdit: true,
      id,
    };
  } catch (err) {
    console.error('Failed to load document version:', err);
    router.navigate(['/not-found']);
    return { formData: new SicFromData<DocumentVersionModel>(form), isEdit: false, id: null };
  }
};
