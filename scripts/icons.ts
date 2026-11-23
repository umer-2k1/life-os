import sharp from "sharp";
import { readFileSync } from "node:fs";

async function main() {
  const svg = readFileSync("public/icons/icon.svg");
  for (const size of [192, 512, 180]) {
    const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(`public/icons/${name}`);
    console.log("wrote", name);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
