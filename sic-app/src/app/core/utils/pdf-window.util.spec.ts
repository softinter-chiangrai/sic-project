import { openPdfWindow } from './pdf-window.util';

describe('openPdfWindow', () => {
  const blob = new Blob(['%PDF'], { type: 'application/pdf' });

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:pdf');
  });
  afterEach(() => vi.restoreAllMocks());

  it('opens the tab at click time and shows the PDF in it later', () => {
    const tab = { closed: false, location: { href: 'about:blank' }, close: vi.fn() };
    const open = vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);

    const pdf = openPdfWindow();
    expect(open).toHaveBeenCalledWith('about:blank', '_blank');

    pdf.show(blob, 'REQ-001');
    expect(tab.location.href).toBe('blob:pdf');
  });

  it('downloads the file when the tab was blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const a = document.createElement('a');
    const click = vi.spyOn(a, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue(a);

    openPdfWindow().show(blob, 'REQ-001');

    expect(a.download).toBe('REQ-001.pdf');
    expect(click).toHaveBeenCalled();
  });

  it('closes the waiting tab when the export failed', () => {
    const tab = { closed: false, location: { href: '' }, close: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);

    openPdfWindow().close();

    expect(tab.close).toHaveBeenCalled();
  });
});
