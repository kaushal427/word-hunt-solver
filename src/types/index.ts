export type Grid = string[][];

export type Position = {
  row: number;
  col: number;
};

export type Path = Position[];

export type SolveResult = {
  word: string;
  path: Path;
  score: number;
};

export type Dictionary = Set<string>;


