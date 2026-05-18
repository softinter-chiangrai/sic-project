// src/app/shared/utils/datetime.util.ts
import dayjs from '../../core/dayjs';
import { Subject } from 'rxjs';

export type CalendarEra = 'en' | 'th';
type DateTimeLocale = 'en' | 'th';

type DateTimeDefaults = {
  offset: number;
  era: CalendarEra;
  dateFormat: string;
  dateTimeFormat: string;
};

export class DateTimeUtil {
  static readonly DEFAULT_OFFSET = 7;
  static readonly DEFAULT_ERA: CalendarEra = 'th';
  static readonly DEFAULT_DATE_FORMAT = 'D MMMM YYYY';
  static readonly DEFAULT_DATE_TIME_FORMAT = 'D MMMM YYYY HH:mm:ss';

  private static readonly defaults: DateTimeDefaults = {
    offset: DateTimeUtil.DEFAULT_OFFSET,
    era: DateTimeUtil.DEFAULT_ERA,
    dateFormat: DateTimeUtil.DEFAULT_DATE_FORMAT,
    dateTimeFormat: DateTimeUtil.DEFAULT_DATE_TIME_FORMAT,
  };

  private static readonly eraChange$ = new Subject<CalendarEra>();

  static setDefaults(config: Partial<DateTimeDefaults>): void {
    if (typeof config.offset === 'number' && Number.isFinite(config.offset)) {
      this.defaults.offset = config.offset;
    }

    if (config.era === 'en' || config.era === 'th') {
      this.defaults.era = config.era;
    }

    if (typeof config.dateFormat === 'string' && config.dateFormat.trim()) {
      this.defaults.dateFormat = config.dateFormat.trim();
    }

    if (typeof config.dateTimeFormat === 'string' && config.dateTimeFormat.trim()) {
      this.defaults.dateTimeFormat = config.dateTimeFormat.trim();
    }
  }

  static setOffset(offset: number): void {
    this.setDefaults({ offset });
  }

  static setEra(era: CalendarEra): void {
    this.setDefaults({ era });
    this.eraChange$.next(era);
  }

  static setDateFormat(dateFormat: string): void {
    this.setDefaults({ dateFormat });
  }

  static setDateTimeFormat(dateTimeFormat: string): void {
    this.setDefaults({ dateTimeFormat });
  }

  static getDefaults(): Readonly<DateTimeDefaults> {
    return { ...this.defaults };
  }

  static onEraChange() {
    return this.eraChange$.asObservable();
  }

  static resolveOffset(userOffset?: number | null): number {
    return typeof userOffset === 'number' && Number.isFinite(userOffset)
      ? userOffset
      : this.defaults.offset;
  }

  static resolveEra(era?: CalendarEra | null): CalendarEra {
    return era === 'en' || era === 'th' ? era : this.defaults.era;
  }

  static resolveDateFormat(format?: string | null): string {
    return typeof format === 'string' && format.trim() ? format.trim() : this.defaults.dateFormat;
  }

  static resolveDateTimeFormat(format?: string | null): string {
    return typeof format === 'string' && format.trim()
      ? format.trim()
      : this.defaults.dateTimeFormat;
  }

  static formatDate(
    utcValue: string | Date | null | undefined,
    format?: string | null,
    userOffset?: number | null
  ): string {
    if (!utcValue) return '-';

    const offset = this.resolveOffset(userOffset);
    const era = this.resolveEra();
    const normalizedFormat = this.normalizeYearFormat(
      this.resolveDateFormat(format),
      era,
    );

    return dayjs
      .utc(utcValue)
      .utcOffset(offset)
      .locale(this.resolveLocale(era))
      .format(normalizedFormat);
  }
  
  static now(): Date {
    return dayjs.utc().toDate();
  }

  static formatDateTime(
    utcValue: string | Date | null | undefined,
    format?: string | null,
    userOffset?: number | null
  ): string {
    if (!utcValue) return '-';

    const offset = this.resolveOffset(userOffset);
    const era = this.resolveEra();
    const normalizedFormat = this.normalizeYearFormat(
      this.resolveDateTimeFormat(format),
      era,
    );

    return dayjs
      .utc(utcValue)
      .utcOffset(offset)
      .locale(this.resolveLocale(era))
      .format(normalizedFormat);
  }

  private static resolveLocale(era: CalendarEra): DateTimeLocale {
    return era === 'en' ? 'en' : 'th';
  }

  private static normalizeYearFormat(format: string, era: CalendarEra): string {
    if (era === 'th') {
      return format.replaceAll('YYYY', 'BBBB').replaceAll('YY', 'BB');
    }
    return format.replaceAll('BBBB', 'YYYY').replaceAll('BB', 'YY');
  }
}
