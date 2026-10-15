import { readLocalStorageList, readLocalStorageValue, writeLocalStorageList, writeLocalStorageValue } from './local-storage-list.util';

describe('local-storage-list.util', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('round-trips a list', () => {
    writeLocalStorageList('k', [{ a: 1 }, { a: 2 }]);
    expect(readLocalStorageList<{ a: number }>('k')).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('a missing key is an empty list', () => {
    expect(readLocalStorageList('nope')).toEqual([]);
  });

  it('a stored value that is not an array is an empty list', () => {
    localStorage.setItem('k', '{"a":1}');
    expect(readLocalStorageList('k')).toEqual([]);
  });

  it('corrupt JSON is an empty list and is logged, not thrown', () => {
    localStorage.setItem('k', '{broken');
    expect(readLocalStorageList('k')).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('a write that the browser refuses (quota) does not throw', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => writeLocalStorageList('k', [1])).not.toThrow();
    expect(() => writeLocalStorageValue('k', 'v')).not.toThrow();
  });

  it('value helpers use the fallback when the key is missing', () => {
    expect(readLocalStorageValue('x')).toBe('');
    expect(readLocalStorageValue('x', 'fb')).toBe('fb');
    writeLocalStorageValue('x', 'real');
    expect(readLocalStorageValue('x', 'fb')).toBe('real');
  });
});
