import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8080/realms/sic-project',
  clientId: 'sic-app',
  responseType: 'code',
  scope: 'openid profile email offline_access',
  strictDiscoveryDocumentValidation: false,
  requireHttps: false,
  showDebugInformation: true,
  timeoutFactor: 0.75,
  useSilentRefresh: false,
  redirectUri: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : '',
  postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : '',
};
