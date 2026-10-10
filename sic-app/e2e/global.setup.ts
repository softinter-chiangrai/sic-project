import { up, down } from './infra/db';
import { deleteSecondUser } from './infra/keycloak';

// Point the backend at the throwaway DB before any test; drop it afterwards unless E2E_KEEP=1
// (VS Code sets E2E_KEEP so clicking single tests stays fast; run `npm run e2e:down` to clean up).
export default async function () {
  await up();
  return async () => {
    if (!process.env['E2E_KEEP']) {
      await deleteSecondUser();
      await down();
    }
  };
}
