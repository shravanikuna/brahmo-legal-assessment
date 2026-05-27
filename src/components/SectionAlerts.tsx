interface SectionAlertsProps {
    totalOldCount: number
    onNormalizeToggle: (normalize: boolean) => void
    normalizeEnabled: boolean
}

export function SectionAlerts({ totalOldCount, onNormalizeToggle, normalizeEnabled }: SectionAlertsProps) {
    if (totalOldCount === 0) return null
    return (
        <div
            className="rounded-xl p-3 flex items-center gap-3 shadow-sm"
            style={{ background: '#ffffff', border: '1px solid rgba(239,68,68,0.25)' }}
        >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.08)' }}>
                <span className="text-lg">⚠️</span>
            </div>
            <div className="flex-1">
                <span className="font-semibold text-sm" style={{ color: '#dc2626' }}>
                    {totalOldCount} outdated law reference{totalOldCount !== 1 ? 's' : ''} detected
                </span>
                <span className="text-xs ml-2" style={{ color: '#94a3b8' }}>
                    IPC/CrPC/IEA found in output — obsolete since 1 July 2024
                </span>
            </div>
            <button
                onClick={() => onNormalizeToggle(!normalizeEnabled)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex-shrink-0"
                style={normalizeEnabled
                    ? { background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.4)', color: '#15803d' }
                    : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#dc2626' }
                }
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
                {normalizeEnabled ? '✓ Showing Normalized' : 'Normalize Sections'}
            </button>
        </div>
    )
}