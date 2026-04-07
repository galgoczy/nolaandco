import { emailLayout } from './layout';

interface OrderConfirmationData {
  customerName: string;
  orderId: string;
  orderUrl: string;
}

export function orderConfirmationSubject(): string {
  return 'Megkaptuk! Készül a Nola & Co emlékőrződ! 🦌';
}

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${data.customerName}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Köszönjük a rendelésedet! Nagyon örülünk, hogy minket választottál, hogy megőrizzük a legelső pillanatok emlékét.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      A rendelésedet (<strong>#${data.orderId.slice(-8).toUpperCase()}</strong>) rögzítettük, és műhelyünkben megkezdtük a baba születési adatainak feldolgozását. Amint az alkotás elkészült, küldünk egy újabb értesítést a csomagod útnak indításáról.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#C4A591;border-radius:8px;">
          <a href="${data.orderUrl}" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            Rendelés részletei
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Ha kérdésed merülne fel a gyártással kapcsolatban, írj nekünk a
      <a href="mailto:rendeles@nolaandco.hu" style="color:#C4A591;text-decoration:none;">rendeles@nolaandco.hu</a> címre!
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br />
      <strong>A Nola & Co. csapata</strong>
    </p>`;
  return emailLayout(body);
}
