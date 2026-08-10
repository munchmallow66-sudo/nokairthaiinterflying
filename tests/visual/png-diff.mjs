/**
 * Dependency-free PNG comparison for the before/after screenshot phases.
 *
 * Reports, per capture, the percentage of pixels that changed and the first
 * row where they start diverging — the row matters more than the percentage,
 * because once a page gets 60px taller everything below shifts and a naive
 * diff reports "40% changed" for what is really one layout change.
 *
 *   node tests/visual/png-diff.mjs before after
 */
import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";

function readPNG(file) {
  const b = fs.readFileSync(file);
  let o = 8;
  let w = 0;
  let h = 0;
  let bd = 0;
  let ct = 0;
  const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o);
    const type = b.toString("ascii", o + 4, o + 8);
    if (type === "IHDR") {
      w = b.readUInt32BE(o + 8);
      h = b.readUInt32BE(o + 12);
      bd = b[o + 16];
      ct = b[o + 17];
    } else if (type === "IDAT") {
      idat.push(b.subarray(o + 8, o + 8 + len));
    } else if (type === "IEND") break;
    o += 12 + len;
  }
  if (bd !== 8) throw new Error(`${file}: only 8-bit PNGs supported`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : ct === 4 ? 2 : 1;
  const bpp = ch;
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const bb = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (ft === 1) v += a;
      else if (ft === 2) v += bb;
      else if (ft === 3) v += (a + bb) >> 1;
      else if (ft === 4) {
        const p = a + bb - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - bb);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
      }
      cur[x] = v & 255;
    }
  }
  return { w, h, bpp, data: out };
}

const [, , phaseA, phaseB] = process.argv;
if (!phaseA || !phaseB) {
  console.error("usage: png-diff.mjs <phaseA> <phaseB>");
  process.exit(1);
}

const dirA = path.join(process.cwd(), "screenshots", phaseA);
const dirB = path.join(process.cwd(), "screenshots", phaseB);
const files = fs
  .readdirSync(dirA)
  .filter((f) => f.endsWith(".png") && !f.endsWith(".anim.png"))
  .sort();

console.log(`${"capture".padEnd(24)} ${"size".padEnd(22)} changed%  firstDiffRow`);
for (const f of files) {
  const pb = path.join(dirB, f);
  if (!fs.existsSync(pb)) continue;
  const A = readPNG(path.join(dirA, f));
  const B = readPNG(pb);
  const w = Math.min(A.w, B.w);
  const h = Math.min(A.h, B.h);
  let changed = 0;
  let total = 0;
  let firstRow = -1;
  for (let y = 0; y < h; y++) {
    let rowChanged = 0;
    for (let x = 0; x < w; x += 2) {
      const ia = y * A.w * A.bpp + x * A.bpp;
      const ib = y * B.w * B.bpp + x * B.bpp;
      const d =
        Math.abs(A.data[ia] - B.data[ib]) +
        Math.abs(A.data[ia + 1] - B.data[ib + 1]) +
        Math.abs(A.data[ia + 2] - B.data[ib + 2]);
      total++;
      if (d > 24) {
        changed++;
        rowChanged++;
      }
    }
    // A handful of stray pixels is antialiasing; 2% of a row is a real change.
    if (firstRow < 0 && rowChanged > w / 100) firstRow = y;
  }
  console.log(
    `${f.replace(".png", "").padEnd(24)} ${`${A.w}x${A.h} -> ${B.w}x${B.h}`.padEnd(22)} ` +
      `${((100 * changed) / total).toFixed(2).padStart(6)}%  ${firstRow < 0 ? "none" : firstRow}`
  );
}
