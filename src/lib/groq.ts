import Groq from "groq-sdk"

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export interface GroqOptions {
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
}

type MessageRole = "system" | "user" | "assistant"

interface GroqMessage {
    role: MessageRole
    content: string
}

/**
 * Base Groq call
 */
export async function askGroq(
    userPrompt: string,
    options: GroqOptions = {}
): Promise<string> {

    const {
        temperature = 0.3,
        maxTokens = 2000,
        systemPrompt
    } = options

    try {

        const messages: GroqMessage[] = []

        // System prompt
        if (systemPrompt) {
            messages.push({
                role: "system",
                content: systemPrompt
            })
        }

        // User prompt
        messages.push({
            role: "user",
            content: userPrompt
        })

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature,
            max_tokens: maxTokens,
        })

        const text =
            response.choices?.[0]?.message?.content?.trim() || ""

        if (!text) {
            throw new Error("Empty response from Groq")
        }

        return text

    } catch (error) {

        console.error("GROQ API ERROR:", error)

        throw error
    }
}

/**
 * Retry wrapper for rate limits / temporary failures
 */
export async function askGroqWithRetry(
    userPrompt: string,
    options: GroqOptions = {},
    maxRetries: number = 3
): Promise<string> {

    let lastError: any

    for (let attempt = 0; attempt < maxRetries; attempt++) {

        try {

            return await askGroq(userPrompt, options)

        } catch (error: any) {

            lastError = error

            // Retry only for rate limit
            if (error?.status === 429) {

                const delay = Math.pow(2, attempt) * 1000

                await new Promise(resolve =>
                    setTimeout(resolve, delay)
                )

                continue
            }

            // Non-retryable error
            throw error
        }
    }

    throw lastError
}

/**
 * Legal AI helper
 * Used later for templates + knowledge injection
 */
export async function askLegalGroq(
    userPrompt: string,
    extraSystemPrompt?: string
): Promise<string> {

    const baseLegalPrompt = `
You are an advanced Indian legal AI assistant.

IMPORTANT RULES:
- IPC was replaced by BNS in July 2024
- CrPC was replaced by BNSS
- Use Indian legal terminology only
- Never use US or UK legal formats
- Focus only on Indian law
- If uncertain, clearly mention verification is needed
- Prefer BNS/BNSS references over IPC/CrPC
`

    const finalPrompt = extraSystemPrompt
        ? `${baseLegalPrompt}\n\n${extraSystemPrompt}`
        : baseLegalPrompt

    return askGroqWithRetry(userPrompt, {
        systemPrompt: finalPrompt,
        temperature: 0.3,
        maxTokens: 2500
    })
}