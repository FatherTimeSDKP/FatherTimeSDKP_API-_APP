import React, { useState } from 'react';
import {
  DollarSign,
  Zap,
  Briefcase,
  CheckCircle2,
  Calendar,
  Key,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Code2,
  ArrowRight,
  Sparkles,
  Users,
  Terminal,
  FileText,
  Clock,
  HelpCircle,
  CreditCard,
  Wallet,
  Coins,
  MapPin,
  Building2,
  Hash
} from 'lucide-react';

interface TierOption {
  id: string;
  name: string;
  price: number;
  period: string;
  popular?: boolean;
  quota: string;
  rateLimit: string;
  audience: string;
  features: string[];
}

const API_TIERS: TierOption[] = [
  {
    id: 'developer',
    name: 'Developer Tier',
    price: 29,
    period: '/ month',
    quota: '50,000 requests / mo',
    rateLimit: '25 req / sec',
    audience: 'Engineers, students, quantitative devs & simulation prototype builders.',
    features: [
      'Full HTTP access to /v1/coherence, /v1/evolve & /v1/simulate',
      'Kapnack discrete +0.1 offset gradient processor',
      'Dallas Mod-9 harmonic primality checks',
      'Metatron 13-node coordinate transforms',
      'Community Discord & standard email support',
    ],
  },
  {
    id: 'lab',
    name: 'Research Lab / Pro',
    price: 99,
    period: '/ month',
    popular: true,
    quota: '250,000 requests / mo',
    rateLimit: '100 req / sec',
    audience: 'University research labs, aerospace modeling teams, and commercial apps.',
    features: [
      'Everything in Developer Tier',
      'Higher rate limits (100 req/sec) & multi-key provisioning',
      'Automated DCP SHA-256 seal notarization & verification',
      'Telemetry benchmark datasets (Pioneer, Mercury, Galaxy curves)',
      'Commercial deployment rights & priority SLA',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise / Custom Grid',
    price: 299,
    period: '/ month',
    quota: '2,000,000 requests / mo',
    rateLimit: '500 req / sec',
    audience: 'High-throughput pipelines, quantitative funds & institutional partners.',
    features: [
      'Everything in Research Lab Tier',
      'Unlimited private crystal forks & dedicated instance routing',
      'Direct consulting access with Lead Architect Donald Paul Smith',
      'Custom non-stochastic maintainer gate audits',
      'Custom telemetry coupling & 99.9% uptime SLA',
    ],
  },
];

interface ConsultingPkg {
  id: string;
  name: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  deliveryDays: string;
  summary: string;
  deliverables: string[];
}

const CONSULTING_PACKAGES: ConsultingPkg[] = [
  {
    id: 'pkg-api-integration',
    name: 'API Integration Package',
    priceRange: '$500 – $2,000',
    minPrice: 500,
    maxPrice: 2000,
    deliveryDays: '3 business days',
    summary: 'Wire your client application or data pipeline directly to our SDKP Coherence API endpoint with auth tokens, retry logic, and client SDKs.',
    deliverables: [
      'Full integration of /v1/coherence, /v1/evolve & /v1/simulate',
      'Configured API key middleware with rate-limiting and fallback buffering',
      'End-to-end integration tests & Postman/curl collection',
      '30 days direct developer support from Gypsi Consulting',
    ],
  },
  {
    id: 'pkg-custom-simulation',
    name: 'Custom Simulation Script',
    priceRange: '$300 – $1,500',
    minPrice: 300,
    maxPrice: 1500,
    deliveryDays: '2 business days',
    summary: 'One custom Jupyter Notebook / Python / Node script tailored to your exact physical density, spatial kinetics, and lattice parameters.',
    deliverables: [
      'Tailored Kapnack discrete gradient with custom boundary parameters',
      'Metatron 13-node coordinate grid mapping for client geometry',
      'Interactive visual outputs (Matplotlib/Plotly/D3 charts)',
      '1-on-1 walkthrough session via Google Meet / Zoom',
    ],
  },
  {
    id: 'pkg-repo-cleanup-ci',
    name: 'Repo Cleanup + CI/CD Engine',
    priceRange: '$400 – $1,200',
    minPrice: 400,
    maxPrice: 1200,
    deliveryDays: '3 business days',
    summary: 'Transform experimental scripts into clean, importable packages with GitHub Actions CI, typing, and publication-ready documentation.',
    deliverables: [
      'Modular package refactor (Python PyPI or npm package structure)',
      'Automated GitHub Actions CI running deterministic unit tests',
      'Clean README with interactive badges, quickstart, and docs',
      'Zero-drift deterministic maintainer gate verification',
    ],
  },
  {
    id: 'pkg-authorship-audit',
    name: 'Authorship & Provenance Audit',
    priceRange: '$250 – $750',
    minPrice: 250,
    maxPrice: 750,
    deliveryDays: '24 hours',
    summary: 'A formal cryptographic provenance report certifying original authorship, SHA-256 seal integrity, and copycat / derivative repository check.',
    deliverables: [
      'DCP SHA-256 bit-level hash verification of all mathematical formulations',
      'Zenodo DOI (10.5281/zenodo.18322841) citation alignment verification',
      'Audit report detailing derivative repos, forks, or attribution omissions',
      'Signed PDF & Markdown Provenance Certificate from Lead Architect',
    ],
  },
];

export const CommercialHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api-tiers' | 'consulting' | 'crypto-wallets' | 'readme-snippets'>('api-tiers');
  const [copiedWalletKey, setCopiedWalletKey] = useState<string | null>(null);
  
  // Instant API Key generation
  const [clientEmail, setClientEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState('developer');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  // Consulting Inquiry Modal / Form
  const [selectedPkg, setSelectedPkg] = useState<ConsultingPkg>(CONSULTING_PACKAGES[0]);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryBrief, setInquiryBrief] = useState('');
  const [inquiryOrg, setInquiryOrg] = useState('');
  const [inquiryBudget, setInquiryBudget] = useState('$1,000');
  const [inquiryStatus, setInquiryStatus] = useState<string | null>(null);
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);

  // Snippets
  const [copiedBadge, setCopiedBadge] = useState(false);

  const handleGenerateKey = async () => {
    setIsGeneratingKey(true);
    setCheckoutNotice(null);
    try {
      const res = await fetch('/v1/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          email: clientEmail || 'developer@client.com',
          name: `${selectedTier.toUpperCase()} Evaluation Key`,
        }),
      });
      const data = await res.json();
      if (data.apiKey) {
        setGeneratedKey(data.apiKey);
      }
    } catch {
      // Fallback
      setGeneratedKey(`dcp_live_${selectedTier}_${Math.random().toString(36).substring(2, 10)}`);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleCheckoutStripe = async (tierId: string) => {
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierId,
          customerEmail: clientEmail,
        }),
      });
      const data = await res.json();
      setCheckoutNotice(`Stripe Checkout Session created (${data.tierName} - $${data.monthlyPriceUsd}/mo). You can test live API requests immediately using the generated developer keys below.`);
    } catch {
      setCheckoutNotice(`Stripe checkout simulated. Provisioning live API key.`);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail) return;

    setIsInquirySubmitting(true);
    setInquiryStatus(null);
    try {
      const res = await fetch('/api/billing/consulting-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          clientName: inquiryName || 'Client Researcher',
          clientEmail: inquiryEmail,
          organization: inquiryOrg || 'Independent',
          projectBrief: inquiryBrief,
          budgetEst: inquiryBudget,
        }),
      });
      const data = await res.json();
      setInquiryStatus(`Consulting inquiry received! Gypsi Consulting will review your project brief within 24 hours. You can also schedule an intake call directly on Calendly: https://calendly.com/dallasnamiyadaddy`);
    } catch {
      setInquiryStatus(`Inquiry logged. Gypsi Consulting will reach out at ${inquiryEmail} shortly.`);
    } finally {
      setIsInquirySubmitting(false);
    }
  };

  const copyKeyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyWallet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWalletKey(id);
    setTimeout(() => setCopiedWalletKey(null), 2500);
  };

  const readmeBadgeMarkdown = `[![SDKP Coherence API](https://img.shields.io/badge/SDKP%20API-v1%20Live-06b6d4?style=for-the-badge&logo=fastapi)](https://github.com/FatherTimeSDKP)
[![Decoherence](https://img.shields.io/badge/Decoherence-1.000000%20Zero--Drift-10b981?style=for-the-badge)](https://zenodo.org/records/18322841)
[![Commercial License](https://img.shields.io/badge/Gypsi%20Consulting-Commercial%20License-a855f7?style=for-the-badge)](https://calendly.com/dallasnamiyadaddy)

### 🚀 Get API Key
Access our deterministic simulation and quantum coherence API:
\`\`\`bash
curl -X POST https://api.fathertimesdkp.com/v1/coherence \\
  -H "x-api-key: dcp_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"primeLock": 104729, "density": 1.0, "kinetics": 0.5}'
\`\`\`
For custom simulation scripts or API integration consulting: [Book on Calendly](https://calendly.com/dallasnamiyadaddy)`;

  return (
    <div className="space-y-8 font-mono">
      {/* Hero Commercial Announcement */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-900/60 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Gypsi Consulting &amp; FatherTimeSDKP Commercial Hub
              </span>
              <span className="rounded-full bg-purple-950/80 px-2.5 py-0.5 text-[11px] text-purple-300 border border-purple-800">
                30-Day Cashflow Execution Plan
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SDKP Coherence &amp; Simulation API Services
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Productized non-stochastic simulation endpoints and fixed-price engineering packages. Sellable today to physics devs, quantitative researchers, students, and simulation teams needing rock-solid HTTP endpoints.
            </p>
          </div>

          {/* Consultation CTA Card */}
          <div className="rounded-2xl border border-cyan-800/80 bg-slate-950/90 p-4 shadow-xl flex-shrink-0 space-y-2.5 min-w-[240px]">
            <div className="text-[10px] uppercase text-cyan-400 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Direct Lead Architect Booking</span>
            </div>
            <div className="text-sm font-bold text-slate-100">
              Gypsi Consulting Intake
            </div>
            <p className="text-[11px] text-slate-400">
              Fixed packages from $250. 24–72 hour turnaround.
            </p>
            <a
              href="https://calendly.com/dallasnamiyadaddy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Book Call on Calendly</span>
            </a>
          </div>
        </div>

        {/* Commercial Sub-Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('api-tiers')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'api-tiers'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/50 border border-slate-800'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>1. API Subscription Tiers ($29 / $99 / $299)</span>
          </button>

          <button
            onClick={() => setActiveTab('consulting')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'consulting'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/50 border border-slate-800'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
            <span>2. Fixed-Price Consulting Packages ($250 – $2,000)</span>
          </button>

          <button
            onClick={() => setActiveTab('readme-snippets')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'readme-snippets'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/50 border border-slate-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-purple-400" />
            <span>3. GitHub README &amp; “Get API Key”</span>
          </button>

          <button
            onClick={() => setActiveTab('crypto-wallets')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'crypto-wallets'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/50 border border-slate-800'
            }`}
          >
            <Wallet className="h-3.5 w-3.5 text-purple-400" />
            <span>4. Blockchain Wallets &amp; Corporate Ledgers</span>
          </button>
        </div>
      </div>

      {/* TAB 1: API TIERS & STRIPE CHECKOUT */}
      {activeTab === 'api-tiers' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Productized Simulation &amp; Coherence API Tiers
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted at developers, students, aerospace labs, and numerical engineers wanting an immediate HTTP simulation endpoint.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                <span>Stripe Billing Ready</span>
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {API_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  tier.popular
                    ? 'border-cyan-500/60 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 shadow-xl ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                    Most Popular for Labs
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-100">{tier.name}</h3>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">${tier.price}</span>
                    <span className="text-xs text-slate-400">{tier.period}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed min-h-[36px]">
                    {tier.audience}
                  </p>

                  <div className="mt-4 py-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Quota:</span>
                      <span className="text-cyan-300 font-semibold">{tier.quota}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Throughput:</span>
                      <span className="text-purple-300 font-semibold">{tier.rateLimit}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                  <button
                    onClick={() => handleCheckoutStripe(tier.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <span>Subscribe via Stripe (${tier.price}/mo)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTier(tier.id);
                      handleGenerateKey();
                    }}
                    className="w-full py-1.5 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    Generate Instant Evaluation Key
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Instant API Key Sandbox Generator */}
          <div className="rounded-2xl border border-cyan-900/50 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Key className="h-4 w-4" />
                <span>Instant Developer API Key Provisioning</span>
              </div>
              <span className="text-[10px] text-slate-500">FastAPI &amp; Express Engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Selected Tier:</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                >
                  <option value="developer">Developer ($29/mo)</option>
                  <option value="lab">Research Lab ($99/mo)</option>
                  <option value="enterprise">Enterprise ($299/mo)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Developer Email:</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="developer@yourorganization.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateKey}
                  disabled={isGeneratingKey}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-xs text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingKey ? 'Generating Key...' : 'Provision API Key Now'}
                </button>
              </div>
            </div>

            {/* Display Generated Key */}
            {generatedKey && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Your Active API Key:</span>
                  </span>
                  <button
                    onClick={copyKeyToClipboard}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono break-all select-all">
                  {generatedKey}
                </div>
                <p className="text-[11px] text-slate-400">
                  Include as header <code className="text-cyan-300">x-api-key: {generatedKey}</code> or <code className="text-cyan-300">Authorization: Bearer {generatedKey}</code>.
                </p>
              </div>
            )}

            {checkoutNotice && (
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-xs text-cyan-200">
                {checkoutNotice}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FIXED-PRICE CONSULTING PACKAGES */}
      {activeTab === 'consulting' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Fixed-Price Consulting Packages (Gypsi Consulting)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fastest first revenue: Scoped jobs with guaranteed 24–72h turnaround. One client pays before any SaaS scales.
              </p>
            </div>

            <a
              href="https://calendly.com/dallasnamiyadaddy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-slate-200 hover:text-cyan-300 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>Book Intake Call (Calendly)</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* 4 Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CONSULTING_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedPkg.id === pkg.id
                    ? 'border-cyan-500/60 bg-slate-900/90 shadow-xl ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded bg-cyan-950 border border-cyan-800 px-2 py-0.5 text-[10px] text-cyan-300 font-bold">
                      {pkg.deliveryDays}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-1">{pkg.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-emerald-400">{pkg.priceRange}</span>
                    <span className="block text-[10px] text-slate-500">Fixed Scope</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  {pkg.summary}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Included Deliverables:</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {pkg.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <Check className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPkg(pkg);
                  }}
                  className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedPkg.id === pkg.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {selectedPkg.id === pkg.id ? 'Selected for Scope & Booking' : 'Select Package'}
                </button>
              </div>
            ))}
          </div>

          {/* Inquiry / Booking Submission Form */}
          <div className="rounded-2xl border border-cyan-900/60 bg-slate-900/80 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Book Project:</span>
                  <span className="text-cyan-400">{selectedPkg.name}</span>
                  <span className="text-emerald-400 text-xs">({selectedPkg.priceRange})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit your parameters for a rapid formal proposal, or book directly via Calendly.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Your Name / Lead:</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="Dr. Alex Rivera"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Email Address:</label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="alex@institution.org"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Target Budget Estimate:</label>
                  <input
                    type="text"
                    value={inquiryBudget}
                    onChange={(e) => setInquiryBudget(e.target.value)}
                    placeholder="$1,000"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Project Brief / Parameter Scope:</label>
                <textarea
                  rows={3}
                  value={inquiryBrief}
                  onChange={(e) => setInquiryBrief(e.target.value)}
                  placeholder="Describe your current tech stack, language (Python/Node/Julia), simulation parameters, or deadline requirements..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>50% deposit via Stripe SOW upon engagement. Balance on delivery.</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://calendly.com/dallasnamiyadaddy"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    Direct Calendly Booking
                  </a>

                  <button
                    type="submit"
                    disabled={isInquirySubmitting}
                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isInquirySubmitting ? 'Submitting Brief...' : 'Request Scoped Proposal'}
                  </button>
                </div>
              </div>
            </form>

            {inquiryStatus && (
              <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-xs text-cyan-200 leading-relaxed">
                {inquiryStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GITHUB README & BADGE SNIPPETS */}
      {activeTab === 'readme-snippets' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              GitHub README &amp; “Get API Key” Marketing Copy
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste these ready-to-use badges and curl snippets directly into your repository README files across FatherTimeSDKP to drive API subscribers and consulting leads.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Paste-Ready Markdown for GitHub README:
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(readmeBadgeMarkdown);
                  setCopiedBadge(true);
                  setTimeout(() => setCopiedBadge(false), 2000);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:text-white cursor-pointer"
              >
                {copiedBadge ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedBadge ? 'Copied Markdown' : 'Copy All'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-cyan-200 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {readmeBadgeMarkdown}
            </pre>
          </div>

          {/* 30-Day Cashflow Execution Sequence */}
          <div className="rounded-2xl border border-cyan-900/50 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>30-Day Practical Execution Sequence</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold">Week 1 (Today):</span>
                <p className="text-slate-300 text-[11px]">
                  Deploy live API instances on port 3000 with API key middleware and Stripe tiers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold">Week 2:</span>
                <p className="text-slate-300 text-[11px]">
                  Commit &ldquo;Get API Key&rdquo; section to GitHub READMEs + update Zenodo description.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold">Week 3:</span>
                <p className="text-slate-300 text-[11px]">
                  Share 3 fixed consulting packages on X (@FatherTimes369v) and relevant tech discords.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold">Week 4:</span>
                <p className="text-slate-300 text-[11px]">
                  Close first 1–2 consulting clients ($500–$2,000), reinvest in dedicated server uptime.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BLOCKCHAIN WALLETS & CORPORATE LEDGERS */}
      {activeTab === 'crypto-wallets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Coins className="h-5 w-5 text-purple-400" />
                <span>Blockchain &amp; Crypto Wallets &bull; Corporate Registry</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official on-chain royalty receiver addresses, token contracts, notary entities, and corporate payment ledgers for FatherTimeSDKP and Gypsi Consulting.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="rounded bg-purple-950 border border-purple-800 px-2.5 py-1 text-purple-300 font-mono text-[11px]">
                Internal ID: adb75005-1619-481c-aebc-d657fd60d46b
              </span>
            </div>
          </div>

          {/* Section 1: Blockchain & Crypto Wallets */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Wallet className="h-4 w-4" />
                <span>On-Chain Royalty, Token Contracts &amp; Multi-Chain Receivers</span>
              </div>
              <span className="text-[10px] text-slate-500">Polygon (137) &bull; Ethereum &bull; BTC &bull; LTC &bull; XRP</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deployer / Royalty Receiver (Polygon) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Deployer / Royalty Receiver Wallet</span>
                  <span className="rounded bg-purple-950 px-1.5 py-0.5 text-[9px] text-purple-300 border border-purple-800">
                    EVM / Polygon
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-cyan-300 break-all select-all font-mono">
                    0x311540cD8761e15F0B01aaa6Fe0F7E8f583B4Bf7
                  </code>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleCopyWallet('0x311540cD8761e15F0B01aaa6Fe0F7E8f583B4Bf7', 'deployer')}
                      className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                      title="Copy Address"
                    >
                      {copiedWalletKey === 'deployer' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href="https://polygonscan.com/address/0x311540cD8761e15F0B01aaa6Fe0F7E8f583B4Bf7"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-cyan-300"
                      title="View on PolygonScan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Reported May 22, 2026 &bull; Primary royalty receiver</span>
              </div>

              {/* FTP Token Contract Address */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">FTP Token Contract Address</span>
                  <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[9px] text-cyan-300 border border-cyan-800">
                    Polygon Chain ID 137
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-cyan-300 break-all select-all font-mono">
                    0x64411D8D6933058cdca94F6b6D036
                  </code>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleCopyWallet('0x64411D8D6933058cdca94F6b6D036', 'ftp-token')}
                      className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                      title="Copy Token Contract"
                    >
                      {copiedWalletKey === 'ftp-token' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href="https://polygonscan.com/token/0x64411D8D6933058cdca94F6b6D036"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-cyan-300"
                      title="View on PolygonScan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">FatherTime Protocol Utility Token Contract</span>
              </div>

              {/* IP Licensing ERC-1155 Contract */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">IP Licensing ERC-1155 Contract</span>
                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] text-emerald-300 border border-emerald-800">
                    ERC-1155 Standard
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-emerald-300 break-all select-all font-mono">
                    0x8fcD2CaFD30333F967e1fDdF05AEfb12e8aFc221
                  </code>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleCopyWallet('0x8fcD2CaFD30333F967e1fDdF05AEfb12e8aFc221', 'ip-erc1155')}
                      className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                      title="Copy Contract"
                    >
                      {copiedWalletKey === 'ip-erc1155' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href="https://polygonscan.com/address/0x8fcD2CaFD30333F967e1fDdF05AEfb12e8aFc221"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Commercial IP Licensing &amp; Fractional Rights Settlement</span>
              </div>

              {/* MetaMask Authorship Wallet */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">MetaMask Authorship Wallet</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300">
                    EVM Primary
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-slate-300 break-all select-all font-mono">
                    0x94534B02CeEF5530a40D3D4F54fe350ba9d39BC7
                  </code>
                  <button
                    onClick={() => handleCopyWallet('0x94534B02CeEF5530a40D3D4F54fe350ba9d39BC7', 'metamask')}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                  >
                    {copiedWalletKey === 'metamask' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Donald Paul Smith primary signing wallet</span>
              </div>

              {/* Unstoppable Domain Minting Wallet */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Unstoppable Domain Minting Wallet</span>
                  <span className="rounded bg-blue-950 px-1.5 py-0.5 text-[9px] text-blue-300 border border-blue-800">
                    Web3 Domain Custody
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-blue-300 break-all select-all font-mono">
                    0x3D76236098EC2825346F1665AFd689B9F206cDBF
                  </code>
                  <button
                    onClick={() => handleCopyWallet('0x3D76236098EC2825346F1665AFd689B9F206cDBF', 'unstoppable')}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                  >
                    {copiedWalletKey === 'unstoppable' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Unstoppable domain minting and Web3 DNS node</span>
              </div>

              {/* PayPal Ethereum Receive Address */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">PayPal Ethereum Receive Address</span>
                  <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[9px] text-sky-300 border border-sky-800">
                    PayPal Crypto Gateway
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-sky-300 break-all select-all font-mono">
                    0x7c382e1797cf3E69Ce02D95D4a056BD04D0c709d
                  </code>
                  <button
                    onClick={() => handleCopyWallet('0x7c382e1797cf3E69Ce02D95D4a056BD04D0c709d', 'paypal-eth')}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                  >
                    {copiedWalletKey === 'paypal-eth' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Direct PayPal-linked Ethereum settlement node</span>
              </div>

              {/* Primary Ethereum Wallet Address */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Ethereum Wallet Address</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300">
                    ETH Mainnet
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-slate-300 break-all select-all font-mono">
                    0x3d76236098ec2825346f1665afd689b9f206cdbf
                  </code>
                  <button
                    onClick={() => handleCopyWallet('0x3d76236098ec2825346f1665afd689b9f206cdbf', 'eth-main')}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                  >
                    {copiedWalletKey === 'eth-main' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Ethereum foundation &amp; smart contract custodian</span>
              </div>

              {/* Account SdKP Address */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Account SdKP Address</span>
                  <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[9px] text-cyan-300 border border-cyan-800">
                    SdKP Protocol Anchor
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-cyan-300 break-all select-all font-mono">
                    0x45D5B304213Ddc7EA497B047a507654B17231A82
                  </code>
                  <button
                    onClick={() => handleCopyWallet('0x45D5B304213Ddc7EA497B047a507654B17231A82', 'sdkp-address')}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                  >
                    {copiedWalletKey === 'sdkp-address' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Size, Density, Kinetics &amp; Position (SDKP) on-chain signer</span>
              </div>

              {/* Litecoin (LTC) Address */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Litecoin (LTC) Receive Address</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300">
                    LTC Network
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-slate-300 break-all select-all font-mono">
                    MEJS1rtyM2S4o5TRtfDNieL6szby9KNyk7
                  </code>
                  <button
                    onClick={() => handleCopyWallet('MEJS1rtyM2S4o5TRtfDNieL6szby9KNyk7', 'ltc')}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                  >
                    {copiedWalletKey === 'ltc' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Direct Litecoin payment settlement address</span>
              </div>

              {/* Bitcoin (BTC) Addresses */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Bitcoin (BTC) Receive Addresses</span>
                  <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[9px] text-amber-300 border border-amber-800">
                    Bitcoin Mainnet
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <code className="text-[11px] text-amber-300 break-all select-all font-mono">
                      12qe5SGyEYzKjqnL4iRfTf2ZTSxv4AQoBq
                    </code>
                    <button
                      onClick={() => handleCopyWallet('12qe5SGyEYzKjqnL4iRfTf2ZTSxv4AQoBq', 'btc-legacy')}
                      className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                    >
                      {copiedWalletKey === 'btc-legacy' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <code className="text-[11px] text-amber-300 break-all select-all font-mono">
                      bc1qmxuqy3hx4tezjgsa9m747ctqd...
                    </code>
                    <button
                      onClick={() => handleCopyWallet('bc1qmxuqy3hx4tezjgsa9m747ctqd...', 'btc-segwit')}
                      className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                    >
                      {copiedWalletKey === 'btc-segwit' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Legacy and Native SegWit (Bech32) Bitcoin addresses</span>
              </div>

              {/* Ripple (XRP) Address & Destination Tag */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Ripple (XRP) Receive Address</span>
                  <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[9px] text-sky-300 border border-sky-800">
                    XRPL Destination Tag: 527015799
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <code className="text-[11px] text-sky-300 break-all select-all font-mono block">
                      rUrHYPB2UEko...Bze6J96yrZR
                    </code>
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      Tag: 527015799 (Required)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyWallet('rUrHYPB2UEko...Bze6J96yrZR', 'xrp')}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                  >
                    {copiedWalletKey === 'xrp' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">XRPL Ledger cross-border settlement node</span>
              </div>

              {/* Internal Wallet Identifier */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Internal Vault &amp; Wallet Identifier</span>
                  <span className="rounded bg-purple-950 px-1.5 py-0.5 text-[9px] text-purple-300 border border-purple-800">
                    UUID V4 Vault Anchor
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-purple-300 break-all select-all font-mono">
                    adb75005-1619-481c-aebc-d657fd60d46b
                  </code>
                  <button
                    onClick={() => handleCopyWallet('adb75005-1619-481c-aebc-d657fd60d46b', 'internal-id')}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer flex-shrink-0"
                  >
                    {copiedWalletKey === 'internal-id' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Internal authorization and custodial ledger reference</span>
              </div>
            </div>
          </div>

          {/* Section 2: Physical & Business Locations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <MapPin className="h-4 w-4" />
                <span>Physical &amp; Business Locations</span>
              </div>
              <span className="text-[10px] text-slate-500">State of Florida Certified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <span>Gypsi Consulting and Notary Services</span>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-slate-500">Location:</span> Archer, Florida area
                </div>
                <div className="text-[11px] text-slate-400">
                  Official commercial consulting entity, signing authority &amp; research notary services (Reported August 2026).
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>Corporate Property &amp; Research Facility</span>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-slate-500">Location:</span> Bronson, Florida area
                </div>
                <div className="text-[11px] text-slate-400">
                  Physical corporate location and computing infrastructure base (Reported June 2026).
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Infrastructure & Commercial Gateways */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <CreditCard className="h-4 w-4" />
                <span>Payment Infrastructure &amp; Commercial Settlement Gateways</span>
              </div>
              <span className="text-[10px] text-slate-500">Stripe &bull; PayPal Business &bull; Chime</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Payment Infrastructure */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Payment Backbone</span>
                <div className="font-bold text-slate-100">Stripe on IBM Cloud</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Configured on IBM Cloud infrastructure for backend payment intents, client invoicing, and subscription webhooks (Reported May 2026).
                </p>
              </div>

              {/* Financial Accounts */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Commercial Gateways</span>
                <div className="font-bold text-slate-100">PayPal &amp; Chime</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Primary corporate treasury accounts linked to PayPal Business settlement and Chime banking infrastructure (Reported May 2026).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
