export type SdkpCategory =
  | 'SDKP-Core'
  | 'SD-N-EOS-QCC'
  | 'Dallas-Code'
  | 'Kapnack-Solver'
  | 'Digital-Crystal'
  | 'LLAL-Loop'
  | 'Falsification-Data';

export interface ResearchEntry {
  id: string;
  title: string;
  category: SdkpCategory;
  summary: string;
  content: string;
  equations: string;
  dataPoints: string;
  authorUid: string;
  authorEmail: string;
  gitRepo?: string;
  zenodoDoi?: string;
  osfId?: string;
  xPostUrl?: string;
  dcpSealHash?: string;
  primeLock?: number;
  mod9Harmonic?: number;
  decoherenceScore?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface DcpSeal {
  id: string;
  subject: string;
  sealHash: string;
  primeLock: number;
  mod9Harmonic: number;
  authorUid: string;
  authorEmail: string;
  zenodoDoi?: string;
  osfId?: string;
  xPostId?: string;
  gitCommitHash?: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  displayName?: string;
  email: string;
  role?: string;
  githubUser?: string;
  zenodoAuthorId?: string;
  osfUserId?: string;
  xHandle?: string;
  zeroCrossingOffset?: number;
  updatedAt: string;
}

export interface FalsificationCase {
  id: string;
  phenomenon: string;
  targetObject: string;
  standardPhysicsPrediction: string;
  sdkpPrediction: string;
  observedData: string;
  deltaDeviation: string;
  verdict: 'CONFIRMED' | 'PRECISE_MATCH' | 'UNDER_REVIEW' | 'ANOMALY_RESOLVED';
  empiricalTimestamp: string;
  provenanceSource: string;
  equationsUsed: string;
}

export interface MetatronNode {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  harmonicCharge: number;
  layer: 'Origin' | 'FCC-Equatorial' | 'FCC-Octahedral';
}

export interface GateCheckReport {
  gateNumber: number;
  title: string;
  passed: boolean;
  score: string;
  details: string;
  ruleCitation: string;
}
