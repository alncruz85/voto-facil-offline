import fs from "fs";
import path from "path";

const publicDir = path.resolve(".output/public");
const indexPath = path.join(publicDir, "index.html");

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf8");
  html = html.replace(/href="\/assets\//g, 'href="assets/');
  html = html.replace(/src="\/assets\//g, 'src="assets/');
  fs.writeFileSync(indexPath, html);
  console.log("SUCCESS: Updated .output/public/index.html with relative asset paths.");
} else {
  console.error("Error: index.html not found in .output/public");
  process.exit(1);
}

const distDir = path.resolve("dist");
fs.mkdirSync(distDir, { recursive: true });
fs.cpSync(publicDir, distDir, { recursive: true });

console.log("SUCCESS: Static files copied to dist/ with relative paths.");
