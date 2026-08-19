import { emailLayout } from './layout';

interface BackInStockData {
  productName: string;
  productUrl: string;
  imageUrl?: string | null;
  /** Egykattintásos leiratkozás linkje. */
  unsubscribeUrl: string;
}

export function backInStockSubject(productName: string): string {
  return `Újra kapható: ${productName}`;
}

export function backInStockHtml(data: BackInStockData): string {
  // A kis szériát szándékosan kimondjuk: több feliratkozó kaphatja ugyanazt a
  // levelet, mint ahány darab van, ezért jobb, ha ez nem érte meglepetésként.
  const image = data.imageUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td align="center">
            <a href="${data.productUrl}">
              <img src="${data.imageUrl}" alt="${data.productName}" width="360" style="display:block;width:100%;max-width:360px;height:auto;border-radius:6px;" />
            </a>
          </td>
        </tr>
      </table>`
    : '';

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Újra kapható, amire vártál 🤍
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Megkértél minket, hogy szóljunk, amint a <strong>${data.productName}</strong> újra
      elérhető. Megérkezett a műhelyünkből.
    </p>

    ${image}

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Minden darabunk kis szériában, kézzel készül, ezért egyszerre csak néhány
      elérhető belőle — és ezt a levelet többen is megkapták. Ha megtetszett,
      érdemes nem sokáig várni vele.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#C4A591;border-radius:8px;">
          <a href="${data.productUrl}" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            Megnézem a terméket
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br /><strong>A Nola &amp; Co. csapata</strong>
    </p>

    <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#999;">
      Ezt az egyszeri értesítőt azért kaptad, mert kérted, hogy szóljunk erről a
      termékről. A címedet nem adtuk hozzá a hírlevelünkhöz.
      <a href="${data.unsubscribeUrl}" style="color:#999;">Töröld az adataimat</a>
    </p>`;

  return emailLayout(body);
}
