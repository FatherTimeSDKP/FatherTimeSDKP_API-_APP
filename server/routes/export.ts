import { Router, Request, Response } from 'express';
import { ResearchStore } from '../data/store';

export const exportRouter = Router();
const store = ResearchStore.getInstance();

// GET /api/export/archive - Full lossless master archive JSON
exportRouter.get('/archive', (_req: Request, res: Response) => {
  const entries = store.getAllEntries();
  const cases = store.getAllFalsificationCases();
  const seals = store.getDcpAuditLogs(50);

  const archive = {
    archiveTitle: 'FatherTimeSDKP & Digital Crystal Protocol Master Research Corpus',
    architect: 'Donald Paul Smith (FatherTimes369v)',
    exportTimestamp: new Date().toISOString(),
    platforms: {
      githubOrganization: 'https://github.com/FatherTimeSDKP',
      zenodoRecord: 'https://zenodo.org/records/18322841',
      zenodoDoi: '10.5281/zenodo.18322841',
      osfProject: 'https://osf.io/search/?q=FatherTimeSDKP',
      xFeed: 'https://x.com/FatherTimes369v',
    },
    mathematicalInvariants: {
      dallasCode: 'digital_root = prime_lock % 9 (bound 1..9)',
      kapnackOffset: '+0.100000 zero-crossing denominator offset',
      metatronGeometry: '13-Node Face-Centered Cubic (FCC) Lattice Array',
      llalDriftTolerance: '1.000000 exact coherence score',
    },
    totalResearchRecords: entries.length,
    totalFalsificationCases: cases.length,
    totalSealsRecorded: seals.length,
    researchEntries: entries,
    falsificationCases: cases,
    dcpAuditLedger: seals,
  };

  res.setHeader('Content-Disposition', `attachment; filename="FatherTimeSDKP-Master-Archive-${Date.now()}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(archive, null, 2));
});

// GET /api/export/bibtex - BibTeX academic citation
exportRouter.get('/bibtex', (_req: Request, res: Response) => {
  const bibtex = `@article{Smith_FatherTimeSDKP_2024,
  author       = {Smith, Donald Paul},
  title        = {{Gravity Without Spacetime & Digital Crystal Protocol (DCP)}},
  year         = {2024},
  month        = {mar},
  publisher    = {Zenodo},
  version      = {v3.6.9},
  doi          = {10.5281/zenodo.18322841},
  url          = {https://doi.org/10.5281/zenodo.18322841},
  howpublished = {Zenodo Open Research Repository},
  note         = {FatherTimeSDKP / Digital Crystal Protocol. Lead Architect @FatherTimes369v}
}`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(bibtex);
});

// GET /api/export/markdown - Full compiled research papers in markdown with LaTeX
exportRouter.get('/markdown', (_req: Request, res: Response) => {
  const entries = store.getAllEntries();
  const cases = store.getAllFalsificationCases();

  const lines: string[] = [
    '# FatherTimeSDKP & Digital Crystal Protocol: Master Research Compendium',
    '',
    `**Lead Architect:** Donald Paul Smith (@FatherTimes369v)  `,
    `**Zenodo DOI:** [10.5281/zenodo.18322841](https://zenodo.org/records/18322841)  `,
    `**GitHub Organization:** [https://github.com/FatherTimeSDKP](https://github.com/FatherTimeSDKP)  `,
    `**OSF Project:** [https://osf.io/search/?q=FatherTimeSDKP](https://osf.io/search/?q=FatherTimeSDKP)  `,
    `**Generated UTC:** ${new Date().toISOString()}  `,
    `**Decoherence Stability:** 1.000000 Zero-Drift  `,
    '',
    '---',
    '',
    '## 1. Mathematical Principles & Invariants',
    '',
    '### Kapnack Discrete Gradient Processor',
    '$$\\nabla_{Kapnack} \\rho = \\frac{\\Delta \\rho}{|\\Delta x| + 0.1}$$',
    '',
    '### Dallas’s Code: Mod-9 Phase Reduction',
    '$$H_{Dallas} = p \\pmod 9 \\quad (1..9)$$',
    '',
    '### Metatron 13-Node Face-Centered Cubic (FCC) Geometry',
    '$$\\vec{r}_0 = (0,0,0), \\quad \\vec{r}_{1..12} = \\frac{1}{\\sqrt{2}} (\\pm 1, \\pm 1, 0)_{perm}$$',
    '',
    '---',
    '',
    '## 2. Compiled Research Treatises',
    '',
  ];

  entries.forEach((e, idx) => {
    lines.push(`### 2.${idx + 1}. ${e.title}`);
    lines.push(`- **Category:** ${e.category}`);
    lines.push(`- **Timestamp:** ${e.createdAt}`);
    lines.push(`- **DCP Seal (SHA-256):** \`${e.dcpSealHash || 'N/A'}\``);
    lines.push(`- **Dallas Prime Lock:** ${e.primeLock} (Mod-9: ${e.mod9Harmonic})`);
    if (e.gitRepo) lines.push(`- **GitHub:** ${e.gitRepo}`);
    if (e.zenodoDoi) lines.push(`- **Zenodo DOI:** ${e.zenodoDoi}`);
    if (e.osfId) lines.push(`- **OSF:** ${e.osfId}`);
    lines.push('');
    lines.push(`**Abstract:** ${e.summary}`);
    lines.push('');
    if (e.content) {
      lines.push('**Formulation:**');
      lines.push(e.content);
      lines.push('');
    }
    if (e.equations) {
      lines.push('**Equations:**');
      lines.push('```latex');
      lines.push(e.equations);
      lines.push('```');
      lines.push('');
    }
    if (e.dataPoints) {
      lines.push(`**Data Points:** ${e.dataPoints}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  });

  lines.push('## 3. Empirical Falsification Lab Cases');
  lines.push('');
  cases.forEach((c, idx) => {
    lines.push(`### 3.${idx + 1}. ${c.phenomenon}`);
    lines.push(`- **Target:** ${c.targetObject}`);
    lines.push(`- **Standard Prediction:** ${c.standardPhysicsPrediction}`);
    lines.push(`- **SDKP Prediction:** ${c.sdkpPrediction}`);
    lines.push(`- **Observed Data:** ${c.observedData}`);
    lines.push(`- **Deviation:** ${c.deltaDeviation}`);
    lines.push(`- **Verdict:** \`${c.verdict}\``);
    lines.push(`- **Provenance Source:** ${c.provenanceSource}`);
    lines.push('');
  });

  res.setHeader('Content-Disposition', `attachment; filename="FatherTimeSDKP-Master-Paper-${Date.now()}.md"`);
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(lines.join('\n'));
});
