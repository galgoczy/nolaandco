import { PREORDER_LABEL, heightLine, weightLine } from '@/lib/weightedPillow';

export type PillowLine = {
  pillow?: boolean;
  weighted?: boolean;
  weightedStatus?: string | null;
  productionNote?: string | null;
  birthWeight?: string | null;
  birthHeight?: string | null;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Emlékpárna-tétel részletei az e-mailekben: születési hossz és súly, a
 * súlyarányosnál előrendelési jelzés és a rendeléskor vállalt tájékoztató.
 */
export function pillowDetailsHtml(item: PillowLine): string {
  if (!item.pillow) return '';
  const parts: string[] = [];
  if (item.birthHeight) parts.push(esc(heightLine(item.birthHeight)));
  if (item.birthWeight) parts.push(esc(weightLine(item.birthWeight, item.weighted)));
  let html = parts.map((p) => `<br/><span style="font-size:12px;color:#999;">${p}</span>`).join('');
  if (item.weighted && item.weightedStatus === 'preorder') {
    html += `<br/><span style="font-size:12px;color:#B5651D;font-weight:600;">${PREORDER_LABEL}</span>`;
  }
  if (item.weighted && item.productionNote) {
    html += `<br/><span style="font-size:12px;color:#999;">${esc(item.productionNote)}</span>`;
  }
  return html;
}
