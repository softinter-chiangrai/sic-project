// src/app/feature/pm/dt/pmdt07/pmdt07.resolver.ts

import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, map, of, tap } from 'rxjs';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { Pmdt07Form } from './pmdt07.form';
import { Pmdt07Service } from './pmdt07.service';
import { PmSpecificationModel } from './pmdt07.model';

export const pmdt07Resolver: ResolveFn<PaginationResponse<PmSpecificationModel> | null> = (route) => {
    const service = inject(Pmdt07Service);
    const requirementId = route.queryParams['requirementId'] || undefined;

    // Always fetch all projects' specifications; navbar context filters client-side.
    // size bumped well above the default page size so the client has the (near-)full
    // dataset to filter against — see pmdt07.component.ts filteredSpecs / gridConfig.lazy.
    return service.getList({ requirementId, page: 0, size: 1000 }).pipe(
        catchError((err) => {
            console.error('pmdt07Resolver error:', err);
            return of(null);
        })
    );
};

export interface Pmdt07AResolvedPageData {
    specification: SicFromData<PmSpecificationModel>;
}

export const pmdt07CreateResolver: ResolveFn<Pmdt07AResolvedPageData> = (route) => {
    const fb = inject(FormBuilder);
    const form = Pmdt07Form.createForm(fb);

    const requirementId = route.queryParams['requirementId'];
    const diagramId = route.queryParams['diagramId'];

    if (requirementId) {
        form.patchValue({ generatedFromRequirementId: requirementId });
    }
    if (diagramId) {
        form.patchValue({ generatedFromDiagramId: diagramId });
    }

    return {
        specification: new SicFromData<PmSpecificationModel>(form)
    };
};

export const pmdt07EditResolver: ResolveFn<Pmdt07AResolvedPageData> = (route) => {
    const fb = inject(FormBuilder);
    const service = inject(Pmdt07Service);
    const router = inject(Router);
    const id = route.params['id'];
    const form = Pmdt07Form.createForm(fb);

    return service.getSpecification(id).pipe(
        map((data) => ({
            specification: new SicFromData<PmSpecificationModel>(form, data)
        })),
    catchError(() => {
        router.navigate(['/feature/pm/specification']);
        return EMPTY;
    })
    );
};