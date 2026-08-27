import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { SqlExportDialogService } from './sql-export-dialog.service';
import { SqlExportDialogForm } from './sql-export-dialog.form';
import { SqlExportDialogModel, SqlExportDialogPageData } from './sql-export-dialog.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const sql-export-dialogResolver: ResolveFn<SqlExportDialogPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(SqlExportDialogService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = SqlExportDialogForm.createForm(fb);

  return {
    formData: new SicFromData<SqlExportDialogModel>(form),
  };
};
