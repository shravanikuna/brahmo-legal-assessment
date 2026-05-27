// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions you'll need
export async function getTemplate(practiceArea: string, documentType: string) {
    const { data } = await supabase
        .from('legal_templates')
        .select('*')
        .eq('practice_area', practiceArea)
        .eq('document_type', documentType)
        // .single()
        .limit(1)
        .maybeSingle()
    return data
}

export async function getKnowledgeNodes(practiceArea: string, tags: string[], limit: number) {
    // Query with priority ordering
    const { data } = await supabase
        .from('knowledge_nodes')
        .select('*')
        .eq('practice_area', practiceArea)
        .contains('tags', tags)  // PostgreSQL JSONB contains
        .order('priority', { ascending: true })
        .limit(limit)
    return data
}