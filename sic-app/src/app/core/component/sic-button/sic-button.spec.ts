import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SicButton } from './sic-button';

describe('SicButton', () => {
  let component: SicButton;
  let fixture: ComponentFixture<SicButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SicButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
