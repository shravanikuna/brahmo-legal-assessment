import { NextRequest, NextResponse } from "next/server"
import { normalizeSections } from "@/src/lib/section-normalizer"

export async function POST(req: NextRequest) {

    try {

        const body = await req.json()
        const { text } = body

        if (!text) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Text is required"
                },
                { status: 400 }
            )
        }

        const result = await normalizeSections(text)

        return NextResponse.json({
            success: true,
            normalizedText: result.normalizedText,
            changes: result.changes
        })

    } catch (error: any) {

        console.error("Normalize Error:", error)

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        )
    }
}