interface LevelContent {
  title: string
  content: string
  sectionChanges: Array<{ old: string; new: string }>
  score: { total: number; grade: string; percentage: number }
}

interface ThreeLevelPanelProps {
  levels: {
    l1: LevelContent
    l2: LevelContent
    l3: LevelContent
  } | null
  isLoading: boolean
}

function highlightSections(text: string, changes: Array<{ old: string; new: string }>) {
  if (!text) return text
  let html = text.replace(/\n/g, '<br/>')
  
  changes.forEach(change => {
    const regex = new RegExp(`(${change.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    html = html.replace(regex, `<span class="inline-block px-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">${change.old}</span>`)
  })
  
  return html
}

function LevelCard({ level, title, color }: { level: LevelContent; title: string; color: string }) {
  const scoreColor = level.score.percentage >= 80 ? 'text-green-600 bg-green-50' : 
                     level.score.percentage >= 60 ? 'text-amber-600 bg-amber-50' : 
                     'text-red-600 bg-red-50'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className={`px-4 py-3 border-b border-gray-100 bg-${color}-50/30`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Score: {level.score.total}/10</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${scoreColor}`}>
            {level.score.grade}
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 min-h-[320px] max-h-[400px] overflow-y-auto">
        {level.content ? (
          <div 
            className="legal-document text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightSections(level.content, level.sectionChanges) }}
          />
        ) : (
          <div className="text-sm text-gray-400 italic text-center py-8">
            Not yet generated
          </div>
        )}
      </div>
      
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
        <span>{level.content?.split(/\s+/).length || 0} words</span>
        {level.content && (
          <button 
            onClick={() => navigator.clipboard.writeText(level.content)}
            className="text-primary-600 hover:text-primary-700"
          >
            Copy
          </button>
        )}
      </div>
    </div>
  )
}

export function ThreeLevelPanel({ levels, isLoading }: ThreeLevelPanelProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!levels) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Enter a query and click generate to see the three-level comparison.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <LevelCard level={levels.l1} title="Level 1 · Generic AI" color="gray" />
      <LevelCard level={levels.l2} title="Level 2 · Template Only" color="blue" />
      <LevelCard level={levels.l3} title="Level 3 · Full Option C" color="gold" />
    </div>
  )
}