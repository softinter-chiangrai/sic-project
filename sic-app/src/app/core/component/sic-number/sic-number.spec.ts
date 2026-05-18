import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SicNumber } from './sic-number';

describe('SicNumber', () => {
  let component: SicNumber;
  let fixture: ComponentFixture<SicNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(SicNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
