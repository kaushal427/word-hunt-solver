import { Dictionary, Grid, Path, Position, SolveResult } from "@/src/types";

function computeWordScore(word: string): number {
  const len = word.length;
  if (len <= 2) return 0;
  if (len === 3) return 100;
  if (len === 4) return 400;
  if (len === 5) return 800;
  if (len === 6) return 1400;
  if (len === 7) return 1800;
  return 2200;
}

export class WordHuntSolver {
  private readonly grid: Grid;
  private readonly numRows: number;
  private readonly numCols: number;
  private readonly dictionary: Dictionary;
  private readonly prefixSet: Set<string>;

  constructor(grid: Grid, dictionary: Dictionary) {
    // Normalize grid to lowercase and treat 'q' tile as 'qu' like Boggle/Word Hunt
    this.grid = grid.map((row) =>
      row.map((c) => {
        const lower = (c || "").toLowerCase();
        return lower === "q" ? "qu" : lower;
      })
    );
    this.numRows = this.grid.length;
    this.numCols = this.grid[0]?.length ?? 0;
    this.dictionary = dictionary;
    this.prefixSet = this.buildPrefixSet(dictionary);
  }

  private buildPrefixSet(dict: Dictionary): Set<string> {
    const set = new Set<string>();
    for (const word of dict) {
      for (let i = 1; i < word.length; i++) {
        set.add(word.slice(0, i));
      }
    }
    return set;
  }

  private getNeighbors(pos: Position): Position[] {
    const neighbors: Position[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = pos.row + dr;
        const c = pos.col + dc;
        if (r >= 0 && r < this.numRows && c >= 0 && c < this.numCols) {
          neighbors.push({ row: r, col: c });
        }
      }
    }
    return neighbors;
  }

  solve(minLength: number = 3): SolveResult[] {
    const results = new Map<string, SolveResult>();
    const visited: boolean[][] = Array.from({ length: this.numRows }, () =>
      Array.from({ length: this.numCols }, () => false)
    );

    const dfs = (pos: Position, current: string, path: Path) => {
      const nextWord = current + this.grid[pos.row][pos.col];

      if (!this.prefixSet.has(nextWord) && !this.dictionary.has(nextWord)) {
        // prune
        return;
      }

      visited[pos.row][pos.col] = true;
      path.push(pos);

      if (nextWord.length >= minLength && this.dictionary.has(nextWord)) {
        const score = computeWordScore(nextWord);
        const key = `${nextWord}`;
        const existing = results.get(key);
        if (!existing || score > existing.score) {
          results.set(key, { word: nextWord, path: [...path], score });
        }
      }

      for (const n of this.getNeighbors(pos)) {
        if (!visited[n.row][n.col]) {
          dfs(n, nextWord, path);
        }
      }

      path.pop();
      visited[pos.row][pos.col] = false;
    };

    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        dfs({ row: r, col: c }, "", []);
      }
    }

    return Array.from(results.values()).sort((a, b) => b.score - a.score || b.word.length - a.word.length || a.word.localeCompare(b.word));
  }
}

export async function loadDictionary(): Promise<Dictionary> {
  async function loadLocal(): Promise<string> {
    try {
      const res = await fetch("/dictionary.txt");
      if (!res.ok) return "";
      return await res.text();
    } catch {
      return "";
    }
  }

  async function loadRemote(): Promise<string> {
    // Large English word list (~4MB). Cached by the browser/CDN.
    const url = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt";
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error("Failed to fetch remote dictionary");
    return await res.text();
  }

  let text = await loadLocal();
  if (!text || text.trim().length < 10) {
    text = await loadRemote();
  }

  const words = text
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 3 && /^[a-z]+$/.test(w));

  return new Set(words);
}

export function pathToDirections(path: Path): { arrows: string[]; coords: string[] } {
  const arrows: string[] = [];
  const coords: string[] = [];
  const colToLetter = (c: number) => String.fromCharCode("A".charCodeAt(0) + c);
  for (let i = 0; i < path.length; i++) {
    const { row, col } = path[i];
    coords.push(`${colToLetter(col)}${row + 1}`);
    if (i === 0) continue;
    const prev = path[i - 1];
    const dr = row - prev.row;
    const dc = col - prev.col;
    // Map to arrow
    let arrow = "";
    if (dr === 0 && dc === 1) arrow = "→";
    else if (dr === 0 && dc === -1) arrow = "←";
    else if (dr === 1 && dc === 0) arrow = "↓";
    else if (dr === -1 && dc === 0) arrow = "↑";
    else if (dr === 1 && dc === 1) arrow = "↘";
    else if (dr === 1 && dc === -1) arrow = "↙";
    else if (dr === -1 && dc === 1) arrow = "↗";
    else if (dr === -1 && dc === -1) arrow = "↖";
    else arrow = "·";
    arrows.push(arrow);
  }
  return { arrows, coords };
}


