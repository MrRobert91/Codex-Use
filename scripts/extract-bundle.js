const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const sourcePath = path.join(process.cwd(), "Chuleta de Codex.html");
const outDir = path.join(process.cwd(), "public");
const assetsDir = path.join(outDir, "assets");
const designSystemDir = path.join(
  outDir,
  "_ds",
  "factor-a-f5-design-system-8b510d6d-4c0e-4fd8-852d-b2e33fc2a1b7",
);

const source = fs.readFileSync(sourcePath, "utf8");

function readJsonScript(type) {
  const match = source.match(
    new RegExp(`<script type="${type}">\\s*([\\s\\S]*?)\\s*<\\/script>`),
  );
  if (!match) throw new Error(`Missing bundled script: ${type}`);
  return JSON.parse(match[1]);
}

const manifest = readJsonScript("__bundler/manifest");
let template = readJsonScript("__bundler/template");

fs.rmSync(outDir, { force: true, recursive: true });
fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(designSystemDir, { recursive: true });

for (const [uuid, entry] of Object.entries(manifest)) {
  let bytes = Buffer.from(entry.data, "base64");
  if (entry.compressed) bytes = zlib.gunzipSync(bytes);

  const ext = entry.mime.includes("javascript") ? "js" : "bin";
  const fileName = `${uuid}.${ext}`;
  fs.writeFileSync(path.join(assetsDir, fileName), bytes);
  template = template.split(uuid).join(`/assets/${fileName}`);
}

template = template
  .replace("<head>", "<head>\n<title>Chuleta de Codex</title>")
  .replace(
    /<script>\s*addEventListener\('load', \(\) => \{[\s\S]*?window\.print\(\), 500\);\s*\}\)\(\);\s*\}\);\s*<\/script>/,
    "",
  );

fs.writeFileSync(path.join(outDir, "index.html"), template);

fs.writeFileSync(
  path.join(designSystemDir, "styles.css"),
  `:root {
  --f5-orange: #ff4700;
  --f5-orange-2: #ff7a3d;
  --f5-orange-soft: #fff1e9;
  --f5-black: #020100;
  --f5-ink-2: #2f2b28;
  --f5-gray: #776f68;
  --font-body: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

html {
  background:
    linear-gradient(90deg, rgba(255, 71, 0, .08), transparent 34%),
    #faf9f7;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at 9% 0%, rgba(255, 71, 0, .16), transparent 26%),
    #faf9f7;
}

.ws-progress {
  box-shadow: 0 12px 30px rgba(255, 71, 0, .08);
}

.ws-progress::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: linear-gradient(90deg, var(--f5-orange), transparent);
}

article[data-ch] {
  transition: border-color .18s ease, background .18s ease, box-shadow .18s ease, transform .18s ease;
}

article[data-ch]:hover {
  border-color: rgba(255, 71, 0, .45) !important;
  box-shadow: 0 16px 36px rgba(255, 71, 0, .10), 0 10px 26px rgba(2, 1, 0, .05) !important;
  transform: translateY(-1px);
}

.ws-check {
  box-shadow: 0 4px 12px rgba(255, 71, 0, .10);
}

.ws-check:focus-visible,
.ws-reset:focus-visible,
a.ws-link:focus-visible {
  outline: 3px solid rgba(255, 71, 0, .35);
  outline-offset: 3px;
}

.ws-reset {
  border-color: rgba(255, 71, 0, .55) !important;
  color: var(--f5-orange) !important;
}

.ws-reset:hover {
  background: var(--f5-orange) !important;
  color: #fff !important;
}

@media (max-width: 720px) {
  .ws-progress {
    padding: 12px 16px !important;
    gap: 14px !important;
  }

  .ws-progress > div:first-child span:last-child {
    max-width: 138px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ws-col {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }

  h1 {
    font-size: 48px !important;
    line-height: .98 !important;
  }

  h2 {
    font-size: 28px !important;
  }

  article[data-ch] {
    padding: 26px 24px !important;
    border-radius: 18px !important;
  }

  article[data-ch] > div {
    align-items: stretch !important;
    flex-direction: column !important;
    gap: 14px !important;
  }

  article[data-ch] > div > div:last-child {
    padding-right: 0 !important;
  }

  article[data-ch] h3 {
    font-size: 24px !important;
    line-height: 1.12 !important;
    max-width: calc(100% - 56px);
  }

  article[data-ch] ol {
    padding-left: 19px !important;
  }
}
`,
);

fs.writeFileSync(
  path.join(designSystemDir, "_ds_bundle.js"),
  "window.__factorF5DesignSystemLoaded = true;\n",
);
