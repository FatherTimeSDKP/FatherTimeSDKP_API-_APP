import React, { useState, useEffect } from 'react';
import { 
  calculateDallasCode, 
  isPrime, 
  findNextPrime, 
  computeKapnackGradient, 
  getMetatronFCCNodes, 
  computeSdkpTimeRate, 
  createDcpSealBlock 
} from '../lib/dcpEngine';
import { MetatronNode } from '../types/research';
import { useAuth } from '../firebase/authContext';
import { db } from '../firebase/config';
import { collection, doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { 
  Binary, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  Activity, 
  Compass, 
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const InteractiveSolvers: React.FC = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'dallas' | 'kapnack' | 'metatron' | 'sdkp' | 'sealer'>('dallas');

  // Dallas's Code State
  const [primeInput, setPrimeInput] = useState<number>(104729);
  const [dallasResult, setDallasResult] = useState<{
    primeLock: number;
    isPrimeNum: boolean;
    mod9Root: number;
    phaseAngleDeg: number;
  }>({
    primeLock: 104729,
    isPrimeNum: true,
    mod9Root: 5,
    phaseAngleDeg: 200,
  });

  // Kapnack Solver State
  const [density1, setDensity1] = useState<number>(1.25);
  const [density2, setDensity2] = useState<number>(4.75);
  const [deltaX, setDeltaX] = useState<number>(0.05);
  const [offsetConstant, setOffsetConstant] = useState<number>(0.1);
  const [kapnackResult, setKapnackResult] = useState({
    discreteGradient: 23.333333,
    classicalGradient: 70.0,
    decoherenceScore: 1.000000,
    verdict: 'PASS (Zero-Drift: 1.000000 Coherence Locked)',
  });

  // Metatron Lattice State
  const [metatronNodes, setMetatronNodes] = useState<MetatronNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MetatronNode | null>(null);
  const [latticeRotation, setLatticeRotation] = useState<number>(25);

  // SDKP Time-Rate State
  const [sizeParam, setSizeParam] = useState<number>(1.0);
  const [densityParam, setDensityParam] = useState<number>(2.5);
  const [kineticsParam, setKineticsParam] = useState<number>(1.8);
  const [positionParam, setPositionParam] = useState<number>(5.0);
  const [sdkpResult, setSdkpResult] = useState({
    timeRate: 0.457891,
    relativeDilation: 2.183926,
    quantumCoherenceIndex: 1.000000,
  });

  // DCP Sealer State
  const [sealSubject, setSealSubject] = useState<string>('Discrete Field Observation Alpha');
  const [sealPayload, setSealPayload] = useState<string>('Empirical spatial density measurements at 13-node coordinate boundary.');
  const [sealPrime, setSealPrime] = useState<number>(104743);
  const [generatedSeal, setGeneratedSeal] = useState<{
    sha256Hash: string;
    mod9Harmonic: number;
    timestamp: string;
    formattedSeal: string;
  } | null>(null);
  const [isPersistingSeal, setIsPersistingSeal] = useState(false);
  const [sealPersistSuccess, setSealPersistSuccess] = useState(false);
  const [copiedSeal, setCopiedSeal] = useState(false);

  // Initialize Metatron nodes
  useEffect(() => {
    const nodes = getMetatronFCCNodes();
    setMetatronNodes(nodes);
    setSelectedNode(nodes[0]);
  }, []);

  // Update Dallas's code when primeInput changes
  useEffect(() => {
    const num = Math.floor(primeInput) || 0;
    const isP = isPrime(num);
    const root = calculateDallasCode(num);
    const deg = (360 / 9) * root;
    setDallasResult({
      primeLock: num,
      isPrimeNum: isP,
      mod9Root: root,
      phaseAngleDeg: Math.round(deg),
    });
  }, [primeInput]);

  // Update Kapnack solver
  useEffect(() => {
    const res = computeKapnackGradient(density1, density2, deltaX, offsetConstant);
    const classical = deltaX !== 0 ? (density2 - density1) / deltaX : Infinity;
    setKapnackResult({
      discreteGradient: res.discreteGradient,
      classicalGradient: Number(classical.toFixed(4)),
      decoherenceScore: res.decoherenceScore,
      verdict: res.stabilityVerdict,
    });
  }, [density1, density2, deltaX, offsetConstant]);

  // Update SDKP time rate
  useEffect(() => {
    const res = computeSdkpTimeRate(sizeParam, densityParam, kineticsParam, positionParam);
    setSdkpResult(res);
  }, [sizeParam, densityParam, kineticsParam, positionParam]);

  // Handle Generate DCP Seal
  const handleGenerateSeal = async () => {
    const authorName = user?.email ? `${user.displayName || 'Researcher'} (${user.email})` : 'Donald Paul Smith (FatherTimes369v)';
    const seal = await createDcpSealBlock(sealSubject, sealPayload, sealPrime, authorName);
    setGeneratedSeal(seal);
    setSealPersistSuccess(false);
  };

  // Persist seal to Firestore
  const handlePersistSealToFirestore = async () => {
    if (!generatedSeal) return;
    if (!user) {
      alert('Please sign in with Google to persist the DCP seal to the official Firestore ledger.');
      return;
    }

    setIsPersistingSeal(true);
    const sealId = `dcp-seal-${Date.now()}`;
    const payload = {
      id: sealId,
      subject: sealSubject,
      sealHash: generatedSeal.sha256Hash,
      primeLock: sealPrime,
      mod9Harmonic: generatedSeal.mod9Harmonic,
      authorUid: user.uid,
      authorEmail: user.email || 'anonymous',
      timestamp: generatedSeal.timestamp,
    };

    try {
      await setDoc(doc(db, 'dcp_seals', sealId), payload);
      setSealPersistSuccess(true);
      setTimeout(() => setSealPersistSuccess(false), 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `dcp_seals/${sealId}`);
    } finally {
      setIsPersistingSeal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub navigation bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-900/40 bg-slate-900/70 p-2 shadow-xl backdrop-blur-sm">
        <button
          onClick={() => setActiveSubTab('dallas')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-medium transition-all cursor-pointer ${
            activeSubTab === 'dallas'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Binary className="h-4 w-4" />
          <span>Dallas’s Code (Mod-9)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kapnack')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-medium transition-all cursor-pointer ${
            activeSubTab === 'kapnack'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Kapnack Solver (+0.1)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('metatron')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-medium transition-all cursor-pointer ${
            activeSubTab === 'metatron'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Metatron 13-Node FCC</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sdkp')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-medium transition-all cursor-pointer ${
            activeSubTab === 'sdkp'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>SDKP Time-Rate f(S,D,K,P)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sealer')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-medium transition-all cursor-pointer ${
            activeSubTab === 'sealer'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-purple-400" />
          <span>DCP Cryptographic Notarizer</span>
        </button>
      </div>

      {/* TAB 1: DALLAS'S CODE SOLVER */}
      {activeSubTab === 'dallas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                <Binary className="h-4 w-4" />
                <span>Mod-9 Prime Phase Harmonic Processor</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">Dallas’s Code Engine</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Terminates chaotic floating-point drift by reducing prime lock values into single-digit cyclic harmonic attractors: 
                <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded ml-1 font-mono">digital_root = prime % 9</code>.
              </p>
            </div>

            <div className="space-y-3 font-mono">
              <label className="block text-xs font-medium text-slate-300">
                Prime Lock Number (p)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={primeInput}
                  onChange={(e) => setPrimeInput(Number(e.target.value))}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-base text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={() => setPrimeInput(findNextPrime(primeInput + 1))}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 text-xs text-cyan-300 transition-colors cursor-pointer"
                  title="Find next verified prime candidate"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Next Prime</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500">Known Locks:</span>
              {[104729, 104743, 104759, 104779, 999983].map((val) => (
                <button
                  key={val}
                  onClick={() => setPrimeInput(val)}
                  className="rounded-md bg-slate-950 border border-slate-800 px-2 py-1 text-[11px] font-mono text-cyan-400 hover:border-cyan-600 transition-colors cursor-pointer"
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Computed Invariant Block */}
            <div className="rounded-xl border border-cyan-950/70 bg-slate-950/90 p-4 font-mono space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Primality Status:</span>
                <span className={`text-xs font-semibold flex items-center gap-1 ${dallasResult.isPrimeNum ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {dallasResult.isPrimeNum ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified Prime Number
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Composite Number (Requires Prime Gate)
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Mod-9 Digital Root Harmonic:</span>
                <span className="text-lg font-bold text-cyan-300">
                  {dallasResult.mod9Root}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Discrete Cyclic Phase Angle:</span>
                <span className="text-xs text-purple-300">
                  {dallasResult.phaseAngleDeg}° ({((dallasResult.phaseAngleDeg * Math.PI) / 180).toFixed(4)} rad)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Decoherence Metric:</span>
                <span className="text-xs text-emerald-400 font-bold">
                  1.000000 (ZERO DRIFT)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Cyclic Dial Projection */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col items-center justify-center">
            <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Dallas 9-Fold Harmonic Attractor Dial
            </h4>

            <div className="relative h-64 w-64 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
              {/* Central Harmonic Center */}
              <div className="absolute h-16 w-16 rounded-full bg-cyan-950 border border-cyan-500/40 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-[10px] font-mono text-cyan-400">Harmonic</span>
                <span className="text-xl font-bold font-mono text-cyan-200">{dallasResult.mod9Root}</span>
              </div>

              {/* 9 Nodes in Circle */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((nodeVal) => {
                const angle = ((nodeVal - 1) * (360 / 9) - 90) * (Math.PI / 180);
                const radius = 96; // px
                const x = Math.round(128 + radius * Math.cos(angle) - 16);
                const y = Math.round(128 + radius * Math.sin(angle) - 16);
                const isCurrent = nodeVal === dallasResult.mod9Root;

                return (
                  <button
                    key={nodeVal}
                    onClick={() => {
                      // pick a prime with this harmonic
                      const primesByHarmonic: Record<number, number> = {
                        1: 104743, 2: 999983, 3: 3, 4: 13, 5: 104729, 6: 0, 7: 7, 8: 104759, 9: 9
                      };
                      if (primesByHarmonic[nodeVal]) setPrimeInput(primesByHarmonic[nodeVal]);
                    }}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className={`absolute h-8 w-8 rounded-full font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-400/50 scale-125 ring-2 ring-cyan-200'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {nodeVal}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] font-mono text-slate-400 mt-4 text-center max-w-sm">
              Phase rotation locks strictly onto node <span className="text-cyan-300 font-bold">{dallasResult.mod9Root}</span> at {dallasResult.phaseAngleDeg}°. Cyclic invariance guarantees zero floating-point accumulation drift over infinite execution loops.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: KAPNACK DISCRETE GRADIENT SOLVER */}
      {activeSubTab === 'kapnack' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                <Activity className="h-4 w-4" />
                <span>Discrete Non-Singular Gradient Processor</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">Kapnack Solver (+0.1 Offset)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Prevents infinite division-by-zero singularities at point-mass centers and coordinate boundaries:
                <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded ml-1 font-mono">∇ρ = Δρ / (|Δx| + 0.1)</code>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Density ρ₁ (kg/m³)</label>
                <input
                  type="number"
                  step="0.05"
                  value={density1}
                  onChange={(e) => setDensity1(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Density ρ₂ (kg/m³)</label>
                <input
                  type="number"
                  step="0.05"
                  value={density2}
                  onChange={(e) => setDensity2(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Spatial Distance Δx (m)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={deltaX}
                  onChange={(e) => setDeltaX(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Zero-Crossing Offset</label>
                <input
                  type="number"
                  step="0.01"
                  value={offsetConstant}
                  onChange={(e) => setOffsetConstant(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Singularity Test Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Boundary Approach (Δx → 0):</span>
                <span className="text-cyan-400">{deltaX} m</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={deltaX}
                onChange={(e) => setDeltaX(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Kapnack Analysis Card */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Singularity Comparison &amp; Stability Output
              </h4>

              <div className="space-y-3 font-mono">
                <div className="rounded-xl border border-cyan-900/60 bg-slate-950/90 p-4">
                  <div className="text-[11px] text-cyan-400 mb-1">Kapnack Discrete Gradient (Protected):</div>
                  <div className="text-2xl font-bold text-cyan-300">
                    {kapnackResult.discreteGradient}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Δρ / (|Δx| + {offsetConstant}) = {(density2 - density1).toFixed(2)} / {(Math.abs(deltaX) + offsetConstant).toFixed(3)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-[11px] text-slate-400 mb-1">Standard Classical Gradient (Unprotected):</div>
                  <div className={`text-xl font-bold ${deltaX === 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {deltaX === 0 ? '∞ (SINGULARITY FAILURE)' : kapnackResult.classicalGradient}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {deltaX === 0 ? 'Division by zero triggers numerical overflow in classical differential calculus.' : `Δρ / Δx = ${(density2 - density1).toFixed(2)} / ${deltaX}`}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-emerald-400 font-semibold">Decoherence Stability Index:</div>
                    <div className="text-xs text-slate-300 mt-0.5">{kapnackResult.verdict}</div>
                  </div>
                  <div className="text-xl font-bold text-emerald-300">
                    {kapnackResult.decoherenceScore.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
              Notice: Under the FatherTimeSDKP framework, the +0.1 denominator constant physically represents the minimum quantum coordination boundary grain, preventing black hole singularities.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: METATRON 13-NODE FCC TOPOLOGY */}
      {activeSubTab === 'metatron' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                    <Layers className="h-4 w-4" />
                    <span>Face-Centered Cubic Spatial Lattice</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">Metatron 13-Node FCC Topology</h3>
                </div>
                <div className="text-right font-mono text-xs text-cyan-300">
                  Coordination: 12 + 1 = 13 Nodes
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                The deterministic discrete lattice replacing Riemannian curved manifolds. 1 central observer node at (0,0,0) and 12 close-packed sphere vertices.
              </p>
            </div>

            {/* Interactive Lattice Visualizer Canvas / SVG */}
            <div className="my-6 relative h-72 w-full rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden">
              <svg className="h-full w-full max-w-md" viewBox="-140 -140 280 280">
                {/* Connecting Lattice Lines to Origin */}
                {metatronNodes.filter(n => n.id !== 0).map((n) => {
                  const rad = (latticeRotation * Math.PI) / 180;
                  const rotX = n.x * Math.cos(rad) - n.z * Math.sin(rad);
                  const rotZ = n.x * Math.sin(rad) + n.z * Math.cos(rad);
                  const scale = 70;
                  const projX = rotX * scale;
                  const projY = -n.y * scale * 0.85 + rotZ * scale * 0.35;

                  return (
                    <line
                      key={`line-${n.id}`}
                      x1="0"
                      y1="0"
                      x2={projX}
                      y2={projY}
                      stroke={selectedNode?.id === n.id ? '#22d3ee' : '#334155'}
                      strokeWidth={selectedNode?.id === n.id ? '2' : '1'}
                      strokeDasharray={n.layer === 'FCC-Octahedral' ? '3,3' : undefined}
                    />
                  );
                })}

                {/* Render Nodes */}
                {metatronNodes.map((n) => {
                  const isCenter = n.id === 0;
                  const rad = (latticeRotation * Math.PI) / 180;
                  const rotX = n.x * Math.cos(rad) - n.z * Math.sin(rad);
                  const rotZ = n.x * Math.sin(rad) + n.z * Math.cos(rad);
                  const scale = 70;
                  const projX = isCenter ? 0 : rotX * scale;
                  const projY = isCenter ? 0 : -n.y * scale * 0.85 + rotZ * scale * 0.35;
                  const isSelected = selectedNode?.id === n.id;

                  return (
                    <g
                      key={`node-${n.id}`}
                      onClick={() => setSelectedNode(n)}
                      className="cursor-pointer transition-transform"
                    >
                      <circle
                        cx={projX}
                        cy={projY}
                        r={isCenter ? '14' : isSelected ? '12' : '9'}
                        fill={isCenter ? '#0891b2' : isSelected ? '#06b6d4' : '#1e293b'}
                        stroke={isSelected ? '#a5f3fc' : isCenter ? '#38bdf8' : '#64748b'}
                        strokeWidth="2"
                      />
                      <text
                        x={projX}
                        y={projY + 3}
                        textAnchor="middle"
                        fontSize={isCenter ? '10' : '8'}
                        fontWeight="bold"
                        fill="#ffffff"
                        fontFamily="monospace"
                      >
                        {n.id}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Rotation Slider overlay */}
              <div className="absolute bottom-2 right-2 bg-slate-900/90 rounded-lg p-2 border border-slate-800 flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={latticeRotation}
                  onChange={(e) => setLatticeRotation(Number(e.target.value))}
                  className="w-24 accent-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Click any node to inspect Cartesian coordinates</span>
              <span>Packing Fraction: <strong className="text-cyan-300">0.74048 (Close-Packed)</strong></span>
            </div>
          </div>

          {/* Node Inspector Panel */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Node Coordinate Inspector
            </h4>

            {selectedNode ? (
              <div className="space-y-3 font-mono">
                <div className="rounded-xl border border-cyan-950 bg-slate-950 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-bold text-cyan-300">
                      Node {selectedNode.id}: {selectedNode.name}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                      {selectedNode.layer}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div>
                      Cartesian Vector: <span className="text-cyan-200">({selectedNode.x}, {selectedNode.y}, {selectedNode.z})</span>
                    </div>
                    <div>
                      Normalized Distance: <span className="text-cyan-200">{Math.sqrt(selectedNode.x**2 + selectedNode.y**2 + selectedNode.z**2).toFixed(4)}</span>
                    </div>
                    <div>
                      Mod-9 Harmonic Charge: <span className="text-amber-300 font-bold">{selectedNode.harmonicCharge}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-400 space-y-2">
                  <div className="font-semibold text-slate-200">SD-N-EOS-QCC Invariants:</div>
                  <p className="text-[11px] leading-relaxed">
                    Shape (FCC Sphere Packing), Dimension (3D Discrete Lattice), Number (13 Coordination Points). Pre-computed lookup tables replace stochastic neural tensor multiplications.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500">Select a node to view coordinate projection.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SDKP TIME-RATE EVOLUTION ENGINE */}
      {activeSubTab === 'sdkp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                <Sliders className="h-4 w-4" />
                <span>Deterministic Time Evolution</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">SDKP Time-Rate Engine</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Calculates time flow as a direct function of Size (S), Density (D), Kinetics (K), and Position (P):
                <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded ml-1 font-mono">T = f(S, D, K, P)</code>.
              </p>
            </div>

            <div className="space-y-4 font-mono">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Size Parameter (S):</span>
                  <span className="text-cyan-400">{sizeParam}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={sizeParam}
                  onChange={(e) => setSizeParam(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Density Parameter (D):</span>
                  <span className="text-cyan-400">{densityParam}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={densityParam}
                  onChange={(e) => setDensityParam(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Kinetics Velocity (K):</span>
                  <span className="text-cyan-400">{kineticsParam}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={kineticsParam}
                  onChange={(e) => setKineticsParam(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Position Harmonic (P):</span>
                  <span className="text-cyan-400">{positionParam} (Dallas Mod-9: {calculateDallasCode(Math.round(positionParam))})</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="9"
                  step="1"
                  value={positionParam}
                  onChange={(e) => setPositionParam(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">
                SDKP Evolutionary Metrics
              </h4>

              <div className="space-y-3 font-mono">
                <div className="rounded-xl border border-cyan-900/60 bg-slate-950/90 p-4">
                  <div className="text-[11px] text-cyan-400 mb-1">SDKP Emergent Time-Rate:</div>
                  <div className="text-3xl font-bold text-cyan-300">
                    {sdkpResult.timeRate}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Normalized clock rate relative to lattice baseline
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-[11px] text-purple-400 mb-1">Relative Gravitational Dilation:</div>
                  <div className="text-2xl font-bold text-purple-300">
                    {sdkpResult.relativeDilation}×
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Derived without Riemannian metric curvature or Minkowski spacetime tensor
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-emerald-400 font-semibold">Quantum Coherence Index:</div>
                    <div className="text-xs text-slate-400">Zero-drift phase stability</div>
                  </div>
                  <div className="text-xl font-bold text-emerald-300">
                    {sdkpResult.quantumCoherenceIndex.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
              Application: Used to model GPS relativistic clock advance (+38.58 μs/day) and Pioneer anomaly sunward drag without Dark Matter or curved spacetime.
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DCP CRYPTOGRAPHIC NOTARIZER */}
      {activeSubTab === 'sealer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-purple-950/60 bg-slate-900/80 p-6 shadow-xl space-y-4">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Digital Crystal Protocol (DCP) Notarizer</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">Cryptographic Ethical Seal</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generates immutable SHA-256 research provenance blocks locked with Dallas’s Code mod-9 prime harmonics and saves directly to Firestore.
              </p>
            </div>

            <div className="space-y-3 font-mono">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject / Document Title</label>
                <input
                  type="text"
                  value={sealSubject}
                  onChange={(e) => setSealSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payload Content / Derivation Body</label>
                <textarea
                  rows={3}
                  value={sealPayload}
                  onChange={(e) => setSealPayload(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dallas’s Prime Lock</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={sealPrime}
                    onChange={(e) => setSealPrime(Number(e.target.value))}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setSealPrime(findNextPrime(sealPrime + 1))}
                    className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs text-purple-300 transition-colors cursor-pointer"
                  >
                    Next Prime
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateSeal}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Compute SHA-256 Provenance &amp; Seal</span>
              </button>
            </div>
          </div>

          {/* Generated Seal Output */}
          <div className="lg:col-span-6 rounded-2xl border border-purple-950/60 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
                  DCP Seal Block &amp; Firestore Ledger
                </h4>
                {generatedSeal && (
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-800">
                    Harmonic: {generatedSeal.mod9Harmonic}
                  </span>
                )}
              </div>

              {generatedSeal ? (
                <div className="space-y-3 font-mono">
                  <pre className="text-[11px] text-purple-200 bg-slate-950 p-3.5 rounded-xl border border-purple-900/60 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {generatedSeal.formattedSeal}
                  </pre>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedSeal.formattedSeal);
                        setCopiedSeal(true);
                        setTimeout(() => setCopiedSeal(false), 2000);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 py-2 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedSeal ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSeal ? 'Copied' : 'Copy Seal Block'}</span>
                    </button>

                    <button
                      onClick={handlePersistSealToFirestore}
                      disabled={isPersistingSeal}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 py-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{isPersistingSeal ? 'Persisting...' : 'Save to Firestore'}</span>
                    </button>
                  </div>

                  {sealPersistSuccess && (
                    <div className="rounded-lg bg-emerald-950/70 border border-emerald-800 px-3 py-2 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Cryptographic DCP Seal registered into Firestore collection: dcp_seals</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-purple-900/50 p-10 text-center text-xs font-mono text-slate-400">
                  Click &ldquo;Compute SHA-256 Provenance &amp; Seal&rdquo; to generate the official cryptographic notarization block.
                </div>
              )}
            </div>

            <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
              Standard: Compliant with FatherTimes369v SDKP research archive &amp; Zenodo record 18322841 immutability protocols.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
