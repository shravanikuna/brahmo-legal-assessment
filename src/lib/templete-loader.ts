import { supabase } from "./supabase"

export async function loadLegalTemplate(
    practiceArea: string,
    documentType: string,
    courtType: string
) {

    const { data, error } = await supabase
        .from("legal_templates")
        .select("*")
        .eq("practice_area", practiceArea)
        .eq("document_type", documentType)
        .eq("court_type", courtType)
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("Template Load Error:", error)
        return null
    }

    return data
}