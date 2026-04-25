import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");
mkdirSync(publicDir, { recursive: true });

const svg = readFileSync(resolve(publicDir, "icon.svg"));

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  await sharp(svg, { density: 384 })
    .resize(t.size, t.size)
    .png({ compressionLevel: 9 })
    .toFile(resolve(publicDir, t.name));
  console.log("wrote", t.name);
}
