import { emailLayout } from './layout';

/** Utólag kiállított számla kísérőlevele (a PDF csatolmányként megy). */
export function invoiceEmailSubject(orderNumber: string): string {
  return `A rendelésed számlája – #${orderNumber}`;
}

export function invoiceEmailHtml(data: { customerName: string; orderNumber: string }): string {
  const name = data.customerName.replace(/</g, '&lt;');
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${name}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Csatoltuk a <strong>#${data.orderNumber}</strong> rendelésed számláját.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Ha kérdésed van, írj nekünk a
      <a href="mailto:rendeles@nolaandco.hu" style="color:#C4A591;text-decoration:none;">rendeles@nolaandco.hu</a> címre!
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br />
      <strong>A Nola & Co. csapata</strong>
    </p>`;
  return emailLayout(body);
}
