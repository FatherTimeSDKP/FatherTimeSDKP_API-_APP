import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../firebase/authContext';
import {
  listDriveFiles,
  uploadDriveFile,
  deleteDriveFile,
  getOrCreateResearchFolder,
  DriveFile,
} from '../services/googleDriveService';
import { ResearchEntry } from '../types/research';
import {
  Cloud,
  HardDrive,
  Upload,
  RefreshCw,
  ExternalLink,
  Trash2,
  Search,
  FileText,
  FileCode,
  FolderPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  ArrowRight,
  Plus
} from 'lucide-react';

interface GoogleDriveHubProps {
  researchEntries: ResearchEntry[];
}

export const GoogleDriveHub: React.FC<GoogleDriveHubProps> = ({ researchEntries }) => {
  const { user, accessToken, signInWithGoogle, logout } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // New file modal
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  // Delete confirmation modal (MANDATORY per Workspace guidelines)
  const [deleteCandidate, setDeleteCandidate] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFiles = useCallback(async (query?: string) => {
    if (!accessToken) return;
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const res = await listDriveFiles(accessToken, { query: query || undefined, pageSize: 30 });
      setFiles(res.files || []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error fetching files from Google Drive');
    } finally {
      setIsLoadingFiles(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchFiles();
    }
  }, [accessToken, fetchFiles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(searchQuery);
  };

  const handleSyncAllResearch = async () => {
    if (!accessToken) {
      setErrorMessage('Please sign in with Google to sync files to your Google Drive.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Get or create folder
      const folderId = await getOrCreateResearchFolder(accessToken);

      // 2. Package Research Entries into a Master Markdown Archive
      const masterContent = `# FatherTimeSDKP & Digital Crystal Protocol (DCP) Research Archive
Generated: ${new Date().toISOString()}
Author: Donald Paul Smith (FatherTimeSDKP)
Total Certified Entries: ${researchEntries.length}

---

${researchEntries
  .map(
    (e, idx) => `## ${idx + 1}. ${e.title}
- **Category**: ${e.category}
- **Created At**: ${e.createdAt}
- **Decoherence Score**: ${e.decoherenceScore ?? 1.000000}
- **Prime Lock Anchor**: ${e.primeLock ?? 104729}
- **Mod-9 Harmonic**: ${e.mod9Harmonic ?? 9}
- **DCP Seal Hash**: ${e.dcpSealHash || '0x369...dcp'}

### Summary & Description
${e.summary || e.content}

### Equations
${e.equations || 'None'}

### Data Points & Metrics
${e.dataPoints || 'None'}

### Provenance Archives
- **Zenodo DOI**: ${e.zenodoDoi ? `https://doi.org/${e.zenodoDoi}` : 'Certified (18322841)'}
- **OSF DOI**: ${e.osfId ? `https://osf.io/${e.osfId}` : 'osf.io/dcp-certified'}
- **GitHub Repository**: ${e.gitRepo || 'https://github.com/FatherTimeSDKP'}

---
`
  )
  .join('\n')}
`;

      const fileName = `DCP_Research_Master_${new Date().toISOString().split('T')[0]}.md`;
      await uploadDriveFile(accessToken, fileName, masterContent, 'text/markdown', folderId);

      // 3. Also upload raw JSON backup
      const jsonContent = JSON.stringify(
        {
          project: 'FatherTimeSDKP Digital Crystal Protocol',
          exportedAt: new Date().toISOString(),
          recordCount: researchEntries.length,
          data: researchEntries,
        },
        null,
        2
      );

      const jsonFileName = `DCP_Research_Raw_Dataset_${new Date().toISOString().split('T')[0]}.json`;
      await uploadDriveFile(accessToken, jsonFileName, jsonContent, 'application/json', folderId);

      setSuccessMessage(
        `Successfully synced ${researchEntries.length} research entries and JSON backup to "FatherTimeSDKP Research Vault" in Google Drive!`
      );
      await fetchFiles();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to export research to Google Drive');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncCrossChainSpec = async () => {
    if (!accessToken) {
      setErrorMessage('Please sign in with Google to export to Google Drive.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const folderId = await getOrCreateResearchFolder(accessToken);
      const specContent = `# Digital Crystal Protocol (DCP) — Cross-Chain DeFi Bridge Architecture
**Publication Date**: 2026-09-29
**Author**: Donald Paul Smith (FatherTimeSDKP)
**Protocol**: Digital Crystal Protocol (DCP-v3.6.9)

## 1. Architectural Foundations
- **Lock-and-Mint / Burn-and-Release**: Guarantees 1:1 backing collateral coverage.
- **Liquidity Pool / Router Bridges**: High capital efficiency with dynamic multi-chain rebalancing.
- **Validator & Message Passing**: Decentralized threshold relayer network with Chainlink CCIP / LayerZero compatibility.
- **Zero-Knowledge Bridges**: Cryptographic verification of cross-chain events without trusted intermediaries.

## 2. Invariant Enforcement & Mathematical Security
- Invariant 1: $\\sum \\text{Minted}_{\\text{chains}} \\le \\text{Collateral}_{\\text{source}}$
- Invariant 2: Domain separation replay protection: $\\text{MsgID} = \\text{Keccak256}(\\text{ChainID} \\parallel \\text{Nonce} \\parallel \\text{ContractAddress})$
- Invariant 3: Mod-9 Phase coherence stability factor $= 1.000000$ (Zero-drift).

## 3. Risk Mitigation & Circuit Breakers
- Automated circuit breakers trigger on anomalous mint volume or pool route skew.
- MEV-resistant commit-reveal schemes and multi-oracle TWAP price aggregation.
- Time-locked emergency pause mechanisms.
`;

      const fileName = `DCP_CrossChain_Bridge_Architecture_2026.md`;
      await uploadDriveFile(accessToken, fileName, specContent, 'text/markdown', folderId);

      setSuccessMessage(`Cross-chain DeFi Bridge specification saved directly to your Google Drive!`);
      await fetchFiles();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload cross-chain spec to Google Drive');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newDocTitle.trim()) return;

    setIsSavingDoc(true);
    setErrorMessage(null);
    try {
      const folderId = await getOrCreateResearchFolder(accessToken);
      const fileName = newDocTitle.endsWith('.md') ? newDocTitle : `${newDocTitle}.md`;
      await uploadDriveFile(accessToken, fileName, newDocContent, 'text/markdown', folderId);
      setSuccessMessage(`Document "${fileName}" created in Google Drive!`);
      setIsNewDocModalOpen(false);
      setNewDocTitle('');
      setNewDocContent('');
      await fetchFiles();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setIsSavingDoc(false);
    }
  };

  // Explicit confirmation dialog execution
  const executeDeleteFile = async () => {
    if (!accessToken || !deleteCandidate) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteDriveFile(accessToken, deleteCandidate.id);
      setSuccessMessage(`File "${deleteCandidate.name}" removed from Google Drive.`);
      setDeleteCandidate(null);
      await fetchFiles();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-800/60 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Cloud className="h-3.5 w-3.5 text-cyan-400" />
                Google Drive Integration
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-300">
                1P Google Workspace Client OAuth
              </span>
              {user && (
                <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[11px] text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Authenticated: {user.email}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Google Drive Research Vault &amp; Cloud Sync
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Directly synchronize all FatherTimeSDKP research papers, discrete Kapnack equations, simulation outputs, and cross-chain DeFi bridge specifications to your Google Drive account with user permission.
            </p>
          </div>

          {/* Sign In / Drive Status Card */}
          <div className="rounded-2xl border border-cyan-800/80 bg-slate-950/90 p-4 shadow-xl flex-shrink-0 space-y-3 min-w-[260px]">
            {!user || !accessToken ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-cyan-400" />
                  <span>Connect Google Drive</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Grant permission to access and organize research files in your Google Drive.
                </p>

                {/* Official Sign In with Google Button */}
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white px-4 py-2.5 text-xs font-medium text-slate-900 shadow-md hover:bg-slate-100 transition-all cursor-pointer font-sans"
                >
                  <svg className="h-4 w-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Drive Connected</span>
                  </span>
                  <button
                    onClick={logout}
                    className="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 truncate">
                  {user.email}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setIsNewDocModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-cyan-600/30 border border-cyan-500/50 px-2.5 py-1.5 text-[11px] text-cyan-200 hover:bg-cyan-600/40 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Doc</span>
                  </button>
                  <button
                    onClick={() => fetchFiles()}
                    disabled={isLoadingFiles}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
                    title="Refresh Files"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncAllResearch}
            disabled={!accessToken || isExporting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>{isExporting ? 'Syncing to Drive...' : `Sync All ${researchEntries.length} Research Entries to Drive`}</span>
          </button>

          <button
            onClick={handleSyncCrossChainSpec}
            disabled={!accessToken || isExporting}
            className="flex items-center gap-2 rounded-xl bg-purple-950/80 border border-purple-700 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-900/80 disabled:opacity-50 transition-all cursor-pointer"
          >
            <FileCode className="h-4 w-4 text-purple-400" />
            <span>Sync Cross-Chain DeFi Bridge Spec</span>
          </button>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-400 hover:text-cyan-300 transition-colors ml-auto"
          >
            <span>Open Google Drive</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Search & File Explorer Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Files in Your Google Drive
            </h2>
            <span className="text-[10px] text-slate-500">
              ({files.length} retrieved)
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search Drive files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-56 sm:w-64"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              Filter
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchFiles('');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* File List */}
        {!accessToken ? (
          <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <Cloud className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">
              Google Drive Not Connected
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please sign in with your Google account above to browse your Drive files and export research papers directly.
            </p>
          </div>
        ) : isLoadingFiles ? (
          <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading files from Google Drive...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <FileText className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">
              No files found in Google Drive
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &ldquo;Sync All Research Entries to Drive&rdquo; above to automatically create the FatherTimeSDKP archive folder and files.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file) => {
              const isMarkdown = file.name.endsWith('.md');
              const isJson = file.name.endsWith('.json');
              return (
                <div
                  key={file.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-800 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0 text-cyan-400">
                        {isMarkdown ? (
                          <FileText className="h-4 w-4 text-cyan-400" />
                        ) : isJson ? (
                          <FileCode className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Cloud className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Drive File'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteCandidate(file)}
                      className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                      title="Delete from Google Drive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-900 text-slate-400">
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {file.mimeType.split('.').pop() || file.mimeType}
                    </span>

                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:underline"
                      >
                        <span>Open in Drive</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MANDATORY Confirmation Dialog for Deleting Files */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-900/60 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertCircle className="h-5 w-5" />
              <span>Confirm File Deletion</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-bold">&ldquo;{deleteCandidate.name}&rdquo;</span> from your Google Drive? This action cannot be undone.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div><span className="text-slate-500">File ID:</span> {deleteCandidate.id}</div>
              <div><span className="text-slate-500">Type:</span> {deleteCandidate.mimeType}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteFile}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Research Document Modal */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <FolderPlus className="h-4 w-4 text-cyan-400" />
                <span>Create Research Document in Google Drive</span>
              </div>
              <button
                onClick={() => setIsNewDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Document Title (.md):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kapnack_Gradient_Proof_2026.md"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Document Content (Markdown):</label>
                <textarea
                  rows={8}
                  placeholder="# Research Note&#10;Discrete phase angle theta = 1.000000..."
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDoc}
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 cursor-pointer disabled:opacity-50"
                >
                  {isSavingDoc ? 'Uploading...' : 'Save to Google Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
