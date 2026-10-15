import { FormControl, FormGroup, Validators } from '@angular/forms';
import { endNotBeforeStart } from './date-range.validator';

const form = (startDate: string | null, endDate: string | null, startTime = '09:00', endTime = '18:00') =>
  new FormGroup(
    {
      startDate: new FormControl(startDate),
      endDate: new FormControl(endDate, Validators.required),
      startTime: new FormControl(startTime),
      endTime: new FormControl(endTime),
    },
    { validators: endNotBeforeStart('startDate', 'endDate', 'startTime', 'endTime') },
  );

describe('endNotBeforeStart', () => {
  it('an end day before the start day is an error on the end date', () => {
    const f = form('2026-10-16', '2026-10-15');
    expect(f.valid).toBe(false);
    expect(f.get('endDate')!.hasError('endBeforeStart')).toBe(true);
    expect(f.get('endTime')!.errors).toBeNull();
  });

  it('the same day with an earlier end time is an error on the end time; the same day and time is fine', () => {
    const f = form('2026-10-16', '2026-10-16', '13:00', '09:30');
    expect(f.get('endTime')!.hasError('endBeforeStart')).toBe(true);
    f.get('endTime')!.setValue('13:00');
    expect(f.valid).toBe(true);
  });

  it('compares the picked day, whatever format the value has (sic-datepicker ISO at UTC+7 vs a plain date)', () => {
    // 16 Oct picked in UTC+7 is stored as 2026-10-15T17:00Z
    expect(form('2026-10-15T17:00:00.000Z', '2026-10-16').valid).toBe(true);
    expect(form('2026-10-15T17:00:00.000Z', '2026-10-15').valid).toBe(false);
  });

  it('fixing the start clears the error and keeps the other errors of the end control', () => {
    const f = form('2026-10-16', '2026-10-15');
    f.get('startDate')!.setValue('2026-10-01');
    expect(f.valid).toBe(true);
    f.get('endDate')!.setValue(null);
    expect(f.get('endDate')!.hasError('required')).toBe(true);
  });

  it('reads a date typed as DD/MM/YYYY', () => {
    expect(form('16/10/2026', '15/10/2026').valid).toBe(false);
    expect(form('16/10/2026', '1/11/2026').valid).toBe(true);
  });

  it('missing values are left to the required validators', () => {
    expect(form(null, '2026-10-15').valid).toBe(true);
  });
});
