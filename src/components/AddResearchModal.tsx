import React, { useState } from 'react';
import { SdkpCategory, ResearchEntry } from '../types/research';
import { calculateDallasCode, createDcpSealBlock, findNextPrime } from '../lib/dcpEngine';
import { useAuth } from '../firebase/authContext';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Binary, 
  FileCode2, 
  RefreshCw, 
  GitBranch, 
  CheckCircle2 
} from 'lucide-react';

interface AddResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryAdded: (newEntry: ResearchEntry) => void;
}

export const AddResearchModal: React.FC<AddResearchModalProps> = ({
  isOpen,
  onClose,
  onEntryAdded,
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SdkpCategory>('SDKP-Core');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [equations, setEquations] = useState('T_{rate} = \\frac{K \\cdot S}{D + 0.1}');
  const [dataPoints, setDataPoints] = useState('Lattice Offset: +0.1000 | Decoherence: 1.000000');
  const [gitRepo, setGitRepo] = useState('https://github.com/FatherTimeSDKP/FatherTimeSDKP-Core');
  const [zenodoDoi, setZenodoDoi] = useState('10.5281/zenodo.18322841');
  const [osfId, setOsfId] = useState('osf.io/fathertime-sdkp');
  const [xPostUrl, setXPostUrl] = useState('https://x.com/FatherTimes369v');
  const [primeLock, setPrimeLock] = useState<number>(104729);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const harmonic = calculateDallasCode(primeLock);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    if (!user) {
      setErrorMessage('Please sign in with Google to create and notarize research entries.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const now = new Date().toISOString();
      const entryId = `research-${Date.now()}`;
      const authorEmail = user.email || 'dallasnamiyadaddy@gmail.com';
      const authorUid = user.uid;

      // Generate real cryptographic SHA-256 seal block
      const seal = await createDcpSealBlock(
        title,
        `${summary}|${equations}|${dataPoints}`,
        primeLock,
        user.displayName ? `${user.displayName} (${authorEmail})` : authorEmail
      );

      const newEntry: ResearchEntry = {
        id: entryId,
        title: title.trim(),
        category,
        summary: summary.trim(),
        content: content.trim(),
        equations: equations.trim(),
        dataPoints: dataPoints.trim(),
        authorUid,
        authorEmail,
        gitRepo: gitRepo.trim() || undefined,
        zenodoDoi: zenodoDoi.trim() || undefined,
        osfId: osfId.trim() || undefined,
        xPostUrl: xPostUrl.trim() || undefined,
        dcpSealHash: seal.sha256Hash,
        primeLock,
        mod9Harmonic: seal.mod9Harmonic,
        decoherenceScore: 1.000000,
        createdAt: now,
        updatedAt: now,
        isPinned: false,
      };

      // Persist to Firestore collection `research_entries`
      await setDoc(doc(db, 'research_entries', entryId), newEntry);

      // Also sync to backend API store
      try {
        await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry),
        });
      } catch {
        // Backend API sync optional fallback
      }

      onEntryAdded(newEntry);
      onClose();
    } catch (err: unknown) {
      console.error('[Add Research Error]', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'research_entries');
      } catch (formattedError) {
        setErrorMessage(formattedError instanceof Error ? formattedError.message : 'Failed to save to Firestore');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-900/60 bg-slate-900 p-6 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                Record &amp; Notarize Research Entry
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Auto-seals with SHA-256 and registers into Firestore &amp; DCP ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-900/80 bg-red-950/40 p-3 text-xs text-red-300 font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-mono text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Document / Paper Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kapnack Gradient Invariance Across 13-Node FCC Array"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Pillar Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SdkpCategory)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="SDKP-Core">SDKP-Core</option>
                <option value="SD-N-EOS-QCC">SD-N-EOS-QCC</option>
                <option value="Dallas-Code">Dallas-Code</option>
                <option value="Kapnack-Solver">Kapnack-Solver</option>
                <option value="Digital-Crystal">Digital-Crystal</option>
                <option value="LLAL-Loop">LLAL-Loop</option>
                <option value="Falsification-Data">Falsification-Data</option>
              </select>
            </div>
          </div>

          {/* Abstract / Summary */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Summary / Abstract *
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="High-level description of mathematical or observational findings..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Full Research Formulation / Derivation
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed equations, step-by-step mathematical proof, or coordinate tables..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Equations & Data Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Equations (LaTeX / Formulas)</span>
              </label>
              <textarea
                rows={2}
                value={equations}
                onChange={(e) => setEquations(e.target.value)}
                placeholder="LaTeX equations..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Binary className="h-3.5 w-3.5 text-emerald-400" />
                <span>Observational Metrics &amp; Data</span>
              </label>
              <textarea
                rows={2}
                value={dataPoints}
                onChange={(e) => setDataPoints(e.target.value)}
                placeholder="Observed coordinates, telemetries, or values..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Platform URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-400 mb-1">GitHub Repo</label>
              <input
                type="text"
                value={gitRepo}
                onChange={(e) => setGitRepo(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Zenodo Record / DOI</label>
              <input
                type="text"
                value={zenodoDoi}
                onChange={(e) => setZenodoDoi(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">OSF Identifier</label>
              <input
                type="text"
                value={osfId}
                onChange={(e) => setOsfId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">X (Twitter) Post Link</label>
              <input
                type="text"
                value={xPostUrl}
                onChange={(e) => setXPostUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Prime Lock & Harmonic */}
          <div className="rounded-xl border border-cyan-950 bg-slate-950/80 p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Dallas’s Prime Lock:</span>
              <input
                type="number"
                value={primeLock}
                onChange={(e) => setPrimeLock(Number(e.target.value))}
                className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
              />
              <button
                type="button"
                onClick={() => setPrimeLock(findNextPrime(primeLock + 1))}
                className="rounded p-1 bg-slate-800 hover:bg-slate-700 text-cyan-300"
                title="Next Prime"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Mod-9 Harmonic: </span>
              <strong className="text-cyan-300 text-sm">{harmonic}</strong>
              <span className="text-[10px] text-emerald-400 ml-2">(Zero-Drift 1.000000)</span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 font-semibold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'Sealing & Persisting...' : 'Cryptographically Seal & Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
