interface DiffItem {
    icon: string
    label: string
    color: string
    description: string
}

interface DiffCalloutProps {
    items: DiffItem[]
}

export function DiffCallout({ items }: DiffCalloutProps) {
    return (
        <div className="bg-[#131f35] border border-yellow-500/20 rounded-xl p-4">
            <div className="text-sm font-bold text-yellow-500 mb-3">✨ What Level 3 adds over Level 2</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {items.map((item, i) => (
                    <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg p-3">
                        <div className="text-xl mb-2">{item.icon}</div>
                        <div className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</div>
                        <div className="text-[10px] text-gray-500 mt-1 leading-relaxed">{item.description}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}