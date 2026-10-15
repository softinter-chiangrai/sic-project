import { DateTimeUtil } from './datetime.util';

describe('DateTimeUtil', () => {
  const saved = DateTimeUtil.getDefaults();
  afterEach(() => DateTimeUtil.setDefaults(saved));

  it('shows "-" for an empty value', () => {
    expect(DateTimeUtil.formatDate(null)).toBe('-');
    expect(DateTimeUtil.formatDateTime(undefined)).toBe('-');
    expect(DateTimeUtil.formatDate('')).toBe('-');
  });

  it('converts UTC to the configured offset (UTC+7 moves 18:00Z to the next day)', () => {
    DateTimeUtil.setDefaults({ era: 'en', offset: 7 });
    expect(DateTimeUtil.formatDate('2026-03-26T18:00:00Z', 'YYYY-MM-DD')).toBe('2026-03-27');
    expect(DateTimeUtil.formatDateTime('2026-03-26T18:00:00Z', 'YYYY-MM-DD HH:mm')).toBe('2026-03-27 01:00');
  });

  it('a per-call offset wins over the default', () => {
    DateTimeUtil.setDefaults({ era: 'en', offset: 7 });
    expect(DateTimeUtil.formatDateTime('2026-03-26T18:00:00Z', 'YYYY-MM-DD HH:mm', 0)).toBe('2026-03-26 18:00');
  });

  it('Thai era prints the Buddhist year (+543), English era the Gregorian year', () => {
    DateTimeUtil.setDefaults({ era: 'th' });
    expect(DateTimeUtil.formatDate('2026-03-27T00:00:00Z', 'YYYY')).toBe('2569');
    DateTimeUtil.setDefaults({ era: 'en' });
    expect(DateTimeUtil.formatDate('2026-03-27T00:00:00Z', 'YYYY')).toBe('2026');
  });

  it('setDefaults ignores values of the wrong type or empty strings', () => {
    DateTimeUtil.setDefaults({ offset: Number.NaN, era: 'xx' as any, dateFormat: '  ', dateTimeFormat: '' });
    expect(DateTimeUtil.getDefaults()).toEqual(saved);
  });

  it('resolve* fall back to the defaults for bad input', () => {
    expect(DateTimeUtil.resolveOffset(null)).toBe(DateTimeUtil.getDefaults().offset);
    expect(DateTimeUtil.resolveOffset(3)).toBe(3);
    expect(DateTimeUtil.resolveEra('xx' as any)).toBe(DateTimeUtil.getDefaults().era);
    expect(DateTimeUtil.resolveDateFormat('  ')).toBe(DateTimeUtil.getDefaults().dateFormat);
  });

  it('setEra tells subscribers', () => {
    const seen: string[] = [];
    const sub = DateTimeUtil.onEraChange().subscribe((e) => seen.push(e));
    DateTimeUtil.setEra('en');
    sub.unsubscribe();
    expect(seen).toEqual(['en']);
  });

  it('toInstantIsoString: a date-only string becomes an ISO instant, junk becomes null', () => {
    expect(DateTimeUtil.toInstantIsoString(null)).toBeNull();
    expect(DateTimeUtil.toInstantIsoString('not a date')).toBeNull();
    expect(DateTimeUtil.toInstantIsoString(new Date('x'))).toBeNull();
    expect(DateTimeUtil.toInstantIsoString(new Date('2027-07-31T00:00:00.000Z'))).toBe('2027-07-31T00:00:00.000Z');
    expect(DateTimeUtil.toInstantIsoString('2027-07-31')).toMatch(/^2027-07-3[01]T.*Z$/);
  });
});
