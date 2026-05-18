import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { SicInput } from './sic-input';

describe('SicInput', () => {
  let component: SicInput;
  let fixture: ComponentFixture<SicInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SicInput],
    }).compileComponents();

    fixture = TestBed.createComponent(SicInput);
    component = fixture.componentInstance;
    component.label = 'Name';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve default required message', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    control.markAsTouched();
    Object.defineProperty(component, 'control', { get: () => control });

    expect(component.showError).toBe(true);
    expect(component.errorMessage).toBe('This field is required.');
  });
});
