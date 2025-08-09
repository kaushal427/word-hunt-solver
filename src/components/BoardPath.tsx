"use client";

import React from "react";
import { Position } from "@/src/types";

type Props = {
  grid: string[][];
  path: Position[];
  title?: string;
  size?: number; // pixels (square)
};

function cellCenter(row: number, col: number, gridSize: number, size: number) {
  const cell = size / gridSize;
  const x = col * cell + cell / 2;
  const y = row * cell + cell / 2;
  return { x, y };
}

export default function BoardPath({ grid, path, title, size = 220 }: Props) {
  const gridSize = grid[0]?.length || 4;
  const cell = size / gridSize;

  return (
    <div className="flex flex-col items-center gap-2">
      {title && <div className="text-xs text-gray-300 font-mono truncate max-w-[220px]">{title}</div>}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Grid letters */}
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}
        >
          {grid.map((row, r) =>
            row.map((ch, c) => (
              <div
                key={`${r}-${c}`}
                className="flex items-center justify-center border border-white/15 text-white/70 text-lg font-semibold select-none"
              >
                {(ch || "").toUpperCase()}
              </div>
            ))
          )}
        </div>

        {/* Path overlay */}
        <svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {path.length >= 2 && (
            <polyline
              fill="none"
              stroke="#9E7BFF"
              strokeWidth={Math.max(6, cell * 0.18)}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={path
                .map(({ row, col }) => {
                  const { x, y } = cellCenter(row, col, gridSize, size);
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          )}
          {path.map(({ row, col }, i) => {
            const { x, y } = cellCenter(row, col, gridSize, size);
            const isStart = i === 0;
            const isEnd = i === path.length - 1;
            const r = Math.max(12, cell * 0.28);
            const fill = isStart ? "#4ADE80" : isEnd ? "#A78BFA" : "#94A3B8";
            return (
              <g key={`${row}-${col}-${i}`}>
                <circle cx={x} cy={y} r={r} fill={fill} opacity={0.9} />
                <circle cx={x} cy={y} r={r + 3} stroke="#0f172a" strokeWidth={2} fill="none" opacity={0.6} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}


