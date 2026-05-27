export type KnowledgeNodeType =
    | "CONSTRAINT"
    | "ANTI_PATTERN"
    | "DECISION"
    | "CLIENT_FACT";

export interface KnowledgeNode {
    id: string;
    node_type: KnowledgeNodeType;
    title: string;
    content: string;
    practice_area: string;
    tags: string[];
    client_id?: string | null;
    matter_id?: string | null;
}

export interface LegalTemplate {
    id: string;
    template_id: string;
    practice_area: string;
    document_type: string;
    court_type: string;
    display_name: string;
    system_prompt: string;
}