import { Router, Request, Response } from 'express';
import {
  computeKapnackGradient,
  calculateDallasCode,
  isPrime,
  findNextPrime,
  getMetatronFCCNodes,
  computeSdkpTimeRate,
  evaluateDeterministicGates,
} from '../../src/lib/dcpEngine';
import { ResearchStore } from '../data/store';

export const solversRouter = Router();
const store = ResearchStore.getInstance();

// POST /api/solvers/kapnack - Kapnack discrete gradient with +0.1 offset
solversRouter.post('/kapnack', (req: Request, res: Response) => {
  try {
    const { density1 = 1.0, density2 = 2.5, deltaX = 1.0, offsetConstant = 0.1 } = req.body;
    const result = computeKapnackGradient(
      Number(density1),
      Number(density2),
      Number(deltaX),
      Number(offsetConstant)
    );

    res.json({
      success: true,
      formula: '\\nabla_{Kapnack} \\rho = \\frac{\\rho_2 - \\rho_1}{|\\Delta x| + 0.1}',
      inputs: { density1, density2, deltaX, offsetConstant },
      result,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/solvers/dallas-code - Dallas Mod-9 Harmonic Lock & Primality
solversRouter.post('/dallas-code', (req: Request, res: Response) => {
  try {
    const { primeLock = 104729 } = req.body;
    const p = Number(primeLock);
    const mod9Harmonic = calculateDallasCode(p);
    const isPrimeNumber = isPrime(p);
    const nextPrime = findNextPrime(p + 1);
    const phaseAngleDeg = Number(((mod9Harmonic * 360) / 9).toFixed(2));

    res.json({
      success: true,
      formula: 'H_{Dallas} = p \\pmod 9 \\quad (\\text{bounded } 1..9)',
      primeLock: p,
      isPrime: isPrimeNumber,
      mod9Harmonic,
      phaseAngleDegrees: phaseAngleDeg,
      nextPrimeCandidate: nextPrime,
      decoherenceScore: 1.000000,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/solvers/time-rate - SDKP Time Evolution f(S, D, K, P)
solversRouter.post('/time-rate', (req: Request, res: Response) => {
  try {
    const { size = 1.0, density = 1.0, kinetics = 0.5, position = 1.0, offset = 0.1 } = req.body;
    const result = computeSdkpTimeRate(
      Number(size),
      Number(density),
      Number(kinetics),
      Number(position),
      Number(offset)
    );

    res.json({
      success: true,
      formula: 'T_{evolution} = \\frac{S \\times (1 + 0.1 K)}{D + 0.1} \\times \\left(1 + \\frac{\\text{mod9}(P)}{90}\\right)',
      inputs: { size, density, kinetics, position, offset },
      result,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/solvers/metatron-lattice - 13 FCC Lattice Nodes
solversRouter.get('/metatron-lattice', (_req: Request, res: Response) => {
  const nodes = getMetatronFCCNodes();
  res.json({
    success: true,
    latticeGeometry: '13-Node Face-Centered Cubic (FCC)',
    coordinationNumber: 12,
    totalNodes: 13,
    packingFraction: 0.74048,
    nodes,
  });
});

// POST /api/solvers/maintainer-gates - 5 Deterministic Maintainer Gates Evaluation
solversRouter.post('/maintainer-gates', (req: Request, res: Response) => {
  try {
    const { codeSnippet = '', primeLock = 104729 } = req.body;
    const reports = evaluateDeterministicGates(String(codeSnippet), Number(primeLock));
    const allPassed = reports.every((r) => r.passed);

    res.json({
      success: true,
      allGatesPassed: allPassed,
      overallScore: allPassed ? '100% DETERMINISTIC COMPLIANT' : 'GATES PENDING CORRECTION',
      totalGates: reports.length,
      reports,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/solvers/falsification - Empirical Falsification Cases
solversRouter.get('/falsification', (_req: Request, res: Response) => {
  const cases = store.getAllFalsificationCases();
  res.json({
    success: true,
    totalCases: cases.length,
    cases,
  });
});
