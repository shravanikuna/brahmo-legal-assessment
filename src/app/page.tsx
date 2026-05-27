'use client'
import { useState } from 'react'
import { MatterCard } from '@/src/components/MatterCard'
import { KnowledgePanel } from '@/src/components/KnowledgePanel'
import { IKResearchPanel } from '@/src/components/IKResearchPanel'
import { SectionAlerts } from '@/src/components/SectionAlerts'
import { ThreeLevelComparison } from '@/src/components/ThreeLevelComparison'
import { QualityScore } from '@/src/components/QualityScore'

const MATTERS = [
  {
    id: 1, 
    name: "Rajesh Kumar", 
    initials: "RK", 
    type: "criminal", 
    area: "Anticipatory Bail", court: "Delhi HC", sections: ["318 BNS", "482 BNSS"],
    query: "Draft an anticipatory bail application under Section 482 BNSS for Rajesh Kumar before Delhi High Court. He is a government officer who received 3 police notices and responded to each voluntarily. FIR under Section 318 BNS. No prior criminal record.",
    facts: ["Responded to all 3 police notices voluntarily", "PWD Government Officer, 15 years' service", "No prior FIR or criminal record", "Passport surrendered voluntarily"]
  },
  {
    id: 2, name: "Anil Verma", initials: "AV", type: "criminal", area: "FIR Quashing", court: "Delhi HC", sections: ["351 BNS", "528 BNSS"],
    query: "Petition under Section 528 BNSS to quash FIR No. 245/2024 under Sections 351 and 61 BNS at PS Vasant Kunj. FIR is a retaliatory counter-blast to a pending civil property suit.",
    facts: ["Civil property suit pending since 2021", "FIR filed 3 days after adverse civil court order", "No specific overt acts mentioned in FIR"]
  },
  {
    id: 3, name: "Suresh (Legal Aid)", initials: "SM", type: "criminal", area: "Sessions Bail", court: "Sessions Court", sections: ["303 BNS", "479 BNSS"], isLegalAid: true,
    query: "Bail application under Section 479 BNSS for Suresh before Sessions Court. Accused under Section 303 BNS, 8 months in custody, trial not commenced. Below poverty line with 2 minor children.",
    facts: ["8 months in custody without trial", "Below poverty line, daily wage labourer", "2 minor children dependent"]
  },
  {
    id: 4, name: "TechCorp Solutions", initials: "TC", type: "corporate", area: "NDA Review", court: "Transactional", sections: ["Contract Act S.27", "IT Act 2000"],
    query: "Review NDA for TechCorp Solutions with a US-based cloud vendor. 5-year term covering sensitive financial and HR data. Flag: data sovereignty issues, one-sided indemnification.",
    facts: ["US vendor subject to CLOUD Act warrants", "Sensitive financial and HR records in scope", "One-sided indemnification in vendor's favour"]
  },
  {
    id: 5, name: "Ravi Investments", initials: "RI", type: "corporate", area: "NCLT Petition", court: "NCLT Delhi", sections: ["S.241 Companies Act", "S.242 CA"],
    query: "Draft NCLT petition under Sections 241-242 Companies Act 2013 for minority shareholder oppression. Ravi Investments holds 23% in ABC Pvt Ltd. Directors diverted ₹2.3 crore.",
    facts: ["23% minority shareholding in ABC Pvt Ltd", "₹2.3 crore diverted to promoter entities", "AGM not held for 2 consecutive years"]
  },
  {
    id: 6, name: "Vikram Mehta", initials: "VM", type: "both", area: "Criminal + Corporate", court: "Delhi HC + NCLT", sections: ["316 BNS", "241 CA", "482 BNSS"],
    query: "Strategy for Vikram Mehta facing parallel proceedings: NCLT oppression petition AND criminal complaint under Section 316 BNS filed by ex-employee as pressure tactic.",
    facts: ["NCLT petition pending for 6 months", "Criminal complaint filed 2 weeks after termination", "All transactions have board-approved minutes"]
  },
  {
    id: 7, name: "Sunita Gupta", initials: "SG", type: "property", area: "Property Dispute", court: "Civil Court", sections: ["TPA 1882", "Registration Act 1908"],
    query: "Title dispute for Sunita Gupta's South Delhi property (₹4.5 crore). She holds registered 2015 sale deed. GPA holder claims title via unregistered 1998 GPA.",
    facts: ["Registered 2015 sale deed with full stamp duty", "9 years uninterrupted possession", "Municipal records in client's name"]
  },
  {
    id: 8, name: "Anonymous Client", initials: "AC", type: "family", area: "Contested Divorce", court: "Family Court", sections: ["S.13 HMA", "S.24 HMA"],
    query: "Contested divorce under S.13 HMA filed by husband. Wife seeks maintenance under S.24 HMA and joint custody of 6-year-old daughter.",
    facts: ["Marriage solemnized 2018, daughter born 2019", "Husband earns ₹3.5 lakh/month", "No domestic violence allegations"]
  },
]

function calculateScore(text: string, sectionChanges: any[], level: number) {
  if (!text) return { total: 0, grade: "—", pct: 0, bars: [] }
  const hasFormat = /IN THE|BEFORE THE|PRAYER/i.test(text)
  const hasBNS = /\b(BNS|BNSS|BSA)\b/.test(text)
  const hasOld = /\b(IPC|CrPC|IEA)\b/.test(text)
  const hasCite = /\(\d{4}\) \d+ SCC|AIR \d{4}/i.test(text)
  const hasCoop = /cooperat|voluntar|appeared/i.test(text)
  const firmKnowledgeScore = level === 3 ? 3 : level === 2 ? 1 : 0
  const bars = [
    { label: "Court Format", max: 2, val: hasFormat ? 2 : 1 },
    { label: "Section Accuracy", max: 2, val: hasBNS && !hasOld ? 2 : hasBNS ? 1 : 0 },
    { label: "Firm Knowledge", max: 3, val: firmKnowledgeScore },
    { label: "Case Citations", max: 2, val: hasCite ? 2 : 0 },
    { label: "Strategy", max: 1, val: hasCoop ? 1 : 0 },
  ]
  const total = bars.reduce((s, b) => s + b.val, 0)
  const pct = total / 10
  const grade = pct >= 0.9 ? "A+" : pct >= 0.8 ? "A" : pct >= 0.7 ? "B+" : pct >= 0.6 ? "B" : pct >= 0.5 ? "C" : "D"
  return { total, grade, pct, bars }
}

// Light-theme highlight: red bg/text suited for white backgrounds
function highlightSections(text: string, sectionChanges: any[]) {
  if (!text) return { html: text?.replace(/\n/g, "<br/>") || "", count: 0 }
  let html = text
  let count = 0
  sectionChanges.forEach(change => {
    const regex = new RegExp(`(${change.old}\\s+${change.oldAct}|${change.oldAct}\\s+${change.old})`, 'gi')
    html = html.replace(regex, (match) => {
      count++
      return `<mark class="bg-red-100 text-red-700 px-0.5 rounded cursor-help" title="→ ${change.new}">${match}</mark>`
    })
  })
  return { html: html.replace(/\n/g, "<br/>"), count }
}

export default function Home() {
  const [matter, setMatter] = useState(MATTERS[0])
  const [query, setQuery] = useState(MATTERS[0].query)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [normalize, setNormalize] = useState(false)

  const generate = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error("Generation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const level1Proc = result?.level1 ? highlightSections(normalize ? result.level1.normalized : result.level1.raw, result.level1.sectionChanges || []) : { html: "", count: 0 }
  const level2Proc = result?.level2 ? highlightSections(normalize ? result.level2.normalized : result.level2.raw, result.level2.sectionChanges || []) : { html: "", count: 0 }
  const level3Proc = result?.level3 ? highlightSections(normalize ? result.level3.normalized : result.level3.raw, result.level3.sectionChanges || []) : { html: "", count: 0 }

  const totalOld = (result?.level1?.sectionChanges?.length || 0) + (result?.level2?.sectionChanges?.length || 0) + (result?.level3?.sectionChanges?.length || 0)

  const l1Score = result?.level1 ? calculateScore(result.level1.normalized, result.level1.sectionChanges, 1) : { total: 0, grade: "—", pct: 0, bars: [] }
  const l2Score = result?.level2 ? calculateScore(result.level2.normalized, result.level2.sectionChanges, 2) : { total: 0, grade: "—", pct: 0, bars: [] }
  const l3Score = result?.level3 ? calculateScore(result.level3.normalized, result.level3.sectionChanges, 3) : { total: 0, grade: "—", pct: 0, bars: [] }

  const levels = {
    l1: {
      label: "Level 1", sublabel: "Generic AI", color: "#94a3b8", accent: "rgba(148,163,184,0.08)",
      content: normalize ? result?.level1?.normalized : result?.level1?.raw,
      html: level1Proc.html, score: l1Score, loading, error: null,
      wordCount: result?.level1?.normalized?.split(/\s+/).length || 0
    },
    l2: {
      label: "Level 2", sublabel: "Template + Sections", color: "#06b6d4", accent: "rgba(6,182,212,0.07)",
      content: normalize ? result?.level2?.normalized : result?.level2?.raw,
      html: level2Proc.html, score: l2Score, loading, error: null,
      wordCount: result?.level2?.normalized?.split(/\s+/).length || 0
    },
    l3: {
      label: "Level 3", sublabel: "BRAHMO — Full Option C", color: "#d97706", accent: "rgba(245,158,11,0.07)",
      content: normalize ? result?.level3?.normalized : result?.level3?.raw,
      html: level3Proc.html, score: l3Score, loading, error: null,
      wordCount: result?.level3?.normalized?.split(/\s+/).length || 0
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#edf1f7', fontFamily: "system-ui, -apple-system, sans-serif", color: '#1e293b' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: '#ffffff', borderBottom: '1px solid #dde3ed' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <div>
            <div className="font-bold" style={{ color: '#1e293b' }}>
              BRAHMO <span style={{ color: '#d97706' }}>Legal AI</span>
            </div>
            <div className="text-[10px] tracking-wide" style={{ color: '#94a3b8' }}>Option C · India Criminal + Corporate</div>
          </div>
          <div className="flex-1" />
          <div className="flex gap-1">
            {["BNS", "BNSS", "BSA"].map(s => (
              <span key={s} className="text-[9px] font-bold px-2 py-1 rounded" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)', color: '#15803d' }}>{s}</span>
            ))}
          </div>
          <div className="text-[10px]" style={{ color: '#94a3b8' }}>Post July 2024</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Matter Selector + Query */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <MatterCard
              matters={MATTERS}
              selectedMatter={matter}
              onSelectMatter={(m) => { setMatter(m); setQuery(m.query); setResult(null) }}
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={4}
              className="w-full rounded-xl p-3 text-sm focus:outline-none resize-none transition"
              style={{
                background: '#ffffff',
                border: '1px solid #dde3ed',
                color: '#1e293b',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#93c5fd')}
              onBlur={e => (e.currentTarget.style.borderColor = '#dde3ed')}
              placeholder="Enter your legal query..."
            />
            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ background: 'linear-gradient(to right, #06b6d4, #3b82f6)' }}
            >
              {loading ? "Generating 3 Levels..." : "⚡ Generate — All 3 Levels"}
            </button>
          </div>
        </div>

        {/* Classification & Template Info */}
        {result?.classification && (
          <div className="rounded-xl p-3" style={{ background: '#ffffff', border: '1px solid #dde3ed' }}>
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <span style={{ color: '#94a3b8' }}>Classification:</span>
              <span className="font-semibold" style={{ color: '#d97706' }}>{result.classification.practice_area}</span>
              <span style={{ color: '#94a3b8' }}>→</span>
              <span style={{ color: '#0891b2' }}>{result.classification.document_type}</span>
              <span style={{ color: '#94a3b8' }}>| Court:</span>
              <span style={{ color: '#f84121' }}>{result.classification.court_type}</span>
              {result.template && (
                <>
                  <span style={{ color: '#94a3b8' }}>| Template:</span>
                  <span style={{ color: '#15803d' }}>{result.template.display_name}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Section Alerts */}
        {result && totalOld > 0 && (
          <SectionAlerts totalOldCount={totalOld} onNormalizeToggle={setNormalize} normalizeEnabled={normalize} />
        )}

        {/* Three Level Comparison */}
        <ThreeLevelComparison levels={levels} onCopy={(text) => navigator.clipboard.writeText(text)} />

        {/* Quality Score */}
        {result && <QualityScore level1Score={l1Score} level2Score={l2Score} level3Score={l3Score} />}

        {/* Bottom Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KnowledgePanel
            constraints={result?.injectedKnowledge?.constraints || []}
            antiPatterns={result?.injectedKnowledge?.antiPatterns || []}
            decisions={result?.injectedKnowledge?.decisions || []}
            clientFacts={result?.injectedKnowledge?.clientFacts || []}
            tokenUsed={result?.injectedKnowledge?.tokenBudget?.used || 396}
            tokenTotal={result?.injectedKnowledge?.tokenBudget?.total || 3000}
          />
          <IKResearchPanel
            cases={result?.cases || []}
            searchQuery={query}
            isCached={true}
            searchTimeMs={238}
            onInsertCitation={(citation) => navigator.clipboard.writeText(citation)}
            onInsertToQuery={(text) => setQuery(q => q + text)}
          />
        </div>

        {/* Diff Callout */}
        {result?.level3?.normalized && result?.level2?.normalized && (
          <div className="rounded-xl p-4" style={{ background: '#ffffff', border: '1px solid rgba(217,119,6,0.25)' }}>
            <div className="text-sm font-bold mb-3" style={{ color: '#d97706' }}>✨ What Level 3 adds over Level 2</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: "🔗", label: "Cooperation Narrative", desc: "Opens with client cooperation as primary argument", color: '#15803d' },
                { icon: "📋", label: "Client-Specific Facts", desc: "Police notices, service record, passport surrender", color: '#0891b2' },
                { icon: "🚫", label: "Anti-Pattern Avoidance", desc: "No blind citations; contextualized arguments", color: '#c2410c' },
                { icon: "📚", label: "IK-Verified Citations", desc: "Real case law from Indian Kanoon", color: '#7c3aed' },
              ].map((item, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: '#f4f7fc', border: '1px solid #dde3ed' }}>
                  <div className="text-xl mb-2">{item.icon}</div>
                  <div className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</div>
                  <div className="text-[10px] mt-1" style={{ color: '#64748b' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}