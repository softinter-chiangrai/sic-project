import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { BlogService } from './blog.service';
import { BlogForm } from './blog.form';
import { BlogModel, BlogPageData } from './blog.model';
import { SicFromData } from '../../../core/model/sic-from-data';

export const blogResolver: ResolveFn<BlogPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(BlogService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = BlogForm.createForm(fb);

  return {
    formData: new SicFromData<BlogModel>(form),
  };
};
