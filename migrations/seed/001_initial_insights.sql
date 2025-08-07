-- ZenCap Production Database
-- Seed Data: Initial Insights Content

BEGIN;

INSERT INTO insights (slug, title, summary, content, author, cover_image_url, status, tags, date_published) VALUES

-- Q4 2024 Tech Earnings Analysis
('q4-2024-tech-earnings-analysis', 
'Q4 2024 Tech Earnings: Key Insights and Market Implications', 
'Comprehensive analysis of Q4 2024 technology sector earnings, highlighting key trends, performance drivers, and implications for 2025 investment strategies.',
'<p>The Q4 2024 earnings season revealed significant insights into the technology sector''s resilience and adaptation to changing market conditions...</p>',
'Investment Research Team',
'/images/insights/q4-2024-tech-earnings-analysis.jpg',
'published',
'earnings, technology, analysis, Q4 2024',
'2024-12-15'),

-- NVIDIA Q1 2025 Analysis
('nvidia-q1-2025-earnings-analysis',
'NVIDIA Q1 2025 Earnings: AI Revolution Continues',
'Deep dive into NVIDIA''s Q1 2025 performance, analyzing data center growth, AI chip demand, and market positioning in the evolving AI landscape.',
'<p>NVIDIA''s Q1 2025 earnings demonstrated the continued strength of AI-driven demand, with data center revenue reaching new heights...</p>',
'Senior Technology Analyst',
'/images/insights/nvidia-q1-2025-earnings-analysis.jpg',
'published',
'NVIDIA, AI, semiconductors, earnings',
'2025-01-20'),

-- Federal Reserve Policy March 2025
('federal-reserve-policy-march-2025',
'Federal Reserve Policy Update: March 2025 Implications',
'Analysis of the Federal Reserve''s March 2025 policy decisions and their impact on investment markets, interest rates, and economic outlook.',
'<p>The Federal Reserve''s March 2025 policy meeting provided crucial insights into the central bank''s approach to monetary policy...</p>',
'Economic Policy Analyst',
'/images/insights/federal-reserve-policy-march-2025.jpg',
'published',
'Federal Reserve, monetary policy, interest rates',
'2025-03-20'),

-- Cloud Infrastructure Wars 2025
('cloud-ai-infrastructure-wars-2025',
'Cloud AI Infrastructure Wars: 2025 Competitive Landscape',
'Examination of the intensifying competition in cloud AI infrastructure, analyzing key players, market dynamics, and investment opportunities.',
'<p>The cloud AI infrastructure market has evolved into a highly competitive battleground, with major players vying for dominance...</p>',
'Technology Infrastructure Analyst',
'/images/insights/cloud-ai-infrastructure-wars-2025.jpg',
'published',
'cloud computing, AI infrastructure, competition',
'2025-02-10'),

-- Energy Transition Q2 2025
('energy-transition-opportunities-q2-2025',
'Energy Transition Opportunities: Q2 2025 Outlook',
'Strategic analysis of energy transition investments, renewable energy trends, and emerging opportunities in the clean energy sector.',
'<p>The energy transition continues to create significant investment opportunities across multiple sectors and geographies...</p>',
'Energy Sector Specialist',
'/images/insights/energy-transition-opportunities-q2-2025.jpg',
'published',
'energy, renewable energy, transition, sustainability',
'2025-04-01'),

-- Healthcare Technology 2025
('healthcare-technology-digital-health-2025',
'Healthcare Technology: Digital Health Revolution 2025',
'Comprehensive overview of digital health innovations, telemedicine growth, and investment opportunities in healthcare technology.',
'<p>Digital health technologies are transforming the healthcare landscape, creating new paradigms for patient care and medical innovation...</p>',
'Healthcare Technology Analyst',
'/images/insights/healthcare-technology-digital-health-2025.jpg',
'published',
'healthcare, digital health, technology, telemedicine',
'2025-03-05'),

-- Geopolitical Risk 2025
('geopolitical-risk-global-markets-2025',
'Geopolitical Risk and Global Markets: 2025 Assessment',
'Analysis of key geopolitical risks affecting global markets, including trade tensions, regulatory changes, and regional conflicts.',
'<p>Geopolitical developments continue to influence global investment markets, creating both risks and opportunities for investors...</p>',
'Geopolitical Risk Analyst',
'/images/insights/geopolitical-risk-global-markets-2025.jpg',
'published',
'geopolitics, risk analysis, global markets',
'2025-01-30'),

-- Quantum Computing 2025
('quantum-computing-commercial-viability-2025',
'Quantum Computing: Commercial Viability in 2025',
'Evaluation of quantum computing''s progress toward commercial applications, investment landscape, and potential market impact.',
'<p>Quantum computing has reached an inflection point where commercial applications are becoming increasingly viable...</p>',
'Emerging Technology Analyst',
'/images/insights/quantum-computing-commercial-viability-2025.jpg',
'published',
'quantum computing, emerging technology, commercial applications',
'2025-02-25'),

-- Real Estate Recovery 2025
('commercial-real-estate-recovery-2025',
'Commercial Real Estate Recovery: 2025 Market Dynamics',
'Assessment of commercial real estate market recovery, sector performance, and investment opportunities across property types.',
'<p>The commercial real estate market is showing signs of stabilization and recovery, with distinct patterns emerging across sectors...</p>',
'Real Estate Investment Analyst',
'/images/insights/commercial-real-estate-recovery-2025.jpg',
'published',
'real estate, commercial property, recovery, investment',
'2025-03-15'),

-- Supply Chain Resilience
('global-supply-chain-resilience-2025',
'Global Supply Chain Resilience: 2025 Strategic Imperatives',
'Analysis of supply chain evolution, resilience strategies, and investment implications for global manufacturing and logistics.',
'<p>Supply chain resilience has become a strategic imperative for businesses worldwide, driving significant changes in operations...</p>',
'Supply Chain Analyst',
'/images/insights/global-supply-chain-resilience-2025.jpg',
'published',
'supply chain, resilience, logistics, manufacturing',
'2025-02-01');

COMMIT;