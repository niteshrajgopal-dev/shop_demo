import { readFileSync } from "node:fs";

const [filePath, uploadUrl, assetUrl, issue, title] = process.argv.slice(2);

if (!filePath || !uploadUrl || !assetUrl || !issue || !title) {
  console.error(
    "Usage: node scripts/upload-linear-attachment.mjs <file> <uploadUrl> <assetUrl> <issue> <title>",
  );
  process.exit(1);
}

const body = readFileSync(filePath);
const size = body.byteLength;

const response = await fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "content-type": "image/png",
    "cache-control": "public, max-age=31536000",
    "x-goog-content-length-range": `${size},${size}`,
    "Content-Disposition": `attachment; filename="${filePath.split(/[\\/]/).pop()}"`,
  },
  body,
});

console.log("upload status", response.status);
if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

console.log(JSON.stringify({ assetUrl, issue, title }));
