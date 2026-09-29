import React from 'react';
import { useAuth } from '../firebase/authContext';
import { 
  Atom, 
  GitBranch, 
  ExternalLink, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  Database,
  CheckCircle2,
  Cpu,
  Terminal,
  Network,
  DollarSign,
  Cloud,
  GitMerge,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'library' | 'topology' | 'solvers' | 'falsification' | 'maintainer' | 'platforms' | 'apis' | 'commercial' | 'drive' | 'crosschain' | 'classroom';
  setActiveTab: (tab: 'library' | 'topology' | 'solvers' | 'falsification' | 'maintainer' | 'platforms' | 'apis' | 'commercial' | 'drive' | 'crosschain' | 'classroom') => void;
  onOpenAddModal: () => void;
  researchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  researchCount,
}) => {
  const { user, isAdmin, signInWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/60 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <Atom className="h-6 w-6 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" title="DCP Cryptographic Core Online" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-tight text-slate-100">
                FatherTime<span className="text-cyan-400">SDKP</span>
              </span>
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300 border border-cyan-800/60">
                DCP-v3.6.9
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Deterministic Crystal Topologies &amp; Provenance Protocol
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Research Archive</span>
            <span className="ml-1 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-cyan-400">
              {researchCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'topology'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>DCP Topology</span>
            <span className="rounded bg-purple-950 px-1 py-0.2 text-[9px] font-mono text-purple-300 border border-purple-800">
              D3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('solvers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'solvers'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Interactive Solvers</span>
          </button>

          <button
            onClick={() => setActiveTab('falsification')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'falsification'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Falsification Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('maintainer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'maintainer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>5 Gates Review</span>
          </button>

          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'platforms'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Platforms Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('apis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'apis'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>APIs</span>
            <span className="rounded bg-cyan-950 px-1 py-0.2 text-[9px] font-mono text-cyan-400 border border-cyan-800">
              REST
            </span>
          </button>

          <button
            onClick={() => setActiveTab('commercial')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'commercial'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Consulting &amp; Pricing</span>
            <span className="rounded bg-emerald-950 px-1 py-0.2 text-[9px] font-mono text-emerald-300 border border-emerald-800">
              $29+
            </span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'drive'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="h-3.5 w-3.5 text-blue-400" />
            <span>Google Drive &amp; Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('crosschain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'crosschain'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitMerge className="h-3.5 w-3.5 text-purple-400" />
            <span>Cross-Chain DeFi</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'classroom'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Google Classroom</span>
          </button>
        </nav>

        {/* Action Controls & Auth */}
        <div className="flex items-center gap-2">
          {/* Quick Add Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer"
            title="Create new research entry with DCP cryptographic seal"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add Research</span>
          </button>

          {/* User Auth Chip */}
          {user ? (
            <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1">
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 flex items-center justify-end gap-1">
                  {isAdmin ? (
                    <>
                      <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                      Lead Architect
                    </>
                  ) : (
                    'Verified Researcher'
                  )}
                </span>
              </div>
              <button
                onClick={logout}
                className="rounded p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Sign out of Firebase Auth"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 transition-all cursor-pointer"
              title="Authenticate via Google Firebase Auth"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-900 px-2 py-1.5 gap-1 bg-slate-950/95 scrollbar-none">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'library' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Research ({researchCount})
        </button>
        <button
          onClick={() => setActiveTab('topology')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'topology' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Topology (D3)
        </button>
        <button
          onClick={() => setActiveTab('solvers')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'solvers' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Solvers
        </button>
        <button
          onClick={() => setActiveTab('falsification')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'falsification' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Falsification
        </button>
        <button
          onClick={() => setActiveTab('maintainer')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'maintainer' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          5 Gates
        </button>
        <button
          onClick={() => setActiveTab('platforms')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'platforms' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Platforms
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'apis' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          APIs (REST)
        </button>
        <button
          onClick={() => setActiveTab('commercial')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'commercial' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-emerald-400'
          }`}
        >
          Consulting &amp; Pricing ($)
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'drive' ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Google Drive &amp; Docs
        </button>
        <button
          onClick={() => setActiveTab('crosschain')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'crosschain' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Cross-Chain DeFi
        </button>
        <button
          onClick={() => setActiveTab('classroom')}
          className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeTab === 'classroom' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Google Classroom
        </button>
      </div>
    </header>
  );
};
