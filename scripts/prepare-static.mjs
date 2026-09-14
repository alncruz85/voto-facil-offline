import fs from "fs";
import path from "path";

const assetsDir = path.resolve(".output/public/assets");
if (!fs.existsSync(assetsDir)) {
  console.error("Assets directory not found:", assetsDir);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
const jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));

if (!jsFile) {
  console.error("No index-*.js found in assets");
  process.exit(1);
}

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Voto Fácil Offline</title>
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>
`;

fs.writeFileSync(".output/public/index.html", html);
fs.mkdirSync("dist", { recursive: true });
fs.cpSync(".output/public", "dist", { recursive: true });

console.log("Static index.html generated successfully with bundle:", jsFile);
