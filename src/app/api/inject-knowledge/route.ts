import { NextRequest, NextResponse } from "next/server"

import { classifyQuery } from "@/src/lib/template-selector"
import { loadLegalTemplate } from "@/src/lib/templete-loader"
import { injectKnowledge } from "@/src/lib/knowledge-injector"

export async function POST(req: NextRequest) {

    try {

        const body = await req.json()

        const { query } = body

        // STEP 1: CLASSIFY
        const classification =
            await classifyQuery(query)

        // STEP 2: LOAD TEMPLATE
        const template = await loadLegalTemplate(
            classification.practice_area,
            classification.document_type,
            classification.court_type
        )

        if (!template) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Template not found"
                },
                { status: 404 }
            )
        }

        // STEP 3: INJECT KNOWLEDGE
        const injected = await injectKnowledge(
            classification.practice_area,
            query,
            template
        )
        const injectedIsString = typeof injected === "string"
        return NextResponse.json({
            success: true,

            classification,

            template: {
                id: template.template_id,
                display_name: template.display_name
            },

            injectedKnowledge: injectedIsString ? null : injected.injectedKnowledge,

            finalPrompt: injectedIsString ? injected : injected.finalPrompt
        })

    } catch (error: any) {

        console.error("Injection Route Error:", error)

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        )
    }
}