import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT || 10000);
const MAX_BODY = 25 * 1024 * 1024;

const routes = {
  '/api/admin': () => import('./api/admin.js'),
  '/api/capabilities': () => import('./api/capabilities.js'),
  '/api/native-capability': () => import('./api/native-capability.js'),
  '/api/chat': () => import('./api/chat.js'),
  '/api/edit-image': () => import('./api/edit-image.js'),
  '/api/generate-image': () => import('./api/generate-image.js'),
  '/api/generate-music': () => import('./api/generate-music.js'),
  '/api/generate-video': () => import('./api/generate-video.js')
};

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function wrapResponse(res) {
  return {
    status(code) { res.statusCode = code; return this; },
    setHeader(name, value) { res.setHeader(name, value); return this; },
    json(value) {
      if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(value));
    },
    send(value = '') { res.end(value); },
    end(value = '') { res.end(value); }
  };
}

async function parseBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) {
      const error = new Error('Request body too large.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  const type = String(req.headers['content-type'] || '').toLowerCase();
  if (type.includes('application/json')) {
    try { return JSON.parse(raw); } catch {
      const error = new Error('Invalid JSON body.');
      error.status = 400;
      throw error;
    }
  }
  return raw;
}

async function serveStatic(req, res) {
  const requested = req.url === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname;
  const clean = normalize(requested).replace(/^([/\\])+/, '');
  const filePath = join(ROOT, clean);
  if (!filePath.startsWith(ROOT)) return false;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return false;
    res.statusCode = 200;
    res.setHeader('Content-Type', mime[extname(filePath).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(await readFile(filePath));
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    res.setHeader('X-Nexus-Version', '4.2.1');

    if (pathname === '/api/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ok:true,version:'4.2.1',service:'Nexus IA',localFirst:true}));
      return;
    }

    if (routes[pathname]) {
      const body = await parseBody(req);
      const mod = await routes[pathname]();
      const wrappedReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body,
        query: Object.fromEntries(new URL(req.url || '/', 'http://localhost').searchParams)
      };
      await mod.default(wrappedReq, wrapResponse(res));
      return;
    }

    if (await serveStatic(req, res)) return;

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Route introuvable.' }));
  } catch (error) {
    console.error('Nexus runtime error:', error);
    if (!res.headersSent) {
      res.statusCode = error?.status || 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: error?.message || 'Erreur serveur.' }));
    } else {
      res.end();
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Nexus IA 4.2.1 listening on port ${PORT}`);
});
