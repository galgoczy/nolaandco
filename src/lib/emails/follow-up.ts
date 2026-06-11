import { emailLayout } from './layout';

interface FollowUpData {
  customerName: string;
}

export function followUpSubject(): string {
  return 'Minden rendben a rendeléseddel? 🦌';
}

export function followUpHtml(data: FollowUpData): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${data.customerName}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Reméljük, már megérkezett az emlékőrződ, és azóta is éppen akkora örömöt lelsz benne, mint amikor kivetted a csomagolásból.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Szeretnénk biztosak lenni benne, hogy minden rendben van. Ha bármilyen kérdésed lenne a tisztítással vagy a használattal kapcsolatban, keress minket bátran.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Ha pedig szívesen megosztanál velünk egy pillanatot a poszterről, párnáról, (vagy a baba első „Nola-öleléséről"), annak nagyon örülnénk – a legjobb fotókat minden hónapban megosztjuk a közösségünkkel!
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#C4A591;">
      @nolaandco.baby &nbsp; #nolaandco
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szép napot kíván:<br />
      <strong>Kriszti – Nola & Co.</strong>
    </p>`;
  return emailLayout(body);
}
