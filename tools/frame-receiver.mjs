// Receptor local usado por tools/extract-frames.html para gravar os quadros em assets/frames/.
// Uso: node tools/frame-receiver.mjs   (porta 8771)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'frames');
fs.mkdirSync(root, { recursive: true });

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/ping') { res.writeHead(200); return res.end('ok'); }
  if (url.pathname === '/clear') {
    for (const f of fs.readdirSync(root)) fs.unlinkSync(path.join(root, f));
    res.writeHead(200); return res.end('cleared');
  }
  if (url.pathname === '/save' && req.method === 'POST') {
    const name = path.basename(url.searchParams.get('name') || '');
    if (!/^[\w.-]+$/.test(name)) { res.writeHead(400); return res.end('bad name'); }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => { fs.writeFileSync(path.join(root, name), Buffer.concat(chunks)); res.writeHead(200); res.end('saved'); });
    return;
  }
  res.writeHead(404); res.end();
}).listen(8771, () => console.log('frame-receiver em http://localhost:8771 -> ' + root));
