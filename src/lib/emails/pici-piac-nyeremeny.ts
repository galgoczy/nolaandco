import { emailLayout } from './layout';

interface PiciPiacPrizeData {
  prizeLabel: string;
  prizeDesc: string;
  isCoupon: boolean;
  code: string;
  shopUrl: string;
  cardUrl: string;
}

export function piciPiacPrizeSubject(): string {
  return 'A nyereményed a Pici Piacról 🎉';
}

export function piciPiacPrizeHtml(d: PiciPiacPrizeData): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Köszönjük, hogy meglátogattál a Pici Piacon! 🤍
    </h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Örülünk, hogy megálltál a standunknál és lekapartad a szelvényed.
      Ahogy ígértük, itt a nyereményed:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="background-color:#F5F4EF;border-radius:12px;padding:24px;">
          <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#4A4A4A;">${d.prizeLabel}</p>
          <p style="margin:0 0 14px;font-size:13px;color:#999;">${d.prizeDesc}</p>
          <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">
            ${d.isCoupon ? 'Kuponkódod' : 'Átvételi kódod'}
          </p>
          <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:3px;color:#C4A591;font-family:monospace;">${d.code}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      ${
        d.isCoupon
          ? 'A kódot a webshopunk pénztáránál tudod beváltani. Nézz szét a termékeink között — van pár újdonság, amit a vásáron is láthattál:'
          : 'A nyereményed a standunknál veheted át — mutasd fel ezt a levelet vagy a kártyád oldalát. Addig is nézz szét a termékeink között:'
      }
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#C4A591;border-radius:8px;">
          <a href="${d.shopUrl}" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            Irány a termékek
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:13px;line-height:1.7;color:#999;">
      A kártyád oldalát bármikor újra megnyithatod: <a href="${d.cardUrl}" style="color:#C4A591;">${d.cardUrl}</a>
    </p>

    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br /><strong>A Nola &amp; Co. csapata</strong>
    </p>

    <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#999;">
      Ezt az egyszeri levelet azért kaptad, mert a kaparós szelvényed oldalán
      kérted, hogy elküldjük a nyereményed. A címedet nem adtuk hozzá a hírlevelünkhöz.
    </p>`;

  return emailLayout(body);
}
