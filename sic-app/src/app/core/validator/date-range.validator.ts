import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import dayjs from '../dayjs';
import { DateTimeUtil } from '../utils/datetime.util';

export const END_BEFORE_START = 'endBeforeStart';

/** date value (ISO from sic-datepicker, 'YYYY-MM-DD', 'DD/MM/YYYY' typed in a text field, Date) -> 'YYYY-MM-DD', the day the user picked */
function dayOf(v: unknown): string | null {
  if (!v) return null;
  const typed = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(v).trim());
  if (typed) return `${typed[3]}-${typed[2].padStart(2, '0')}-${typed[1].padStart(2, '0')}`;
  const d = dayjs.utc(v as string | Date).utcOffset(DateTimeUtil.getDefaults().offset);
  return d.isValid() ? d.format('YYYY-MM-DD') : null;
}

function setError(control: AbstractControl | null, on: boolean) {
  if (!control) return;
  const { [END_BEFORE_START]: had, ...rest } = control.errors ?? {};
  if (on && !had) control.setErrors({ ...rest, [END_BEFORE_START]: true });
  if (!on && had) control.setErrors(Object.keys(rest).length ? rest : null);
}

/**
 * Form-group validator: the end (date + optional time) must not be earlier than the start. Equal is allowed.
 * The error is put on the control the user has to fix (end date, or end time when both days are the same) so it shows under that field,
 * and on the group so the form stays invalid.
 */
export function endNotBeforeStart(startDate = 'startDate', endDate = 'endDate', startTime?: string, endTime?: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const sd = dayOf(group.get(startDate)?.value);
    const ed = dayOf(group.get(endDate)?.value);
    const st = (startTime && group.get(startTime)?.value) || '';
    const et = (endTime && group.get(endTime)?.value) || '';
    const dayBefore = !!sd && !!ed && ed < sd;
    const timeBefore = !!sd && sd === ed && !!st && !!et && String(et).slice(0, 5) < String(st).slice(0, 5);
    setError(group.get(endDate), dayBefore);
    if (endTime) setError(group.get(endTime), timeBefore);
    return dayBefore || timeBefore ? { [END_BEFORE_START]: true } : null;
  };
}
