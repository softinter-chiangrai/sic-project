import { up, down, E2E_DB } from './infra/db';
import { deleteSecondUser } from './infra/keycloak';
import { pointReportsAt, syncTemplates } from './infra/report-service';

// Point the backend at the throwaway DB before any test; drop it afterwards unless E2E_KEEP=1
// (VS Code sets E2E_KEEP so clicking single tests stays fast; run `npm run e2e:down` to clean up).
// The report service is shared with the real app, so it is pointed back to the real DB after every run, even with E2E_KEEP.
export default async function () {
  await up();
  syncTemplates();
  await pointReportsAt(E2E_DB);
  return async () => {
    await pointReportsAt('sic_app');
    if (!process.env['E2E_KEEP']) {
      await deleteSecondUser();
      await down();
    }
  };
}
