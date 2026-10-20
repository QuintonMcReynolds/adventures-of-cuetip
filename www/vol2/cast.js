// The cast of Adventures of Cuetip, drawn in code.
// Every character has a 100x150 story portrait (draw) and, if they fight, a 64x64 battle sprite (fight).
"use strict";

const CW = 100, CH = 150;
const INK = "#07040f";

// Black HS marks. Fixed spots so they spread the same way every time; `level` 0..1 shows more of them.
const HS_SPOTS_PORTRAIT = [
  [70, 128, 6, 5], [26, 120, 4, 4], [62, 140, 7, 4], [80, 112, 4, 5], [38, 136, 5, 4], [56, 104, 4, 3],
  [74, 92, 3, 3], [30, 100, 3, 4], [66, 80, 3, 3], [34, 74, 3, 2], [86, 50, 3, 2], [22, 36, 2, 3],
];
function drawHS(g, spots, level, scale = 1) {
  const n = Math.round(spots.length * Math.max(0, Math.min(1, level)));
  for (let i = 0; i < n; i++) {
    const [x, y, rx, ry] = spots[i];
    Px.ellipse(g, x, y, rx * scale + 1, ry * scale + 1, "#2a1238");
    Px.ellipse(g, x, y, rx * scale, ry * scale, "#0b0610");
    if (i > 0) { const [px, py] = spots[i - 1]; Px.line(g, x, y, (x + px) / 2 + 2, (y + py) / 2 - 1, "#1a0c24"); }
  }
}

// Generic humanoid face helpers (Vexmoor, Nightshade)
function eyesHuman(g, cx, cy, face, iris, blink) {
  const L = cx - 8, R = cx + 4, y = cy + 1;
  for (const x of [L, R]) {
    if (blink) { Px.rect(g, x, y + 2, 4, 1, INK); continue; }
    Px.rect(g, x, y, 4, 2, "#0d0612");
    Px.rect(g, x + 1, y, 2, 2, iris); Px.rect(g, x + 1, y, 1, 1, "#ffffff");
  }
  const by = cy - 4;
  if (face === "angry" || face === "smile") { Px.line(g, L - 1, by, L + 4, by + 2, INK); Px.line(g, R + 5, by, R, by + 2, INK); }
  else { Px.rect(g, L - 1, by, 5, 1, INK); Px.rect(g, R + 1, by, 5, 1, INK); }
}

const CAST = {
  // ------------------------------------------------------------ Cuetip
  cuetip: {
    name: "Cuetip", color: "#6fb4ff",
    B: "#4a86ee", Bs: "#2f5fc0", Bh: "#7aa8f8", R: "#ee1c24",
    draw(g, face, blink, hs = 0) {
      const { B, Bs, Bh, R } = this;
      // body and arms
      Px.ellipse(g, 52, 128, 31, 30, Bs);
      Px.ellipse(g, 50, 128, 30, 30, B);
      Px.ellipse(g, 24, 118, 8, 14, B); Px.ellipse(g, 78, 118, 8, 14, Bs);
      for (let i = 0; i < 3; i++) { Px.line(g, 20 + i * 3, 130, 18 + i * 3, 138, "#d8e0f0"); Px.line(g, 76 + i * 3, 130, 78 + i * 3, 138, "#d8e0f0"); }
      Px.line(g, 50, 100, 50, 150, Bs);
      drawHS(g, HS_SPOTS_PORTRAIT, hs);
      if (this.braid) { Px.rect(g, 16, 124, 16, 3, "#1c1220"); for (const x of [18, 23, 28]) Px.rect(g, x, 125, 1, 1, "#fff2b0"); }
      // ears: left one swept up and out, right one straight out, both banded
      Px.poly(g, [[31, 58], [42, 48], [34, 30], [18, 18], [16, 26], [24, 40]], B);
      Px.line(g, 22, 30, 30, 26, INK); Px.line(g, 25, 37, 34, 33, INK);
      Px.poly(g, [[64, 46], [70, 56], [92, 50], [98, 44], [86, 42]], Bs);
      Px.poly(g, [[64, 46], [70, 54], [92, 48], [98, 44], [86, 42]], B);
      Px.line(g, 82, 42, 84, 50, INK); Px.line(g, 88, 43, 90, 48, INK);
      // head
      Px.ellipse(g, 52, 68, 26, 23, Bs);
      Px.ellipse(g, 50, 68, 26, 23, B);
      Px.ellipse(g, 42, 58, 8, 4, Bh);
      if (hs > 0.85) { Px.ellipse(g, 66, 76, 4, 3, "#0b0610"); Px.ellipse(g, 30, 64, 2, 2, "#0b0610"); }
      // the black V brow
      Px.line(g, 42, 55, 50, 64, INK); Px.line(g, 43, 55, 50, 63, INK); Px.line(g, 58, 55, 50, 64, INK); Px.line(g, 57, 55, 50, 63, INK);
      // eyes
      const eye = (pts, px, py) => {
        if (blink) { Px.line(g, pts[0][0], pts[0][1] + 3, pts[1][0], pts[1][1] + 3, INK); return; }
        Px.poly(g, pts, R);
        Px.rect(g, px, py, 2, 2, INK);
        Px.rect(g, px - 1, py - 1, 1, 1, "#ff8a8a");
      };
      if (face === "hurt") {
        Px.line(g, 34, 66, 45, 68, INK); Px.line(g, 34, 67, 45, 69, INK);
        eye([[55, 66], [66, 62], [65, 69], [57, 71]], 59, 66);
        Px.rect(g, 70, 56, 2, 4, "#bfe6ff"); Px.rect(g, 70, 60, 2, 1, "#8fc8f0");
      } else if (face === "surprised") {
        Px.ellipse(g, 40, 67, 5, 5, R); Px.ellipse(g, 61, 67, 5, 5, R);
        if (!blink) { Px.rect(g, 40, 67, 2, 2, INK); Px.rect(g, 60, 67, 2, 2, INK); }
      } else if (face === "smile") {
        eye([[34, 66], [46, 64], [44, 68], [36, 68]], 41, 65);
        eye([[55, 64], [67, 66], [65, 68], [57, 68]], 59, 65);
      } else if (face === "sad") {
        eye([[34, 64], [46, 66], [44, 71], [36, 70]], 41, 67);
        eye([[55, 66], [67, 64], [65, 70], [57, 71]], 59, 67);
        Px.rect(g, 36, 72, 1, 3, "#8fc8f0");
      } else if (face === "angry") {
        eye([[33, 63], [47, 67], [44, 70], [36, 69]], 42, 67);
        eye([[54, 67], [68, 63], [65, 69], [57, 70]], 58, 67);
      } else {
        eye([[34, 63], [46, 65], [44, 71], [36, 70]], 41, 66);
        eye([[55, 65], [67, 63], [65, 70], [57, 71]], 59, 66);
      }
      // mouth and fangs
      if (face === "smile") { Px.rect(g, 46, 80, 9, 1, INK); Px.rect(g, 45, 79, 1, 1, INK); Px.rect(g, 55, 79, 1, 1, INK); }
      else if (face === "sad" || face === "hurt") { Px.rect(g, 47, 81, 7, 1, INK); Px.rect(g, 46, 82, 1, 1, INK); Px.rect(g, 54, 82, 1, 1, INK); }
      else if (face === "surprised") Px.ellipse(g, 50, 81, 2, 2, INK);
      else { Px.line(g, 47, 79, 50, 81, INK); Px.line(g, 53, 79, 50, 81, INK); }
      Px.rect(g, 47, 82, 1, 2, "#ffffff"); Px.rect(g, 53, 82, 1, 2, "#ffffff");
    },
    fight(g, hs = 0) {
      const { B, Bs, R } = this;
      Px.ellipse(g, 22, 58, 5, 3, Bs); Px.ellipse(g, 36, 58, 5, 3, Bs);       // feet
      Px.ellipse(g, 29, 46, 13, 12, Bs); Px.ellipse(g, 28, 46, 13, 12, B);    // body
      Px.ellipse(g, 41, 44, 4, 6, B);                                         // front arm
      for (let i = 0; i < 3; i++) Px.line(g, 43 + i, 49, 46 + i * 2, 53, "#d8e0f0");
      if (this.braid) { Px.rect(g, 38, 46, 7, 2, "#1c1220"); Px.rect(g, 41, 46, 1, 1, "#fff2b0"); }
      Px.poly(g, [[22, 22], [27, 19], [16, 6], [10, 8]], B); Px.line(g, 14, 10, 18, 9, INK);
      Px.poly(g, [[35, 20], [38, 25], [56, 19], [53, 16]], B); Px.line(g, 49, 18, 50, 21, INK);
      Px.ellipse(g, 30, 28, 12, 10, Bs); Px.ellipse(g, 29, 28, 12, 10, B);    // head
      Px.line(g, 30, 22, 33, 26, INK); Px.line(g, 36, 22, 33, 26, INK);       // V
      Px.poly(g, [[27, 27], [32, 28], [31, 31], [28, 30]], R); Px.rect(g, 30, 29, 1, 1, INK);
      Px.poly(g, [[35, 28], [40, 27], [39, 30], [36, 31]], R); Px.rect(g, 37, 29, 1, 1, INK);
      Px.rect(g, 34, 34, 1, 2, "#fff");
      const spots = [[22, 50, 2, 2], [32, 54, 3, 2], [18, 42, 2, 2], [36, 40, 2, 1], [26, 38, 1, 1], [40, 46, 1, 2], [20, 30, 1, 1], [38, 24, 1, 1]];
      drawHS(g, spots, hs);
    },
  },

  // ------------------------------------------------------------ the bride (never seen from the front)
  bride: {
    name: "???", color: "#ffd8ec",
    draw(g, face) {
      const hair = "#1c1220", hi = "#4a3058", skin = "#f6e2da";
      // shoulders and the back of a white dress
      Px.poly(g, [[16, 150], [22, 92], [36, 84], [64, 84], [78, 92], [84, 150]], skin);
      Px.poly(g, [[24, 150], [30, 104], [70, 104], [76, 150]], face === "veil" ? "#ffffff" : "#f0eef8");
      // very long hair, all the way down
      Px.ellipse(g, 50, 52, 20, 22, hair);
      Px.poly(g, [[30, 52], [70, 52], [74, 110], [70, 150], [30, 150], [26, 110]], hair);
      for (const [x0, x1] of [[38, 34], [46, 44], [55, 57], [63, 67]]) Px.line(g, x0, 40, x1, 148, hi);
      // starlight caught in it
      for (const [x, y] of [[40, 62], [58, 80], [46, 108], [62, 128], [36, 136]]) { Px.rect(g, x, y, 1, 1, "#ffffff"); Px.rect(g, x - 1, y, 3, 1, "rgba(255,255,255,0.4)"); }
      // a white flower pinned above her ear
      Px.ellipse(g, 66, 40, 4, 4, "#ffffff"); Px.rect(g, 65, 39, 2, 2, "#ffd27a");
      if (face === "veil") { g.fillStyle = "rgba(255,255,255,0.45)"; Px.poly(g, [[34, 30], [66, 30], [80, 150], [20, 150]], "rgba(255,255,255,0.35)"); }
      // her hand, reaching back
      if (face === "reach") { Px.ellipse(g, 86, 112, 5, 4, skin); Px.rect(g, 80, 106, 6, 10, skin); }
    },
  },

  // ------------------------------------------------------------ Vexmoor, the Rot King
  vexmoor: {
    name: "Vexmoor", color: "#7fff6a",
    draw(g, face, blink) {
      const robe = "#1a1024", robeS = "#0e0814", skin = "#a4a2b4", skinS = "#7c7a90";
      Px.poly(g, [[14, 150], [22, 86], [38, 74], [62, 74], [78, 86], [86, 150]], robe);
      Px.poly(g, [[56, 150], [62, 80], [78, 86], [86, 150]], robeS);
      Px.rect(g, 46, 74, 8, 76, "#2a1638");
      for (let i = 0; i < 4; i++) Px.rect(g, 49, 84 + i * 14, 2, 4, "#7fff6a");
      // hood
      Px.poly(g, [[28, 66], [32, 30], [50, 18], [68, 30], [72, 66], [62, 80], [38, 80]], robe);
      Px.ellipse(g, 51, 50, 13, 16, skinS); Px.ellipse(g, 50, 50, 13, 16, skin);
      // rot veins spreading over his face
      Px.line(g, 40, 58, 44, 50, "#2a1238"); Px.line(g, 44, 50, 42, 44, "#2a1238"); Px.line(g, 60, 60, 57, 52, "#2a1238");
      eyesHuman(g, 50, 48, face, "#7fff6a", blink);
      if (face === "smile" || face === "dark") { Px.rect(g, 44, 58, 12, 2, "#1a0610"); Px.rect(g, 45, 58, 10, 1, "#e8f0d8"); Px.rect(g, 43, 57, 1, 1, "#1a0610"); Px.rect(g, 56, 57, 1, 1, "#1a0610"); }
      else if (face === "angry") Px.rect(g, 46, 59, 8, 1, "#1a0610");
      else Px.rect(g, 47, 59, 6, 1, "#1a0610");
      Px.poly(g, [[37, 40], [37, 30], [50, 24], [63, 30], [63, 40], [56, 34], [44, 34]], robe);
      // crown of black thorns
      for (const [x, h] of [[34, 14], [40, 20], [46, 16], [54, 16], [60, 20], [66, 14]]) Px.poly(g, [[x - 2, 30], [x + 2, 30], [x, 30 - h]], "#0a0610");
      Px.rect(g, 33, 28, 35, 3, "#0a0610");
      if (face === "dark") { g.save(); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(10,4,20,0.4)"; g.fillRect(36, 34, 28, 12); g.restore(); }
    },
    fight(g) {
      Px.poly(g, [[14, 62], [22, 28], [32, 20], [42, 28], [50, 62]], "#1a1024");
      Px.poly(g, [[32, 62], [36, 28], [42, 28], [50, 62]], "#0e0814");
      Px.ellipse(g, 32, 18, 7, 8, "#a4a2b4");
      Px.poly(g, [[24, 16], [26, 6], [32, 2], [38, 6], [40, 16], [36, 12], [28, 12]], "#1a1024");
      for (const x of [26, 30, 34, 38]) Px.poly(g, [[x - 1, 6], [x + 1, 6], [x, 0]], "#0a0610");
      Px.rect(g, 33, 17, 2, 1, "#7fff6a"); Px.rect(g, 37, 17, 2, 1, "#7fff6a");
      Px.poly(g, [[40, 30], [52, 34], [56, 30], [58, 34], [54, 38], [42, 36]], "#a4a2b4");
      Px.line(g, 56, 30, 60, 26, "#0a0610"); Px.line(g, 58, 34, 62, 32, "#0a0610");
    },
  },

  // ------------------------------------------------------------ Bramble, the old tortoise monk
  bramble: {
    name: "Bramble", color: "#9fd18a",
    draw(g, face, blink) {
      const skin = "#8aa07a", skinS = "#667a5a";
      Px.ellipse(g, 50, 130, 44, 36, "#5a3e24");
      for (const [x, y] of [[30, 118], [50, 112], [70, 118], [40, 138], [60, 138]]) {
        Px.poly(g, [[x - 8, y], [x - 4, y - 7], [x + 4, y - 7], [x + 8, y], [x + 4, y + 7], [x - 4, y + 7]], "#7a5634");
      }
      Px.poly(g, [[30, 150], [34, 100], [66, 100], [70, 150]], "#c8783a");       // monk's robe
      Px.poly(g, [[44, 100], [56, 100], [62, 150], [38, 150]], "#a05a2a");
      for (let i = 0; i < 9; i++) Px.ellipse(g, 36 + i * 3.5, 104 + Math.abs(4 - i) * -1.2 + 6, 1, 1, "#3a2414");
      Px.rect(g, 44, 84, 12, 18, skin);
      Px.ellipse(g, 51, 66, 21, 19, skinS); Px.ellipse(g, 50, 66, 21, 19, skin);
      Px.ellipse(g, 42, 56, 6, 3, "#a4b894");
      const y = 66;
      if (blink || face === "neutral") { Px.rect(g, 38, y, 7, 1, INK); Px.rect(g, 55, y, 7, 1, INK); }
      else if (face === "surprised") { Px.ellipse(g, 41, y, 3, 3, "#f4f0e0"); Px.ellipse(g, 59, y, 3, 3, "#f4f0e0"); Px.rect(g, 41, y, 1, 1, INK); Px.rect(g, 59, y, 1, 1, INK); }
      else { Px.rect(g, 38, y - 1, 7, 3, "#f4f0e0"); Px.rect(g, 55, y - 1, 7, 3, "#f4f0e0"); Px.rect(g, 41, y, 2, 2, "#3a2a14"); Px.rect(g, 57, y, 2, 2, "#3a2a14"); Px.rect(g, 37, y - 2, 9, 1, skinS); Px.rect(g, 54, y - 2, 9, 1, skinS); }
      // enormous white eyebrows and a beard that has seen things
      const brow = face === "stern" ? 3 : 0;
      Px.poly(g, [[34, 60 - brow], [46, 58 + brow], [46, 61 + brow], [32, 64]], "#f0f0e8");
      Px.poly(g, [[54, 58 + brow], [66, 60 - brow], [68, 64], [54, 61 + brow]], "#f0f0e8");
      Px.poly(g, [[38, 76], [62, 76], [58, 96], [52, 112], [48, 112], [42, 96]], "#e8e8e0");
      Px.line(g, 50, 80, 50, 110, "#c8c8c0");
      if (face === "smile") { Px.rect(g, 45, 75, 10, 1, "#3a2a14"); Px.rect(g, 44, 74, 1, 1, "#3a2a14"); Px.rect(g, 55, 74, 1, 1, "#3a2a14"); }
      else Px.rect(g, 46, 75, 8, 1, "#3a2a14");
    },
    fight(g) {
      Px.ellipse(g, 28, 40, 18, 14, "#5a3e24");
      for (const x of [18, 28, 38]) Px.poly(g, [[x - 4, 38], [x - 2, 34], [x + 2, 34], [x + 4, 38], [x + 2, 42], [x - 2, 42]], "#7a5634");
      Px.rect(g, 16, 50, 6, 10, "#8aa07a"); Px.rect(g, 34, 50, 6, 10, "#8aa07a");
      Px.rect(g, 40, 30, 6, 6, "#8aa07a");
      Px.ellipse(g, 48, 26, 8, 7, "#8aa07a");
      Px.rect(g, 49, 24, 3, 1, INK); Px.poly(g, [[44, 30], [54, 30], [50, 40]], "#e8e8e0");
      Px.poly(g, [[46, 21], [52, 20], [52, 22], [46, 23]], "#f0f0e8");
      Px.line(g, 8, 52, 10, 20, "#a07a4a"); // walking staff
    },
  },

  // ------------------------------------------------------------ Dr. Moss, the moth healer
  moss: {
    name: "Dr. Moss", color: "#f2e2b0",
    draw(g, face, blink) {
      // wings folded behind her
      Px.poly(g, [[8, 150], [14, 70], [40, 96], [60, 96], [86, 70], [92, 150]], "#c8b48a");
      Px.ellipse(g, 22, 112, 7, 7, "#8a6a4a"); Px.ellipse(g, 22, 112, 3, 3, "#2a1a10");
      Px.ellipse(g, 78, 112, 7, 7, "#8a6a4a"); Px.ellipse(g, 78, 112, 3, 3, "#2a1a10");
      Px.poly(g, [[28, 150], [32, 100], [68, 100], [72, 150]], "#3a5a5a");                // healer's shawl
      Px.rect(g, 47, 104, 6, 46, "#2a4444"); Px.rect(g, 48, 116, 4, 4, "#ffffff"); Px.rect(g, 49, 115, 2, 6, "#e85a6a"); Px.rect(g, 47, 117, 6, 2, "#e85a6a");
      // fluffy collar
      for (let i = 0; i < 9; i++) Px.ellipse(g, 30 + i * 5, 96 + (i % 2) * 2, 5, 5, "#f8f2e4");
      Px.ellipse(g, 50, 70, 20, 18, "#efe2c4");
      for (let i = 0; i < 7; i++) Px.ellipse(g, 34 + i * 5.3, 56 + (i % 2), 3, 3, "#f8f2e4");
      // antennae like ferns
      for (const s of [-1, 1]) {
        const x0 = 50 + s * 8;
        for (let i = 0; i < 9; i++) {
          const x = x0 + s * i * 2, y = 52 - i * 3.6;
          Px.rect(g, x, y, 1, 2, "#8a6a4a");
          Px.line(g, x, y, x - s * 3, y - 2, "#b89a6a"); Px.line(g, x, y, x + s * 3, y + 1, "#b89a6a");
        }
      }
      // huge dark moth eyes, round glasses
      const ey = 70;
      for (const x of [40, 60]) {
        if (blink) { Px.rect(g, x - 5, ey, 10, 1, INK); continue; }
        Px.ellipse(g, x, ey, 6, face === "surprised" ? 7 : 6, "#1a1424");
        Px.rect(g, x - 3, ey - 3, 2, 2, "#ffffff"); Px.rect(g, x + 2, ey + 2, 1, 1, "#9a8cc0");
        if (face === "sad") Px.rect(g, x - 6, ey - 7, 12, 2, "#efe2c4");
      }
      for (const x of [40, 60]) { g.fillStyle = "#c9a24a"; for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(t) * 8), Math.round(ey + Math.sin(t) * 8), 1, 1); } }
      Px.rect(g, 48, ey - 1, 4, 1, "#c9a24a");
      if (face === "smile") { Px.rect(g, 47, 82, 6, 1, "#6a4a3a"); Px.rect(g, 46, 81, 1, 1, "#6a4a3a"); Px.rect(g, 53, 81, 1, 1, "#6a4a3a"); }
      else Px.rect(g, 48, 82, 4, 1, "#6a4a3a");
    },
  },

  // ------------------------------------------------------------ Kit, the fox swordswoman
  kit: {
    name: "Kit", color: "#ff9a4a",
    draw(g, face, blink) {
      const fur = "#e8742a", furS = "#b8541a", white = "#f8efe4";
      Px.poly(g, [[18, 150], [24, 98], [40, 90], [60, 90], [76, 98], [82, 150]], "#2a2a3a");   // dark gi
      Px.poly(g, [[40, 90], [50, 120], [60, 90]], white);
      Px.line(g, 22, 96, 78, 150, "#8a6a3a"); Px.line(g, 23, 96, 79, 150, "#5a4024");          // sword strap
      Px.rect(g, 76, 40, 3, 70, "#3a3a4a"); Px.rect(g, 74, 38, 7, 3, "#c9a24a");                  // hilt over shoulder
      Px.poly(g, [[36, 86], [64, 86], [66, 94], [34, 94]], "#c8303c");                           // bandana
      Px.poly(g, [[36, 92], [30, 106], [36, 104]], "#c8303c");
      // ears
      Px.poly(g, [[28, 58], [30, 24], [44, 46]], fur); Px.poly(g, [[32, 52], [32, 32], [40, 46]], "#3a1a10");
      Px.poly(g, [[72, 58], [70, 24], [56, 46]], fur); Px.poly(g, [[68, 52], [68, 32], [60, 46]], "#3a1a10");
      // head: wide cheeks narrowing to a muzzle
      Px.poly(g, [[26, 62], [34, 46], [66, 46], [74, 62], [68, 76], [56, 86], [44, 86], [32, 76]], furS);
      Px.poly(g, [[26, 62], [34, 46], [64, 46], [72, 62], [66, 76], [54, 85], [44, 85], [32, 76]], fur);
      Px.poly(g, [[30, 68], [42, 70], [50, 86], [44, 86], [32, 76]], white);
      Px.poly(g, [[70, 68], [58, 70], [50, 86], [56, 86], [68, 76]], white);
      Px.ellipse(g, 50, 80, 3, 2, INK);
      Px.line(g, 44, 58, 58, 74, "#8a3a1a");                                                     // old scar
      const y = 62;
      if (blink) { Px.rect(g, 37, y + 1, 7, 1, INK); Px.rect(g, 56, y + 1, 7, 1, INK); }
      else {
        const narrow = face === "angry" || face === "smile";
        Px.poly(g, [[36, y], [45, y + (narrow ? 1 : 0)], [43, y + 3], [37, y + 3]], "#ffd23d");
        Px.poly(g, [[55, y + (narrow ? 1 : 0)], [64, y], [63, y + 3], [57, y + 3]], "#ffd23d");
        Px.rect(g, 41, y + 1, 1, 2, INK); Px.rect(g, 58, y + 1, 1, 2, INK);
        if (face === "angry") { Px.line(g, 35, y - 3, 45, y - 1, INK); Px.line(g, 65, y - 3, 55, y - 1, INK); }
      }
      if (face === "smile") { Px.line(g, 46, 83, 50, 84, INK); Px.line(g, 54, 83, 50, 84, INK); Px.rect(g, 53, 84, 1, 2, "#fff"); }
      else if (face === "surprised") Px.ellipse(g, 50, 84, 1, 1, INK);
      else Px.rect(g, 48, 84, 4, 1, INK);
    },
    fight(g) {
      const fur = "#e8742a";
      Px.poly(g, [[4, 44], [16, 40], [20, 46], [8, 50]], fur); Px.rect(g, 4, 44, 3, 3, "#f8efe4");    // tail
      Px.poly(g, [[16, 60], [18, 36], [34, 32], [38, 60]], "#2a2a3a");
      Px.rect(g, 18, 32, 18, 3, "#c8303c");
      Px.poly(g, [[22, 30], [26, 12], [42, 16], [50, 24], [40, 30]], fur);
      Px.poly(g, [[26, 14], [26, 4], [32, 12]], fur); Px.poly(g, [[34, 14], [38, 4], [40, 14]], fur);
      Px.poly(g, [[40, 24], [50, 24], [42, 30]], "#f8efe4");
      Px.rect(g, 36, 19, 3, 2, "#ffd23d"); Px.rect(g, 37, 19, 1, 2, INK);
      Px.line(g, 36, 40, 60, 28, "#d8e0f0"); Px.line(g, 36, 41, 60, 29, "#a8b0c0"); Px.rect(g, 33, 40, 4, 3, "#c9a24a");  // blade
    },
  },

  // ------------------------------------------------------------ Ozzie, the retired champion bear
  ozzie: {
    name: "Ozzie", color: "#d8a060",
    draw(g, face, blink) {
      const fur = "#7a4a2a", furS = "#5a341c", muzz = "#c8946a";
      Px.ellipse(g, 50, 140, 46, 34, furS); Px.ellipse(g, 48, 140, 44, 34, fur);
      Px.rect(g, 14, 134, 72, 9, "#c9a24a"); Px.rect(g, 42, 130, 16, 16, "#ffd23d"); Px.rect(g, 46, 134, 8, 8, "#c8303c");  // title belt
      Px.ellipse(g, 20, 112, 13, 12, "#c8303c"); Px.ellipse(g, 80, 112, 13, 12, "#a8202c");                                   // gloves up
      Px.ellipse(g, 17, 108, 4, 3, "#e85a6a"); Px.ellipse(g, 77, 108, 4, 3, "#c8303c");
      Px.ellipse(g, 28, 40, 9, 9, fur); Px.ellipse(g, 72, 40, 9, 9, fur); Px.ellipse(g, 28, 40, 4, 4, muzz); Px.ellipse(g, 72, 40, 4, 4, muzz);
      Px.ellipse(g, 52, 66, 30, 27, furS); Px.ellipse(g, 50, 66, 30, 27, fur);
      Px.ellipse(g, 50, 78, 13, 10, muzz); Px.ellipse(g, 50, 72, 5, 3, INK);
      Px.line(g, 62, 50, 70, 64, "#e8c8a0"); Px.line(g, 64, 52, 72, 60, "#e8c8a0");    // scars
      const y = 60;
      if (blink) { Px.rect(g, 36, y, 6, 1, INK); Px.rect(g, 58, y, 6, 1, INK); }
      else { Px.ellipse(g, 39, y, 2, 2, INK); Px.ellipse(g, 61, y, 2, 2, INK); Px.rect(g, 38, y - 1, 1, 1, "#fff"); Px.rect(g, 60, y - 1, 1, 1, "#fff"); }
      if (face === "angry") { Px.line(g, 34, y - 6, 43, y - 3, INK); Px.line(g, 66, y - 6, 57, y - 3, INK); }
      if (face === "smile") { Px.rect(g, 43, 84, 14, 2, "#3a1a10"); Px.rect(g, 44, 84, 12, 1, "#f8f0e0"); Px.rect(g, 42, 83, 1, 1, "#3a1a10"); Px.rect(g, 57, 83, 1, 1, "#3a1a10"); }
      else if (face === "angry") { Px.rect(g, 44, 85, 12, 2, "#3a1a10"); Px.rect(g, 45, 85, 2, 1, "#f8f0e0"); Px.rect(g, 53, 85, 2, 1, "#f8f0e0"); }
      else Px.rect(g, 46, 85, 8, 1, "#3a1a10");
    },
    fight(g) {
      Px.ellipse(g, 26, 42, 18, 18, "#7a4a2a");
      Px.rect(g, 14, 54, 8, 8, "#5a341c"); Px.rect(g, 32, 54, 8, 8, "#5a341c");
      Px.rect(g, 10, 44, 34, 4, "#c9a24a");
      Px.ellipse(g, 34, 18, 11, 10, "#7a4a2a"); Px.ellipse(g, 28, 9, 3, 3, "#7a4a2a");
      Px.ellipse(g, 42, 21, 5, 4, "#c8946a"); Px.rect(g, 45, 19, 2, 2, INK);
      Px.rect(g, 36, 15, 2, 2, INK);
      Px.ellipse(g, 48, 34, 7, 7, "#c8303c"); Px.ellipse(g, 40, 40, 6, 6, "#a8202c");
    },
  },

  // ------------------------------------------------------------ Lady Nightshade, the Blight Duchess (Vexmoor's elder sister)
  nightshade: {
    name: "Lady Nightshade", color: "#ff5ad8",
    draw(g, face, blink) {
      const gown = "#2a1238", gownS = "#1a0a26", skin = "#c8b8d8", skinS = "#a898b8", hair = "#1e0e2a";
      // hair falling behind her, all the way to the waist
      Px.ellipse(g, 50, 52, 24, 26, hair);
      Px.poly(g, [[26, 52], [74, 52], [80, 120], [70, 128], [30, 128], [20, 120]], hair);
      // gown with a high stiff collar
      Px.poly(g, [[14, 150], [24, 92], [38, 82], [62, 82], [76, 92], [86, 150]], gown);
      Px.poly(g, [[58, 150], [62, 86], [76, 92], [86, 150]], gownS);
      for (let i = 0; i < 4; i++) Px.line(g, 36 + i * 8, 100, 30 + i * 12, 150, "#4a2a5a");
      Px.poly(g, [[28, 86], [32, 66], [42, 80], [58, 80], [68, 66], [72, 86]], "#3a1a4a");
      Px.rect(g, 46, 70, 8, 12, skinS);
      // a necklace of black berries
      for (let i = 0; i < 7; i++) { const x = 38 + i * 4, y = 86 + Math.round(Math.sin(i / 6 * Math.PI) * 4); Px.ellipse(g, x, y, 1.5, 1.5, "#0a0610"); Px.rect(g, x - 1, y - 1, 1, 1, "#8a7aa8"); }
      // face
      Px.ellipse(g, 51, 54, 13, 16, skinS); Px.ellipse(g, 50, 54, 13, 16, skin);
      eyesHuman(g, 50, 51, face === "hurt" ? "neutral" : face, "#ff5ad8", blink);
      if (face === "dark" && !blink) { Px.rect(g, 43, 52, 2, 1, "#ffffff"); Px.rect(g, 55, 52, 2, 1, "#ffffff"); }
      // dark lips
      if (face === "smile" || face === "dark") { Px.rect(g, 45, 62, 10, 1, "#3a0a3a"); Px.rect(g, 44, 61, 1, 1, "#3a0a3a"); Px.rect(g, 55, 61, 1, 1, "#3a0a3a"); Px.rect(g, 47, 63, 6, 1, "#5a1a5a"); }
      else if (face === "angry") { Px.rect(g, 45, 63, 10, 2, "#3a0a3a"); Px.rect(g, 46, 63, 8, 1, "#e8e0f0"); }
      else if (face === "hurt") { Px.ellipse(g, 50, 63, 3, 2, "#3a0a3a"); Px.line(g, 40, 42, 58, 66, "#7a3a8a"); }
      else Px.rect(g, 46, 62, 8, 2, "#3a0a3a");
      // nightshade flowers pinned through her hair
      const flower = (x, y) => {
        for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 - Math.PI / 2; Px.line(g, x, y, x + Math.round(Math.cos(a) * 4), y + Math.round(Math.sin(a) * 4), "#8a3ac8"); }
        Px.rect(g, x - 1, y - 1, 2, 2, "#ffd23d");
      };
      for (const [x, y] of [[28, 44], [24, 70], [74, 46], [78, 74], [30, 104], [72, 108]]) flower(x, y);
      // her brother's crown of thorns, cracked down the middle and mended with silver
      for (const [x, h] of [[34, 14], [40, 20], [46, 16], [54, 16], [60, 20], [66, 14]]) Px.poly(g, [[x - 2, 34], [x + 2, 34], [x, 34 - h]], "#0a0610");
      Px.rect(g, 33, 32, 35, 3, "#0a0610");
      Px.line(g, 50, 14, 48, 22, "#e8e8ff"); Px.line(g, 48, 22, 52, 28, "#e8e8ff"); Px.line(g, 52, 28, 50, 35, "#e8e8ff");
      if (face === "dark") { g.save(); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(20,4,30,0.35)"; g.fillRect(36, 38, 28, 14); g.restore(); }
    },
    fight(g) {
      Px.poly(g, [[10, 62], [20, 26], [32, 20], [44, 26], [54, 62]], "#2a1238");
      Px.poly(g, [[32, 62], [36, 26], [44, 26], [54, 62]], "#1a0a26");
      Px.poly(g, [[24, 24], [24, 8], [40, 8], [40, 24], [44, 40], [20, 40]], "#1e0e2a");
      Px.ellipse(g, 32, 16, 7, 8, "#c8b8d8");
      for (const x of [26, 30, 34, 38]) Px.poly(g, [[x - 1, 8], [x + 1, 8], [x, 1]], "#0a0610");
      Px.rect(g, 25, 7, 15, 2, "#0a0610"); Px.rect(g, 32, 2, 1, 6, "#e8e8ff");
      Px.rect(g, 33, 15, 2, 1, "#ff5ad8"); Px.rect(g, 37, 15, 2, 1, "#ff5ad8");
      for (const [x, y] of [[22, 14], [42, 18], [20, 34]]) { Px.rect(g, x - 1, y, 3, 1, "#8a3ac8"); Px.rect(g, x, y - 1, 1, 3, "#8a3ac8"); }
      // outstretched hand and a whip of thorns
      Px.poly(g, [[40, 28], [52, 32], [54, 30], [56, 33], [52, 36], [42, 34]], "#c8b8d8");
      for (let i = 0; i < 6; i++) { const x = 54 + i * 1.6, y = 34 + i * 4; Px.rect(g, x, y, 2, 3, "#3a1a4a"); Px.rect(g, x + 2, y + 1, 1, 1, "#c07aff"); }
    },
  },

  // ------------------------------------------------------------ Rook, the raven hex-breaker
  rook: {
    name: "Rook", color: "#8fb0ff",
    draw(g, face, blink) {
      const feat = "#14141e", sheen = "#2a3a5a", coat = "#4a4a58";
      Px.poly(g, [[16, 150], [22, 96], [38, 86], [62, 86], [78, 96], [84, 150]], coat);
      Px.poly(g, [[38, 86], [50, 120], [62, 86]], "#2a2a34");
      Px.poly(g, [[36, 88], [44, 112], [50, 120], [42, 94]], "#5a5a6a"); Px.poly(g, [[64, 88], [56, 112], [50, 120], [58, 94]], "#5a5a6a");
      Px.poly(g, [[34, 84], [66, 84], [70, 94], [30, 94]], "#2a6a6a");   // teal scarf
      Px.poly(g, [[60, 92], [66, 116], [72, 112], [66, 92]], "#2a6a6a");
      // hex sigils stitched on the coat
      for (const [x, y] of [[26, 120], [74, 128], [30, 140]]) { g.fillStyle = "#c9a24a"; for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(t) * 4), Math.round(y + Math.sin(t) * 4), 1, 1); } Px.rect(g, x, y, 1, 1, "#c9a24a"); }
      // head and crest
      Px.poly(g, [[38, 46], [42, 34], [46, 44], [50, 30], [54, 44], [60, 36], [60, 50]], feat);
      Px.ellipse(g, 50, 64, 20, 20, feat);
      Px.line(g, 36, 58, 44, 50, sheen); Px.line(g, 38, 70, 46, 76, sheen); Px.line(g, 56, 48, 62, 54, sheen);
      // beak, pointing off to the side
      Px.poly(g, [[54, 62], [86, 70], [54, 74]], "#6a6a76"); Px.poly(g, [[54, 70], [80, 71], [54, 75]], "#44444e");
      Px.rect(g, 58, 64, 3, 1, "#2a2a30");
      const y = 60;
      const eye = (x) => {
        if (blink) { Px.rect(g, x - 2, y, 5, 1, "#8fb0ff"); return; }
        const r = face === "surprised" ? 3 : 2;
        Px.ellipse(g, x, y, r, r, "#e8eef8"); Px.rect(g, x, y, 1, 1, INK);
      };
      eye(40); eye(54);
      // monocle over the right eye
      g.fillStyle = "#c9a24a"; for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2; g.fillRect(Math.round(54 + Math.cos(t) * 5), Math.round(y + Math.sin(t) * 5), 1, 1); }
      Px.line(g, 58, 64, 62, 82, "#c9a24a");
      if (face === "stern" || face === "angry") { Px.line(g, 36, y - 5, 44, y - 3, "#6a7aa8"); Px.line(g, 58, y - 5, 50, y - 3, "#6a7aa8"); }
      if (face === "smile") { Px.line(g, 36, y + 3, 44, y + 3, "#6a7aa8"); }
    },
    fight(g) {
      Px.poly(g, [[14, 62], [18, 30], [36, 26], [42, 62]], "#4a4a58");
      Px.rect(g, 18, 28, 20, 4, "#2a6a6a");
      Px.ellipse(g, 30, 18, 10, 10, "#14141e");
      Px.poly(g, [[24, 10], [26, 2], [30, 9], [34, 3], [34, 12]], "#14141e");
      Px.poly(g, [[36, 16], [52, 20], [36, 23]], "#6a6a76");
      Px.ellipse(g, 33, 16, 1.5, 1.5, "#e8eef8"); Px.rect(g, 33, 16, 1, 1, INK);
      // a hex charm glowing in his outstretched wing
      Px.poly(g, [[38, 36], [52, 34], [52, 40], [40, 42]], "#14141e");
      Px.ellipse(g, 55, 37, 4, 4, "#fff2b0"); Px.ellipse(g, 55, 37, 2, 2, "#ffffff");
    },
  },

  // ------------------------------------------------------------ Pip, the hedgehog kid with HS
  pip: {
    name: "Pip", color: "#ffc870",
    draw(g, face, blink) {
      g.save(); g.translate(0, -26);   // he's short, but his face should clear the text box
      this.body(g, face, blink);
      g.restore();
    },
    body(g, face, blink) {
      const spine = "#6a4a2a", spineH = "#8a6a3a", face1 = "#f0dcc0";
      // spines, fanned out behind him
      for (let i = 0; i < 13; i++) {
        const a = Math.PI * (0.95 + i * 0.085), x = 50 + Math.cos(a) * 30, y = 100 + Math.sin(a) * 30;
        Px.poly(g, [[50 + Math.cos(a - 0.2) * 12, 100 + Math.sin(a - 0.2) * 12], [x, y], [50 + Math.cos(a + 0.2) * 12, 100 + Math.sin(a + 0.2) * 12]], i % 2 ? spine : spineH);
      }
      Px.ellipse(g, 50, 98, 24, 20, spine);
      // little body
      Px.ellipse(g, 50, 138, 20, 16, spineH); Px.ellipse(g, 50, 140, 12, 11, face1);
      // arm, with HS marks he hasn't learned to look at yet
      Px.ellipse(g, 30, 132, 6, 10, spineH);
      for (const [x, y, r] of [[29, 128, 2], [31, 135, 3], [28, 140, 1.5]]) Px.ellipse(g, x, y, r, r, "#0b0610");
      Px.ellipse(g, 70, 132, 6, 10, spine);
      // too-big scarf
      Px.poly(g, [[30, 112], [70, 112], [72, 120], [28, 120]], "#e8b040");
      for (const x of [36, 48, 60]) Px.rect(g, x, 112, 3, 8, "#c8303c");
      Px.poly(g, [[60, 118], [66, 136], [72, 134], [68, 118]], "#e8b040");
      // face
      Px.ellipse(g, 50, 98, 17, 15, face1);
      Px.ellipse(g, 50, 105, 2.5, 2, INK);
      const y = 95;
      for (const x of [42, 58]) {
        if (blink) { Px.rect(g, x - 3, y + 1, 6, 1, INK); continue; }
        if (face === "smile") { Px.line(g, x - 3, y + 1, x, y - 1, INK); Px.line(g, x, y - 1, x + 3, y + 1, INK); continue; }
        const r = face === "surprised" ? 4 : 3;
        Px.ellipse(g, x, y, r, r + 1, INK); Px.rect(g, x - 1, y - 2, 2, 2, "#ffffff");
      }
      if (face === "sad" || face === "surprised") { Px.line(g, 37, y - 6, 45, y - 8, "#6a4a2a"); Px.line(g, 63, y - 6, 55, y - 8, "#6a4a2a"); }
      if (face === "angry") { Px.line(g, 37, y - 8, 45, y - 5, "#6a4a2a"); Px.line(g, 63, y - 8, 55, y - 5, "#6a4a2a"); }
      if (face === "sad") { Px.rect(g, 38, y + 4, 1, 4, "#8fc8f0"); Px.rect(g, 46, 109, 8, 1, INK); }
      else if (face === "smile") { Px.rect(g, 46, 108, 8, 1, INK); Px.rect(g, 45, 107, 1, 1, INK); Px.rect(g, 54, 107, 1, 1, INK); }
      else if (face === "surprised") Px.ellipse(g, 50, 109, 1.5, 1.5, INK);
      else Px.rect(g, 48, 109, 4, 1, INK);
    },
    fight(g) {
      for (let i = 0; i < 8; i++) { const a = Math.PI * (0.6 + i * 0.13); Px.poly(g, [[28, 40], [28 + Math.cos(a) * 18, 40 + Math.sin(a) * 18 - 4], [28 + Math.cos(a + 0.2) * 10, 40 + Math.sin(a + 0.2) * 10]], i % 2 ? "#6a4a2a" : "#8a6a3a"); }
      Px.ellipse(g, 28, 46, 13, 11, "#6a4a2a");
      Px.ellipse(g, 38, 44, 8, 7, "#f0dcc0"); Px.rect(g, 45, 44, 2, 2, INK); Px.rect(g, 39, 41, 2, 2, INK);
      Px.rect(g, 22, 50, 18, 3, "#e8b040"); Px.rect(g, 16, 50, 6, 2, "#e8b040");
      Px.ellipse(g, 22, 59, 4, 2, "#5a3a1a"); Px.ellipse(g, 34, 59, 4, 2, "#5a3a1a");
    },
  },

  // ------------------------------------------------------------ Sir Quill, porcupine knight, Pip's big brother
  quill: {
    name: "Sir Quill", color: "#d0b0ff",
    draw(g, face, blink) {
      // quills: long, pale, black-tipped
      for (let i = 0; i < 17; i++) {
        const a = Math.PI * (0.92 + i * 0.072), x = 50 + Math.cos(a) * 46, y = 70 + Math.sin(a) * 46;
        Px.line(g, 50 + Math.cos(a) * 14, 70 + Math.sin(a) * 14, x, y, "#e8e0d0");
        Px.line(g, x - Math.cos(a) * 5, y - Math.sin(a) * 5, x, y, "#2a2030");
      }
      // armour of dark violet, Nightshade's flower on the chest
      Px.poly(g, [[14, 150], [20, 96], [38, 86], [62, 86], [80, 96], [86, 150]], "#3a2a48");
      Px.poly(g, [[60, 150], [62, 90], [80, 96], [86, 150]], "#2a1a38");
      Px.poly(g, [[12, 100], [30, 88], [36, 104], [16, 112]], "#4a3a5a"); Px.poly(g, [[88, 100], [70, 88], [64, 104], [84, 112]], "#4a3a5a");
      for (const x of [18, 26, 74, 82]) Px.poly(g, [[x - 2, 96], [x + 2, 96], [x, 88]], "#1a0a20");
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 - Math.PI / 2; Px.line(g, 50, 116, 50 + Math.round(Math.cos(a) * 6), 116 + Math.round(Math.sin(a) * 6), "#8a3ac8"); }
      Px.rect(g, 49, 115, 2, 2, "#ffd23d");
      // head
      Px.ellipse(g, 51, 64, 19, 19, "#5a4034"); Px.ellipse(g, 50, 64, 19, 19, "#7a5a4a");
      Px.ellipse(g, 50, 74, 10, 8, "#a88a74"); Px.ellipse(g, 50, 70, 3, 2, "#1a0e0e");
      const y = 60;
      for (const x of [41, 59]) {
        if (blink) { Px.rect(g, x - 3, y, 6, 1, INK); continue; }
        Px.ellipse(g, x, y, 2.5, 2.5, INK); Px.rect(g, x - 1, y - 1, 1, 1, "#ffffff");
        if (face === "angry") Px.rect(g, x - 1, y, 2, 1, "#ff5ad8");
      }
      if (face === "angry") { Px.line(g, 36, y - 6, 45, y - 3, INK); Px.line(g, 64, y - 6, 55, y - 3, INK); }
      if (face === "sad" || face === "hurt") { Px.line(g, 36, y - 3, 45, y - 6, INK); Px.line(g, 64, y - 3, 55, y - 6, INK); }
      if (face === "smile") { Px.rect(g, 45, 79, 10, 1, "#3a1a10"); Px.rect(g, 44, 78, 1, 1, "#3a1a10"); Px.rect(g, 55, 78, 1, 1, "#3a1a10"); }
      else if (face === "angry") { Px.rect(g, 45, 80, 10, 2, "#3a1a10"); Px.rect(g, 46, 80, 2, 1, "#f0e8d8"); Px.rect(g, 52, 80, 2, 1, "#f0e8d8"); }
      else Px.rect(g, 46, 80, 8, 1, "#3a1a10");
      // the "cure": thorn vines growing up out of his collar
      for (const [x0, y0, x1, y1] of [[36, 88, 30, 66], [62, 88, 70, 70], [44, 86, 42, 78], [30, 66, 34, 54]]) {
        Px.line(g, x0, y0, x1, y1, "#3a1a3a");
        Px.rect(g, (x0 + x1) / 2 + 1, (y0 + y1) / 2, 2, 1, "#c07aff");
      }
      if (face === "hurt") Px.rect(g, 64, 64, 2, 4, "#bfe6ff");
    },
    fight(g) {
      for (let i = 0; i < 9; i++) { const a = Math.PI * (0.75 + i * 0.09); Px.line(g, 26, 26, 26 + Math.cos(a) * 24, 26 + Math.sin(a) * 24, "#e8e0d0"); }
      Px.poly(g, [[14, 62], [16, 30], [38, 28], [42, 62]], "#3a2a48");
      Px.rect(g, 10, 28, 10, 7, "#4a3a5a"); Px.rect(g, 34, 28, 10, 7, "#4a3a5a");
      Px.ellipse(g, 30, 18, 9, 9, "#7a5a4a"); Px.ellipse(g, 37, 21, 5, 4, "#a88a74");
      Px.rect(g, 40, 19, 2, 2, "#1a0e0e"); Px.rect(g, 33, 15, 2, 2, INK);
      Px.line(g, 22, 30, 18, 20, "#3a1a3a");
      Px.line(g, 34, 44, 62, 30, "#8a8a9a"); Px.poly(g, [[60, 27], [64, 29], [62, 33]], "#c8c8d8");   // lance
    },
  },

  // ------------------------------------------------------------ battle-only enemies
  hound: {
    name: "Thorn Hound", color: "#c07aff",
    fight(g) {
      Px.poly(g, [[6, 40], [14, 34], [40, 32], [50, 24], [58, 26], [60, 34], [52, 40], [44, 42], [42, 58], [36, 58], [34, 46], [20, 46], [18, 58], [12, 58], [12, 46]], "#1a0a22");
      Px.poly(g, [[50, 24], [50, 14], [55, 22]], "#1a0a22");
      for (const x of [12, 18, 24, 30, 36, 42]) Px.poly(g, [[x - 2, 34], [x + 2, 33], [x, 26 - (x % 4)]], "#5a2a6a");
      Px.rect(g, 53, 28, 3, 2, "#ff5ad8");
      Px.poly(g, [[56, 34], [62, 34], [60, 37]], "#e8e8f0");
    },
  },
  moth: {
    name: "Blight Moth", color: "#7fff6a",
    fight(g) {
      Px.poly(g, [[30, 32], [6, 12], [4, 34], [16, 46]], "#4a2a6a"); Px.poly(g, [[34, 32], [58, 12], [60, 34], [48, 46]], "#3a1a5a");
      Px.poly(g, [[30, 36], [14, 52], [26, 56]], "#3a1a5a"); Px.poly(g, [[34, 36], [50, 52], [38, 56]], "#2a1048");
      Px.ellipse(g, 14, 28, 4, 4, "#1a2a14"); Px.ellipse(g, 14, 28, 2, 2, "#7fff6a");
      Px.ellipse(g, 50, 28, 4, 4, "#1a2a14"); Px.ellipse(g, 50, 28, 2, 2, "#7fff6a");
      Px.ellipse(g, 32, 36, 4, 12, "#1a1020");
      Px.rect(g, 30, 25, 2, 2, "#7fff6a"); Px.rect(g, 33, 25, 2, 2, "#7fff6a");
      Px.line(g, 30, 24, 24, 14, "#1a1020"); Px.line(g, 34, 24, 40, 14, "#1a1020");
    },
  },
  knight: {
    name: "Thorn Knight", color: "#ff5ad8",
    fight(g) {
      Px.poly(g, [[12, 62], [14, 30], [40, 30], [42, 62]], "#2a1a38");
      Px.rect(g, 8, 28, 12, 8, "#3a2a4a"); Px.rect(g, 34, 28, 12, 8, "#3a2a4a");
      for (const x of [10, 16, 36, 42]) Px.poly(g, [[x - 1, 28], [x + 1, 28], [x, 22]], "#1a0a20");
      Px.poly(g, [[18, 26], [18, 8], [24, 4], [32, 4], [36, 8], [36, 26]], "#2a1a38");
      Px.rect(g, 20, 12, 16, 2, "#0b0610"); Px.rect(g, 28, 12, 6, 2, "#ff5ad8");
      for (const x of [20, 26, 32]) Px.poly(g, [[x - 2, 6], [x + 2, 6], [x, -1]], "#5a2a6a");
      Px.line(g, 40, 50, 58, 20, "#a8a8b8"); Px.line(g, 41, 50, 59, 20, "#78788a"); Px.rect(g, 37, 48, 6, 3, "#5a2a6a");
    },
  },
  bloom: {
    name: "The Withering Bloom", color: "#ff5ad8",
    fight(g) {
      Px.rect(g, 28, 34, 6, 30, "#1a3a1a");
      for (const y of [40, 48, 56]) { Px.poly(g, [[34, y], [38, y - 2], [34, y + 2]], "#c07aff"); Px.poly(g, [[28, y + 3], [24, y + 1], [28, y + 5]], "#c07aff"); }
      Px.poly(g, [[30, 52], [12, 44], [16, 56]], "#2a4a2a"); Px.poly(g, [[34, 46], [52, 40], [48, 52]], "#2a4a2a");
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; Px.ellipse(g, 31 + Math.cos(a) * 12, 20 + Math.sin(a) * 11, 8, 7, k % 2 ? "#1a0a1a" : "#3a1a3a"); }
      Px.ellipse(g, 31, 20, 9, 8, "#4a1a4a");
      Px.ellipse(g, 33, 22, 6, 4, "#0b0610");
      for (const x of [29, 32, 35, 38]) Px.rect(g, x, 19, 1, 2, "#e8e0d0");
      Px.ellipse(g, 30, 14, 2, 2, "#ff5ad8");
    },
  },
};

// Cuetip's tiny classic sprite (from CuetipLLC's official pixel art), used on the title and icon
function classicCuetip(scale = 2) {
  const pal = { B: "#4fa8ff", R: "#aa0a19", K: "#000000" };
  const c = Px.canvas(25 * scale, 12 * scale), g = c.getContext("2d");
  CUETIP_GRID.forEach((row, y) => [...row].forEach((k, x) => { if (pal[k]) { g.fillStyle = pal[k]; g.fillRect(x * scale, y * scale, scale, scale); } }));
  return Px.outline(c);
}

const SpriteCache = {
  cache: new Map(),
  // variant: Cuetip's HS level (0..1), rounded so the cache stays small
  get(who, face = "neutral", blink = false, dimmed = false, variant = 0) {
    const v = who === "cuetip" ? Math.round(variant * 12) / 12 : 0;
    const key = `${who}|${face}|${blink}|${dimmed}|${v}|${who === "cuetip" && CAST.cuetip.braid ? 1 : 0}`;
    let c = this.cache.get(key);
    if (c) return c;
    if (dimmed) c = Px.dim(this.get(who, face, blink, false, v), 0.45);
    else {
      const raw = Px.canvas(CW, CH);
      CAST[who].draw(raw.getContext("2d"), face, blink, v);
      c = Px.outline(raw);
    }
    this.cache.set(key, c);
    return c;
  },
  fighter(who, hs = 0) {
    const v = who === "cuetip" ? Math.round(hs * 8) / 8 : 0;
    const key = `fight|${who}|${v}|${who === "cuetip" && CAST.cuetip.braid ? 1 : 0}`;
    let c = this.cache.get(key);
    if (c) return c;
    const raw = Px.canvas(64, 64);
    CAST[who].fight(raw.getContext("2d"), v);
    c = Px.outline(raw);
    this.cache.set(key, c);
    return c;
  },
};
