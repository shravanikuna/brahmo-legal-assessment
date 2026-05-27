-- LEGAL TEMPLATES

CREATE TABLE IF NOT EXISTS legal_templates (
    id BIGSERIAL PRIMARY KEY,
    template_id TEXT UNIQUE NOT NULL,
    jurisdiction TEXT DEFAULT 'IN',
    practice_area TEXT NOT NULL,
    document_type TEXT NOT NULL,
    court_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    auto_research_query TEXT,
    quality_checks JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);


-- KNOWLEDGE NODES

CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id BIGSERIAL PRIMARY KEY,
    node_id TEXT UNIQUE NOT NULL,
    node_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    practice_area TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    client_id TEXT,
    matter_id TEXT,
    priority INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW()
);


-- SECTION MAPPINGS

CREATE TABLE IF NOT EXISTS section_mappings (
    id BIGSERIAL PRIMARY KEY,
    old_section TEXT NOT NULL,
    old_act TEXT NOT NULL,
    new_section TEXT NOT NULL,
    new_act TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


-- GENERATION LOGS (Optional but good)

CREATE TABLE IF NOT EXISTS generation_logs (
    id BIGSERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    practice_area TEXT,
    document_type TEXT,
    level1_score NUMERIC,
    level2_score NUMERIC,
    level3_score NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);


-- INDEXES

CREATE INDEX IF NOT EXISTS idx_knowledge_practice ON knowledge_nodes(practice_area);
CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_priority ON knowledge_nodes(priority);
CREATE INDEX IF NOT EXISTS idx_templates_practice ON legal_templates(practice_area);
CREATE INDEX IF NOT EXISTS idx_templates_doc ON legal_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_mappings_old ON section_mappings(old_section, old_act);