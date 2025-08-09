"use client";

import React from "react";
import { SolveResult } from "@/src/types";
import { pathToDirections } from "@/src/utils/WordHuntSolver";

type Props = {
  results: SolveResult[];
};

export default function WordList({ results }: Props) {
  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Words</h2>
        <span className="text-sm text-gray-500">{results.length} found</span>
      </div>
      <ul className="divide-y rounded border">
        {results.map((r) => {
          const { arrows, coords } = pathToDirections(r.path);
          return (
            <li key={r.word} className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono uppercase">{r.word}</span>
                <span className="text-sm text-gray-600">{r.score}</span>
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


