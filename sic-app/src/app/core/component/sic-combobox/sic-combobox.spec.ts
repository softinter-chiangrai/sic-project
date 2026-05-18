import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { SicCombobox } from './sic-combobox';

describe('SicCombobox', () => {
  let component: SicCombobox;
  let fixture: ComponentFixture<SicCombobox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicCombobox],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(SicCombobox);
    component = fixture.componentInstance;
    component.apiUrl = '/api/example/lov';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
