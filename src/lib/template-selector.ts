// lib/template-selector.ts

interface Classification {
    practice_area: "criminal" | "corporate"
    document_type: string
    court_type: "high_court" | "sessions_court" | "tribunal" | "na"
    confidence: number
}

export function classifyQuery(query: string): Classification {
    const q = query.toLowerCase()

    // Criminal classifications
    if (q.includes("anticipatory bail") || (q.includes("bail") && q.includes("482"))) {
        return {
            practice_area: "criminal",
            document_type: "anticipatory_bail",
            court_type: "high_court",
            confidence: 0.95
        }
    }

    if (q.includes("fir quashing") || (q.includes("quash") && q.includes("fir"))) {
        return {
            practice_area: "criminal",
            document_type: "fir_quashing",
            court_type: "high_court",
            confidence: 0.95
        }
    }

    if (q.includes("sessions court") || (q.includes("bail") && q.includes("session"))) {
        return {
            practice_area: "criminal",
            document_type: "regular_bail",
            court_type: "sessions_court",
            confidence: 0.9
        }
    }

    // Corporate classifications
    if (q.includes("nda") || q.includes("confidentiality agreement")) {
        return {
            practice_area: "corporate",
            document_type: "nda_review",
            court_type: "na",
            confidence: 0.95
        }
    }

    if (q.includes("nclt") || q.includes("oppression") || q.includes("mismanagement") || q.includes("section 241")) {
        return {
            practice_area: "corporate",
            document_type: "nclt_petition",
            court_type: "tribunal",
            confidence: 0.95
        }
    }

    // Default fallback - but with low confidence
    if (q.includes("bail") || q.includes("arrest") || q.includes("fir") || q.includes("crime")) {
        return {
            practice_area: "criminal",
            document_type: "anticipatory_bail",
            court_type: "high_court",
            confidence: 0.6
        }
    }

    if (q.includes("contract") || q.includes("agreement") || q.includes("company") || q.includes("shareholder")) {
        return {
            practice_area: "corporate",
            document_type: "nda_review",
            court_type: "na",
            confidence: 0.6
        }
    }

    // Last resort
    return {
        practice_area: "criminal",
        document_type: "anticipatory_bail",
        court_type: "high_court",
        confidence: 0.3
    }
}