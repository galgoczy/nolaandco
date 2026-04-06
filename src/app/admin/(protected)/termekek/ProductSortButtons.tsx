'use client';

import { useRouter } from 'next/navigation';

export default function ProductSortButtons({
  productId,
  isFirst,
  isLast,
  allIds,
  currentIdx,
}: {
  productId: string;
  isFirst: boolean;
  isLast: boolean;
  allIds: string[];
  currentIdx: number;
}) {
  const router = useRouter();

  async function move(dir: -1 | 1) {
    const swapIdx = currentIdx + dir;
    if (swapIdx < 0 || swapIdx >= allIds.length) return;

    // Build new order: swap sortOrder of current and target
    const order = allIds.map((id, i) => {
      if (i === currentIdx) return { id, sortOrder: swapIdx };
      if (i === swapIdx) return { id, sortOrder: currentIdx };
      return { id, sortOrder: i };
    });

    await fetch('/api/admin/products/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={isFirst}
        className="text-on-surface/60 hover:text-on-surface disabled:opacity-20 text-xs"
        aria-label="Fel"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        disabled={isLast}
        className="text-on-surface/60 hover:text-on-surface disabled:opacity-20 text-xs"
        aria-label="Le"
      >
        ▼
      </button>
    </div>
  );
}
