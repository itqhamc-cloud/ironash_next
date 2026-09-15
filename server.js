// server.js - Production entry point for cPanel "Setup Node.js App" (Phusion Passenger)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Ensure production mode on cPanel
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const dev = process.env.NODE_ENV === 'development';

// In Phusion Passenger, PORT can be a Unix domain socket path or a TCP port string.
// Do NOT parseInt() because socket paths like /tmp/passenger.xxx will become NaN.
const port = process.env.PORT || 3000;

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', req.url, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }
    });

    server.once('error', (err) => {
      console.error('Server failed to bind or listen:', err);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`> IronAsh Next.js server running in ${process.env.NODE_ENV} mode`);
      console.log(`> Listening on ${port}`);
    });
  })
  .catch((err) => {
    console.error('FATAL: Failed to prepare Next.js app:', err);
    console.error('Common reason: The ".next" folder might be missing, or node_modules has OS architecture mismatch.');
    process.exit(1);
  });

