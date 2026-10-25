// Local dev server with no-cache headers so module edits always load fresh.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const types = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json'
};

http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    console.log(new Date().toISOString().slice(11, 19), req.method, urlPath);
    let file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, {
            'Content-Type': types[path.extname(file)] || 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        res.end(data);
    });
}).listen(8471, () => console.log('dev server on http://localhost:8471 (no-cache)'));
