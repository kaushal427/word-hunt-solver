"use client";

import React from "react";
import { SolveResult } from "@/src/types";
import BoardPath from "@/src/components/BoardPath";

type Props = {
  grid: string[][];
  results: SolveResult[];
};

const SIZE_MAP: Record<string, number> = {
  compact: 160,
  cozy: 200,
  comfortable: 240,
};

export default function Gallery({ grid, results }: Props) {
  const [count, setCount] = React.useState(24);
  const [sizeKey, setSizeKey] = React.useState<keyof typeof SIZE_MAP>("cozy");
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setCount(24);
  }, [results]);

  React.useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCount((c) => Math.min(c + 24, results.length));
        }
      });
    }, { rootMargin: "512px" });
    obs.observe(node);
    return () => obs.disconnect();
  }, [results.length]);

  const displayed = results.slice(0, count);
  const size = SIZE_MAP[sizeKey];

  return (
    <div className="w-full max-w-6xl">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-400">{results.length} words</div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Tile size</label>
          <select
            value={sizeKey}
            onChange={(e) => setSizeKey(e.target.value as any)}
            className="bg-transparent border rounded px-2 py-1 text-sm"
          >
            <option value="compact">Compact</option>
            <option value="cozy">Cozy</option>
            <option value="comfortable">Comfortable</option>
          </select>
          <button
            className="text-xs border rounded px-2 py-1 hover:bg-white/10"
            onClick={() => setCount(results.length)}
          >
            Load all
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayed.map((r) => (
          <BoardPath key={`${r.word}-${r.path.length}`} grid={grid} path={r.path} title={`${r.word.toLowerCase()} • ${r.score}`} size={size} />
        ))}
      </div>
      {count < results.length && (
        <div ref={loadMoreRef} className="h-16 flex items-center justify-center text-sm text-gray-500">
          Loading more…
        </div>
      )}
    </div>
  );
}


