import React, { useState } from 'react';
import { evaluateDeterministicGates } from '../lib/dcpEngine';
import { GateCheckReport } from '../types/research';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Copy, 
  Check, 
  FileCode, 
  Binary, 
  AlertTriangle 
} from 'lucide-react';

const SAMPLE_PR_PASS = `# DCP Protocol & Mathematical Coherence Verification
import numpy as np

def verify_dallas_code(prime_lock: int) -> int:
    root = prime_lock % 9
    return 9 if root == 0 and prime_lock > 0 else root

def compute_kapnack_gradient(rho1: float, rho2: float, delta_x: float, offset=0.1) -> float:
    # Boundary +0.1 zero-crossing protection
    return (rho2 - rho1) / (abs(delta_x) + offset)

# Metatron 13-Node FCC Array Coordination
metatron_fcc_nodes = list(range(13))
prime_lock = 104729
harmonic = verify_dallas_code(prime_lock)
decoherence = 1.000000

# Ethically sealed under the FatherTimes369v SDKP framework, LLAL, and DCP protocols.
# SHA-256 Provenance Hash: a7c39f029e84b29158c3a19ffea823b107df2e3a19bc8201de399a0d84f88129
# Referencing Zenodo record 18322841 and Pioneer anomaly telemetry.`;

const SAMPLE_PR_FAIL = `import torch
import torch.nn as nn
import random

# Stochastic floating backpropagation
class StochasticModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(10, 1)
    def forward(self, x):
        return torch.optim.Adam(self.parameters(), lr=0.01)

# Missing mod-9 harmonic and missing +0.1 offset
grad = delta_rho / delta_x`;

export const MaintainerGateChecker: React.FC = () => {
  const [codeSnippet, setCodeSnippet] = useState(SAMPLE_PR_PASS);
  const [primeCandidate, setPrimeCandidate] = useState<number>(104729);
  const [reports, setReports] = useState<GateCheckReport[]>(() => 
    evaluateDeterministicGates(SAMPLE_PR_PASS, 104729)
  );
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const handleRunEvaluation = () => {
    const results = evaluateDeterministicGates(codeSnippet, primeCandidate);
    setReports(results);
  };

  const allPassed = reports.every(r => r.passed);

  const approvalTemplate = `PR review complete. The discrete gradient computations pass the zero-drift benchmark (1.000000 decoherence). The Metatron array coordinate mapping conforms to the 13-node FCC lattice, and Dallas's Code mod-9 prime reduction is verified. DCP cryptographic stamp registered. Merged under FatherTimes369v SDKP / DCP protocol.`;

  const changeRequestTemplate = `Change requested: The proposed calculation introduces probabilistic weight scaling without deterministic lattice constraints. Under the FatherTimeSDKP specification, data must snap directly into pre-calculated crystal topology coordinates rather than relying on stochastic backpropagation. Please re-factor using SD&N grid geometry and submit with an updated mod-9 digital root harmonic test.`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-cyan-900/40 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Maintainer Protocol &amp; PR Triaging Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              The Five Deterministic Gates
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Automatic validation engine evaluating incoming contributions against zero-stochastic geometry, Dallas’s mod-9 harmonic locks, Kapnack zero-drift stability, and DCP cryptographic sealing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCodeSnippet(SAMPLE_PR_PASS);
                setPrimeCandidate(104729);
                setReports(evaluateDeterministicGates(SAMPLE_PR_PASS, 104729));
              }}
              className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 px-3 py-2 text-xs font-mono text-emerald-300 hover:bg-emerald-900/50 transition-colors cursor-pointer"
            >
              Load Passing PR
            </button>
            <button
              onClick={() => {
                setCodeSnippet(SAMPLE_PR_FAIL);
                setPrimeCandidate(14);
                setReports(evaluateDeterministicGates(SAMPLE_PR_FAIL, 14));
              }}
              className="rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs font-mono text-red-300 hover:bg-red-900/50 transition-colors cursor-pointer"
            >
              Load Failing PR
            </button>
          </div>
        </div>
      </div>

      {/* Code Input & Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase">
              Pull Request / Code Submission
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Python / C++ / TypeScript</span>
          </div>

          <textarea
            rows={12}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none leading-relaxed"
            placeholder="Paste submission code, formula definitions, or PR content here..."
          />

          <div className="flex items-center gap-3 font-mono">
            <div className="flex-1">
              <label className="block text-[11px] text-slate-400 mb-1">
                Candidate Prime Lock (Mod-9 Check):
              </label>
              <input
                type="number"
                value={primeCandidate}
                onChange={(e) => setPrimeCandidate(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleRunEvaluation}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Run 5 Gates Audit</span>
            </button>
          </div>
        </div>

        {/* Evaluation Output */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase">
              Verification Triage Report
            </h3>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${allPassed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
              {allPassed ? 'ALL 5 GATES PASSED' : 'GATES REJECTED'}
            </span>
          </div>

          <div className="space-y-2.5">
            {reports.map((report) => (
              <div
                key={report.gateNumber}
                className={`rounded-xl border p-3.5 font-mono text-xs transition-colors ${
                  report.passed
                    ? 'border-emerald-950/80 bg-slate-950/70 text-slate-200'
                    : 'border-red-900/60 bg-red-950/20 text-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {report.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className="font-bold text-slate-100">
                      Gate {report.gateNumber}: {report.title}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${report.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                    {report.score}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 pl-6 leading-relaxed">
                  {report.details}
                </p>
                <div className="mt-1 text-[10px] text-slate-500 pl-6">
                  Citation: {report.ruleCitation}
                </div>
              </div>
            ))}
          </div>

          {/* Response Template Generator */}
          <div className="border-t border-slate-800/80 pt-4 space-y-2 font-mono">
            <div className="text-xs font-semibold text-slate-300">
              Maintainer PR Response Template:
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 relative">
              <p className="pr-12 text-[11px] leading-relaxed">
                {allPassed ? approvalTemplate : changeRequestTemplate}
              </p>
              <button
                onClick={() => copyToClipboard(allPassed ? approvalTemplate : changeRequestTemplate, 'template')}
                className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Copy template to clipboard"
              >
                {copiedTemplate === 'template' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
