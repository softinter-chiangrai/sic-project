import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { NewDiagramDialogService } from './new-diagram-dialog.service';
import { NewDiagramDialogForm } from './new-diagram-dialog.form';
import { NewDiagramDialogModel, NewDiagramDialogPageData } from './new-diagram-dialog.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const new-diagram-dialogResolver: ResolveFn<NewDiagramDialogPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(NewDiagramDialogService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = NewDiagramDialogForm.createForm(fb);

  return {
    formData: new SicFromData<NewDiagramDialogModel>(form),
  };
};
