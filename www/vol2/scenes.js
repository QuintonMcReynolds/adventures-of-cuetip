// Backgrounds for Adventures of Cuetip, Vol. 2. Each has a static layer (built once) and an animated draw(g, t).
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
// The Star Tree: trunk, two big branches and a wide crown
function starTree(g, leaf, trunk) {
  Px.poly(g, [[150, 140], [154, 80], [166, 80], [170, 140]], trunk);
  Px.poly(g, [[156, 96], [130, 70], [134, 66], [158, 88]], trunk); Px.poly(g, [[164, 92], [196, 64], [198, 70], [166, 98]], trunk);
  Px.ellipse(g, 160, 56, 70, 36, leaf); Px.ellipse(g, 130, 66, 30, 18, leaf); Px.ellipse(g, 196, 64, 30, 18, leaf);
}
// The Blight Moon: violet, cratered, too big
function moon(g, x, y, r) {
  Px.ellipse(g, x, y, r + 2, r + 2, "#3a1a4a");
  Px.ellipse(g, x, y, r, r, "#c07aff");
  Px.ellipse(g, x - r * 0.15, y - r * 0.1, r * 0.8, r * 0.8, "#d49aff");
  const rr = rng(r * 13);
  for (let i = 0; i < 3 + r / 6; i++) { const a = rr() * 6.28, d = rr() * r * 0.7; Px.ellipse(g, x + Math.cos(a) * d, y + Math.sin(a) * d, 1 + rr() * r * 0.15, 1 + rr() * r * 0.12, "#9a5ad8"); }
}
function moonGlow(g, t, x, y, r) {
  const a = 0.12 + 0.06 * Math.sin(t * 1.2);
  const grd = g.createRadialGradient(x, y, r, x, y, r * 2.2);
  grd.addColorStop(0, `rgba(192,122,255,${a})`); grd.addColorStop(1, "rgba(192,122,255,0)");
  g.fillStyle = grd; g.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
}
function petals(g, t, n, color, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const sp = 10 + r() * 14, x0 = r() * SW, ph = r() * 200;
    const y = ((t * sp + ph) % 200) - 10, x = (x0 + Math.sin(t + i) * 8 + t * 6) % SW;
    Px.rect(g, x, y, 2, 1, color);
  }
}
function fireflies(g, t, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = (i * 61 + Math.sin(t * 0.8 + i) * 12 + seed) % SW, y = 110 + ((i * 37) % 50) + Math.sin(t * 1.3 + i) * 4;
    g.fillStyle = `rgba(255,236,150,${0.4 + 0.4 * Math.sin(t * 3 + i)})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
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
      moon(g, 268, 34, 16);
      hills(g, 128, 18, "#120a22", 5, 20);
      // the Star Tree, far away on the horizon
      Px.rect(g, 236, 96, 4, 26, "#2a1a3a");
      Px.ellipse(g, 238, 90, 22, 14, "#2a1a4a");
      Px.vgrad(g, 0, 140, SW, 40, ["#0a0614", "#030208"]);
      // a cliff in the foreground
      Px.poly(g, [[0, 180], [0, 132], [40, 128], [92, 134], [110, 146], [118, 180]], "#06040c");
    },
    draw(g, t) {
      moonGlow(g, t, 268, 34, 16);
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
  home: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 140, ["#1e1440", "#5a2a5a", "#c0607a", "#f0a070", "#ffd8a0"]);
      stars(g, 30, 41, 40);
      hills(g, 140, 10, "#3a2240", 21, 30);
      starTree(g, "#3a3a8a", "#3a2240");
      cottage(g, 30, 114, 46, 28, "#6a4a5a", "#3a2a5a", true);
      Px.rect(g, 64, 96, 5, 12, "#4a3040");   // chimney
      Px.vgrad(g, 0, 140, SW, 40, ["#3a2a4a", "#1a1028"]);
      for (let x = 92; x < 140; x += 8) { Px.rect(g, x, 134, 2, 10, "#5a3a3a"); }
      Px.rect(g, 90, 137, 52, 1, "#5a3a3a");
      const r = rng(17);
      for (let i = 0; i < 70; i++) Px.rect(g, Math.floor(r() * SW), 142 + Math.floor(r() * 36), 1, 1, ["#ffffff", "#ffd8ec", "#c8e8ff"][i % 3]);
    },
    draw(g, t) {
      const r = rng(23);
      for (let i = 0; i < 40; i++) {
        const x = 96 + r() * 130, y = 26 + r() * 64, ph = r() * 6;
        g.fillStyle = `rgba(255,240,180,${0.3 + 0.4 * Math.sin(t * 2 + ph)})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      for (let i = 0; i < 3; i++) { const y = 94 - ((t * 6 + i * 9) % 28); g.fillStyle = `rgba(200,180,200,${0.3 * (1 - (94 - y) / 28)})`; g.fillRect(65 + Math.round(Math.sin(t + i) * 2), Math.round(y), 3, 2); }
      fireflies(g, t, 10, 31);
    },
  },
  blightree: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 140, ["#05020c", "#1a0628", "#3a0a3a", "#4a1440"]);
      stars(g, 50, 43, 120);
      moon(g, 252, 40, 26);
      hills(g, 140, 10, "#1a0a22", 21, 30);
      starTree(g, "#1e1030", "#1a0e24");
      // black thorns driven into the trunk
      for (const [x, y, dx] of [[152, 112, -14], [168, 104, 16], [156, 92, -10], [166, 124, 12]]) Px.poly(g, [[x, y - 2], [x, y + 2], [x + dx, y]], "#0a0610");
      cottage(g, 30, 114, 46, 28, "#3a2a3a", "#1e1a3a", false);
      Px.vgrad(g, 0, 140, SW, 40, ["#1e0e28", "#08040e"]);
      const r = rng(17);
      for (let i = 0; i < 70; i++) Px.rect(g, Math.floor(r() * SW), 142 + Math.floor(r() * 36), 1, 1, ["#6a5a7a", "#5a4a6a", "#4a3a5a"][i % 3]);
    },
    draw(g, t) {
      moonGlow(g, t, 252, 40, 26);
      const r = rng(23);
      for (let i = 0; i < 20; i++) {
        const x = 96 + r() * 130, y = 26 + r() * 64, ph = r() * 6;
        if (Math.sin(t * 1.3 + ph) > 0.6) { g.fillStyle = "rgba(255,240,180,0.35)"; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
      }
      petals(g, t, 14, "#5a2a6a", 7);
    },
  },
  peaks: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 140, ["#060a18", "#101a34", "#1e2a4a"]);
      stars(g, 90, 51, 100);
      moon(g, 70, 30, 9);
      Px.poly(g, [[0, 140], [30, 70], [60, 96], [100, 40], [140, 90], [180, 56], [230, 100], [270, 50], [320, 84], [320, 140]], "#2a3248");
      for (const [x, y] of [[100, 40], [180, 56], [270, 50], [30, 70]]) Px.poly(g, [[x - 8, y + 12], [x, y], [x + 8, y + 12], [x + 2, y + 9], [x - 3, y + 13]], "#c8d0e0");
      Px.poly(g, [[0, 180], [0, 120], [50, 110], [90, 130], [150, 124], [200, 140], [320, 128], [320, 180]], "#141a28");
      // Rook's crooked tower
      Px.poly(g, [[218, 150], [222, 50], [244, 48], [246, 150]], "#3a3a4a");
      Px.poly(g, [[238, 150], [240, 49], [244, 48], [246, 150]], "#2a2a38");
      Px.poly(g, [[214, 52], [234, 22], [252, 50]], "#1a1a28");
      Px.rect(g, 228, 70, 6, 9, "#ffd27a"); Px.rect(g, 230, 102, 5, 8, "#ffd27a"); Px.rect(g, 230, 132, 8, 18, "#14141e");
      Px.vgrad(g, 0, 150, SW, 30, ["#20283a", "#0a0e18"]);
    },
    draw(g, t) {
      twinkle(g, t, 14, 52, 100);
      for (let i = 0; i < 4; i++) {
        const a = t * (0.6 + i * 0.15) + i * 1.6, x = 234 + Math.cos(a) * (22 + i * 8), y = 28 + Math.sin(a) * 8 + i * 4;
        const f = Math.sin(t * 10 + i) > 0 ? 1 : 0;
        Px.rect(g, x - 2, y - f, 2, 1, "#07040f"); Px.rect(g, x, y, 1, 1, "#07040f"); Px.rect(g, x + 1, y - f, 2, 1, "#07040f");
      }
      for (let i = 0; i < 40; i++) {
        const x = (i * 47 + t * (8 + (i % 4) * 3)) % 330 - 5, y = (i * 29 + t * (14 + (i % 3) * 4)) % 190 - 5;
        Px.rect(g, x, y, 1, 1, i % 3 ? "#e8eef8" : "#a8b8d8");
      }
    },
  },
  thistle: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 130, ["#140a28", "#3a1a4a", "#6a3a5a", "#8a5a6a"]);
      stars(g, 40, 61, 60);
      moon(g, 56, 34, 13);
      hills(g, 118, 12, "#2a1a3a", 63, 24);
      Px.vgrad(g, 0, 124, SW, 56, ["#3a3a2a", "#141408"]);
      Px.poly(g, [[130, 180], [150, 124], [176, 124], [210, 180]], "#5a4a3a");
      const hut = (x, y, w, lit) => {
        Px.ellipse(g, x, y, w, w * 0.7, "#6a5a48"); Px.rect(g, x - w, y, w * 2, w * 0.7, "#6a5a48");
        Px.ellipse(g, x, y - w * 0.3, w + 3, w * 0.6, "#6a3a8a");
        for (let k = -2; k <= 2; k++) Px.poly(g, [[x + k * w * 0.35 - 2, y - w * 0.6], [x + k * w * 0.35 + 2, y - w * 0.6], [x + k * w * 0.4, y - w * 1.1]], "#9a6ac8");
        Px.rect(g, x - 3, y + w * 0.2, 6, w * 0.5, "#1a0e08");
        if (lit) Px.rect(g, x + w * 0.45, y + 1, 4, 4, "#ffd27a");
      };
      hut(34, 116, 18, true); hut(100, 112, 14, true); hut(236, 114, 16, false); hut(292, 118, 19, true);
      // the clinic tent Dr. Moss set up
      Px.poly(g, [[180, 132], [200, 98], [226, 132]], "#e8e0d0"); Px.poly(g, [[200, 98], [226, 132], [214, 132]], "#c8c0b0");
      Px.rect(g, 199, 112, 4, 10, "#e85a6a"); Px.rect(g, 196, 115, 10, 4, "#e85a6a");
      Px.line(g, 0, 84, 320, 90, "#3a2a20");
    },
    draw(g, t) {
      for (let i = 0; i < 14; i++) {
        const x = 10 + i * 22, y = 85 + Math.round(i * 0.3 + Math.sin(t * 1.5 + i) * 1.2);
        const on = Math.sin(t * 3 + i * 7) > -0.9;
        g.fillStyle = "rgba(255,210,140,0.12)"; g.fillRect(x - 3, y, 8, 8);
        Px.rect(g, x, y + 2, 3, 4, on ? ["#ffd27a", "#ff9a6a"][i % 2] : "#6a4a2a");
      }
      for (let i = 0; i < 16; i++) {
        const x = (i * 41 + Math.sin(t * 0.7 + i) * 10 + t * 5) % SW, y = 170 - ((i * 37 + t * 9) % 150);
        Px.rect(g, x, y, 1, 1, "#f8f0ff"); g.fillStyle = "rgba(248,240,255,0.35)"; g.fillRect(Math.round(x) - 1, Math.round(y), 3, 1);
      }
    },
  },
  briar: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 180, ["#0a0612", "#140a1e", "#0a0610"]);
      Px.poly(g, [[90, 0], [120, 0], [170, 150], [110, 150]], "rgba(200,160,255,0.06)");
      Px.poly(g, [[220, 0], [236, 0], [260, 150], [220, 150]], "rgba(200,160,255,0.05)");
      const arch = (cx, cy, rx, ry, w, c) => {
        for (let a = Math.PI; a <= Math.PI * 2; a += 0.02) Px.ellipse(g, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, w, w, c);
        for (let a = Math.PI + 0.15; a < Math.PI * 2; a += 0.22) { const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; Px.poly(g, [[x - 1, y], [x + 1, y], [x + Math.cos(a) * 6, y + Math.sin(a) * 6]], c); }
      };
      arch(60, 150, 70, 120, 3, "#1e0e2a"); arch(260, 150, 80, 110, 3, "#1e0e2a");
      arch(160, 160, 140, 130, 4, "#140820");
      Px.vgrad(g, 0, 140, SW, 40, ["#1a1020", "#060308"]);
      Px.poly(g, [[120, 180], [150, 140], [174, 140], [210, 180]], "#2a1e2a");
    },
    draw(g, t) {
      for (let i = 0; i < 18; i++) {
        const x = (i * 53 + t * 4 + Math.sin(t + i) * 6) % SW, y = 40 + ((i * 31 + t * 3) % 110);
        g.fillStyle = `rgba(192,122,255,${0.3 + 0.3 * Math.sin(t * 2 + i)})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    },
  },
  bridge: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 180, ["#06030e", "#1a0a2a", "#2a1040", "#0a0412"]);
      stars(g, 70, 71, 90);
      moon(g, 160, 44, 30);
      Px.poly(g, [[0, 180], [0, 110], [30, 104], [56, 120], [60, 180]], "#140a1e");
      Px.poly(g, [[320, 180], [320, 100], [290, 108], [264, 122], [260, 180]], "#140a1e");
      Px.rect(g, 50, 132, 220, 8, "#4a4058"); Px.rect(g, 50, 140, 220, 3, "#2a2036");
      for (let x = 56; x < 268; x += 9) { const h = 10 + (x * 7) % 9; Px.poly(g, [[x - 1, 132], [x + 1, 132], [x, 132 - h]], "#8a8098"); }
      for (const x of [90, 160, 230]) Px.rect(g, x - 2, 143, 4, 37, "#2a2036");
    },
    draw(g, t) {
      moonGlow(g, t, 160, 44, 30);
      for (let i = 0; i < 4; i++) {
        const x = ((t * (6 + i * 3) + i * 90) % 420) - 100;
        g.fillStyle = "rgba(160,120,200,0.12)"; g.fillRect(Math.round(x), 150 + i * 7, 120, 5);
      }
      for (let x = 56; x < 268; x += 9) if (Math.sin(t * 2 + x) > 0.97) Px.rect(g, x, 120, 1, 2, "#ffffff");
    },
  },
  garden: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 140, ["#0a0414", "#2a0a30", "#4a1440"]);
      stars(g, 40, 81, 60);
      moon(g, 240, 60, 40);
      for (const x of [40, 130, 220]) {
        Px.rect(g, x, 60, 10, 84, "#6a6078"); Px.rect(g, x + 50, 60, 10, 84, "#6a6078");
        for (let a = Math.PI; a <= Math.PI * 2; a += 0.03) Px.rect(g, x + 30 + Math.cos(a) * 30, 64 + Math.sin(a) * 24, 4, 4, "#7a7088");
        Px.line(g, x + 4, 80, x + 8, 100, "#3a3448");
      }
      Px.rect(g, 180, 50, 30, 94, "#0a0414");   // a fallen gap in the arches
      Px.vgrad(g, 0, 140, SW, 40, ["#1e0e1e", "#08040a"]);
      const rose = (x, y, r) => {
        Px.rect(g, x - 1, y, 2, 150 - y, "#1a2a1a");
        for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; Px.ellipse(g, x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.5, r * 0.6, r * 0.5, k % 2 ? "#1a0a1a" : "#2e122e"); }
        Px.ellipse(g, x, y, r * 0.4, r * 0.35, "#4a1a4a");
      };
      rose(20, 112, 14); rose(110, 120, 10); rose(196, 108, 16); rose(300, 116, 12); rose(260, 132, 8);
    },
    draw(g, t) {
      moonGlow(g, t, 240, 60, 40);
      petals(g, t, 16, "#3a1a3a", 9);
    },
  },
  throne2: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 180, ["#04020a", "#14061e", "#24082e"]);
      stars(g, 60, 91, 120);
      moon(g, 160, 66, 58);
      // throne of thorns
      Px.poly(g, [[128, 140], [126, 70], [134, 84], [140, 52], [148, 80], [160, 36], [172, 80], [180, 52], [186, 84], [194, 70], [192, 140]], "#0a0610");
      Px.rect(g, 140, 104, 40, 8, "#1a0e24");
      for (const x of [20, 300]) { Px.poly(g, [[x - 10, 150], [x - 4, 30], [x + 4, 30], [x + 10, 150]], "#0e0818"); for (let y = 40; y < 140; y += 14) { Px.poly(g, [[x + 4, y], [x + 4, y + 3], [x + 12, y - 2]], "#0e0818"); Px.poly(g, [[x - 4, y + 7], [x - 4, y + 10], [x - 12, y + 5]], "#0e0818"); } }
      for (let i = 0; i < 4; i++) Px.rect(g, 100 - i * 14, 140 + i * 10, 120 + i * 28, 10, i % 2 ? "#1a1024" : "#22142e");
    },
    draw(g, t) {
      moonGlow(g, t, 160, 66, 58);
      for (let i = 0; i < 24; i++) {
        const x = (i * 37 + t * 3) % SW, y = 150 - ((i * 23 + t * 10) % 140);
        g.fillStyle = `rgba(255,90,216,${0.25 + 0.25 * Math.sin(t * 3 + i)})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    },
  },
  startree: {
    build(g) {
      Px.vgrad(g, 0, 0, SW, 140, ["#05030f", "#141040", "#2a2a6a", "#3a3a7a"]);
      stars(g, 140, 9, 130);
      hills(g, 140, 10, "#141038", 21, 30);
      starTree(g, "#1e1a50", "#2a1a3a");
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
