export type PracticeArea =
    | "criminal"
    | "corporate"
    | "family"
    | "civil"

export type NodeType =
    | "CONSTRAINT"
    | "DECISION"
    | "CLIENT_FACT"
    | "ANTI_PATTERN"

export interface LegalTemplate {
    id?: number

    template_id: string

    display_name: string

    practice_area: PracticeArea

    document_type: string

    court_type: string

    system_prompt: string

    auto_research_query: string
}

export interface KnowledgeNode {
    id?: number

    node_id: string

    practice_area: PracticeArea

    node_type: NodeType

    title: string

    content: string

    tags: string[]

    priority: number
}

export interface SectionMapping {
    id?: number

    old_section: string

    old_act: string

    new_section: string

    new_act: string
}

export interface InjectedKnowledge {
    constraints: string[]

    decisions: string[]

    clientFacts: string[]

    antiPatterns: string[]
}

export interface ThreeLevelResponse {
    success: boolean

    classification: {
        practice_area: string
        document_type: string
        court_type: string
    }

    template: {
        id: string
        display_name: string
    }

    level1: any
    level2: any
    level3: any

    injectedKnowledge: InjectedKnowledge

    cases: any[]
}