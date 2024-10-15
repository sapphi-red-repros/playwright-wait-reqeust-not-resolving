import http from 'http';
import { chromium } from 'playwright'

const server = http.createServer((req, res) => {
  if (req.url === '/worker.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end('console.log("Hello from Worker")');
    return
  }

  res.writeHead(200);
  res.end(`
<html>
  <head>
    <script>
      new Worker('/worker.js', { type: 'module' });
    </script>
  </head>
  <body>
    <p>See console</p>
  </body>
</html>
    `);
})

await new Promise(resolve => {
  server.once('listening', resolve)

  server.listen(3000);
});

console.log('server started on localhost:3000');

const browser = await chromium.launch();
const page = await browser.newPage();

const reqPromise = page.waitForRequest(/worker\.js/);

await page.goto('http://localhost:3000');

await reqPromise

await browser.close();
server.close();
