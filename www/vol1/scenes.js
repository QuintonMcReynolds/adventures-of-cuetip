// Backgrounds for Adventures of Cuetip. Each has a static layer (built once) and an animated draw(g, t).
"use strict";

function stars(g, n, seed, h = 100) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { g.fillStyle = r() < 0.15 ? "#ffffff" : "#c8c0e8"; g.fillRect(Math.floor(r() * SW), Math.floor(r() * h), 1, 1); }
}
function twinkle(g, t, n, seed, h = 100) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * SW), y = Math.floor(r() * h), ph = r() * 6;
    if (Math.sin(t * 2 + ph) > 0.7) { g.fillStyle = "#ffffff"; g.fillRect(x, y, 1, 1); g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
  }
}
function hills(g, y0, amp, color, seed, step = 16) {
  const r = rng(seed), pts = [[0, SH]];
  for (let x = 0; x <= SW + step; x += step) pts.push([x, y0 - r() * amp]);
  pts.push([SW, SH]);
  Px.poly(g, pts, color);
}
function pine(g, x, base, h, color) {
  for (let i = 0; i < 4; i++) { const w = h * 0.35 * (1 - i * 0.2), y = base - h * 0.25 * i; Px.poly(g, [[x - w, y], [x + w, y], [x, y - h * 0.4]], color); }
  Px.rect(g, x - 1, base, 2, 4, color);
}
function cottage(g, x, y, w, h, wall, roof, lit) {
  Px.rect(g, x, y, w, h, wall);
  Px.poly(g, [[x - 3, y], [x + w / 2, y - h * 0.7], [x + w + 3, y]], roof);
  Px.rect(g, x + w * 0.4, y + h * 0.45, w * 0.22, h * 0.55, "#1a0e08");
  if (lit) { Px.rect(g, x + 3, y + 4, 4, 4, "#ffd27a"); Px.rect(g, x + w - 7, y + 4, 4, 4, "#ffd27a"); }
}

const BACKGROUNDS = {
  title: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 140, ["#05030c", "#120a2a", "#2a1648", "#4a2060"]);
      stars(g, 110, 3, 120);
      hills(g, 128, 18, "#120a22", 5, 20);
      // the Star Tree, far away on the horizon
      Px.rect(g, 236, 96, 4, 26, "#2a1a3a");
      Px.ellipse(g, 238, 90, 22, 14, "#2a1a4a");
      Px.vgrad(g, 0, 140, SW, 40, ["#0a0614", "#030208"]);
      // a cliff in the foreground
      Px.poly(g, [[0, 180], [0, 132], [40, 128], [92, 134], [110, 146], [118, 180]], "#06040c");
    },
    draw(g, t) {
      twinkle(g, t, 20, 11, 120);
      for (let i = 0; i < 18; i++) {
        const a = 0.4 + 0.4 * Math.sin(t * 1.5 + i);
        g.fillStyle = `rgba(255,236,170,${a})`;
        g.fillRect(222 + ((i * 7) % 32), 82 + ((i * 5) % 16), 1, 1);
      }
      // a falling star every few seconds
      const p = (t % 6) / 6;
      if (p < 0.25) { const x = 90 + p * 600, y = 20 + p * 160; Px.line(g, x, y, x - 10, y - 3, "#ffffff"); }
      // Cuetip on the cliff, looking at the tree
      if (!this.cue) this.cue = classicCuetip(1);
      g.drawImage(this.cue, 56, 116 + Math.round(Math.sin(t * 2)));
    },
  },
  village: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 110, ["#0a0820", "#1a1440", "#2e2058"]);
      stars(g, 70, 4, 80);
      hills(g, 104, 16, "#160f30", 8, 24);
      Px.vgrad(g, 0, 120, SW, 60, ["#1e2a20", "#0e140e"]);
      cottage(g, 14, 96, 40, 28, "#3a2a40", "#5a2030", true);
      cottage(g, 74, 100, 34, 24, "#3a2a40", "#203a5a", true);
      cottage(g, 214, 98, 38, 26, "#3a2a40", "#5a2030", true);
      cottage(g, 270, 94, 42, 30, "#3a2a40", "#203a5a", false);
      Px.rect(g, 0, 124, SW, 2, "#2a3a2a");
      Px.line(g, 0, 70, 320, 76, "#3a2a20");
    },
    draw(g, t) {
      // festival lanterns strung across the square
      for (let i = 0; i < 16; i++) {
        const x = 10 + i * 20, y = 71 + Math.round(i * 0.37 + Math.sin(t * 1.5 + i) * 1.2);
        const c = ["#ff7a5a", "#ffd27a", "#7ad8ff"][i % 3];
        g.fillStyle = "rgba(255,210,140,0.12)"; g.fillRect(x - 3, y, 8, 8);
        Px.rect(g, x, y + 2, 3, 4, c);
      }
      twinkle(g, t, 12, 21, 80);
    },
  },
  mountain: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 130, ["#6a8ab8", "#a8b8d0", "#e8d8c8"]);
      Px.poly(g, [[0, 120], [60, 40], [100, 70], [160, 20], [230, 80], [280, 50], [320, 90], [320, 130], [0, 130]], "#8a98b8");
      Px.poly(g, [[150, 32], [160, 20], [172, 36], [164, 34], [158, 40]], "#f4f4fa");
      Px.poly(g, [[52, 50], [60, 40], [68, 52]], "#f4f4fa");
      hills(g, 130, 20, "#5a6a5a", 13, 18);
      for (let i = 0; i < 9; i++) pine(g, 10 + i * 36 + (i % 2) * 8, 140, 30 + (i % 3) * 8, "#2a4a3a");
      Px.vgrad(g, 0, 140, SW, 40, ["#7a6a5a", "#5a4a3a"]);
      // shrine steps and a little stone lantern
      for (let i = 0; i < 6; i++) Px.rect(g, 120 + i * 4, 140 + i * 6, 80 - i * 8, 6, i % 2 ? "#8a8070" : "#9a9080");
      Px.rect(g, 236, 120, 10, 20, "#8a8070"); Px.rect(g, 232, 116, 18, 5, "#7a7060"); Px.rect(g, 239, 124, 4, 4, "#ffd27a");
    },
    draw(g, t) {
      for (let i = 0; i < 3; i++) {
        const x = ((t * (4 + i * 2) + i * 140) % 460) - 140;
        g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(x, 100 + i * 12, 140, 8);
      }
      for (let i = 0; i < 8; i++) {
        const x = (i * 47 + t * 12) % 330, y = (i * 29 + t * 18) % 190;
        Px.rect(g, x, y, 2, 1, "#f8c8d8");
      }
    },
  },
  forest: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 180, ["#0a1410", "#101e18", "#0a120e"]);
      for (let i = 0; i < 14; i++) pine(g, i * 26 + 6, 120, 70, "#0e1c16");
      for (let i = 0; i < 10; i++) pine(g, i * 34 + 18, 140, 90, "#08120e");
      Px.vgrad(g, 0, 140, SW, 40, ["#14201a", "#060a08"]);
    },
    draw(g, t) {
      for (let i = 0; i < 14; i++) {
        const x = (i * 61 + Math.sin(t + i) * 8) % SW, y = 60 + ((i * 37) % 70) + Math.sin(t * 1.3 + i) * 4;
        g.fillStyle = `rgba(190,255,140,${0.4 + 0.4 * Math.sin(t * 3 + i)})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    },
  },
  swamp: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 120, ["#0a1a1a", "#14302a", "#1e4038"]);
      for (let i = 0; i < 7; i++) {
        const x = 10 + i * 50;
        Px.rect(g, x, 30, 6, 100, "#0a1410"); Px.poly(g, [[x - 20, 40], [x + 3, 20], [x + 26, 40]], "#0e2018");
        for (let k = 0; k < 4; k++) Px.rect(g, x - 10 + k * 8, 40, 1, 20 + (k * 7) % 14, "#1a3a2a");   // hanging moss
      }
      Px.vgrad(g, 0, 128, SW, 52, ["#10302a", "#06140f"]);
      // Moss's hut on stilts
      Px.rect(g, 196, 74, 70, 40, "#3a2a1a"); Px.poly(g, [[190, 76], [231, 46], [272, 76]], "#2a4a3a");
      for (const x of [200, 222, 244, 260]) Px.rect(g, x, 114, 3, 22, "#2a1a0e");
      Px.rect(g, 222, 90, 14, 24, "#1a0e08");
    },
    draw(g, t) {
      for (const [x, y] of [[206, 84], [254, 84], [60, 52], [120, 62], [160, 46]]) {
        const a = 0.5 + 0.3 * Math.sin(t * 2 + x);
        g.fillStyle = `rgba(255,220,140,${a * 0.25})`; g.beginPath(); g.arc(x + 2, y + 3, 8, 0, 7); g.fill();
        Px.rect(g, x, y, 4, 6, `rgba(255,220,140,${a})`);
      }
      for (let i = 0; i < 6; i++) {
        const x = (i * 57 + t * 6) % SW;
        g.fillStyle = "rgba(127,255,180,0.18)"; g.fillRect(Math.round(x), 140 + (i % 3) * 10, 24, 1);
      }
      for (let i = 0; i < 10; i++) {
        const x = (i * 31 + t * 9) % SW, y = 40 + ((i * 53 + t * 5) % 90);
        g.fillStyle = `rgba(200,255,120,${0.5 + 0.5 * Math.sin(t * 4 + i)})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    },
  },
  ember: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 120, ["#3a1030", "#a83a3a", "#f08a3a", "#ffc860"]);
      Px.ellipse(g, 220, 100, 22, 22, "#ffe8a0");
      Px.poly(g, [[0, 120], [0, 50], [30, 46], [44, 70], [70, 74], [86, 120]], "#5a1e1a");
      Px.poly(g, [[240, 120], [262, 60], [290, 56], [300, 30], [320, 32], [320, 120]], "#5a1e1a");
      Px.vgrad(g, 0, 118, SW, 62, ["#8a3a24", "#4a1a10"]);
      Px.poly(g, [[120, 180], [150, 118], [170, 118], [220, 180]], "#a85a34");
      for (const x of [20, 280, 300]) { Px.rect(g, x, 104, 4, 16, "#3a1a10"); Px.rect(g, x - 4, 108, 4, 2, "#3a1a10"); Px.rect(g, x + 4, 110, 4, 2, "#3a1a10"); }
    },
    draw(g, t) {
      for (let i = 0; i < 12; i++) {
        const x = (i * 71 + t * 20) % SW, y = 170 - ((i * 23 + t * 14) % 120);
        Px.rect(g, x, y, 1, 1, i % 2 ? "#ffd27a" : "#ff7a3a");
      }
    },
  },
  arena: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 180, ["#0a0a14", "#14141e"]);
      // crowd silhouettes
      const r = rng(5);
      for (let row = 0; row < 3; row++) for (let x = 0; x < SW; x += 7) Px.ellipse(g, x + r() * 3, 70 + row * 12, 3, 4, row === 0 ? "#1a1a28" : row === 1 ? "#22222e" : "#2a2a36");
      // the ring
      Px.vgrad(g, 0, 130, SW, 50, ["#c8c0b0", "#8a8478"]);
      Px.rect(g, 0, 128, SW, 4, "#3a3a4a");
      for (const y of [96, 108, 120]) Px.rect(g, 0, y, SW, 2, "#c8303c");
      for (const x of [6, 310]) Px.rect(g, x, 90, 6, 42, "#d8d8e0");
      // big lights
      for (const x of [60, 160, 260]) { Px.rect(g, x - 10, 8, 20, 6, "#2a2a36"); }
    },
    draw(g, t) {
      for (const x of [60, 160, 260]) {
        g.fillStyle = "rgba(255,250,220,0.08)"; Px.poly(g, [[x - 8, 14], [x + 8, 14], [x + 40, 130], [x - 40, 130]], "rgba(255,250,220,0.06)");
        Px.rect(g, x - 8, 12, 16, 2, "#fffbe8");
      }
      for (let i = 0; i < 10; i++) if (Math.sin(t * 6 + i * 3.1) > 0.92) Px.rect(g, (i * 37) % SW, 66 + (i % 3) * 12, 2, 2, "#ffffff");  // camera flashes
    },
  },
  spire: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 180, ["#06030a", "#120a1a", "#0a0610"]);
      for (const x of [30, 110, 210, 290]) {
        Px.rect(g, x - 9, 0, 18, 140, "#1a1424"); Px.rect(g, x - 11, 0, 2, 140, "#2a2036");
        Px.rect(g, x - 12, 130, 24, 10, "#22182e");
      }
      // stained window of a crown, cracked
      Px.ellipse(g, 160, 50, 26, 30, "#1a0e24"); Px.ellipse(g, 160, 50, 22, 26, "#2a1a10");
      for (const x of [146, 154, 162, 170]) Px.poly(g, [[x - 3, 60], [x + 3, 60], [x, 34]], "#3a6a2a");
      Px.line(g, 150, 30, 168, 72, "#000");
      Px.vgrad(g, 0, 140, SW, 40, ["#1a1424", "#06030a"]);
      for (let x = 0; x < SW; x += 20) Px.rect(g, x, 140, 1, 40, "#120c1a");
    },
    draw(g, t) {
      for (const x of [30, 110, 210, 290]) {
        const f = Math.sin(t * 9 + x) > 0 ? 1 : 0;
        g.fillStyle = "rgba(127,255,106,0.12)"; g.beginPath(); g.arc(x, 112, 14, 0, 7); g.fill();
        Px.poly(g, [[x - 4, 120], [x + 4, 120], [x + (f ? 1 : -1), 106]], "#7fff6a"); Px.rect(g, x - 1, 114, 2, 6, "#e8ffd8");
        Px.rect(g, x - 5, 120, 10, 3, "#2a2036");
      }
    },
  },
  startree: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 140, ["#05030f", "#141040", "#2a2a6a", "#3a3a7a"]);
      stars(g, 140, 9, 130);
      hills(g, 140, 10, "#141038", 21, 30);
      // the great tree
      Px.poly(g, [[150, 140], [154, 80], [166, 80], [170, 140]], "#2a1a3a");
      Px.poly(g, [[156, 96], [130, 70], [134, 66], [158, 88]], "#2a1a3a"); Px.poly(g, [[164, 92], [196, 64], [198, 70], [166, 98]], "#2a1a3a");
      Px.ellipse(g, 160, 56, 70, 36, "#1e1a50"); Px.ellipse(g, 130, 66, 30, 18, "#1e1a50"); Px.ellipse(g, 196, 64, 30, 18, "#1e1a50");
      Px.vgrad(g, 0, 140, SW, 40, ["#1a1a40", "#0a0a20"]);
      const r = rng(17);
      for (let i = 0; i < 70; i++) Px.rect(g, Math.floor(r() * SW), 142 + Math.floor(r() * 36), 1, 1, ["#ffffff", "#ffd8ec", "#c8e8ff"][i % 3]);  // flowers
    },
    draw(g, t) {
      const r = rng(23);
      for (let i = 0; i < 60; i++) {
        const x = 96 + r() * 130, y = 26 + r() * 64, ph = r() * 6;
        const a = 0.4 + 0.5 * Math.sin(t * 2 + ph);
        g.fillStyle = `rgba(255,240,180,${a})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      for (let i = 0; i < 5; i++) {
        const p = ((t * 0.25 + i * 0.21) % 1), x = 20 + i * 64 + p * 50, y = p * 140;
        if (p < 0.6) { Px.line(g, x, y, x - 5, y - 3, "#ffffff"); }
      }
    },
  },
  void: { build(g) { Px.rect(g, 0, 0, SW, SH, "#030206"); }, draw(g, t) {
    for (let i = 0; i < 40; i++) {
      const x = (i * 73 + t * (4 + (i % 5))) % SW, y = (i * 37 + Math.sin(t + i) * 6) % SH;
      g.fillStyle = i % 4 ? "rgba(154,140,192,0.5)" : "rgba(127,255,106,0.7)"; g.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  } },
  black: { build(g) { Px.rect(g, 0, 0, SW, SH, "#000"); }, draw() {} },
};

const BgCache = {
  cache: {},
  get(key) {
    if (!this.cache[key]) {
      const c = Px.canvas(SW, SH);
      BACKGROUNDS[key].build(c.getContext("2d"));
      this.cache[key] = c;
    }
    return this.cache[key];
  },
};
