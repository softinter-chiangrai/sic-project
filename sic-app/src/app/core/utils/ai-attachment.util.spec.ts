import { filesToAiAttachments } from './ai-attachment.util';

describe('filesToAiAttachments', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('turns a file into name + mime type + base64 without the data-URL prefix', async () => {
    const [a] = await filesToAiAttachments([new File(['hello'], 'a.txt', { type: 'text/plain' })]);
    expect(a.fileName).toBe('a.txt');
    expect(a.mimeType).toBe('text/plain');
    expect(a.base64Data).toBe(btoa('hello'));
  });

  it('a file without a type is sent as application/octet-stream', async () => {
    const [a] = await filesToAiAttachments([new File(['x'], 'blob')]);
    expect(a.mimeType).toBe('application/octet-stream');
  });

  it('skips a file over 8MB but keeps the others (no throw)', async () => {
    const big = new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'big.bin');
    const small = new File(['ok'], 'small.txt', { type: 'text/plain' });
    const out = await filesToAiAttachments([big, small]);
    expect(out.map((x) => x.fileName)).toEqual(['small.txt']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('no files gives an empty list', async () => {
    expect(await filesToAiAttachments([])).toEqual([]);
  });
});
