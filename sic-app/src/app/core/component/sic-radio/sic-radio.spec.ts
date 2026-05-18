import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';

import { SicRadio } from './sic-radio';

describe('SicRadio', () => {
  let component: SicRadio;
  let fixture: ComponentFixture<SicRadio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicRadio],
      providers: [provideHttpClient(), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SicRadio);
    component = fixture.componentInstance;
    component.options = [
      { value: 'yes', text: 'Yes' },
      { value: 'no', text: 'No' },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});