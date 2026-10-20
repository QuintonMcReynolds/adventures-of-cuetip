// Pixel-art helpers shared by every drawing in the game: crisp shapes, dithered gradients, outlines.
"use strict";

const SW = 320, SH = 180;

const Px = {
  canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; },
  rect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
  ellipse(g, cx, cy, rx, ry, c) {
    g.fillStyle = c;
    for (let y = -ry; y <= ry; y++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
    }
  },
  // Scanline polygon fill on whole pixels, so edges stay crisp
  poly(g, pts, c) {
    g.fillStyle = c;
    let minY = Infinity, maxY = -Infinity;
    for (const [, y] of pts) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
        if ((y1 <= yc && y2 > yc) || (y2 <= yc && y1 > yc)) xs.push(x1 + ((yc - y1) / (y2 - y1)) * (x2 - x1));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const a = Math.round(xs[k]), b = Math.round(xs[k + 1]);
        if (b > a) g.fillRect(a, y, b - a, 1);
      }
    }
  },
  line(g, x0, y0, x1, y1, c) {
    g.fillStyle = c;
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      g.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  },
  rgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; },
  // Ordered-dither vertical gradient through a list of colors (the classic pixel-art sky)
  vgrad(g, x, y, w, h, colors) {
    const img = g.getImageData(x, y, w, h), d = img.data, cs = colors.map(Px.rgb);
    for (let j = 0; j < h; j++) {
      const t = (j / Math.max(1, h - 1)) * (cs.length - 1);
      const i0 = Math.min(cs.length - 2, Math.floor(t)), f = t - i0;
      for (let i = 0; i < w; i++) {
        const c = f > BAYER[(j + y) & 3][(i + x) & 3] ? cs[i0 + 1] : cs[i0];
        const k = (j * w + i) * 4;
        d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255;
      }
    }
    g.putImageData(img, x, y);
  },
  // Dark 1px outline around every opaque shape: gives sprites the pixel-art look
  outline(src, color = "#07040f") {
    const w = src.width, h = src.height, out = Px.canvas(w, h), g = out.getContext("2d");
    const d = src.getContext("2d").getImageData(0, 0, w, h).data;
    const a = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
    g.fillStyle = color;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!a(x, y) && (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1))) g.fillRect(x, y, 1, 1);
    }
    g.drawImage(src, 0, 0);
    return out;
  },
  dim(src, alpha) {
    const c = Px.canvas(src.width, src.height), g = c.getContext("2d");
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = "source-atop";
    g.fillStyle = `rgba(7,4,15,${alpha})`; g.fillRect(0, 0, c.width, c.height);
    return c;
  },
};
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]].map((r) => r.map((v) => (v + 0.5) / 16));

function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }

