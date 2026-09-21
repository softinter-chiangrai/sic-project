// src/app/feature/pm/dt/pmdt08/pmdt08.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

import { SicFromData } from '../../../../core/model/sic-from-data';
import { Pmdt08Form } from './pmdt08.form';
import { Pmdt08PageData, Pmdt08Model } from './pmdt08.model';
import { DiscussionService } from './discussion.service';

// NOTE: the 'discussion' route has no :id param and the page (pmdt08.component.ts) is a
// project discussion feed (list of posts/replies), not a single-discussion edit form.
// This resolver preloads the first page of posts for the project so the component doesn't
// have to make its own initial HTTP call in ngOnInit. The empty edit-by-id form is kept in
// discussionData only for backward compatibility with Pmdt08Model/Pmdt08Form, which are not
// currently exercised by any route.
export const pmdt08Resolver: ResolveFn<Pmdt08PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const discussionService = inject(DiscussionService);

  const form = Pmdt08Form.createForm(fb);
  const discussionData = new SicFromData<Pmdt08Model>(form);

  const projectId = route.queryParamMap.get('projectId') || route.queryParamMap.get('id') || route.paramMap.get('projectId') || route.paramMap.get('id');

  if (!projectId) {
    return { discussionData, projectId: null, posts: [], totalElements: 0, totalPages: 0 };
  }

  try {
    const response = await lastValueFrom(discussionService.getPosts(projectId, 0, 10));
    return {
      discussionData,
      projectId,
      posts: response?.data || [],
      totalElements: response?.pageable?.totalElements || 0,
      totalPages: response?.pageable?.totalPages || 0,
    };
  } catch (err) {
    console.error('Failed to load discussion posts:', err);
    return { discussionData, projectId, posts: [], totalElements: 0, totalPages: 0 };
  }
};
