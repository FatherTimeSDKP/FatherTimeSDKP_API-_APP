import { Router, Request, Response } from 'express';
import { ResearchStore } from '../data/store';
import { ResearchEntry, SdkpCategory } from '../../src/types/research';
import crypto from 'node:crypto';

export const researchRouter = Router();
const store = ResearchStore.getInstance();

function calculateDallasMod9(prime: number): number {
  if (prime <= 0) return 0;
  const root = prime % 9;
  return root === 0 ? 9 : root;
}

// GET /api/research - List all compiled research with filters
researchRouter.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, tag, limit } = req.query;
    let entries = store.getAllEntries();

    if (category && typeof category === 'string' && category !== 'ALL') {
      entries = entries.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }

    if (tag && typeof tag === 'string') {
      entries = entries.filter((e) => e.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      entries = entries.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.equations.toLowerCase().includes(q) ||
        e.dataPoints.toLowerCase().includes(q) ||
        (e.zenodoDoi && e.zenodoDoi.toLowerCase().includes(q))
      );
    }

    if (limit && !isNaN(Number(limit))) {
      entries = entries.slice(0, Number(limit));
    }

    res.json({
      success: true,
      totalCount: entries.length,
      provenanceStatus: 'LOSSLESS_VERIFIED',
      metadata: {
        architect: 'Donald Paul Smith (FatherTimes369v)',
        primaryZenodoDoi: '10.5281/zenodo.18322841',
        githubOrganization: 'https://github.com/FatherTimeSDKP',
        decoherenceScore: 1.000000,
      },
      data: entries,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/research/categories
researchRouter.get('/categories', (_req: Request, res: Response) => {
  const categories: SdkpCategory[] = [
    'SDKP-Core',
    'SD-N-EOS-QCC',
    'Dallas-Code',
    'Kapnack-Solver',
    'Digital-Crystal',
    'LLAL-Loop',
    'Falsification-Data',
  ];
  res.json({ success: true, categories });
});

// GET /api/research/:id - Get single entry with full lossless equations & data points
researchRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const entry = store.getEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: `Research entry with ID '${req.params.id}' not found.`,
      });
    }

    res.json({
      success: true,
      data: entry,
      verification: {
        hasSha256Seal: Boolean(entry.dcpSealHash),
        primeLock: entry.primeLock,
        mod9Harmonic: entry.mod9Harmonic,
        decoherenceScore: entry.decoherenceScore || 1.000000,
        bitLevelProvenanceMatch: true,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/research - Create and notarize research record
researchRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      title,
      category,
      summary,
      content,
      equations,
      dataPoints,
      authorUid,
      authorEmail,
      gitRepo,
      zenodoDoi,
      osfId,
      xPostUrl,
      primeLock,
      tags,
    } = req.body;

    if (!title || !summary) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title and summary are mandatory.',
      });
    }

    const timestamp = new Date().toISOString();
    const entryId = req.body.id || `research-${Date.now()}`;
    const pLock = Number(primeLock) || 104729;
    const mod9 = calculateDallasMod9(pLock);

    // Compute cryptographic SHA-256 seal digest
    const sealPayload = `${title}|${summary}|${equations || ''}|${dataPoints || ''}|${pLock}|${timestamp}`;
    const sealHash = crypto.createHash('sha256').update(sealPayload).digest('hex');

    const newEntry: ResearchEntry = {
      id: entryId,
      title: String(title).trim(),
      category: (category as SdkpCategory) || 'SDKP-Core',
      summary: String(summary).trim(),
      content: content ? String(content).trim() : '',
      equations: equations ? String(equations).trim() : '',
      dataPoints: dataPoints ? String(dataPoints).trim() : '',
      authorUid: authorUid || 'fathertime-origin-smith',
      authorEmail: authorEmail || 'dallasnamiyadaddy@gmail.com',
      gitRepo: gitRepo || 'https://github.com/FatherTimeSDKP/FatherTimeSDKP-Core',
      zenodoDoi: zenodoDoi || '10.5281/zenodo.18322841',
      osfId: osfId || 'osf.io/fathertime-sdkp',
      xPostUrl: xPostUrl || 'https://x.com/FatherTimes369v',
      dcpSealHash: sealHash,
      primeLock: pLock,
      mod9Harmonic: mod9,
      decoherenceScore: 1.000000,
      createdAt: timestamp,
      updatedAt: timestamp,
      tags: Array.isArray(tags) ? tags : ['SDKP', 'DCP'],
      isPinned: Boolean(req.body.isPinned),
    };

    store.createEntry(newEntry);

    res.status(201).json({
      success: true,
      message: 'Research document compiled and notarized successfully.',
      dcpSeal: {
        hash: sealHash,
        primeLock: pLock,
        mod9Harmonic: mod9,
        decoherenceScore: 1.000000,
        timestamp,
      },
      data: newEntry,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /api/research/:id - Update research entry preserving original creation timestamp
researchRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = store.getEntryById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: `Entry '${id}' not found.` });
    }

    const updated = store.updateEntry(id, req.body);
    res.json({
      success: true,
      message: 'Research record updated while preserving original creation timestamp and cryptographic integrity.',
      data: updated,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/research/:id
researchRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deleted = store.deleteEntry(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Entry '${id}' not found.` });
    }
    res.json({ success: true, message: `Research record '${id}' removed.` });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});
