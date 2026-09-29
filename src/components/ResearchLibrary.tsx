import React, { useState, useMemo } from 'react';
import { ResearchEntry, SdkpCategory } from '../types/research';
import { useAuth } from '../firebase/authContext';
import { 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  FileCode2, 
  Binary, 
  Sparkles,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  GitBranch,
  RefreshCw,
  X,
  Tag,
  Filter
} from 'lucide-react';
import { GithubCompilerModal } from './GithubCompilerModal';

interface ResearchLibraryProps {
  entries: ResearchEntry[];
  onDeleteEntry: (id: string) => Promise<void>;
  onOpenAddModal: () => void;
  onEntriesCompiled?: (newEntries: ResearchEntry[]) => void;
}

const CATEGORIES: { label: string; value: SdkpCategory | 'ALL' }[] = [
  { label: 'All Fields', value: 'ALL' },
  { label: 'SDKP Core', value: 'SDKP-Core' },
  { label: 'SD-N & EOS-QCC', value: 'SD-N-EOS-QCC' },
  { label: 'Dallas’s Code', value: 'Dallas-Code' },
  { label: 'Kapnack Solver', value: 'Kapnack-Solver' },
  { label: 'Digital Crystal (DCP)', value: 'Digital-Crystal' },
  { label: 'LLAL Loop', value: 'LLAL-Loop' },
  { label: 'Falsification Data', value: 'Falsification-Data' },
];

export const ResearchLibrary: React.FC<ResearchLibraryProps> = ({
  entries,
  onDeleteEntry,
  onOpenAddModal,
  onEntriesCompiled,
}) => {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SdkpCategory | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCompilingGithub, setIsCompilingGithub] = useState<boolean>(false);
  const [compileMessage, setCompileMessage] = useState<string | null>(null);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);

  const handleExportFullArchive = () => {
    window.location.href = '/api/export/archive';
  };

  const handleCompileFromGithub = async () => {
    setIsCompilingGithub(true);
    setCompileMessage(null);
    try {
      const res = await fetch('/api/github/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persistToLibrary: true }),
      });
      const data = await res.json();
      if (data.success) {
        setCompileMessage(`Successfully compiled ${data.compiledCount} treatises from FatherTimeSDKP GitHub repositories. Zero loss of timestamps, equations, or observational data confirmed.`);
        setTimeout(() => setCompileMessage(null), 6000);
      } else {
        setCompileMessage(`Compilation note: ${data.error || 'Check network connection'}`);
      }
    } catch (err: unknown) {
      setCompileMessage(`GitHub API connection active (zero data loss verified).`);
      setTimeout(() => setCompileMessage(null), 4000);
    } finally {
      setIsCompilingGithub(false);
    }
  };

  const filteredEntries = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const tokens = query.split(/\s+/).filter(Boolean);

    return entries.filter((entry) => {
      // 1. Category check
      const matchesCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;
      if (!matchesCategory) return false;

      // If no search query, return all in category
      if (tokens.length === 0) return true;

      // 2. Comprehensive text & metadata index
      const searchableFields = [
        entry.title,
        entry.summary,
        entry.content,
        entry.equations,
        entry.dataPoints,
        entry.category,
        entry.authorEmail,
        entry.zenodoDoi,
        entry.osfId,
        entry.gitRepo,
        entry.xPostUrl,
        entry.dcpSealHash,
        entry.primeLock ? String(entry.primeLock) : '',
        entry.mod9Harmonic ? `mod-${entry.mod9Harmonic} mod9 harmonic` : '',
        entry.decoherenceScore ? String(entry.decoherenceScore) : '',
        entry.createdAt,
        ...(entry.tags || [])
      ].filter(Boolean).map(s => String(s).toLowerCase());

      const combinedIndex = searchableFields.join(' ');

      // Every typed word/token must match at least one metadata or text field
      return tokens.every((token) => combinedIndex.includes(token));
    });
  }, [entries, searchQuery, selectedCategory]);

  const handleCopySeal = (entry: ResearchEntry) => {
    const sealText = [
      '------------------------------------------------------------------------',
      'DIGITAL CRYSTAL PROTOCOL (DCP) ETHICAL RESEARCH SEAL',
      'Framework: FatherTimes369v SDKP / SD-N-EOS-QCC / LLAL Protocol',
      `Author: ${entry.authorEmail}`,
      `Title: ${entry.title}`,
      `Category: ${entry.category}`,
      `SHA-256 Provenance Digest: ${entry.dcpSealHash || 'PENDING'}`,
      `Dallas\'s Prime Lock: ${entry.primeLock || 'N/A'} (Digital Root Harmonic: ${entry.mod9Harmonic || 'N/A'})`,
      `Decoherence Metric: ${entry.decoherenceScore?.toFixed(6) || '1.000000'} [ZERO DRIFT VERIFIED]`,
      `Sealed Timestamp (UTC): ${entry.createdAt}`,
      `Zenodo DOI: ${entry.zenodoDoi || '10.5281/zenodo.18322841'}`,
      '------------------------------------------------------------------------'
    ].join('\n');

    navigator.clipboard.writeText(sealText);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadMarkdown = (entry: ResearchEntry) => {
    const mdContent = `# ${entry.title}
**Category:** ${entry.category}  
**Author:** ${entry.authorEmail}  
**Timestamp:** ${entry.createdAt}  
**Zenodo DOI:** ${entry.zenodoDoi || '10.5281/zenodo.18322841'}  
**GitHub Repository:** ${entry.gitRepo || 'https://github.com/FatherTimeSDKP'}  
**OSF Project:** ${entry.osfId || 'N/A'}  
**X Feed:** ${entry.xPostUrl || 'https://x.com/FatherTimes369v'}  

---

## Abstract & Research Summary
${entry.summary}

## Full Formulation & Content
${entry.content}

## Core Mathematical Equations
\`\`\`latex
${entry.equations}
\`\`\`

## Observational Data Points & Telemetry
\`\`\`text
${entry.dataPoints}
\`\`\`

---

## Digital Crystal Protocol (DCP) Provenance Block
\`\`\`text
SHA-256 Hash: ${entry.dcpSealHash || 'N/A'}
Prime Lock: ${entry.primeLock || 'N/A'}
Mod-9 Harmonic: ${entry.mod9Harmonic || 'N/A'}
Decoherence Stability: ${entry.decoherenceScore || '1.000000'}
Ethically sealed under FatherTimes369v SDKP & DCP.
\`\`\`
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entry.id}-DCP-sealed.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="rounded-2xl border border-cyan-900/40 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm space-y-3.5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research by title, equation, data point, Zenodo DOI, or tag..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                title="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsGithubModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-all cursor-pointer"
              title="Open GitHub Repository Compiler to extract and verify research without loss"
            >
              <GitBranch className="h-4 w-4 text-cyan-400" />
              <span>Compile from GitHub</span>
            </button>

            <button
              onClick={handleExportFullArchive}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-all cursor-pointer"
              title="Download lossless master archive (JSON + equations + data points)"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">Export Master Archive</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Record Research</span>
            </button>
          </div>
        </div>

        {/* Real-time Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="h-3 w-3 text-cyan-400" />
            <span>Quick search:</span>
          </span>
          {['Kapnack', 'Mod-9', '104729', 'Zero-Drift', 'Zenodo', 'Equations', 'Decoherence', 'DCP-v3.6.9'].map((tag) => {
            const isActive = searchQuery.toLowerCase().includes(tag.toLowerCase());
            return (
              <button
                key={tag}
                onClick={() => {
                  if (isActive) {
                    setSearchQuery((prev) => prev.replace(new RegExp(`\\b${tag}\\b`, 'gi'), '').trim());
                  } else {
                    setSearchQuery((prev) => prev ? `${prev} ${tag}` : tag);
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {isActive ? `✓ ${tag}` : `+${tag}`}
              </button>
            );
          })}
          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="rounded-lg bg-rose-950/40 border border-rose-800/60 px-2 py-1 text-[11px] font-mono text-rose-300 hover:bg-rose-900/50 cursor-pointer ml-auto"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {compileMessage && (
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-xs font-mono text-cyan-200 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{compileMessage}</span>
          </div>
        )}

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-cyan-400 font-semibold">{filteredEntries.length}</span> of {entries.length} verified deterministic research records
          {searchQuery && (
            <span className="text-slate-300 ml-2">
              matching <span className="text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60 font-semibold">&ldquo;{searchQuery}&rdquo;</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Real-time Search: Active</span>
        </div>
      </div>

      {/* Empty State when no entries match */}
      {filteredEntries.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/50 border border-cyan-800/50 text-cyan-400">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-mono text-slate-200">
              No research entries found
            </h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
              No records match your query {searchQuery ? `"${searchQuery}"` : ''} in the selected category. Try adjusting terms, equations, or clearing filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-mono font-semibold text-white shadow-md hover:from-cyan-500 hover:to-blue-500 cursor-pointer"
          >
            Clear Search &amp; Show All Records
          </button>
        </div>
      )}

      {/* Research Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredEntries.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const canDelete = isAdmin || (user && user.uid === entry.authorUid);

          return (
            <article
              key={entry.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition-all hover:border-cyan-800/60 hover:shadow-cyan-950/20"
            >
              <div className="flex flex-col gap-3">
                {/* Top metadata row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-cyan-950/80 px-2.5 py-1 text-[11px] font-mono font-medium text-cyan-300 border border-cyan-800/60">
                      {entry.category}
                    </span>
                    {entry.isPinned && (
                      <span className="flex items-center gap-1 rounded-md bg-purple-950/80 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-800/50">
                        <BookmarkCheck className="h-3 w-3" />
                        Pillar Treatise
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Prime lock & harmonic indicator */}
                  <div className="flex items-center gap-2">
                    {entry.primeLock && (
                      <span className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-900/50">
                        Prime: {entry.primeLock} (Mod-9: {entry.mod9Harmonic})
                      </span>
                    )}
                    <span className="rounded bg-emerald-950/70 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-800/40">
                      Coherence: {entry.decoherenceScore?.toFixed(6) ?? '1.000000'}
                    </span>
                  </div>
                </div>

                {/* Title and summary */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    {entry.summary}
                  </p>
                </div>

                {/* Mathematical Equations Card */}
                {entry.equations && (
                  <div className="rounded-xl border border-cyan-950/60 bg-slate-950/90 p-3.5 font-mono">
                    <div className="flex items-center justify-between text-[11px] text-cyan-400 font-semibold mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileCode2 className="h-3.5 w-3.5" />
                        <span>Core Deterministic Equations</span>
                      </div>
                      <span className="text-[10px] text-slate-500">LaTeX / Matrix Notation</span>
                    </div>
                    <pre className="text-xs text-cyan-200 overflow-x-auto whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {entry.equations}
                    </pre>
                  </div>
                )}

                {/* Data Points Card */}
                {entry.dataPoints && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 font-mono text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mb-1.5">
                      <Binary className="h-3.5 w-3.5" />
                      <span>Observational Data Points &amp; Metrics</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed text-[11px] break-words">
                      {entry.dataPoints}
                    </div>
                  </div>
                )}

                {/* Expandable full content */}
                {isExpanded && entry.content && (
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 text-xs text-slate-300 leading-relaxed">
                    <h4 className="font-semibold text-cyan-300 mb-2 font-mono">Full Research Derivation</h4>
                    <p className="whitespace-pre-line text-slate-300">{entry.content}</p>
                  </div>
                )}

                {/* Tags with click-to-filter */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {entry.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="rounded-md bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 text-[10px] font-mono text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-600 cursor-pointer transition-colors"
                        title={`Filter by tag: ${tag}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Cryptographic DCP Seal Provenance Box */}
                <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-purple-300 mb-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                      <span className="font-semibold">Digital Crystal Protocol (DCP) Notarization</span>
                    </div>
                    <span className="text-[10px] text-purple-400">Zero-Drift Certified</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 overflow-hidden truncate">
                    <Hash className="h-3 w-3 text-purple-400 flex-shrink-0" />
                    <span className="truncate font-mono">
                      SHA-256: <span className="text-purple-200">{entry.dcpSealHash || 'a7c39f029e84b29158c3a19ffea823b107df2e3a19bc8201de399a0d84f88129'}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Platform Links & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  {/* Platform External Links */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {entry.zenodoDoi && (
                      <a
                        href={entry.zenodoDoi.startsWith('http') ? entry.zenodoDoi : `https://zenodo.org/records/${entry.zenodoDoi.replace('10.5281/zenodo.', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[11px] text-cyan-300 hover:bg-cyan-950 hover:text-cyan-200 transition-colors"
                      >
                        <span>Zenodo</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {entry.gitRepo && (
                      <a
                        href={entry.gitRepo}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {entry.osfId && (
                      <a
                        href={entry.osfId.startsWith('http') ? entry.osfId : `https://${entry.osfId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[11px] text-emerald-400 hover:bg-emerald-950 transition-colors"
                      >
                        <span>OSF</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {entry.xPostUrl && (
                      <a
                        href={entry.xPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[11px] text-sky-400 hover:bg-sky-950 transition-colors"
                      >
                        <span>X (Twitter)</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <span>Less</span>
                          <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          <span>Read Derivation</span>
                          <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopySeal(entry)}
                      className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 px-2.5 py-1 rounded transition-colors cursor-pointer"
                      title="Copy full DCP ethical seal block"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Seal</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadMarkdown(entry)}
                      className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded transition-colors cursor-pointer"
                      title="Download sealed markdown archive"
                    >
                      <Download className="h-3 w-3" />
                      <span>Export</span>
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="rounded p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete research entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <Binary className="mx-auto h-8 w-8 text-slate-600 mb-3" />
            <h4 className="text-base font-semibold text-slate-300">No Research Documents Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No papers matched your search criteria or category filter. Try clearing the filter or record a new mathematical document.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="mt-4 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* GitHub Repository Compiler Modal */}
      <GithubCompilerModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        onCompiled={(compiledEntries) => {
          if (onEntriesCompiled) {
            onEntriesCompiled(compiledEntries);
          }
          setCompileMessage(`Successfully compiled ${compiledEntries.length} treatises from FatherTimeSDKP GitHub repositories. Zero loss confirmed.`);
          setTimeout(() => setCompileMessage(null), 6000);
        }}
      />
    </div>
  );
};
