import { Subject } from 'rxjs';
import { provideNgxMask } from 'ngx-mask';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { TranslateModule } from '@ngx-translate/core';
import { Feature } from './feature';

// AuthService (a dependency of the page) talks to Keycloak in its constructor: give it an OAuthService that is logged out and never answers
const oauthStub = {
  configure: () => {}, setupAutomaticSilentRefresh: () => {}, logOut: () => {}, initCodeFlow: () => {}, refreshToken: () => Promise.reject(new Error('stub')),
  loadDiscoveryDocument: () => new Promise(() => {}), loadDiscoveryDocumentAndTryLogin: () => new Promise(() => {}), tryLoginCodeFlow: () => new Promise(() => {}),
  hasValidAccessToken: () => false, getAccessToken: () => '', getIdToken: () => '', getRefreshToken: () => '', getIdentityClaims: () => null,
  discoveryDocumentLoaded: false, loginUrl: '', state: '', events: new Subject(),
};

describe('Feature', () => {
  let component: Feature;
  let fixture: ComponentFixture<Feature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feature, TranslateModule.forRoot()],
      providers: [provideNgxMask(), provideRouter([]), provideHttpClient(), { provide: OAuthService, useValue: oauthStub }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Feature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
