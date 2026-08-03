// server.js - Moe Style Static HTTP Server with 404 Page Support
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ===== Configuration =====
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 8080;

// ===== Check if dist folder exists =====
if (!fs.existsSync(DIST_DIR)) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error: dist folder does not exist!');
    process.exit(1);
}

// ===== Terminal Colors & Emoji (Moe Style) =====
const c = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    fg: {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
    }
};

// ===== MIME Types =====
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
};

function getMimeType(ext) {
    return mimeTypes[ext] || 'application/octet-stream';
}

// ===== Logging (Moe Style) =====
function logRequest(req, status, size, time) {
    const method = req.method;
    const pathname = url.parse(req.url).pathname;
    const timestamp = new Date().toISOString();

    const statusColor = status >= 400 ? c.fg.red : c.fg.green;
    const statusStr = `${statusColor}${status}${c.reset}`;
    const methodStr = `${c.fg.cyan}${method}${c.reset}`;
    const pathStr = `${c.fg.yellow}${pathname}${c.reset}`;
    const sizeStr = size ? `${c.fg.magenta}${size}${c.reset}` : '';
    const timeStr = time ? `${c.fg.blue}${time}ms${c.reset}` : '';

    let emoji = '✨';
    if (status >= 500) emoji = '💥';
    else if (status >= 400) emoji = '😱';
    else if (status >= 300) emoji = '🔀';
    else emoji = '✅';

    console.log(
        `${c.dim}[${timestamp}]${c.reset} ${emoji} ${methodStr} ${pathStr} ${statusStr} ${sizeStr} ${timeStr}`
    );
}

// ===== HTTP Server =====
const server = http.createServer((req, res) => {
    const startTime = Date.now();
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Security: prevent directory traversal
    if (pathname.includes('..')) {
        res.statusCode = 403;
        res.end('Forbidden');
        logRequest(req, 403, 0, Date.now() - startTime);
        return;
    }

    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(DIST_DIR, pathname);

    // Check file existence
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // File not found → serve 404.html if exists
            const notFoundPath = path.join(DIST_DIR, '404.html');
            fs.readFile(notFoundPath, (err404, data) => {
                if (err404) {
                    // Fallback plain 404
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('404 Not Found');
                    logRequest(req, 404, 0, Date.now() - startTime);
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/html');
                    res.end(data);
                    logRequest(req, 404, data.length, Date.now() - startTime);
                }
            });
            return;
        }

        // If it's a directory, try index.html
        if (stats.isDirectory()) {
            const indexFile = path.join(filePath, 'index.html');
            fs.readFile(indexFile, (errIndex, data) => {
                if (errIndex) {
                    // No index → serve 404.html
                    const notFoundPath = path.join(DIST_DIR, '404.html');
                    fs.readFile(notFoundPath, (err404, data404) => {
                        if (err404) {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('404 Not Found');
                            logRequest(req, 404, 0, Date.now() - startTime);
                        } else {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'text/html');
                            res.end(data404);
                            logRequest(req, 404, data404.length, Date.now() - startTime);
                        }
                    });
                    return;
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);
                logRequest(req, 200, data.length, Date.now() - startTime);
            });
            return;
        }

        // Regular file
        const ext = path.extname(filePath);
        const mimeType = getMimeType(ext);
        fs.readFile(filePath, (errRead, data) => {
            if (errRead) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Internal Server Error');
                logRequest(req, 500, 0, Date.now() - startTime);
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', mimeType);
            res.end(data);
            logRequest(req, 200, data.length, Date.now() - startTime);
        });
    });
});

// ===== Start Server =====
server.listen(PORT, () => {
    const msg = `
    ✨ Moe Server ✨
    📁 Serving: ${DIST_DIR}
    🌐 Listening: http://localhost:${PORT}
    `;
    console.log(c.fg.magenta + c.bright + msg + c.reset);
});

// ===== Graceful Shutdown =====
process.on('SIGINT', () => {
    console.log('\n' + c.fg.yellow + '👋 Bye bye! Server shutting down.' + c.reset);
    process.exit(0);
});