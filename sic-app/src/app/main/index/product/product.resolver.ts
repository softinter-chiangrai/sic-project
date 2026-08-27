import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ProductService } from './product.service';
import { ProductForm } from './product.form';
import { ProductModel, ProductPageData } from './product.model';
import { SicFromData } from '../../../core/model/sic-from-data';

export const productResolver: ResolveFn<ProductPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(ProductService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = ProductForm.createForm(fb);

  return {
    formData: new SicFromData<ProductModel>(form),
  };
};
