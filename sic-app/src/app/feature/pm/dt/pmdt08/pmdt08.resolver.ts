// src/app/feature/pm/dt/pmdt08/pmdt08.resolver.ts

import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, map, of, tap } from 'rxjs';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { Pmdt08Form } from './pmdt08.form';

import { Pmdt08Service } from './pmdt08.service';
import { PmSpecificationModel } from './pmdt08.model';

export const pmdt08Resolver: ResolveFn<PaginationResponse<PmSpecificationModel> | null> = (route) => {
    const service = inject(Pmdt08Service);
    const customerState = inject(CustomerStateService);
    const projectId = route.queryParams['projectId'] || customerState.getProjectId();

    return service.getList({ projectId, page: 0, size: 10 }).pipe(
        catchError((err) => {
            console.error('pmdt08Resolver error:', err);
            return of(null);
        })
    );
};


export const pmdt08CreateResolver: ResolveFn<Pmdt08Form> = (route) => {
    const fb = inject(FormBuilder);
    const form = Pmdt08Form.createForm(fb);

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

export const pmdt08EditResolver: ResolveFn<Pmdt08Form> = (route) => {
    const fb = inject(FormBuilder);
    const service = inject(Pmdt08Service);
    const router = inject(Router);
    const id = route.params['id'];
    const form = Pmdt08Form.createForm(fb);

    return service.getSpecification(id).pipe(
        tap((data) => {
            form.patchValue(data);
            form.updateValueAndValidity();
        }),
        map(() => ({
            specification: new SicFromData<PmSpecificationModel>(form)
        })),
        catchError(() => {
            router.navigate(['/feature/pm/pmdt08']);
            return EMPTY;
        })
    );
};