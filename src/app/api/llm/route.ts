import { NextRequest, NextResponse } from "next/server"

import {
    askGroq,
    askGroqWithRetry,
    askLegalGroq
} from "@/src/lib/groq"

/**
 * POST
 * Generic LLM endpoint
 */
export async function POST(req: NextRequest) {

    try {

        const body = await req.json()

        const {
            prompt,
            systemPrompt,
            temperature,
            maxTokens,
            useRetry = true,
            legalMode = true
        } = body

        if (!prompt) {

            return NextResponse.json(
                {
                    success: false,
                    error: "Prompt is required"
                },
                {
                    status: 400
                }
            )
        }

        let response: string

        // Legal specialized mode
        if (legalMode) {

            response = await askLegalGroq(
                prompt,
                systemPrompt
            )

        }
        // Generic retry mode
        else if (useRetry) {

            response = await askGroqWithRetry(prompt, {
                systemPrompt,
                temperature,
                maxTokens
            })

        }
        // Raw mode
        else {

            response = await askGroq(prompt, {
                systemPrompt,
                temperature,
                maxTokens
            })
        }

        return NextResponse.json({
            success: true,
            response,
            provider: "groq",
            model: "llama-3.3-70b-versatile"
        })

    } catch (error: any) {

        console.error("LLM ROUTE ERROR:", error)

        return NextResponse.json(
            {
                success: false,
                error:
                    error?.message ||
                    "Failed to generate response"
            },
            {
                status: error?.status || 500
            }
        )
    }
}

/**
 * GET
 * Simple browser testing
 */
export async function GET(req: NextRequest) {

    try {

        const searchParams =
            req.nextUrl.searchParams

        const prompt =
            searchParams.get("prompt") ||
            "Explain Section 318 of Bharatiya Nyaya Sanhita related to cheating offences in India."

        const response = await askLegalGroq(prompt)

        return NextResponse.json({
            success: true,
            response,
            provider: "groq",
            model: "llama-3.3-70b-versatile"
        })

    } catch (error: any) {

        console.error("LLM GET ERROR:", error)

        return NextResponse.json(
            {
                success: false,
                error:
                    error?.message ||
                    "Failed to generate response"
            },
            {
                status: error?.status || 500
            }
        )
    }
}