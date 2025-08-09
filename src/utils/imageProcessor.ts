import Tesseract from "tesseract.js";

export type OCRGridResult = {
  grid: string[][];
  rawText: string;
};

function normalizeLetter(char: string): string {
  const c = char.toLowerCase();
  if (c === "0") return "o";
  if (c === "1" || c === "l" || c === "i") return "i";
  if (c === "5") return "s";
  if (c === "2") return "z";
  return c;
}

export async function ocrGridFromImage(image: File | string, gridSize = 4): Promise<OCRGridResult> {
  // Better accuracy: crop the board and OCR each cell individually in single-char mode
  const canvas = (await resizeToMax(image, 900)) as HTMLCanvasElement | string;
  if (typeof window === "undefined" || typeof canvas === "string") {
    // Fallback to whole-image OCR in non-DOM env
    const { data } = await Tesseract.recognize(canvas, "eng", {
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    } as any);
    const rawText = (data.text || "").replace(/\s+/g, "");
    const letters = rawText.replace(/[^A-Za-z]/g, "").split("").map(normalizeLetter);
    const totalNeeded = gridSize * gridSize;
    while (letters.length < totalNeeded) letters.push("");
    const grid: string[][] = [];
    for (let r = 0; r < gridSize; r++) grid.push(letters.slice(r * gridSize, (r + 1) * gridSize));
    return { grid, rawText };
  }

  // DOM path: sample the inner square and split into cells
  const ctx = (canvas as HTMLCanvasElement).getContext("2d")!;
  const w = (canvas as HTMLCanvasElement).width;
  const h = (canvas as HTMLCanvasElement).height;
  const pad = Math.round(Math.min(w, h) * 0.06); // trim borders
  const innerX = pad, innerY = pad, innerW = w - pad * 2, innerH = h - pad * 2;
  const cellW = Math.floor(innerW / gridSize);
  const cellH = Math.floor(innerH / gridSize);

  const grid: string[][] = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => ""));

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const sx = innerX + c * cellW + Math.round(cellW * 0.15);
      const sy = innerY + r * cellH + Math.round(cellH * 0.15);
      const sw = Math.round(cellW * 0.7);
      const sh = Math.round(cellH * 0.7);

      const cellCanvas = document.createElement("canvas");
      cellCanvas.width = sw;
      cellCanvas.height = sh;
      const cellCtx = cellCanvas.getContext("2d")!;
      cellCtx.drawImage(canvas as HTMLCanvasElement, sx, sy, sw, sh, 0, 0, sw, sh);

      // Upscale per cell for clarity
      const upscale = document.createElement("canvas");
      upscale.width = sw * 2;
      upscale.height = sh * 2;
      const upCtx = upscale.getContext("2d")!;
      upCtx.imageSmoothingEnabled = true;
      upCtx.imageSmoothingQuality = "high";
      upCtx.drawImage(cellCanvas, 0, 0, upscale.width, upscale.height);

      const { data } = await Tesseract.recognize(upscale, "eng", {
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        tessedit_pageseg_mode: "10",
      } as any);
      const ch = (data.text || "").trim().replace(/[^A-Za-z]/g, "");
      grid[r][c] = normalizeLetter(ch[0] ?? "");
    }
  }

  const rawText = grid.flat().join("");
  return { grid, rawText };
}

async function resizeToMax(source: File | string, max: number): Promise<HTMLCanvasElement | string> {
  if (typeof window === "undefined") return source as string;
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas);
    };
    img.src = typeof source === "string" ? source : URL.createObjectURL(source);
  });
}


