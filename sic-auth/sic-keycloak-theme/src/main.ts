import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { bootstrapKcApplication } from './kc.gen';
import 'sic-ng/theme/all-themes.css';
import './global-overrides.css';

// Uncommented for local preview: `npm run start` renders login.ftl with a mock kcContext
// so we can see the sic-ng themed login page without a running Keycloak server.
// Comment this back out before building the real theme jar for production.
import { getKcContextMock } from './login/KcPageStory';

if (import.meta.env.DEV) {
  window.kcContext = getKcContextMock({
    pageId: 'login.ftl',
    overrides: {},
  });
}
(async () => {
  if (window.kcContext === undefined) {
    const { NoContextComponent } = await import('./no-context.component');

    bootstrapApplication(NoContextComponent, appConfig);

    return;
  }

  bootstrapKcApplication({
    kcContext: window.kcContext,
    bootstrapApplication: ({ KcRootComponent, kcProvider }) =>
      bootstrapApplication(KcRootComponent, {
        ...appConfig,
        providers: [...appConfig.providers, kcProvider],
      }),
  });
})();
