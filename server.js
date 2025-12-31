const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SERVICE_KEY || '';

function jsonResponse(res, status, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,apikey,Authorization'
  });
  res.end(payload);
}

async function proxyToSupabase(route, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('SUPABASE_URL or SUPABASE_KEY not set in environment');
  }
  const url = `${SUPABASE_URL}${route}`;
  const hdrs = Object.assign({
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
  }, options.headers || {});

  const resp = await fetch(url, Object.assign({}, options, { headers: hdrs }));
  return resp;
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(new URL(req.url, `http://localhost`).pathname);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath);
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // fallback to index.html for SPA
      const fallback = path.join(process.cwd(), 'index.html');
      fs.readFile(fallback, (err2, data) => {
        if (err2) {
          res.writeHead(404, {'Content-Type':'text/plain'});
          res.end('Not found');
          return;
        }
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
      });
      return;
    }
    const stream = fs.createReadStream(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = {
      '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json',
      '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml'
    }[ext] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': mime});
    stream.pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,apikey,Authorization'
      });
      res.end();
      return;
    }

    if (req.url.startsWith('/api/docentes') && req.method === 'GET') {
      try {
        const resp = await proxyToSupabase('/rest/v1/docentes?select=id,nombre&order=nombre.asc', { method: 'GET' });
        const text = await resp.text();
        res.writeHead(resp.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(text);
      } catch (err) {
        jsonResponse(res, 500, { error: err.message });
      }
      return;
    }

    if (req.url.startsWith('/api/observaciones') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const observacion = parsed.observacion || parsed;
          const respuestas = parsed.respuestas || [];

          // Insert observacion
          const obsResp = await proxyToSupabase('/rest/v1/observaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify(observacion)
          });

          if (!obsResp.ok) {
            const txt = await obsResp.text();
            throw new Error(`Failed to insert observacion: ${obsResp.status} ${txt}`);
          }

          const obsArray = await obsResp.json();
          const observacionId = obsArray && obsArray[0] && obsArray[0].id;
          if (!observacionId) throw new Error('No observacion id returned from Supabase');

          // Insert respuestas
          const promises = respuestas.map(r => {
            const payload = {
              observacion_id: observacionId,
              indicador_id: r.indicador_id,
              valor: r.valor
            };
            return proxyToSupabase('/rest/v1/respuestas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
              body: JSON.stringify(payload)
            });
          });

          const results = await Promise.all(promises);
          const failed = results.filter(r => !r.ok);

          if (failed.length === 0) {
            jsonResponse(res, 200, { observacion_id: observacionId });
            return;
          }

          // Compensating delete: remove observacion if respuestas failed
          try {
            await proxyToSupabase(`/rest/v1/observaciones?id=eq.${observacionId}`, { method: 'DELETE' });
          } catch (delErr) {
            console.error('Compensating delete failed:', delErr);
          }

          const badTexts = await Promise.all(failed.map(async f => `${f.status}:${await f.text()}`));
          throw new Error(`Failed to insert ${failed.length} respuestas: ${badTexts.join(' | ')}`);

        } catch (err) {
          console.error('Error /api/observaciones:', err);
          jsonResponse(res, 500, { error: err.message });
        }
      });
      return;
    }

    // Static files / SPA fallback
    serveStatic(req, res);
  } catch (err) {
    console.error('Unhandled server error:', err);
    jsonResponse(res, 500, { error: String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`Static server + API proxy listening on http://localhost:${PORT}`);
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Warning: SUPABASE_URL or SUPABASE_KEY not set. API endpoints will fail until provided.');
  }
});
