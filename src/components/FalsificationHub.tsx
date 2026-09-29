import React, { useState } from 'react';
import { FalsificationCase } from '../types/research';
import { INITIAL_FALSIFICATION_CASES } from '../lib/seedData';
import { 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Telescope, 
  Scale, 
  Sparkles,
  Binary,
  Layers
} from 'lucide-react';

export const FalsificationHub: React.FC = () => {
  const [cases] = useState<FalsificationCase[]>(INITIAL_FALSIFICATION_CASES);
  const [selectedCase, setSelectedCase] = useState<FalsificationCase>(INITIAL_FALSIFICATION_CASES[0]);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredCases = cases.filter(c => 
    c.phenomenon.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.targetObject.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.provenanceSource.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-cyan-900/40 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Telescope className="h-4 w-4" />
              <span>Predictions-for-falsification / Observational Archive</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              Empirical Falsification Laboratory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Deterministic testing of the FatherTimeSDKP lattice &amp; Kapnack solver against real NASA JPL, MESSENGER, and astronomical telescope observations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-3 text-right font-mono">
              <div className="text-[10px] text-emerald-400 uppercase">Verification Rate</div>
              <div className="text-lg font-bold text-emerald-300">100% Tested</div>
            </div>
          </div>
        </div>

        {/* Filter Input */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search observational cases (e.g. Pioneer, Mercury, GPS)..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Layout: Case Selector & Detailed Comparison Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Case List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-semibold text-slate-400 uppercase px-1">
            Empirical Test Cases ({filteredCases.length})
          </div>

          <div className="space-y-2">
            {filteredCases.map((c) => {
              const isSelected = selectedCase.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/30 shadow-lg shadow-cyan-950/30'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-200 leading-snug">
                      {c.phenomenon}
                    </h4>
                    <span className="flex-shrink-0 rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-800">
                      {c.verdict}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {c.targetObject}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
                    <span>Variance: {c.deltaDeviation}</span>
                    <span className="text-cyan-400">View Data &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Side-by-Side Analysis */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded bg-cyan-950 px-2.5 py-1 text-xs font-mono text-cyan-300 border border-cyan-800">
                Falsification Case ID: {selectedCase.id}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{selectedCase.verdict}</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mt-2">
              {selectedCase.phenomenon}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Target Observation: {selectedCase.targetObject}
            </p>
          </div>

          {/* Tri-Column Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* Standard Model Prediction */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5" />
                <span>Standard Physics Model</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedCase.standardPhysicsPrediction}
              </p>
            </div>

            {/* FatherTimeSDKP Prediction */}
            <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-4 space-y-2">
              <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>FatherTimeSDKP Discrete Model</span>
              </div>
              <p className="text-cyan-200 leading-relaxed">
                {selectedCase.sdkpPrediction}
              </p>
            </div>
          </div>

          {/* Real Empirical Telemetry Card */}
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <Binary className="h-3.5 w-3.5" />
                <span>Observed Real-World Telemetry Data</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {selectedCase.empiricalTimestamp}
              </span>
            </div>
            <div className="text-base font-bold text-emerald-300">
              {selectedCase.observedData}
            </div>
            <div className="text-[11px] text-slate-300">
              Observed Variance from SDKP: <strong className="text-emerald-400">{selectedCase.deltaDeviation}</strong>
            </div>
          </div>

          {/* Equation Used */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-1.5">
            <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Governing SDKP Equation</span>
            </div>
            <pre className="text-xs text-cyan-200 whitespace-pre-wrap bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              {selectedCase.equationsUsed}
            </pre>
          </div>

          {/* Provenance & Citation */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="truncate">
              Source: <span className="text-slate-300">{selectedCase.provenanceSource}</span>
            </div>
            <a
              href="https://zenodo.org/records/18322841"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 flex-shrink-0"
            >
              <span>Zenodo Record</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
