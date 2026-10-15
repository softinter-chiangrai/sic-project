import { ActivatedRoute } from '@angular/router';
import { resolveCustomerId, resolveProjectId, resolveRequirementId } from './resolve-context.util';

const routeWith = (queryParams: Record<string, string>) => ({ snapshot: { queryParams } }) as unknown as ActivatedRoute;

describe('resolve-context.util', () => {
  it('reads the id from the query string only', () => {
    const r = routeWith({ projectId: 'p1', customerId: 'c1', requirementId: 'r1' });
    expect(resolveProjectId(r)).toBe('p1');
    expect(resolveCustomerId(r)).toBe('c1');
    expect(resolveRequirementId(r)).toBe('r1');
  });

  it('a missing or empty param is null (all of the business shows)', () => {
    const r = routeWith({ projectId: '' });
    expect(resolveProjectId(r)).toBeNull();
    expect(resolveCustomerId(r)).toBeNull();
    expect(resolveRequirementId(r)).toBeNull();
  });
});
