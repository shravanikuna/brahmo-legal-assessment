// lib/knowledge-injector.ts

import { supabase } from "./supabase"
import { getTopCasesWithMetadata } from "./indian-law"

interface TemplateData {
    template_id: string
    display_name: string
    system_prompt: string
    auto_research_query: string
}

const TOKEN_BUDGET = 3000
const PRIORITY_ORDER = ['CONSTRAINT', 'ANTI_PATTERN', 'DECISION', 'CLIENT_FACT']

// Rough token estimator (1 token ≈ 4 chars for English)
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
}

export async function injectKnowledge(
    practiceArea: string,
    userQuery: string,
    template: TemplateData
) {
    try {
        // =========================
        // STEP 1: Fetch Knowledge Nodes
        // =========================
        const lowerQuery = userQuery.toLowerCase()

        const { data: allNodes, error } = await supabase
            .from("knowledge_nodes")
            .select("*")
            .eq("practice_area", practiceArea)

        if (error) {
            console.error("Knowledge Fetch Error:", error)
            return {
                finalPrompt: template.system_prompt,
                injectedKnowledge: null
            }
        }

        // =========================
        // STEP 2: Score Relevance
        // =========================
        const scoredNodes = (allNodes || []).map(node => {
            const tags = node.tags || []
            let relevanceScore = 0

            // Tag matching
            for (const tag of tags) {
                if (lowerQuery.includes(tag.toLowerCase())) {
                    relevanceScore += 0.3
                }
            }

            // Keyword matching in content
            const contentLower = (node.content || "").toLowerCase()
            const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 3)
            for (const word of queryWords) {
                if (contentLower.includes(word)) {
                    relevanceScore += 0.1
                }
            }

            return {
                ...node,
                relevanceScore: Math.min(relevanceScore, 1.0)
            }
        })

        // =========================
        // STEP 3: Sort by Priority THEN Relevance
        // =========================
        const sortedNodes = scoredNodes.sort((a, b) => {
            // First by priority (CONSTRAINT = highest)
            const aPriority = PRIORITY_ORDER.indexOf(a.node_type)
            const bPriority = PRIORITY_ORDER.indexOf(b.node_type)
            if (aPriority !== bPriority) {
                return aPriority - bPriority
            }
            // Then by relevance
            return b.relevanceScore - a.relevanceScore
        })

        // =========================
        // STEP 4: Apply Token Budget (Priority-based truncation)
        // =========================
        const constraints: string[] = []
        const antiPatterns: string[] = []
        const decisions: string[] = []
        const clientFacts: string[] = []

        let totalTokens = 0

        for (const node of sortedNodes) {
            const formatted = `- [${Math.round(node.relevanceScore * 100)}%] ${node.title}: ${node.content}`
            const nodeTokens = estimateTokens(formatted)

            if (totalTokens + nodeTokens <= TOKEN_BUDGET) {
                switch (node.node_type) {
                    case "CONSTRAINT":
                        constraints.push(formatted)
                        break
                    case "ANTI_PATTERN":
                        antiPatterns.push(formatted)
                        break
                    case "DECISION":
                        decisions.push(formatted)
                        break
                    case "CLIENT_FACT":
                        clientFacts.push(formatted)
                        break
                }
                totalTokens += nodeTokens
            } else {
                console.log(`Truncated: ${node.title} (would exceed token budget)`)
                break
            }
        }

        console.log(`Token budget: ${totalTokens}/${TOKEN_BUDGET} used`)

        // =========================
        // STEP 5: Fetch IK Cases (only for Level 3)
        // =========================
        let formattedCases = "No verified case law found for this query."

        try {
            const cases = await getTopCasesWithMetadata(template.auto_research_query)

            if (cases && cases.length > 0) {
                formattedCases = cases
                    .map((c: any, index: number) => `
${index + 1}. **${c.title}** (${c.citation || "Citation pending"})
   - Court: ${c.court || "N/A"}
   - Date: ${c.date || c.publishdate || "N/A"}
   - Key Finding: ${c.headline?.substring(0, 200) || "Relevant precedent"}
`)
                    .join("\n\n")
            }
        } catch (ikError) {
            console.error("IK Injection Error:", ikError)
        }

        // =========================
        // STEP 6: Build Final Prompt with Markers
        // =========================
        let finalPrompt = template.system_prompt

        finalPrompt = finalPrompt.replace(
            "{INJECTION_CONSTRAINTS}",
            constraints.length > 0
                ? `**FIRM CONSTRAINTS (Must Follow):**\n${constraints.join("\n")}`
                : "No specific constraints for this matter."
        )

        finalPrompt = finalPrompt.replace(
            "{INJECTION_ANTI_PATTERNS}",
            antiPatterns.length > 0
                ? `**ANTI-PATTERNS (What to Avoid):**\n${antiPatterns.join("\n")}`
                : "No anti-patterns identified."
        )

        finalPrompt = finalPrompt.replace(
            "{INJECTION_DECISIONS}",
            decisions.length > 0
                ? `**PAST DECISIONS (Firm Precedent):**\n${decisions.join("\n")}`
                : "No prior firm decisions on point."
        )

        finalPrompt = finalPrompt.replace(
            "{INJECTION_CLIENT}",
            clientFacts.length > 0
                ? `**CLIENT-SPECIFIC FACTS:**\n${clientFacts.join("\n")}`
                : "No client-specific facts provided."
        )

        finalPrompt = finalPrompt.replace(
            "{INJECTION_CASELAW}",
            `**VERIFIED INDIAN KANOON CASE LAW:**\n${formattedCases}`
        )

        return {
            finalPrompt,
            injectedKnowledge: {
                constraints,
                antiPatterns,
                decisions,
                clientFacts,
                tokenBudget: {
                    used: totalTokens,
                    total: TOKEN_BUDGET,
                    percentage: Math.round((totalTokens / TOKEN_BUDGET) * 100)
                }
            }
        }

    } catch (error) {
        console.error("Knowledge Injection Error:", error)
        throw error
    }
}