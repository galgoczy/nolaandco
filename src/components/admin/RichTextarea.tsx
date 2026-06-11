'use client';

import { useRef } from 'react';

interface RichTextareaProps {
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

/**
 * Textarea with a minimal formatting toolbar (bold / italic / underline).
 * The selected text (or caret position) gets wrapped in markdown-style tokens:
 *   **bold**, *italic*, __underline__
 * The output markdown is stored as-is; rendering happens via renderRichText().
 */
export default function RichTextarea({
  value,
  onChange,
  required,
  placeholder,
  minHeight = '120px',
  className = '',
}: RichTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(token: string, placeholder = 'szöveg') {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end) || placeholder;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const next = `${before}${token}${selected}${token}${after}`;
    onChange(next);
    // restore selection to the newly wrapped content
    requestAnimationFrame(() => {
      const el2 = ref.current;
      if (!el2) return;
      const selStart = start + token.length;
      const selEnd = selStart + selected.length;
      el2.focus();
      el2.setSelectionRange(selStart, selEnd);
    });
  }

  const btnCls =
    'px-2 py-1 rounded border border-outline-variant bg-white text-xs font-medium hover:bg-surface-container-high transition-colors';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => wrap('**')}
          className={`${btnCls} font-bold`}
          title="Félkövér (**szöveg**)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => wrap('*')}
          className={`${btnCls} italic`}
          title="Dőlt (*szöveg*)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => wrap('__')}
          className={`${btnCls} underline`}
          title="Aláhúzott (__szöveg__)"
        >
          U
        </button>
        <span className="text-[11px] text-on-surface/50 ml-1">
          Jelöld ki a szöveget, majd kattints. Vagy írd:{' '}
          <code>**félkövér**</code>, <code>*dőlt*</code>,{' '}
          <code>__aláhúzott__</code>
        </span>
      </div>
      <textarea
        ref={ref}
        className={className}
        style={{ minHeight }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}
