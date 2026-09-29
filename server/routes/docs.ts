import { Router, Request, Response } from 'express';

export const docsRouter = Router();

docsRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.1.0',
    info: {
      title: 'FatherTimeSDKP & Digital Crystal Protocol (DCP) Research Suite API',
      version: '3.6.9',
      description: 'Unified RESTful research and cryptographic provenance API suite for FatherTimeSDKP, Digital Crystal Protocol, and cross-platform syncing with GitHub, Zenodo, OSF, and X.',
      contact: {
        name: 'Donald Paul Smith (@FatherTimes369v)',
        email: 'dallasnamiyadaddy@gmail.com',
        url: 'https://github.com/FatherTimeSDKP',
      },
      license: {
        name: 'Creative Commons Attribution 4.0 International (CC-BY-4.0)',
        url: 'https://creativecommons.org/licenses/by/4.0/',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Primary AI Studio Application Server',
      },
    ],
    tags: [
      { name: 'Research', description: 'Lossless CRUD and cataloging of research documents, equations, and data points' },
      { name: 'GitHub', description: 'Direct repository compilation and synchronization from FatherTimeSDKP' },
      { name: 'Platforms', description: 'Cross-platform connectors: Zenodo, OSF, X (@FatherTimes369v)' },
      { name: 'DCP', description: 'Digital Crystal Protocol cryptographic SHA-256 sealing and verification' },
      { name: 'Solvers', description: 'Deterministic equation solvers (Kapnack +0.1, Dallas Mod-9, Metatron-13, SDKP Time-Rate)' },
      { name: 'Export', description: 'Lossless master archive downloads in JSON, BibTeX, and Markdown' },
    ],
    endpoints: [
      {
        path: '/api/research',
        method: 'GET',
        tag: 'Research',
        summary: 'Query all research entries with category, tag, or text search',
        parameters: ['category (query)', 'search (query)', 'tag (query)', 'limit (query)'],
      },
      {
        path: '/api/research/:id',
        method: 'GET',
        tag: 'Research',
        summary: 'Get single research document by ID with full equations and data points',
      },
      {
        path: '/api/research',
        method: 'POST',
        tag: 'Research',
        summary: 'Create and notarize a new research entry with server-side SHA-256 seal',
      },
      {
        path: '/api/research/:id',
        method: 'PUT',
        tag: 'Research',
        summary: 'Update research entry while preserving original creation timestamp',
      },
      {
        path: '/api/research/:id',
        method: 'DELETE',
        tag: 'Research',
        summary: 'Remove research record from library',
      },
      {
        path: '/api/github/repos',
        method: 'GET',
        tag: 'GitHub',
        summary: 'List all FatherTimeSDKP GitHub repositories, commits, and metadata',
      },
      {
        path: '/api/github/repo/:repoName',
        method: 'GET',
        tag: 'GitHub',
        summary: 'Get detail and equation invariants for a specific repository',
      },
      {
        path: '/api/github/compile',
        method: 'POST',
        tag: 'GitHub',
        summary: 'Losslessly compile research from GitHub repositories into library',
      },
      {
        path: '/api/platforms/status',
        method: 'GET',
        tag: 'Platforms',
        summary: 'Check status of GitHub, Zenodo, OSF, and X connections',
      },
      {
        path: '/api/platforms/zenodo/record/:recordId',
        method: 'GET',
        tag: 'Platforms',
        summary: 'Query Zenodo API record 18322841 with verified DOI metadata',
      },
      {
        path: '/api/platforms/osf/nodes',
        method: 'GET',
        tag: 'Platforms',
        summary: 'Fetch Open Science Framework preprint nodes and files',
      },
      {
        path: '/api/platforms/x/feed',
        method: 'GET',
        tag: 'Platforms',
        summary: 'Fetch public X (@FatherTimes369v) broadcast disclosures and announcements',
      },
      {
        path: '/api/platforms/sync-all',
        method: 'POST',
        tag: 'Platforms',
        summary: 'Trigger lossless parallel sync across all 4 platforms with master SHA-256 digest',
      },
      {
        path: '/api/dcp/seal',
        method: 'POST',
        tag: 'DCP',
        summary: 'Generate tamper-evident cryptographic DCP seal block with SHA-256 and prime lock',
      },
      {
        path: '/api/dcp/verify',
        method: 'POST',
        tag: 'DCP',
        summary: 'Cryptographically verify bit-level hash integrity and provenance',
      },
      {
        path: '/api/dcp/seals',
        method: 'GET',
        tag: 'DCP',
        summary: 'Retrieve cryptographic seal audit log from ledger',
      },
      {
        path: '/api/solvers/kapnack',
        method: 'POST',
        tag: 'Solvers',
        summary: 'Calculate Kapnack discrete gradient with +0.1 zero-crossing offset',
      },
      {
        path: '/api/solvers/dallas-code',
        method: 'POST',
        tag: 'Solvers',
        summary: 'Calculate Dallas Mod-9 Harmonic Lock, primality, and phase rotation angle',
      },
      {
        path: '/api/solvers/time-rate',
        method: 'POST',
        tag: 'Solvers',
        summary: 'Compute SDKP Time Evolution: T = f(S, D, K, P)',
      },
      {
        path: '/api/solvers/metatron-lattice',
        method: 'GET',
        tag: 'Solvers',
        summary: 'Get 13-node Metatron Face-Centered Cubic (FCC) coordinates and harmonics',
      },
      {
        path: '/api/solvers/maintainer-gates',
        method: 'POST',
        tag: 'Solvers',
        summary: 'Audit code snippet or formula against the 5 Deterministic Maintainer Gates',
      },
      {
        path: '/api/solvers/falsification',
        method: 'GET',
        tag: 'Solvers',
        summary: 'Fetch empirical falsification telemetry cases',
      },
      {
        path: '/api/export/archive',
        method: 'GET',
        tag: 'Export',
        summary: 'Download complete lossless JSON master archive',
      },
      {
        path: '/api/export/bibtex',
        method: 'GET',
        tag: 'Export',
        summary: 'Download academic BibTeX citation for Zenodo DOI 10.5281/zenodo.18322841',
      },
      {
        path: '/api/export/markdown',
        method: 'GET',
        tag: 'Export',
        summary: 'Download complete research papers in Markdown with LaTeX formulas',
      },
    ],
  });
});
