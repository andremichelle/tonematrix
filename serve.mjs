// Static server with COOP/COEP so localhost is cross-origin isolated (enables SharedArrayBuffer).
// Run:  node serve.mjs   ->  open http://localhost:8080  (NOT the IDE live-preview)
import {createServer} from "node:http"
import {readFile} from "node:fs/promises"
import {extname, join, normalize} from "node:path"

const ROOT = process.cwd()
const PORT = 8080

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ttf": "font/ttf"
}

createServer(async (req, res) => {
    const pathname = normalize(decodeURIComponent(new URL(req.url, "http://localhost").pathname))
    const file = join(ROOT, pathname === "/" ? "index.html" : pathname)
    if (!file.startsWith(ROOT)) {
        res.writeHead(403).end("Forbidden")
        return
    }
    try {
        const body = await readFile(file)
        res.writeHead(200, {
            "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cache-Control": "no-store"
        })
        res.end(body)
    } catch {
        res.writeHead(404).end("Not found")
    }
}).listen(PORT, () => console.log(`http://localhost:${PORT}  (cross-origin isolated)`))
