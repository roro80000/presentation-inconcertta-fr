/**
 * Serveur local — reproduit les URLs propres Netlify (/contact → contact.html).
 * Usage : npm run dev  (http://localhost:8080)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8080;

/** Chemins sans extension servis comme sur Netlify (pretty URLs). */
const PRETTY_ROUTES = {
  '/contact': 'contact.html',
  '/gestion': 'gestion.html',
  '/mentions-legales': 'mentions-legales.html',
  '/merci': 'merci.html',
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function safeJoin(root, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) return null;
  return full;
}

function resolveFilePath(urlPath) {
  let pathname = decodeURIComponent((urlPath || '/').split('?')[0].split('#')[0]);
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  if (pathname === '/demo.html') {
    return { file: safeJoin(ROOT, 'index.html'), redirect: '/index.html' };
  }

  const pretty = PRETTY_ROUTES[pathname];
  if (pretty) {
    return { file: safeJoin(ROOT, pretty) };
  }

  if (pathname === '/') {
    return { file: safeJoin(ROOT, 'index.html') };
  }

  const direct = safeJoin(ROOT, pathname.slice(1));
  if (direct && fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    return { file: direct };
  }

  const withHtml = `${direct}.html`;
  if (withHtml && fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) {
    return { file: withHtml };
  }

  return null;
}

const server = http.createServer((req, res) => {
  const resolved = resolveFilePath(req.url);
  if (!resolved?.file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — fichier introuvable');
    return;
  }

  if (resolved.redirect) {
    res.writeHead(301, { Location: resolved.redirect });
    res.end();
    return;
  }

  fs.readFile(resolved.file, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(err.code === 'ENOENT' ? '404 — fichier introuvable' : '500 — erreur serveur');
      return;
    }
    const ext = path.extname(resolved.file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Site local : http://localhost:${PORT}/`);
  console.log('URLs propres : /contact, /gestion, /mentions-legales, /merci');
});
