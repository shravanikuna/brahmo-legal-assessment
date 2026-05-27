// src/components/KnowledgePanel.tsx

import { useState } from 'react'

interface KnowledgeNode {
    title: string
    content: string
    relevance?: number
}

interface KnowledgePanelProps {
    constraints: KnowledgeNode[]
    antiPatterns: KnowledgeNode[]
    decisions: KnowledgeNode[]
    clientFacts: KnowledgeNode[]
    tokenUsed: number
    tokenTotal: number
}

// Helper to extract relevance from title (format: "- [100%] Title")
const extractRelevance = (title: string): number => {
    if (!title || typeof title !== 'string') return 85
    const match = title.match(/\[(\d+)%\]/)
    if (match) {
        return parseInt(match[1])
    }
    return 85
}

// Helper to clean title (remove relevance prefix and dash)
const cleanTitle = (title: string): string => {
    if (!title || typeof title !== 'string') return "Knowledge Node"
    // Remove pattern like "- [100%] " or "- [90%] "
    let cleaned = title.replace(/^-\s*\[\d+%\]\s*/, '')
    // Also handle if no dash
    cleaned = cleaned.replace(/^\[\d+%\]\s*/, '')
    return cleaned || "Knowledge Node"
}

// Parse node from string format or object
const parseNode = (node: any, index: number, type: string): { title: string; content: string; relevance: number } => {
    // If node is already an object with title and content
    if (node && typeof node === 'object') {
        if (node.title && node.content) {
            return {
                title: node.title,
                content: node.content,
                relevance: node.relevance || extractRelevance(node.title)
            }
        }
        // If it's a string-like object
        if (typeof node === 'string') {
            return {
                title: node,
                content: node,
                relevance: 85
            }
        }
    }

    // If node is a string
    if (typeof node === 'string') {
        return {
            title: node,
            content: node,
            relevance: extractRelevance(node)
        }
    }

    // Default fallback
    return {
        title: `${type} ${index + 1}`,
        content: "No content available",
        relevance: 85
    }
}

export function KnowledgePanel({
    constraints,
    antiPatterns,
    decisions,
    clientFacts,
    tokenUsed,
    tokenTotal
}: KnowledgePanelProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Parse all nodes safely
    const parsedConstraints = (constraints || []).map((node, i) => parseNode(node, i, "Constraint"))
    const parsedAntiPatterns = (antiPatterns || []).map((node, i) => parseNode(node, i, "Anti-Pattern"))
    const parsedDecisions = (decisions || []).map((node, i) => parseNode(node, i, "Decision"))
    const parsedClientFacts = (clientFacts || []).map((node, i) => parseNode(node, i, "Client Fact"))

    const sections = [
        { key: "constraints", label: "CONSTRAINTS", color: "#ef4444", nodes: parsedConstraints, priority: "Priority 1 — never truncated" },
        { key: "antiPatterns", label: "ANTI-PATTERNS", color: "#f59e0b", nodes: parsedAntiPatterns, priority: "Priority 2" },
        { key: "decisions", label: "FIRM DECISIONS", color: "#3cca70", nodes: parsedDecisions, priority: "Priority 3" },
        { key: "clientFacts", label: "CLIENT FACTS", color: "#06b6d4", nodes: parsedClientFacts, priority: "Priority 4 — truncated first" },
    ]

    // Calculate percentage correctly
    const percentage = tokenTotal > 0 ? (tokenUsed / tokenTotal) * 100 : 0
    const isWarning = percentage > 90

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🧠</span>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Knowledge Injection Panel</h3>
                        <p className="text-[11px] text-gray-500">What Level 3 knows that Levels 1 & 2 don't</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase">Token budget</div>
                        <div className="text-sm font-bold text-primary-600">{tokenUsed.toLocaleString()} / {tokenTotal.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Token Budget Bar - FIXED */}
            <div className="px-5 pt-3 pb-2 border-b border-gray-100">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${percentage}%`,
                            background: isWarning ? 'linear-gradient(90deg, #f59e0b, rgb(148, 163, 184))' : '#06b6d4'
                        }}
                    />
                </div>
                <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-gray-400">{percentage.toFixed(0)}% utilized</span>
                </div>
            </div>

            {/* Nodes List */}
            <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto">
                {sections.map((section) => {
                    if (section.nodes.length === 0) return null

                    return (
                        <div key={section.key}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-4 rounded-full" style={{ background: section.color }} />
                                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: section.color }}>
                                    {section.label}
                                </span>
                                <span className="text-[10px] text-gray-400">— {section.priority}</span>
                                <span className="text-[10px] text-gray-400 ml-auto">{section.nodes.length} nodes</span>
                            </div>

                            {section.nodes.map((node, idx) => {
                                const nodeId = `${section.key}-${idx}`
                                const isExpanded = expandedId === nodeId
                                const relevance = node.relevance || 85

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setExpandedId(isExpanded ? null : nodeId)}
                                        className={`mb-2 rounded-lg p-3 cursor-pointer transition-all border ${isExpanded ? 'border-opacity-40 shadow-sm' : 'border-gray-200'
                                            }`}
                                        style={{
                                            background: isExpanded ? `${section.color}08` : "#fafafa",
                                            borderColor: isExpanded ? section.color : "#e5e7eb"
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-800">{node.title}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${relevance}%`,
                                                            background: relevance >= 80 ? '#22c55e' : relevance >= 60 ? '#f59e0b' : '#ef4444'
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-mono text-gray-500 w-8">{relevance}%</span>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                                                {node.content}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="px-5 py-5 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 justify-between h-[55px]">
                <span> 📊 Total: {parsedConstraints.length + parsedAntiPatterns.length + parsedDecisions.length + parsedClientFacts.length} knowledge nodes</span>
                <span> ✅ Priority order: CONSTRAINT → ANTI-PATTERN → DECISION → CLIENT_FACT</span>
            </div>


        </div>
    )
}