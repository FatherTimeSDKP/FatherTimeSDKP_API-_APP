# Security Specification: FatherTimeSDKP & Digital Crystal Protocol

## 1. Data Invariants
1. **Identity & Authorship:** Every `research_entries` and `dcp_seals` document must have `authorUid == request.auth.uid`. A user cannot forge another researcher's identity or impersonate Donald Paul Smith / FatherTime.
2. **Authenticated Write Operations:** Unauthenticated users cannot create, modify, or delete research records, seals, or user profiles.
3. **Immutability of Cryptographic Integrity:** Once a `dcp_seals` document is registered, its `sealHash`, `primeLock`, and `authorUid` are strictly immutable to prevent retrospective provenance forgery.
4. **Volumetric Boundaries:** All string fields must adhere strictly to length constraints (e.g., titles <= 200 chars, IDs <= 128 chars, content <= 10000 chars) to prevent Denial-of-Wallet attacks.
5. **Mod-9 Harmonic Invariant:** `mod9Harmonic` must fall strictly within integer range `[1, 9]` matching Dallas's Code.
6. **User Isolation:** In `/users/{userId}`, each user may only write their own profile document where `userId == request.auth.uid`. Admin roles cannot be self-elevated.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Unauthenticated Research Injection**
   `POST /research_entries/attack-1` without auth token. Expected: `PERMISSION_DENIED`.
2. **Payload 2: Identity Forgery (Author UID Spoofing)**
   `POST /research_entries/attack-2` with `authorUid: "another-user-uid"` while authenticated as `victim-uid`. Expected: `PERMISSION_DENIED`.
3. **Payload 3: Mod-9 Harmonic Range Violation**
   `POST /dcp_seals/attack-3` with `mod9Harmonic: 15` (violating mod-9 single digit invariant). Expected: `PERMISSION_DENIED`.
4. **Payload 4: Negative Mod-9 Harmonic**
   `POST /dcp_seals/attack-4` with `mod9Harmonic: 0` or `-3`. Expected: `PERMISSION_DENIED`.
5. **Payload 5: Volumetric Denial-of-Wallet (100KB Title Attack)**
   `POST /research_entries/attack-5` with `title` string length 100,000 characters. Expected: `PERMISSION_DENIED`.
6. **Payload 6: Ghost Field Injection (Shadow Update)**
   `POST /research_entries/attack-6` with undocumented field `__isAdmin: true`. Expected: `PERMISSION_DENIED`.
7. **Payload 7: Cross-User Profile Takeover**
   `PUT /users/victim-user-123` authenticated as `attacker-user-456`. Expected: `PERMISSION_DENIED`.
8. **Payload 8: Self-Privilege Escalation**
   `PUT /users/attacker-user-456` setting `role: "admin"` directly in payload. Expected: `PERMISSION_DENIED`.
9. **Payload 9: Retrospective DCP Seal Hash Tampering**
   `PATCH /dcp_seals/seal-1` attempting to alter `sealHash` or `primeLock`. Expected: `PERMISSION_DENIED`.
10. **Payload 10: ID Poisoning Attack**
   `POST /research_entries/attack%20$invalid%#` containing illegal path characters or oversized ID. Expected: `PERMISSION_DENIED`.
11. **Payload 11: Non-Numeric Prime Lock**
   `POST /dcp_seals/attack-11` where `primeLock: "not-a-number"`. Expected: `PERMISSION_DENIED`.
12. **Payload 12: Orphaned Research Deletion**
   `DELETE /research_entries/doc-1` by user who does not own `authorUid` and is not admin. Expected: `PERMISSION_DENIED`.
