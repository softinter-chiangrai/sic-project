import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sicStripHtml',
  standalone: true,
})
export class SicStripHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength?: number): string {
    if (!value) return '';
    // Strip HTML tags and entities
    const plainText = value
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    if (maxLength && maxLength > 0 && plainText.length > maxLength) {
      return plainText.substring(0, maxLength) + '...';
    }
    return plainText;
  }
}
