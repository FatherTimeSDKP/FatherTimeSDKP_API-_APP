import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ResearchEntry } from '../types/research';
import { getMetatronFCCNodes, calculateDallasCode } from '../lib/dcpEngine';
import { 
  Network, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldCheck, 
  Layers, 
  Hash, 
  Key, 
  ExternalLink, 
  FileCode2,
  Atom,
  Sparkles,
  Info
} from 'lucide-react';

interface DcpNetworkTopologyProps {
  researchEntries: ResearchEntry[];
}

export interface DcpGraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'origin' | 'crystal-node' | 'research-node' | 'platform-node';
  category?: string;
  harmonic: number;
  primeLock?: number;
  sealHash?: string;
  doi?: string;
  url?: string;
  equations?: string;
  dataPoints?: string;
  layer?: string;
  coord3D?: [number, number, number];
  radius: number;
  color: string;
}

export interface DcpGraphLink extends d3.SimulationLinkDatum<DcpGraphNode> {
  source: string | DcpGraphNode;
  target: string | DcpGraphNode;
  type: 'crystal-lattice' | 'cryptographic-seal' | 'platform-link' | 'fcc-octahedral';
  color: string;
}

// Mod-9 harmonic color palette
const HARMONIC_COLORS: Record<number, string> = {
  1: '#38bdf8', // sky-400
  2: '#818cf8', // indigo-400
  3: '#c084fc', // purple-400
  4: '#e879f9', // fuchsia-400
  5: '#22d3ee', // cyan-400 (DCP Core Primary)
  6: '#34d399', // emerald-400
  7: '#fbbf24', // amber-400
  8: '#f87171', // red-400
  9: '#a855f7', // purple-500 (Center Origin)
};

export const DcpNetworkTopology: React.FC<DcpNetworkTopologyProps> = ({ researchEntries }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<DcpGraphNode | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'CRYSTAL' | 'RESEARCH' | 'PLATFORMS'>('ALL');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPhysicsActive, setIsPhysicsActive] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Zoom behavior reference
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<DcpGraphNode, DcpGraphLink> | null>(null);

  // Build Graph Nodes & Links from Metatron FCC Lattice and Compiled Research
  const { nodes: allNodes, links: allLinks } = useMemo(() => {
    const rawNodes: DcpGraphNode[] = [];
    const rawLinks: DcpGraphLink[] = [];

    // 1. Metatron 13-Node FCC Crystal Lattice
    const metatronNodes = getMetatronFCCNodes();
    metatronNodes.forEach((mn) => {
      const isOrigin = mn.id === 0;
      const color = isOrigin ? '#a855f7' : HARMONIC_COLORS[mn.harmonicCharge] || '#06b6d4';

      rawNodes.push({
        id: `crystal-${mn.id}`,
        name: isOrigin ? 'Metatron Origin Node (0,0,0)' : `FCC Node #${mn.id} (${mn.name})`,
        type: isOrigin ? 'origin' : 'crystal-node',
        harmonic: mn.harmonicCharge,
        layer: mn.layer,
        coord3D: [mn.x, mn.y, mn.z],
        radius: isOrigin ? 22 : 14,
        color,
        equations: isOrigin
          ? '\\vec{r}_0 = (0,0,0) \\implies \\Phi_{Metatron}(0) = 1.000000'
          : `\\vec{r}_{${mn.id}} = (${mn.x}, ${mn.y}, ${mn.z}) \\quad H_{Dallas} = ${mn.harmonicCharge}`,
      });

      // Connect FCC vertices to Origin (Center Lattice Edges)
      if (!isOrigin) {
        rawLinks.push({
          source: 'crystal-0',
          target: `crystal-${mn.id}`,
          type: 'crystal-lattice',
          color: 'rgba(168, 85, 247, 0.45)',
        });
      }
    });

    // FCC Inter-vertex octahedral lattice edges
    for (let i = 1; i <= 12; i++) {
      const nextId = i === 12 ? 1 : i + 1;
      rawLinks.push({
        source: `crystal-${i}`,
        target: `crystal-${nextId}`,
        type: 'fcc-octahedral',
        color: 'rgba(6, 182, 212, 0.25)',
      });
    }

    // 2. Research Treatises Nodes
    researchEntries.forEach((entry, idx) => {
      const mod9 = entry.mod9Harmonic || calculateDallasCode(entry.primeLock || 104729);
      const color = HARMONIC_COLORS[mod9] || '#38bdf8';

      rawNodes.push({
        id: `research-${entry.id}`,
        name: entry.title,
        type: 'research-node',
        category: entry.category,
        harmonic: mod9,
        primeLock: entry.primeLock || 104729,
        sealHash: entry.dcpSealHash,
        doi: entry.zenodoDoi,
        url: entry.gitRepo,
        equations: entry.equations,
        dataPoints: entry.dataPoints,
        radius: 17,
        color,
      });

      // Connect each research treatise to the corresponding FCC node (mapping based on harmonic mod 12 + 1)
      const targetFccId = (idx % 12) + 1;
      rawLinks.push({
        source: `crystal-${targetFccId}`,
        target: `research-${entry.id}`,
        type: 'cryptographic-seal',
        color: 'rgba(34, 211, 238, 0.6)',
      });
    });

    // 3. Platform Hub Nodes (GitHub, Zenodo, OSF, X)
    const platformHubs = [
      {
        id: 'platform-github',
        name: 'GitHub Organization (FatherTimeSDKP)',
        url: 'https://github.com/FatherTimeSDKP',
        color: '#f43f5e',
        harmonic: 9,
      },
      {
        id: 'platform-zenodo',
        name: 'Zenodo Record 18322841 (DOI: 10.5281/zenodo.18322841)',
        url: 'https://zenodo.org/records/18322841',
        doi: '10.5281/zenodo.18322841',
        color: '#06b6d4',
        harmonic: 5,
      },
      {
        id: 'platform-osf',
        name: 'Open Science Framework (OSF)',
        url: 'https://osf.io/search/?q=FatherTimeSDKP',
        color: '#10b981',
        harmonic: 3,
      },
      {
        id: 'platform-x',
        name: 'X Broadcast Stream (@FatherTimes369v)',
        url: 'https://x.com/FatherTimes369v',
        color: '#38bdf8',
        harmonic: 6,
      },
    ];

    platformHubs.forEach((plat) => {
      rawNodes.push({
        id: plat.id,
        name: plat.name,
        type: 'platform-node',
        url: plat.url,
        doi: plat.doi,
        harmonic: plat.harmonic,
        radius: 18,
        color: plat.color,
      });

      // Platform nodes anchor to the Origin or relevant research papers
      rawLinks.push({
        source: 'crystal-0',
        target: plat.id,
        type: 'platform-link',
        color: 'rgba(244, 63, 94, 0.4)',
      });
    });

    return { nodes: rawNodes, links: rawLinks };
  }, [researchEntries]);

  // Filtered nodes and links based on UI state
  const { filteredNodes, filteredLinks } = useMemo(() => {
    let nodes = allNodes;
    if (filterType === 'CRYSTAL') {
      nodes = allNodes.filter((n) => n.type === 'origin' || n.type === 'crystal-node');
    } else if (filterType === 'RESEARCH') {
      nodes = allNodes.filter((n) => n.type === 'research-node' || n.type === 'origin');
    } else if (filterType === 'PLATFORMS') {
      nodes = allNodes.filter((n) => n.type === 'platform-node' || n.type === 'origin');
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = allLinks.filter((l) => {
      const sourceId = typeof l.source === 'object' ? (l.source as DcpGraphNode).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as DcpGraphNode).id : l.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return { filteredNodes: nodes, filteredLinks: links };
  }, [allNodes, allLinks, filterType]);

  // Initialize and run D3 force simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = isExpanded ? 700 : 440;

    svg.selectAll('*').remove();

    // SVG Defs for glowing filters and gradients
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Main Graph Container Group (for zoom & pan)
    const g = svg.append('g').attr('class', 'graph-container');

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(Number(event.transform.k.toFixed(2)));
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Deep copy data for D3 simulation
    const nodesCopy: DcpGraphNode[] = filteredNodes.map((d) => ({ ...d }));
    const linksCopy: DcpGraphLink[] = filteredLinks.map((d) => ({ ...d }));

    // Force Simulation setup
    const simulation = d3.forceSimulation<DcpGraphNode>(nodesCopy)
      .force(
        'link',
        d3.forceLink<DcpGraphNode, DcpGraphLink>(linksCopy)
          .id((d) => d.id)
          .distance((d) => {
            if (d.type === 'crystal-lattice') return 110;
            if (d.type === 'fcc-octahedral') return 80;
            if (d.type === 'cryptographic-seal') return 140;
            return 160;
          })
          .strength(0.6)
      )
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 12));

    simulationRef.current = simulation;

    // Draw Links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksCopy)
      .enter()
      .append('line')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => {
        if (d.type === 'cryptographic-seal') return 2;
        if (d.type === 'crystal-lattice') return 2.2;
        return 1.2;
      })
      .attr('stroke-dasharray', (d) => (d.type === 'cryptographic-seal' ? '4,3' : 'none'))
      .attr('stroke-opacity', 0.85);

    // Draw Node Groups
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodesCopy)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, DcpGraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Outer Glowing Aura Circle
    node.append('circle')
      .attr('r', (d) => d.radius + 4)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.15)
      .attr('filter', 'url(#glow)');

    // Main Circle
    node.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.type === 'origin') return '#581c87';
        if (d.type === 'platform-node') return '#0f172a';
        return '#020617';
      })
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.type === 'origin' ? 3.5 : 2.2))
      .on('click', (_event, d) => {
        setSelectedNode(d);
      });

    // Node Badges / Harmonic Icons
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', (d) => (d.type === 'origin' ? '12px' : '10px'))
      .attr('font-weight', 'bold')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.type === 'origin') return 'Ω-0';
        if (d.type === 'crystal-node') return `M${d.harmonic}`;
        if (d.type === 'research-node') return `DCP`;
        return 'HUB';
      });

    // Node Label underneath
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 15)
      .attr('fill', '#cbd5e1')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('pointer-events', 'none')
      .text((d) => (d.name.length > 20 ? `${d.name.substring(0, 18)}...` : d.name));

    // Simulation Tick Update
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Select first node by default for inspector
    if (!selectedNode && nodesCopy.length > 0) {
      setSelectedNode(nodesCopy[0]);
    }

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, isExpanded]);

  // Zoom control handlers
  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, factor);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const handleReheatSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.8).restart();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-900/60 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 shadow-2xl backdrop-blur-md">
      {/* Topology Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:px-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-cyan-400" />
              Interactive D3 Visual Topology
            </span>
            <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-800">
              Metatron 13-FCC &bull; Mod-9 Dallas Code
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-mono text-slate-100 mt-1 flex items-center gap-2">
            <span>Digital Crystal Protocol (DCP) Network Topology</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5 max-w-2xl">
            Live interactive force-directed graph illustrating the geometric coupling between 13-node Metatron crystal coordinates, compiled research documents, and external verification hubs.
          </p>
        </div>

        {/* Filter & View Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Layer Filter Pills */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            {(['ALL', 'CRYSTAL', 'RESEARCH', 'PLATFORMS'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                  filterType === mode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 gap-1">
            <button
              onClick={() => handleZoom(1.2)}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Reheat / Fullscreen */}
          <button
            onClick={handleReheatSimulation}
            className="flex items-center gap-1 rounded-xl bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reheat Force Simulation"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reheat</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-xl bg-cyan-950/80 border border-cyan-800 px-2.5 py-1.5 text-cyan-300 hover:bg-cyan-900/60 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Canvas' : 'Expand Canvas'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isExpanded ? 'Compact' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className={`relative w-full transition-all duration-300 ${
          isExpanded ? 'h-[700px]' : 'h-[440px]'
        } bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950`}
      >
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* D3 SVG Canvas */}
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Active Node Inspector Card (Overlaid Bottom Right) */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 max-w-sm w-[90%] sm:w-80 rounded-2xl border border-cyan-900/80 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md font-mono text-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span 
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className="font-bold text-slate-100 truncate text-xs">
                  {selectedNode.name}
                </span>
              </div>
              <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-cyan-400">
                {selectedNode.type}
              </span>
            </div>

            {/* Invariants & Coordinates */}
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Dallas Mod-9 Harmonic:</span>
                <span className="font-bold text-cyan-300">
                  Mod-9: {selectedNode.harmonic}
                </span>
              </div>

              {selectedNode.coord3D && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">3D Lattice Coordinate:</span>
                  <span className="text-amber-300">
                    ({selectedNode.coord3D.join(', ')})
                  </span>
                </div>
              )}

              {selectedNode.primeLock && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Prime Lock Key:</span>
                  <span className="text-purple-300">
                    {selectedNode.primeLock}
                  </span>
                </div>
              )}

              {selectedNode.sealHash && (
                <div className="space-y-0.5 pt-1 border-t border-slate-900">
                  <span className="text-slate-500 text-[10px]">DCP SHA-256 Digest:</span>
                  <div className="rounded bg-slate-900/80 p-1.5 text-[10px] text-purple-200 break-all select-all font-mono">
                    {selectedNode.sealHash}
                  </div>
                </div>
              )}

              {selectedNode.equations && (
                <div className="space-y-0.5 pt-1 border-t border-slate-900">
                  <span className="text-slate-500 text-[10px]">Formulation:</span>
                  <div className="rounded bg-slate-900/80 p-1.5 text-[10px] text-cyan-300 truncate">
                    {selectedNode.equations.split('\n')[0]}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            {(selectedNode.url || selectedNode.doi) && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px]">
                {selectedNode.url && (
                  <a
                    href={selectedNode.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {selectedNode.doi && (
                  <span className="text-slate-400 ml-auto">
                    DOI: {selectedNode.doi}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Legend Overlay (Top Left) */}
        <div className="absolute top-4 left-4 rounded-xl bg-slate-950/80 border border-slate-800 p-2.5 backdrop-blur-sm font-mono text-[10px] space-y-1.5 pointer-events-none hidden sm:block">
          <div className="text-slate-400 uppercase font-semibold">Topology Legend:</div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            <span>Metatron Origin Node (0,0,0)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span>12 FCC Lattice Vertices</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            <span>Research Documents (DCP Sealed)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Verification Hubs (Zenodo, OSF, X, GH)</span>
          </div>
        </div>

        {/* Interaction Hint */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 text-[10px] font-mono text-slate-400 pointer-events-none hidden md:block">
          <span>Drag nodes to rotate lattice &bull; Scroll to zoom &bull; Click node to inspect</span>
        </div>
      </div>
    </div>
  );
};
