"use client";

import React from "react";
import { SolveResult } from "@/src/types";
import { pathToDirections } from "@/src/utils/WordHuntSolver";

type Props = {
  results: SolveResult[];
};

export default function WordList({ results }: Props) {
  const ordered = React.useMemo(() => {
    return [...results].sort((a, b) => b.score - a.score || b.word.length - a.word.length);
  }, [results]);
  return (
    <div className="w-full max-w-3xl card p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Words</h2>
        <span className="text-sm text-gray-400">{ordered.length} found</span>
      </div>
      <ul className="divide-y divide-white/10">
        {ordered.map((r) => {
          const { arrows, coords } = pathToDirections(r.path);
          return (
            <li key={r.word} className="p-3 hover:bg-white/5 rounded">
              <div className="flex items-center justify-between">
                <span className="font-mono uppercase tracking-wide">{r.word}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">{r.score}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400 font-mono flex flex-wrap gap-2">
                <span>{coords[0] ?? ""}</span>
                {arrows.map((a, i) => (
                  <span key={i}>{a} {coords[i + 1]}</span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


