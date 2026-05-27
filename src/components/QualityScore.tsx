interface ScoreData {
    total: number; grade: string; pct: number
    bars: Array<{ label: string; val: number; max: number }>
}
interface QualityScoreProps {
    level1Score: ScoreData; level2Score: ScoreData; level3Score: ScoreData
}

// Matches ThreeLevelComparison's getScoreBarColor exactly
const getScoreBarColor = (val: number, max: number) => {
    const pct = (val / max) * 100
    if (pct >= 80) return 'rgb(245, 158, 11)'   // amber — excellent
    if (pct >= 60) return 'rgb(6, 182, 212)'    // cyan — good
    return 'rgb(148, 163, 184)'                  // slate — needs work
}

const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return '#16a34a'
    if (grade === 'B+' || grade === 'B') return '#0891b2'
    if (grade === 'C+' || grade === 'C') return '#d97706'
    return '#dc2626'
}

export function QualityScore({ level1Score, level2Score, level3Score }: QualityScoreProps) {
    const scores = [
        { level: 1, label: "Level 1", sublabel: "Generic AI", score: level1Score, color: "#94a3b8", accent: "rgba(148,163,184,0.08)", borderColor: "#dde3ed" },
        { level: 2, label: "Level 2", sublabel: "Template + Sections", score: level2Score, color: "#06b6d4", accent: "rgba(6,182,212,0.07)", borderColor: "rgba(6,182,212,0.3)" },
        { level: 3, label: "Level 3", sublabel: "BRAHMO — Full Option C", score: level3Score, color: "#f59e0b", accent: "rgba(245,158,11,0.07)", borderColor: "rgba(245,158,11,0.3)" },
    ]

    return (
        <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: '#ffffff', border: '1px solid #dde3ed' }}>
            {/* Header */}
            <div className="px-5 py-3" style={{ borderBottom: '1px solid #eef1f7' }}>
                <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <div>
                        <h3 className="text-sm font-semibold" style={{ color: '#1e293b' }}>Quality Score Analysis</h3>
                        <p className="text-[11px]" style={{ color: '#94a3b8' }}>Objective comparison across three levels</p>
                    </div>
                </div>
            </div>

            {/* Score Cards */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {scores.map(s => (
                    <div
                        key={s.level}
                        className="rounded-lg border overflow-hidden transition-all hover:shadow-sm"
                        style={{ background: '#f4f7fc', borderColor: s.borderColor }}
                    >
                        {/* Card header accent — mirrors ThreeLevelComparison level header */}
                        <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ background: s.accent, borderColor: '#e8edf5' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</span>
                                <span className="text-[10px]" style={{ color: '#94a3b8' }}>· {s.sublabel}</span>
                            </div>
                            <div
                                className="text-sm font-bold px-2 py-0.5 rounded"
                                style={{ color: getGradeColor(s.score.grade), background: `${getGradeColor(s.score.grade)}15` }}
                            >
                                {s.score.grade}
                            </div>
                        </div>

                        <div className="p-4">
                            {/* Donut — uses level color, not score-based color */}
                            <div className="relative w-20 h-20 mx-auto mb-3">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="#e2e8f0" strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={s.color}
                                        strokeWidth="3"
                                        strokeDasharray={`${s.score.pct * 100} 100`}
                                        strokeLinecap="round"
                                    />
                                    <text x="18" y="20.5" textAnchor="middle" fontSize="6" fill="#475569" fontWeight="bold">
                                        {Math.round(s.score.pct * 100)}%
                                    </text>
                                </svg>
                            </div>

                            <div className="text-center mb-3">
                                <div className="text-lg font-bold" style={{ color: '#1e293b' }}>
                                    {s.score.total.toFixed(1)}<span className="text-xs" style={{ color: '#94a3b8' }}>/10</span>
                                </div>
                            </div>

                            {/* Bars — same amber/cyan/slate logic as ThreeLevelComparison */}
                            <div className="space-y-2">
                                {s.score.bars.map((bar, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-20 text-[10px]" style={{ color: '#64748b' }}>{bar.label}</div>
                                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${(bar.val / bar.max) * 100}%`, background: getScoreBarColor(bar.val, bar.max) }}
                                            />
                                        </div>
                                        <div className="w-8 text-right text-[10px] font-mono" style={{ color: '#64748b' }}>{bar.val}/{bar.max}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-2" style={{ borderTop: '1px solid #eef1f7', background: '#f7f9fc' }}>
                <div className="text-[10px] text-center" style={{ color: '#94a3b8' }}>
                    Scoring: Court Format (2) + Legal Accuracy (2) + Firm Knowledge (3) + Case Law (2) + Strategy (1) = 10
                </div>
            </div>
        </div>
    )
}