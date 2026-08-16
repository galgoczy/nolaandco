import { Fragment, type ReactNode } from 'react';

/**
 * Az adminból szerkesztett blokk-szövegek egyszerű formázása:
 *  - új sor → sortörés,
 *  - **szöveg** → félkövér.
 * Szándékosan minimális — a blokkok tipográfiáját a komponens adja.
 */
export function renderInline(text: string): ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split('**').map((part, j) =>
        j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : <Fragment key={j}>{part}</Fragment>,
      )}
    </Fragment>
  ));
}

/** Mint a renderInline, de a sortörés csak mobilon él (hero gombfelirat). */
export function renderMobileBreaks(text: string): ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br className="md:hidden" />}
      {i > 0 && ' '}
      {line}
    </Fragment>
  ));
}
