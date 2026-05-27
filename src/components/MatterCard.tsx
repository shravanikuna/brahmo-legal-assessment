import { useState } from 'react'

export interface Matter {
    id: number; name: string; initials: string
    type: 'criminal' | 'corporate' | 'both' | 'property' | 'family'
    area: string; court: string; sections: string[]
    query: string; facts: string[]; isLegalAid?: boolean
}
interface MatterCardProps {
    matters: Matter[]; selectedMatter: Matter; onSelectMatter: (matter: Matter) => void
}

const TYPE_STYLES = {
    criminal: { bg: "rgba(220,38,38,0.08)", border: "#fca5a5", text: "#dc2626", label: "Criminal" },
    corporate: { bg: "rgba(6,182,212,0.08)", border: "#a5f3fc", text: "#0891b2", label: "Corporate" },
    both: { bg: "rgba(139,92,246,0.08)", border: "#ddd6fe", text: "#7c3aed", label: "Crim+Corp" },
    property: { bg: "rgba(22,163,74,0.08)", border: "#bbf7d0", text: "#15803d", label: "Property" },
    family: { bg: "rgba(217,70,239,0.08)", border: "#f5d0fe", text: "#a21caf", label: "Family" },
}

export function MatterCard({ matters, selectedMatter, onSelectMatter }: MatterCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredMatters = searchTerm
        ? matters.filter(m =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.area.toLowerCase().includes(searchTerm.toLowerCase()))
        : matters

    const style = TYPE_STYLES[selectedMatter.type]

    return (
        <div className="relative">
            <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                    Active Matter
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center gap-3 rounded-xl p-3 transition-all"
                    style={{ background: '#ffffff', border: '1px solid #dde3ed' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#bfcfea')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#dde3ed')}
                >
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
                    >
                        {selectedMatter.initials}
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                            {selectedMatter.name}
                            {selectedMatter.isLegalAid && <span className="text-xs ml-1" style={{ color: '#d97706' }}>⚖ Aid</span>}
                        </div>
                        <div className="text-[11px]" style={{ color: '#64748b' }}>{selectedMatter.area} · {selectedMatter.court}</div>
                    </div>
                    <span
                        className="text-[9px] font-bold px-2 py-1 rounded flex-shrink-0"
                        style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                    >
                        {style.label}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>{isOpen ? "▲" : "▼"}</span>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div
                        className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl shadow-lg overflow-hidden"
                        style={{ background: '#ffffff', border: '1px solid #dde3ed' }}
                    >
                        <div className="p-2" style={{ borderBottom: '1px solid #eef1f7' }}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search matters..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg px-3 py-1.5 text-sm outline-none transition"
                                style={{
                                    background: '#f4f7fc',
                                    border: '1px solid #dde3ed',
                                    color: '#1e293b',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#93c5fd')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#dde3ed')}
                            />
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {filteredMatters.map((m) => {
                                const ms = TYPE_STYLES[m.type]
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => { onSelectMatter(m); setIsOpen(false); setSearchTerm("") }}
                                        className="w-full flex items-center gap-3 p-3 transition-all text-left"
                                        style={{ borderBottom: '1px solid #f0f4f8' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f4f7fc')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                            style={{ background: ms.bg, border: `1px solid ${ms.border}`, color: ms.text }}
                                        >
                                            {m.initials}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold" style={{ color: '#1e293b' }}>{m.name}</div>
                                            <div className="text-[11px]" style={{ color: '#64748b' }}>{m.area} · {m.court}</div>
                                        </div>
                                        <span
                                            className="text-[9px] font-bold px-2 py-0.5 rounded"
                                            style={{ background: ms.bg, color: ms.text, border: `1px solid ${ms.border}` }}
                                        >
                                            {ms.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Client Facts */}
            <div className="mt-3 rounded-xl p-3" style={{ background: '#f4f7fc', border: '1px solid #dde3ed' }}>
                <div className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>
                    Client Facts
                </div>
                <div className="space-y-1.5">
                    {selectedMatter.facts.map((fact, i) => (
                        <div key={i} className="flex gap-2 text-xs" style={{ color: '#475569' }}>
                            <span className="mt-0.5" style={{ color: '#15803d' }}>•</span>
                            <span>{fact}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}