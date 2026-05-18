import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SicSidebar } from './sic-sidebar';

describe('SicSidebar', () => {
  let component: SicSidebar;
  let fixture: ComponentFixture<SicSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SicSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
