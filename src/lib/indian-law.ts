import { NextResponse } from "next/server"

const IK_BASE_URL = "https://api.indiankanoon.org"

function cleanHtml(text: string) {
    return text.replace(/<[^>]*>/g, "")
}

export async function searchIndianKanoon(query: string) {
    try {
        const response = await fetch(`${IK_BASE_URL}/search/`, {
            method: "POST",
            headers: {
                Authorization: `Token ${process.env.INDIAN_KANOON_API_KEY}`,
                // "formInput": "anticipatory+bail+Section+482+BNSS+Supreme+Court",
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            body: new URLSearchParams({
                formInput: query,
                pagenum: "0"
            })
        })


        const data = await response.json()


        if (!data.docs || data.docs.length === 0) {
            return []
        }

        return data.docs.slice(0, 5).map((doc: any) => ({
            docid: doc.docid || doc.tid,
            title: doc.title,
            court: doc.court,
            headline: cleanHtml(doc.headline || ""),
            publishdate: doc.publishdate,
            numcites: doc.numcites
        }))
    } catch (error) {
        console.error("IK SEARCH ERROR:", error)
        return []
    }
}

export async function getDocumentMetadata(docid: number) {
    try {
        const response = await fetch(
            `${IK_BASE_URL}/docmeta/${docid}/`,
            {
                method: "POST",
                headers: {
                    Authorization: `Token ${process.env.INDIAN_KANOON_API_KEY}`
                }
            }
        )

        const data = await response.json()

        return {
            title: data.title,
            citation: data.citation,
            court: data.court,
            date: data.date,
            numcites: data.numcites,
            numcitedby: data.numcitedby,
            doctype: data.doctype
        }
    } catch (error) {
        console.error("IK Metadata Error:", error)
        return null
    }
}

export async function getTopCasesWithMetadata(query: string) {

    // STEP 1: Search Indian Kanoon
    const searchResults = await searchIndianKanoon(query)


    // STEP 2: If no results, return empty
    if (!searchResults.length) {
        return []
    }

    // STEP 3: Take top 3
    const topDocs = searchResults.slice(0, 3)

    // STEP 4: Fetch metadata for each doc
    const enrichedCases = []

    for (const doc of topDocs) {
        try {
            const metadata = await getDocumentMetadata(doc.docid)

            enrichedCases.push({
                docid: doc.docid,
                title: doc.title,
                headline: doc.headline?.replace(/<[^>]*>/g, '') || "Key precedent",
                publishdate: doc.publishdate,
                citation: metadata?.citation || "Citation pending",
                court: metadata?.court || metadata?.doctype || "Court not specified",
                date: metadata?.date || doc.publishdate,
                relevance: 85
            })
        } catch (err) {
            // Still add the case without metadata
            enrichedCases.push({
                docid: doc.docid,
                title: doc.title,
                headline: doc.headline?.replace(/<[^>]*>/g, '') || "Key precedent",
                publishdate: doc.publishdate,
                citation: "Citation pending",
                court: "Court not specified",
                date: doc.publishdate,
                relevance: 70
            })
        }
    }

    // IMPORTANT: Return the enrichedCases!
    return enrichedCases
}