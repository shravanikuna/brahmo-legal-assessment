export const legalTemplates = [
    {
        practice_area: "criminal",

        document_type: "anticipatory_bail",

        court_type: "sessions",

        display_name: "Anticipatory Bail Application",

        system_prompt:
            "Draft a professional anticipatory bail application under BNSS using Indian legal drafting standards.",

        auto_research_query:
            "anticipatory bail economic offence cooperation investigation"
    },

    {
        practice_area: "criminal",

        document_type: "fir_quashing",

        court_type: "high_court",

        display_name: "FIR Quashing Petition",

        system_prompt:
            "Draft FIR quashing petition using abuse of process arguments under Indian criminal law.",

        auto_research_query:
            "FIR quashing abuse of process"
    },

    {
        practice_area: "corporate",

        document_type: "nda_review",

        court_type: "corporate",

        display_name: "NDA Review",

        system_prompt:
            "Review NDA risks, liability exposure, confidentiality obligations and termination clauses.",

        auto_research_query:
            "NDA enforceability India"
    }
];