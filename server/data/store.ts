import { ResearchEntry, FalsificationCase } from '../../src/types/research';
import { INITIAL_RESEARCH_ENTRIES, INITIAL_FALSIFICATION_CASES } from '../../src/lib/seedData';
import crypto from 'node:crypto';

// In-memory persistent store initialized with the full lossless seed corpus
export class ResearchStore {
  private static instance: ResearchStore;
  private entries: Map<string, ResearchEntry> = new Map();
  private falsificationCases: Map<string, FalsificationCase> = new Map();
  private dcpAuditLogs: Array<{
    id: string;
    subject: string;
    sealHash: string;
    primeLock: number;
    mod9Harmonic: number;
    authorEmail: string;
    timestamp: string;
    decoherenceScore: number;
    zenodoDoi?: string;
  }> = [];

  private constructor() {
    INITIAL_RESEARCH_ENTRIES.forEach((entry) => {
      this.entries.set(entry.id, { ...entry });
      if (entry.dcpSealHash) {
        this.dcpAuditLogs.push({
          id: `audit-${entry.id}`,
          subject: entry.title,
          sealHash: entry.dcpSealHash,
          primeLock: entry.primeLock || 104729,
          mod9Harmonic: entry.mod9Harmonic || 5,
          authorEmail: entry.authorEmail,
          timestamp: entry.createdAt,
          decoherenceScore: entry.decoherenceScore || 1.000000,
          zenodoDoi: entry.zenodoDoi,
        });
      }
    });

    INITIAL_FALSIFICATION_CASES.forEach((c) => {
      this.falsificationCases.set(c.id, { ...c });
    });
  }

  public static getInstance(): ResearchStore {
    if (!ResearchStore.instance) {
      ResearchStore.instance = new ResearchStore();
    }
    return ResearchStore.instance;
  }

  public getAllEntries(): ResearchEntry[] {
    return Array.from(this.entries.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getEntryById(id: string): ResearchEntry | undefined {
    return this.entries.get(id);
  }

  public createEntry(entry: ResearchEntry): ResearchEntry {
    this.entries.set(entry.id, entry);
    if (entry.dcpSealHash) {
      this.dcpAuditLogs.unshift({
        id: `audit-${entry.id}`,
        subject: entry.title,
        sealHash: entry.dcpSealHash,
        primeLock: entry.primeLock || 104729,
        mod9Harmonic: entry.mod9Harmonic || 5,
        authorEmail: entry.authorEmail,
        timestamp: entry.createdAt,
        decoherenceScore: entry.decoherenceScore || 1.000000,
        zenodoDoi: entry.zenodoDoi,
      });
    }
    return entry;
  }

  public updateEntry(id: string, updates: Partial<ResearchEntry>): ResearchEntry | null {
    const existing = this.entries.get(id);
    if (!existing) return null;
    const updated: ResearchEntry = {
      ...existing,
      ...updates,
      id, // Immutable ID
      createdAt: existing.createdAt, // Lossless timestamp preservation
      updatedAt: new Date().toISOString(),
    };
    this.entries.set(id, updated);
    return updated;
  }

  public deleteEntry(id: string): boolean {
    return this.entries.delete(id);
  }

  public getAllFalsificationCases(): FalsificationCase[] {
    return Array.from(this.falsificationCases.values());
  }

  public getFalsificationCaseById(id: string): FalsificationCase | undefined {
    return this.falsificationCases.get(id);
  }

  public getDcpAuditLogs(limitCount = 20) {
    return this.dcpAuditLogs.slice(0, limitCount);
  }

  public recordDcpSeal(seal: {
    id: string;
    subject: string;
    sealHash: string;
    primeLock: number;
    mod9Harmonic: number;
    authorEmail: string;
    timestamp: string;
    decoherenceScore: number;
    zenodoDoi?: string;
  }) {
    this.dcpAuditLogs.unshift(seal);
  }
}
