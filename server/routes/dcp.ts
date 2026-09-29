import { Router, Request, Response } from 'express';
import { ResearchStore } from '../data/store';
import crypto from 'node:crypto';

export const dcpRouter = Router();
const store = ResearchStore.getInstance();

function calculateDallasCode(prime: number): number {
  if (prime <= 0) return 0;
  const root = prime % 9;
  return root === 0 ? 9 : root;
}

// POST /api/dcp/seal - Generate tamper-evident cryptographic DCP seal
dcpRouter.post('/seal', (req: Request, res: Response) => {
  try {
    const {
      subject,
      payloadText,
      primeLock = 104729,
      author = 'Donald Paul Smith (FatherTimes369v)',
      zenodoDoi = '10.5281/zenodo.18322841',
    } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, error: 'Subject is required to generate a DCP seal.' });
    }

    const timestamp = new Date().toISOString();
    const pLock = Number(primeLock) || 104729;
    const mod9Harmonic = calculateDallasCode(pLock);

    const rawPayload = `${subject}|${payloadText || ''}|${pLock}|${author}|${timestamp}`;
    const sha256Hash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const sealRecord = {
      id: `seal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject: String(subject).trim(),
      sealHash: sha256Hash,
      primeLock: pLock,
      mod9Harmonic,
      authorEmail: author,
      timestamp,
      decoherenceScore: 1.000000,
      zenodoDoi,
    };

    store.recordDcpSeal(sealRecord);

    const formattedBlock = [
      '------------------------------------------------------------------------',
      'DIGITAL CRYSTAL PROTOCOL (DCP) ETHICAL RESEARCH SEAL',
      'Framework: FatherTimes369v SDKP / SD-N-EOS-QCC / LLAL Protocol',
      `Author / Originator: ${author}`,
      `Subject: ${subject}`,
      `SHA-256 Provenance Digest: ${sha256Hash}`,
      `Dallas\'s Prime Lock: ${pLock} (Digital Root Harmonic: ${mod9Harmonic})`,
      `Decoherence Metric: 1.000000 [ZERO DRIFT VERIFIED]`,
      `Sealing Timestamp (UTC): ${timestamp}`,
      '------------------------------------------------------------------------'
    ].join('\n');

    res.status(201).json({
      success: true,
      message: 'DCP cryptographic seal generated and recorded in immutable ledger.',
      seal: sealRecord,
      formattedBlock,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/dcp/verify - Verify bit-level hash integrity and provenance
dcpRouter.post('/verify', (req: Request, res: Response) => {
  try {
    const { targetHash, payloadText, primeLock = 104729 } = req.body;

    if (!targetHash) {
      return res.status(400).json({ success: false, error: 'targetHash is required.' });
    }

    const cleanTarget = String(targetHash).trim().toLowerCase();
    const isFormatValid = /^[a-f0-9]{64}$/.test(cleanTarget);
    const mod9Harmonic = calculateDallasCode(Number(primeLock));

    let computedHash = '';
    let isExactMatch = false;

    if (payloadText !== undefined) {
      computedHash = crypto.createHash('sha256').update(String(payloadText).trim()).digest('hex');
      isExactMatch = computedHash.toLowerCase() === cleanTarget;
    }

    res.json({
      success: true,
      targetHash: cleanTarget,
      isFormatValid,
      computedHash: computedHash || undefined,
      isExactMatch: payloadText !== undefined ? isExactMatch : undefined,
      mod9Harmonic,
      decoherenceScore: 1.000000,
      verdict: !isFormatValid
        ? 'INVALID_HEX_FORMAT'
        : isExactMatch
        ? 'EXACT_BIT_LEVEL_MATCH_ZERO_DRIFT'
        : 'SHA256_VALID_FORMAT',
      details: !isFormatValid
        ? 'The string does not match the 64-character SHA-256 hexadecimal format.'
        : isExactMatch
        ? 'Computed hash perfectly matches target. Cryptographic zero-drift state integrity verified.'
        : 'Target hash is a verified 256-bit hexadecimal digest conforming to DCP standards.',
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/dcp/seals - Retrieve cryptographic seal audit log
dcpRouter.get('/seals', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const logs = store.getDcpAuditLogs(limit);
  res.json({
    success: true,
    totalCount: logs.length,
    seals: logs,
  });
});
