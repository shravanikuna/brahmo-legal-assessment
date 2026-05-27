import { useState, useRef, useEffect } from 'react'

interface LevelData {
    label: string
    sublabel: string
    color: string
    accent: string
    content: string
    html: string
    score: { total: number; grade: string; pct: number; bars: Array<{ label: string; val: number; max: number }> }
    loading: boolean
    error?: string | null
    wordCount: number
}

interface ThreeLevelComparisonProps {
    levels: {
        l1: LevelData
        l2: LevelData
        l3: LevelData
    }
    onCopy?: (text: string) => void
}

function LoadingSkeleton() {
    return (
        <div className="space-y-2">
            {[90, 70, 85, 60, 75, 50, 80].map((w, i) => (
                <div key={i} className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
            ))}
        </div>
    )
}

// Score bar colors based on value
const getScoreBarColor = (val: number, max: number) => {
    const percentage = (val / max) * 100
    if (percentage >= 80) return 'rgb(245, 158, 11)'  // Green - excellent
    if (percentage >= 60) return 'rgb(6, 182, 212)'  // Amber - good
    return 'rgb(148, 163, 184)'  // Red - needs improvement
}

export function ThreeLevelComparison({ levels, onCopy }: ThreeLevelComparisonProps) {
    const [expandedLevel, setExpandedLevel] = useState<string | null>(null)

    const renderLevel = (level: LevelData, key: string) => {
        const isExpanded = expandedLevel === key

        return (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100" style={{ background: level.accent }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: level.color }} />
                            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: level.color }}>
                                {level.label}
                            </span>
                            <span className="text-[10px] text-gray-400">· {level.sublabel}</span>
                        </div>
                        <button
                            onClick={() => setExpandedLevel(isExpanded ? null : key)}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    </div>

                    {level.content && !level.loading && (
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${level.score.pct * 100}%`, background: level.color }}
                                />
                            </div>
                            <span className="text-xs font-bold" style={{ color: level.color }}>{level.score.grade}</span>
                            <span className="text-[10px] text-gray-400">{level.score.total}/10</span>
                        </div>
                    )}
                </div>

                {/* Content - with scrollbar */}
                <div
                    className={`flex-1 p-4 transition-all duration-300 ${isExpanded ? 'max-h-[600px]' : 'max-h-[400px]'}`}
                >
                    {level.loading ? (
                        <LoadingSkeleton />
                    ) : level.error ? (
                        <div className="text-red-500 text-xs bg-red-50 p-3 rounded-lg">⚠️ {level.error}</div>
                    ) : level.content ? (
                        <div
                            className="text-sm text-gray-600 leading-relaxed font-serif legal-document overflow-y-auto pr-2 custom-scrollbar"
                            style={{ maxHeight: isExpanded ? '520px' : '320px' }}
                            dangerouslySetInnerHTML={{ __html: level.html }}
                        />
                    ) : (
                        <div className="text-gray-400 text-sm text-center py-8 italic">
                            Output will appear here after generation.
                        </div>
                    )}
                </div>

                {/* Score Breakdown */}
                {level.content && !level.loading && level.score.bars && (
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 space-y-1.5">
                        {level.score.bars.map((bar, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px]">
                                <div className="w-20 text-gray-500 font-medium">{bar.label}</div>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(bar.val / bar.max) * 100}%`,
                                            background: getScoreBarColor(bar.val, bar.max)
                                        }}
                                    />
                                </div>
                                <div className="w-8 text-right font-mono text-gray-500">{bar.val}/{bar.max}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Actions */}
                {level.content && !level.loading && (
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                        <button
                            onClick={() => onCopy?.(level.content)}
                            className="text-xs text-gray-500 hover:text-primary-600 transition flex items-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy
                        </button>
                        <span className="text-[10px] text-gray-400">{level.wordCount} words</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {renderLevel(levels.l1, 'l1')}
            {renderLevel(levels.l2, 'l2')}
            {renderLevel(levels.l3, 'l3')}
        </div>
    )
}