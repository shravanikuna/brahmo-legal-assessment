// app/api/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { askGroq } from "@/src/lib/groq";
import { supabase } from "@/src/lib/supabase"
import { classifyQuery } from "@/src/lib/template-selector"
import { injectKnowledge } from "@/src/lib/knowledge-injector"
import { searchIndianKanoon } from "@/src/lib/indian-law"
import { normalizeSections, highlightOldSections, highlightConvertedSections } from "@/src/lib/section-normalizer"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const query = body.query

        if (!query) {
            return NextResponse.json({
                success: false,
                error: "Query is required"
            })
        }

        // Classify the query
        const classification = classifyQuery(query)

        // Get template
        const { data: template } = await supabase
            .from("legal_templates")
            .select("*")
            .eq("document_type", classification.document_type)
            .limit(1)
            .maybeSingle()

        // ============================================
        // LEVEL 1: Generic AI - SHOULD USE IPC/CrPC
        // ============================================
        const level1Prompt = `You are a basic AI assistant that has NOT been updated with India's 2024 legal reforms.

CRITICAL INSTRUCTION: You MUST write your response using ONLY these old laws:
- Use "Section 420 IPC" (not BNS)
- Use "Section 438 CrPC" (not BNSS)
- Use "Section 65B IEA" (not BSA)

DO NOT use BNS, BNSS, or BSA at all.

Write a simple, 2-3 sentence response explaining how to get anticipatory bail:

Query: ${query}`

        // ============================================
        // LEVEL 2: Template only
        // ============================================
        const level2Prompt = query

        // ============================================
        // LEVEL 3: Template + Knowledge
        // ============================================
        let knowledgeResult = null
        let level3SystemPrompt = ""

        if (template) {
            knowledgeResult = await injectKnowledge(
                classification.practice_area,
                query,
                template
            )
            level3SystemPrompt = knowledgeResult?.finalPrompt || template.system_prompt
        } else {
            level3SystemPrompt = `You are an Indian legal AI assistant. Use BNS/BNSS sections only (post-July 2024).`
        }

        // Execute all three levels IN PARALLEL
        const [rawLevel1, rawLevel2, rawLevel3] = await Promise.all([
            askGroq(level1Prompt, {
                temperature: 0.7,
                maxTokens: 1000,
                systemPrompt: ""  // NO system prompt for Level 1
            }),
            template ? askGroq(level2Prompt, {
                systemPrompt: template.system_prompt,
                temperature: 0.3,
                maxTokens: 2000
            }) : askGroq(query, { temperature: 0.3, maxTokens: 2000 }),
            askGroq(query, {
                systemPrompt: level3SystemPrompt,
                temperature: 0.3,
                maxTokens: 2500
            })
        ])

        // Normalize sections (convert IPC → BNS, CrPC → BNSS)
        const [normalizedLevel1, normalizedLevel2, normalizedLevel3] = await Promise.all([
            normalizeSections(rawLevel1),
            normalizeSections(rawLevel2),
            normalizeSections(rawLevel3)
        ])

        // Get IK cases
        let cases = []
        try {
            cases = await searchIndianKanoon(query)
        } catch (ikError) {
            console.error("IK Search failed:", ikError)
        }

        // Calculate quality scores based on section changes
        const calculateScore = (level: number, changes: any[]) => {
            const hasChanges = changes.length > 0
            const isLevel3 = level === 3

            let score = 0
            if (level === 1) {
                // Level 1 should HAVE old sections (IPC) - that's correct for L1
                score = hasChanges ? 2 : 1  // More changes = more old sections = better for L1
            } else if (level === 2) {
                // Level 2 should have NO old sections
                score = !hasChanges ? 4 : 2
            } else {
                // Level 3 should have NO old sections + firm knowledge
                score = !hasChanges ? 5 : 3
                if (isLevel3 && !hasChanges) score += 1  // Bonus for clean output
            }
            return Math.min(score, 5)
        }

        return NextResponse.json({
            success: true,
            classification,
            template: template ? {
                id: template.template_id,
                display_name: template.display_name
            } : null,
            level1: {
                raw: rawLevel1,
                normalized: normalizedLevel1.normalizedText,
                sectionChanges: normalizedLevel1.changes || [],
                changeCount: normalizedLevel1.changeCount || 0,
                score: calculateScore(1, normalizedLevel1.changes || [])
            },
            level2: {
                raw: rawLevel2,
                normalized: normalizedLevel2.normalizedText,
                sectionChanges: normalizedLevel2.changes || [],
                changeCount: normalizedLevel2.changeCount || 0,
                score: calculateScore(2, normalizedLevel2.changes || [])
            },
            level3: {
                raw: rawLevel3,
                normalized: normalizedLevel3.normalizedText,
                sectionChanges: normalizedLevel3.changes || [],
                changeCount: normalizedLevel3.changeCount || 0,
                score: calculateScore(3, normalizedLevel3.changes || [])
            },
            injectedKnowledge: knowledgeResult?.injectedKnowledge || null,
            cases: cases || []
        })

    } catch (error) {
        console.error("Generate API Error:", error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Generation failed"
        }, { status: 500 })
    }
}