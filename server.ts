import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { researchRouter } from './server/routes/research';
import { githubRouter } from './server/routes/github';
import { platformsRouter } from './server/routes/platforms';
import { dcpRouter } from './server/routes/dcp';
import { solversRouter } from './server/routes/solvers';
import { exportRouter } from './server/routes/export';
import { docsRouter } from './server/routes/docs';
import { v1Router } from './server/routes/v1';
import { billingRouter } from './server/routes/billing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Mount Commercial v1 API & Billing Routes
  app.use('/v1', v1Router);
  app.use('/api/v1', v1Router);
  app.use('/api/billing', billingRouter);

  // Mount API Routes
  app.use('/api/research', researchRouter);
  app.use('/api/github', githubRouter);
  app.use('/api/platforms', platformsRouter);
  app.use('/api/dcp', dcpRouter);
  app.use('/api/solvers', solversRouter);
  app.use('/api/export', exportRouter);
  app.use('/api/docs', docsRouter);
  app.use('/api', docsRouter); // Base API endpoint returns OpenAPI specification

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'UP',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'FatherTimeSDKP Research Hub Server',
      version: '3.6.9',
      decoherenceStability: 1.000000,
    });
  });

  // Vite development middleware vs Production static serving
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[Server] Serving production build from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FatherTimeSDKP Server listening on http://0.0.0.0:${PORT}`);
    console.log(`📚 APIs active at http://0.0.0.0:${PORT}/api/docs`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error] Failed to start server:', err);
  process.exit(1);
});
