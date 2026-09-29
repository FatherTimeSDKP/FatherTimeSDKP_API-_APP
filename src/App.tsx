import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { db } from './firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firebase/errors';
import { ResearchEntry } from './types/research';
import { INITIAL_RESEARCH_ENTRIES } from './lib/seedData';
import { Navbar } from './components/Navbar';
import { ResearchLibrary } from './components/ResearchLibrary';
import { InteractiveSolvers } from './components/InteractiveSolvers';
import { FalsificationHub } from './components/FalsificationHub';
import { MaintainerGateChecker } from './components/MaintainerGateChecker';
import { PlatformSyncHub } from './components/PlatformSyncHub';
import { AddResearchModal } from './components/AddResearchModal';
import { ApiExplorer } from './components/ApiExplorer';
import { DcpNetworkTopology } from './components/DcpNetworkTopology';
import { CommercialHub } from './components/CommercialHub';
import { 
  Atom, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Network,
  ChevronDown,
  ChevronUp,
  DollarSign
} from 'lucide-react';

function MainAppContent() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'topology' | 'solvers' | 'falsification' | 'maintainer' | 'platforms' | 'apis' | 'commercial'>('library');
  const [researchEntries, setResearchEntries] = useState<ResearchEntry[]>(INITIAL_RESEARCH_ENTRIES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<'syncing' | 'connected' | 'offline'>('syncing');
  const [showDashboardTopology, setShowDashboardTopology] = useState<boolean>(true);

  // Realtime Firestore synchronization for research entries
  useEffect(() => {
    const researchCollection = collection(db, 'research_entries');

    const unsubscribe = onSnapshot(
      researchCollection,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteEntries: ResearchEntry[] = [];
          snapshot.forEach((docSnap) => {
            remoteEntries.push(docSnap.data() as ResearchEntry);
          });
          // Sort by createdAt descending
          remoteEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setResearchEntries(remoteEntries);
        } else {
          // If Firestore collection is empty, seed with initial research items so nothing is lost
          setResearchEntries(INITIAL_RESEARCH_ENTRIES);
          // Seed the documents to Firestore asynchronously if user is logged in
          if (user) {
            INITIAL_RESEARCH_ENTRIES.forEach(async (entry) => {
              try {
                await setDoc(doc(db, 'research_entries', entry.id), entry);
              } catch {
                // Ignore seed error
              }
            });
          }
        }
        setFirestoreSyncStatus('connected');
      },
      (error) => {
        console.warn('[Firestore Live Sync Warning]', error.message);
        setFirestoreSyncStatus('offline');
        // Do not crash the UI on snapshot permission warnings, keep seed data intact
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this research document?')) return;
    try {
      await deleteDoc(doc(db, 'research_entries', id));
      setResearchEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `research_entries/${id}`);
    }
  };

  const handleEntryAdded = (newEntry: ResearchEntry) => {
    setResearchEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
  };

  const handleEntriesCompiled = (compiledEntries: ResearchEntry[]) => {
    setResearchEntries((prev) => {
      const existingMap = new Map(prev.map((e) => [e.id, e]));
      compiledEntries.forEach((ce) => existingMap.set(ce.id, ce));
      const merged = Array.from(existingMap.values());
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return merged;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        researchCount={researchEntries.length}
      />

      {/* Main Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        
        {/* Architect & Provenance Announcement Header */}
        <div className="relative overflow-hidden rounded-3xl border border-cyan-900/50 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan-500/20 px-3 py-1 font-mono text-xs font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  FatherTimeSDKP &amp; Digital Crystal Ecosystem
                </span>
                <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 font-mono text-[11px] text-slate-300 border border-slate-700">
                  Lead Architect: Donald Paul Smith (@FatherTimes369v)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                Deterministic Crystal Topologies &amp; Research Archive
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Replacing probabilistic spacetime tensor metrics with pre-computed grid lattices governed by <strong className="text-cyan-300">Size, Density, Kinetics, and Position (SDKP)</strong>. Every calculation, timestamp, equation, and observational data point is cryptographically sealed under the <strong className="text-purple-300">Digital Crystal Protocol (DCP)</strong>.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex flex-row md:flex-col gap-2.5 font-mono text-xs flex-shrink-0">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-inner">
                <div className="text-[10px] text-slate-400">Decoherence Stability</div>
                <div className="text-lg font-bold text-emerald-400">1.000000 <span className="text-[10px] text-slate-500">Zero Drift</span></div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-inner">
                <div className="text-[10px] text-slate-400">Dallas Prime Harmonic</div>
                <div className="text-lg font-bold text-cyan-400">Mod-9 <span className="text-[10px] text-slate-500">{'{1..9}'}</span></div>
              </div>
            </div>
          </div>

          {/* Quick Platform Strip */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500">Connected Hubs:</span>
              <a
                href="https://github.com/FatherTimeSDKP"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                <span>GitHub / FatherTimeSDKP</span>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://zenodo.org/records/18322841"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Zenodo (DOI 18322841)</span>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://osf.io/search/?q=FatherTimeSDKP"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>OSF Research</span>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://x.com/FatherTimes369v"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>X (@FatherTimes369v)</span>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firestore Persistence: {firestoreSyncStatus === 'connected' ? 'Live Synchronized' : 'Local / Offline Cached'}</span>
            </div>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Main Dashboard D3 Topology Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Network className="h-4 w-4 text-cyan-400" />
                  <span className="font-bold">Digital Crystal Protocol (DCP) Network Topology</span>
                  <span className="rounded bg-cyan-950 px-2 py-0.2 text-[10px] text-cyan-300 border border-cyan-800">
                    Live D3 Simulation
                  </span>
                </div>

                <button
                  onClick={() => setShowDashboardTopology(!showDashboardTopology)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition-colors cursor-pointer text-[11px]"
                >
                  {showDashboardTopology ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      <span>Minimize Topology</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      <span>Display D3 Topology</span>
                    </>
                  )}
                </button>
              </div>

              {showDashboardTopology && (
                <DcpNetworkTopology researchEntries={researchEntries} />
              )}
            </div>

            {/* Research Library */}
            <ResearchLibrary
              entries={researchEntries}
              onDeleteEntry={handleDeleteEntry}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onEntriesCompiled={handleEntriesCompiled}
            />
          </div>
        )}

        {activeTab === 'topology' && (
          <div className="space-y-6">
            <DcpNetworkTopology researchEntries={researchEntries} />

            {/* Topology Invariants Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Atom className="h-4 w-4" />
                  <span>Metatron 13-Node FCC</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  1 central origin (0,0,0) and 12 outer close-packed sphere vertices: (±1, ±1, 0), (±1, 0, ±1), (0, ±1, ±1) normalized by 1/√2.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>DCP Cryptographic Coupling</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Every research document is anchored via SHA-256 digests to its specific crystal coordinate node and sealed under Dallas’s Code mod-9 prime locks.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Zero-Drift 1.000000</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Discrete spatial density kinetics (SDKP) with Kapnack +0.1 boundary offsets prevents runaway float decoherence and eliminates infinite singularities.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'solvers' && <InteractiveSolvers />}

        {activeTab === 'falsification' && <FalsificationHub />}

        {activeTab === 'maintainer' && <MaintainerGateChecker />}

        {activeTab === 'platforms' && <PlatformSyncHub entries={researchEntries} />}

        {activeTab === 'apis' && <ApiExplorer />}

        {activeTab === 'commercial' && <CommercialHub />}

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-8 px-4 font-mono text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Atom className="h-4 w-4 text-cyan-400" />
            <span>FatherTimeSDKP &amp; Digital Crystal Protocol (DCP) Research Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Metatron 13-Node FCC</span>
            <span>•</span>
            <span>Kapnack +0.1 Offset</span>
            <span>•</span>
            <span>Dallas Mod-9 Phase Lock</span>
            <span>•</span>
            <span>LLAL Zero-Drift</span>
          </div>
          <div>
            DOI: <a href="https://zenodo.org/records/18322841" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">10.5281/zenodo.18322841</a>
          </div>
        </div>
      </footer>

      {/* Add Research Modal */}
      <AddResearchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEntryAdded={handleEntryAdded}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
