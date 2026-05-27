-- Run this in SQL Editor to add more nodes
INSERT INTO knowledge_nodes (node_id, practice_area, node_type, title, content, tags, priority) VALUES
('C-002', 'criminal', 'CONSTRAINT', 'No IPC Sections', 'Never use IPC or CrPC sections. Always use BNS and BNSS after July 2024.', ARRAY['bns', 'sections'], 10),
('C-003', 'criminal', 'CONSTRAINT', 'Passport Surrender', 'For bail applications, always include undertaking to surrender passport if client has foreign travel history.', ARRAY['bail', 'passport'], 9),
('C-004', 'criminal', 'CONSTRAINT', 'Delhi HC Closing Line', 'Every Delhi High Court bail application must end with: AND FOR THIS ACT OF KINDNESS, THE APPLICANT AS IN DUTY BOUND SHALL EVER PRAY.', ARRAY['delhi-hc', 'format'], 10),
('AP-002', 'criminal', 'ANTI_PATTERN', 'Avoid Generic No Antecedents', 'Do not use no criminal antecedents alone. Contextualize with cooperation history.', ARRAY['bail', 'generic'], 8),
('AP-003', 'criminal', 'ANTI_PATTERN', 'Avoid Aggressive Language', 'Avoid aggressive constitutional language in first anticipatory bail filing. Courts respond better to cooperation-first positioning.', ARRAY['strategy'], 8),
('D-002', 'criminal', 'DECISION', 'Satender Antil v CBI', '2022 SCC 699: Bail is the rule and jail is the exception. Cooperation with investigation is a key factor.', ARRAY['satender-antil', 'supreme-court'], 8),
('D-003', 'criminal', 'DECISION', 'Sushila Aggarwal v State', '2020 SCC: Anticipatory bail should not be limited by time unless exceptional circumstances exist.', ARRAY['sushila-aggarwal', 'anticipatory-bail'], 7),
('D-004', 'criminal', 'DECISION', 'Arnesh Kumar v Bihar', '2014 SCC: Police must satisfy checklist before arrest. Magistrate must apply mind to necessity of custody.', ARRAY['arnesh-kumar', 'arrest'], 7),
('CF-003', 'criminal', 'CLIENT_FACT', 'Government Service', 'Client is a PWD Government Officer with 15 years of unblemished service record.', ARRAY['government', 'service'], 6),
('CF-004', 'criminal', 'CLIENT_FACT', 'Community Roots', 'Client owns property in Delhi and has deep community roots, eliminating flight risk.', ARRAY['roots', 'community'], 5);

-- Add more section mappings
INSERT INTO section_mappings (old_section, old_act, new_section, new_act) VALUES
('302', 'IPC', '101', 'BNS'),
('304', 'IPC', '105', 'BNS'),
('376', 'IPC', '64', 'BNS'),
('498A', 'IPC', '85', 'BNS'),
('406', 'IPC', '316', 'BNS'),
('161', 'CrPC', '180', 'BNSS'),
('439', 'CrPC', '483', 'BNSS'),
('437', 'CrPC', '479', 'BNSS');