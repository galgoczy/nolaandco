/**
 * Minimal safe rich-text renderer for product descriptions.
 *
 * Supports a tiny markdown-like syntax:
 *   **bold**       → <strong>
 *   *italic*       → <em>
 *   __underline__  → <u>
 *   \n             → <br />
 *
 * Input is HTML-escaped first, so raw HTML in the source never reaches the
 * browser — only the controlled tags above are emitted.
 */
export function renderRichText(input: string | null | undefined): string {
  if (!input) return '';

  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return escaped
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_\n]+)__/g, '<u>$1</u>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\r?\n/g, '<br />');
}
