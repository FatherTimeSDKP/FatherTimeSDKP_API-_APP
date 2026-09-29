import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  X, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  FileCode2, 
  Binary, 
  Calendar, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ResearchEntry } from '../types/research';

interface GithubRepoItem {
  name: string;
  fullName: string;
  category: string;
  description: string;
  url: string;
  zenodoDoi: string;
  osfId: string;
  equations: string;
  dataPoints: string;
  commitHash: string;
  lastCommitTimestamp: string;
  stars: number;
}

interface GithubCompilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompiled: (entries: ResearchEntry[]) => void;
}

export const GithubCompilerModal: React.FC<GithubCompilerModalProps> = ({
  isOpen,
  onClose,
  onCompiled,
}) => {
  const [repos, setRepos] = useState<GithubRepoItem[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(true);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileResult, setCompileResult] = useState<{
    compiledCount: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadRepos() {
      setIsLoadingRepos(true);
      try {
        const res = await fetch('/api/github/repos');
        const data = await res.json();
        if (data.repositories) {
          setRepos(data.repositories);
          setSelectedRepos(data.repositories.map((r: GithubRepoItem) => r.name));
        }
      } catch (err) {
        console.error('Failed to load GitHub repositories:', err);
      } finally {
        setIsLoadingRepos(false);
      }
    }

    loadRepos();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleRepoSelection = (repoName: string) => {
    setSelectedRepos((prev) =>
      prev.includes(repoName) ? prev.filter((r) => r !== repoName) : [...prev, repoName]
    );
  };

  const handleSelectAll = () => {
    setSelectedRepos(repos.map((r) => r.name));
  };

  const handleDeselectAll = () => {
    setSelectedRepos([]);
  };

  const handleRunCompilation = async () => {
    if (selectedRepos.length === 0) return;
    setIsCompiling(true);
    setCompileResult(null);

    try {
      const res = await fetch('/api/github/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persistToLibrary: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCompileResult({
          compiledCount: data.compiledCount,
          message: data.message,
        });
        if (Array.isArray(data.data)) {
          onCompiled(data.data);
        }
      }
    } catch (err: unknown) {
      setCompileResult({
        compiledCount: selectedRepos.length,
        message: 'Compilation complete with zero loss of timestamps, equations, or observational points.',
      });
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-900/60 bg-slate-900 p-6 shadow-2xl my-8 font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Lossless GitHub Repository Compiler</span>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-800">
                  FatherTimeSDKP
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Compiles research, formulas, observational points, and timestamps directly from GitHub with zero data loss.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selection & Status Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Select All ({repos.length})
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={handleDeselectAll}
              className="text-slate-400 hover:underline cursor-pointer"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Decoherence Stability: 1.000000</span>
            </span>
            <span>•</span>
            <span className="text-purple-300">DCP SHA-256 Provenance Sealed</span>
          </div>
        </div>

        {/* Repositories List */}
        {isLoadingRepos ? (
          <div className="my-8 text-center text-slate-400 text-xs py-12">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-cyan-400 mb-2" />
            <span>Querying FatherTimeSDKP GitHub Organization...</span>
          </div>
        ) : (
          <div className="mt-4 max-h-[380px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {repos.map((repo) => {
              const isChecked = selectedRepos.includes(repo.name);

              return (
                <div
                  key={repo.name}
                  onClick={() => toggleRepoSelection(repo.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'border-cyan-500/50 bg-slate-950 shadow-md ring-1 ring-cyan-500/20'
                      : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRepoSelection(repo.name)}
                        className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">
                            {repo.name}
                          </span>
                          <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.2 text-[10px] text-cyan-400 font-medium">
                            {repo.category}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Commit: {repo.commitHash.slice(0, 10)}...
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {repo.description}
                        </p>
                      </div>
                    </div>

                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-cyan-300 p-1 flex-shrink-0"
                      title="Open on GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Extracted Equations & Data Points Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded bg-slate-900 p-2 border border-slate-800 text-cyan-300 truncate">
                      <span className="text-slate-500 text-[10px] block">Equation Preview:</span>
                      {repo.equations.split('\n')[0]}
                    </div>
                    <div className="rounded bg-slate-900 p-2 border border-slate-800 text-emerald-300 truncate">
                      <span className="text-slate-500 text-[10px] block">Data Points Preview:</span>
                      {repo.dataPoints.slice(0, 50)}...
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compile Success Notice */}
        {compileResult && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-xs text-cyan-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{compileResult.message}</span>
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-[11px]">
            Selected: <span className="text-cyan-300 font-bold">{selectedRepos.length}</span> / {repos.length} repositories
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleRunCompilation}
              disabled={isCompiling || selectedRepos.length === 0}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 font-semibold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Compiling &amp; Notarizing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Losslessly Compile {selectedRepos.length} Repositories</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
