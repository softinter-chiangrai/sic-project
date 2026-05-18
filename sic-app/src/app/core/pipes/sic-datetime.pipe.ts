// src/app/shared/pipes/user-datetime.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DateTimeUtil } from '../utils/datetime.util';

@Pipe({
  name: 'sicDateTime',
})
export class SicDateTimePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    userOffset?: number | null,
    format?: string | null
  ): string {
    return DateTimeUtil.formatDateTime(value, format, userOffset);
  }
}
