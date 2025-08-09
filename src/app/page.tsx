"use client";

import React from "react";
import GridEditor from "@/src/components/Grid";
import WordList from "@/src/components/WordList";
import Gallery from "@/src/components/Gallery";
import { WordHuntSolver, loadDictionary } from "@/src/utils/WordHuntSolver";
import { ocrGridFromImage } from "@/src/utils/imageProcessor";
import { SolveResult } from "@/src/types";

export default function Home() {
  const [grid, setGrid] = React.useState<string[][]>([
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
  ]);
  const [results, setResults] = React.useState<SolveResult[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [ocrWarning, setOcrWarning] = React.useState<string | null>(null);
  const [ocrPreview, setOcrPreview] = React.useState<string | null>(null);
  const dictionaryRef = React.useRef<Set<string> | null>(null);
  const [view, setView] = React.useState<"list" | "gallery">("gallery");

  const ensureDictionary = React.useCallback(async () => {
    if (!dictionaryRef.current) {
      dictionaryRef.current = await loadDictionary();
    }
    return dictionaryRef.current;
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/process", { method: "POST", body: form });
      const json = await res.json();
      const dataUrl = json.dataUrl as string;
      setOcrPreview(dataUrl);
      const { grid: ocrGrid } = await ocrGridFromImage(dataUrl);
      setGrid(ocrGrid);
      const flat = ocrGrid.flat().filter(Boolean);
      setOcrWarning(flat.length < 16 ? `OCR captured ${flat.length}/16 letters. Please correct the grid manually.` : null);
    } finally {
      setBusy(false);
    }
  };

  const solve = async () => {
    setBusy(true);
    try {
      const dict = await ensureDictionary();
      const solver = new WordHuntSolver(grid, dict);
      setResults(solver.solve());
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setGrid([
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ]);
    setResults([]);
    setOcrPreview(null);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center gap-6">
      <header className="w-full max-w-6xl flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Word Hunt Solver</h1>
        <div className="flex gap-2 text-sm">
          <button onClick={() => setView("list")} className={`px-3 py-1 rounded border ${view === "list" ? "bg-white/10" : "bg-transparent"}`}>List</button>
          <button onClick={() => setView("gallery")} className={`px-3 py-1 rounded border ${view === "gallery" ? "bg-white/10" : "bg-transparent"}`}>Gallery</button>
        </div>
      </header>

      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">
        <div className="card p-4">
          <div className="flex flex-col gap-3 items-start">
            <label className="text-sm font-medium">Upload screenshot</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {ocrPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ocrPreview} alt="preview" className="w-64 rounded border border-white/10" />
            )}
            {ocrWarning && (
              <p className="text-yellow-400 text-sm max-w-xs">{ocrWarning}</p>
            )}
            <div className="flex gap-2">
              <button onClick={solve} disabled={busy} className="btn-primary disabled:opacity-50">{busy ? "Working..." : "Solve"}</button>
              <button onClick={reset} className="px-4 py-2 rounded border border-white/10">Reset</button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <GridEditor grid={grid} onChange={setGrid} />
        </div>
      </section>

      {view === "list" ? (
        <WordList results={results} />
      ) : (
        <Gallery grid={grid} results={results} />
      )}
    </div>
  );
}
