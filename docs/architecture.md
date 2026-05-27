# BRAHMO Legal AI - Architecture Overview

## System Summary

A template engine with firm knowledge injection that makes generic AI produce firm-specific legal outputs. Supports Criminal and Corporate law for India using unified database tables.

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Groq LLM (Llama 3.3 70B)
- **Database**: Supabase (PostgreSQL)
- **External API**: Indian Kanoon (case law)

## Data Flow
User Query → Classify → Fetch Template → Inject Knowledge → Generate 3 Levels → Return JSON

text

## Three-Level Generation

| Level | Description | Sections Used |
|-------|-------------|---------------|
| **Level 1** | Generic AI, no template | IPC/CrPC (old law) |
| **Level 2** | Template only | BNS/BNSS (correct format) |
| **Level 3** | Template + Firm Knowledge + IK Cases | BNS/BNSS + Strategic Arguments |

## Database Schema (Unified Tables)

### `legal_templates`
One table for ALL practice areas (criminal, corporate, future family law)

### `knowledge_nodes`
CONSTRAINT, ANTI_PATTERN, DECISION, CLIENT_FACT nodes with priority ordering

### `section_mappings`
IPC→BNS, CrPC→BNSS, IEA→BSA conversions

## Knowledge Injection

Priority order (token budget: 3000):
1. CONSTRAINT (never truncated)
2. ANTI_PATTERN (never truncated)  
3. DECISION (truncated if needed)
4. CLIENT_FACT (truncated first)

## Indian Kanoon Integration

- Search API for case law
- Metadata API for citations
- Results injected via `{INJECTION_CASELAW}` marker

## Section Normalizer

Converts old sections to new:
- `Section 438 CrPC` → `Section 482 BNSS`
- `Section 420 IPC` → `Section 318 BNS`

## Scalability

Adding Family Law = INSERT new rows into existing tables. Zero code changes.

## Key Differentiator

Generic AI produces generic arguments. 
Level 3 produces firm-specific strategy (cooperation-first, Malhotra precedent, client facts).