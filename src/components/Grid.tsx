"use client";

import React from "react";

type Props = {
  grid: string[][];
  onChange: (grid: string[][]) => void;
};

export default function GridEditor({ grid, onChange }: Props) {
  const handleCellChange = (r: number, c: number, value: string) => {
    const letter = value.slice(-1).toLowerCase().replace(/[^a-z]/g, "");
    const next = grid.map((row) => [...row]);
    next[r][c] = letter;
    onChange(next);
  };

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))`, width: "min(420px, 100%)" }}>
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <input
            key={`${r}-${c}`}
            value={cell}
            maxLength={1}
            onChange={(e) => handleCellChange(r, c, e.target.value)}
            className="border rounded text-center p-3 uppercase tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))
      )}
    </div>
  );
}


