import { SicStripHtmlPipe } from './sic-strip-html.pipe';

describe('SicStripHtmlPipe', () => {
  const pipe = new SicStripHtmlPipe();

  it('returns an empty string for null, undefined and empty input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('removes tags and keeps the text', () => {
    expect(pipe.transform('<p>สวัสดี <b>ครับ</b></p>')).toBe('สวัสดี ครับ');
  });

  it('decodes the common entities', () => {
    expect(pipe.transform('<p>A&nbsp;&amp;&nbsp;B &lt;C&gt; &quot;D&quot; &#39;E&#39;</p>')).toBe(`A & B <C> "D" 'E'`);
  });

  it('truncates with an ellipsis only when longer than maxLength', () => {
    expect(pipe.transform('<p>abcdefghij</p>', 5)).toBe('abcde...');
    expect(pipe.transform('<p>abcde</p>', 5)).toBe('abcde');
    expect(pipe.transform('<p>abcdefghij</p>', 0)).toBe('abcdefghij');
  });
});
