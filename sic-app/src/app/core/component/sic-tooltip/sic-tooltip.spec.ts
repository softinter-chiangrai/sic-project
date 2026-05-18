import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SicTooltip } from './sic-tooltip';

describe('SicTooltip', () => {
  let component: SicTooltip;
  let fixture: ComponentFixture<SicTooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicTooltip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SicTooltip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
