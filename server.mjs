import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const originalData = join(root, "data", "db.js");
const port = Number(process.env.PORT) || 8790;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/data/db.js") {
    try {
      const body = await readFile(originalData);
      response.writeHead(200, { "Content-Type": types[".js"], "Cache-Control": "no-store" });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
    return;
  }
  const target = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  try {
    const body = await readFile(join(root, target));
    response.writeHead(200, { "Content-Type": types[extname(target)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(body);
  } catch {
    try {
      const body = await readFile(join(root, "404.html"));
      response.writeHead(404, { "Content-Type": types[".html"], "Cache-Control": "no-store" });
      response.end(body);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("404 — Halaman tidak ditemukan");
    }
  }
}).listen(port, () => console.log(`Titik Ngemil V2 aktif di http://localhost:${port}`));
