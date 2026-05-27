import { NextRequest, NextResponse } from "next/server"
import { askLegalGroq } from "@/src/lib/groq"

/**
 * Helper to clean markdown code blocks from LLM responses
 */
function cleanJSONResponse(rawResponse: string): string {
    // Remove markdown code blocks
    let cleaned = rawResponse.trim()

    // Remove ```json ... ``` or ``` ... ```
    const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i
    const match = cleaned.match(codeBlockRegex)

    if (match) {
        cleaned = match[1].trim()
    }

    // Also handle cases where there's text before/after JSON
    // Extract just the JSON part
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')

    if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
    }

    return cleaned
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { query } = body

        if (!query) {
            return NextResponse.json(
                { success: false, error: "Query is required" },
                { status: 400 }
            )
        }

        /**
         * LLM classification prompt - INSTRUCT to NOT use markdown
         */
        const classificationPrompt = `
Classify the following Indian legal query.

QUERY:
"${query}"

CRITICAL INSTRUCTION: 
Return ONLY valid JSON. Do NOT wrap in backticks. Do NOT include markdown code blocks. Do NOT include any explanatory text before or after the JSON.

Available practice_area values:
- criminal
- corporate

Available document_type values:
CRIMINAL:
- anticipatory_bail
- regular_bail
- fir_quashing

CORPORATE:
- nda_review
- nclt_petition

Available court_type values:
- high_court
- sessions_court
- tribunal
- na

OUTPUT FORMAT (ONLY THIS, NO OTHER TEXT):
{
  "practice_area": "",
  "document_type": "",
  "court_type": "",
  "confidence": 0.0,
  "reasoning": ""
}
`

        let rawResponse = await askLegalGroq(classificationPrompt)

        // Clean the response - remove markdown code blocks
        rawResponse = cleanJSONResponse(rawResponse)

        /**
         * Parse JSON safely
         */
        let parsed

        try {
            parsed = JSON.parse(rawResponse)
        } catch (error) {
            console.error("INVALID CLASSIFICATION JSON:", rawResponse)

            // Fallback: try to extract JSON using regex
            const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0])
                } catch {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Invalid classification response",
                            rawResponse
                        },
                        { status: 500 }
                    )
                }
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid classification response",
                        rawResponse
                    },
                    { status: 500 }
                )
            }
        }

        // Validate required fields
        if (!parsed.practice_area || !parsed.document_type) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields in classification",
                    parsed
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            classification: parsed
        })

    } catch (error: any) {
        console.error("CLASSIFY QUERY ERROR:", error)

        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Classification failed"
            },
            { status: 500 }
        )
    }
}