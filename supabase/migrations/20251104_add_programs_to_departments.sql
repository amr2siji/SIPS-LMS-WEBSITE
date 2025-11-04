/*
  # Add Programs to Each Department
  
  This migration adds comprehensive programs for each department in the LMS system.
  
  ## Programs Added:
  - Business Administration Department: 3 programs
  - Marketing Department: 2 programs
  - Civil Engineering Department: 2 programs
  - Electrical Engineering Department: 2 programs
  - Software Engineering Department: 3 programs
  - Information Systems Department: 2 programs
  - Data Science Department: 2 programs
*/

-- Temporarily disable RLS for data insertion
ALTER TABLE programs DISABLE ROW LEVEL SECURITY;

-- Insert programs for each department
INSERT INTO programs (
  id, 
  department_id, 
  name, 
  description, 
  program_type, 
  duration_months, 
  image_url, 
  payment_type, 
  program_amount, 
  is_active, 
  created_at
) VALUES
  
  -- BUSINESS ADMINISTRATION DEPARTMENT (b10e8400-e29b-41d4-a716-446655440001)
  (
    'a1000000-e29b-41d4-a716-446655440001',
    'b10e8400-e29b-41d4-a716-446655440001',
    'Bachelor of Business Administration (BBA)',
    'Comprehensive business management program covering finance, operations, marketing, and strategic management',
    'Bachelor',
    48,
    '/programs/bba.jpg',
    'full',
    450000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440002',
    'b10e8400-e29b-41d4-a716-446655440001',
    'Diploma in Business Management',
    'Practical business management skills for entry-level management positions',
    'Diploma',
    24,
    '/programs/business-diploma.jpg',
    'semester',
    150000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440003',
    'b10e8400-e29b-41d4-a716-446655440001',
    'Master of Business Administration (MBA)',
    'Advanced business leadership and strategic management program for professionals',
    'Masters',
    24,
    '/programs/mba.jpg',
    'full',
    850000.00,
    true,
    now()
  ),

  -- MARKETING DEPARTMENT (b10e8400-e29b-41d4-a716-446655440002)
  (
    'a1000000-e29b-41d4-a716-446655440004',
    'b10e8400-e29b-41d4-a716-446655440002',
    'Bachelor of Marketing Management',
    'Specialized marketing program focusing on digital marketing, branding, and consumer behavior',
    'Bachelor',
    48,
    '/programs/marketing-bachelor.jpg',
    'semester',
    200000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440005',
    'b10e8400-e29b-41d4-a716-446655440002',
    'Diploma in Digital Marketing',
    'Modern digital marketing strategies including SEO, social media, and content marketing',
    'Diploma',
    12,
    '/programs/digital-marketing.jpg',
    'full',
    120000.00,
    true,
    now()
  ),

  -- CIVIL ENGINEERING DEPARTMENT (b10e8400-e29b-41d4-a716-446655440003)
  (
    'a1000000-e29b-41d4-a716-446655440006',
    'b10e8400-e29b-41d4-a716-446655440003',
    'Bachelor of Civil Engineering (B.Eng)',
    'Professional engineering degree in structural, geotechnical, and transportation engineering',
    'Bachelor',
    48,
    '/programs/civil-engineering.jpg',
    'semester',
    250000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440007',
    'b10e8400-e29b-41d4-a716-446655440003',
    'Diploma in Construction Technology',
    'Practical construction management and building technology program',
    'Diploma',
    24,
    '/programs/construction-tech.jpg',
    'semester',
    180000.00,
    true,
    now()
  ),

  -- ELECTRICAL ENGINEERING DEPARTMENT (b10e8400-e29b-41d4-a716-446655440004)
  (
    'a1000000-e29b-41d4-a716-446655440008',
    'b10e8400-e29b-41d4-a716-446655440004',
    'Bachelor of Electrical and Electronic Engineering',
    'Comprehensive electrical engineering program covering power systems, electronics, and automation',
    'Bachelor',
    48,
    '/programs/electrical-engineering.jpg',
    'semester',
    250000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440009',
    'b10e8400-e29b-41d4-a716-446655440004',
    'Diploma in Electrical Technology',
    'Hands-on electrical systems installation and maintenance program',
    'Diploma',
    24,
    '/programs/electrical-tech.jpg',
    'full',
    160000.00,
    true,
    now()
  ),

  -- SOFTWARE ENGINEERING DEPARTMENT (b10e8400-e29b-41d4-a716-446655440005)
  (
    'a1000000-e29b-41d4-a716-446655440010',
    'b10e8400-e29b-41d4-a716-446655440005',
    'Bachelor of Software Engineering',
    'Professional software development program covering full-stack development, DevOps, and cloud computing',
    'Bachelor',
    48,
    '/programs/software-engineering.jpg',
    'semester',
    220000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440011',
    'b10e8400-e29b-41d4-a716-446655440005',
    'Diploma in Software Development',
    'Intensive programming and web development bootcamp',
    'Diploma',
    18,
    '/programs/software-diploma.jpg',
    'full',
    150000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440012',
    'b10e8400-e29b-41d4-a716-446655440005',
    'Master of Software Engineering',
    'Advanced software architecture, cloud computing, and AI/ML integration',
    'Masters',
    24,
    '/programs/software-masters.jpg',
    'semester',
    400000.00,
    true,
    now()
  ),

  -- INFORMATION SYSTEMS DEPARTMENT (b10e8400-e29b-41d4-a716-446655440006)
  (
    'a1000000-e29b-41d4-a716-446655440013',
    'b10e8400-e29b-41d4-a716-446655440006',
    'Bachelor of Information Systems',
    'Business information systems, database management, and enterprise solutions',
    'Bachelor',
    48,
    '/programs/information-systems.jpg',
    'semester',
    200000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440014',
    'b10e8400-e29b-41d4-a716-446655440006',
    'Diploma in Business Information Technology',
    'IT skills for business applications and enterprise systems',
    'Diploma',
    18,
    '/programs/business-it.jpg',
    'full',
    130000.00,
    true,
    now()
  ),

  -- DATA SCIENCE DEPARTMENT (b10e8400-e29b-41d4-a716-446655440007)
  (
    'a1000000-e29b-41d4-a716-446655440015',
    'b10e8400-e29b-41d4-a716-446655440007',
    'Bachelor of Data Science',
    'Advanced analytics, machine learning, and big data technologies',
    'Bachelor',
    48,
    '/programs/data-science.jpg',
    'semester',
    230000.00,
    true,
    now()
  ),
  (
    'a1000000-e29b-41d4-a716-446655440016',
    'b10e8400-e29b-41d4-a716-446655440007',
    'Master of Data Science and Analytics',
    'Advanced data science, AI, and business intelligence program',
    'Masters',
    24,
    '/programs/data-science-masters.jpg',
    'full',
    750000.00,
    true,
    now()
  )

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  program_type = EXCLUDED.program_type,
  duration_months = EXCLUDED.duration_months,
  payment_type = EXCLUDED.payment_type,
  program_amount = EXCLUDED.program_amount;

-- Re-enable RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

/*
  SUMMARY:
  
  Total Programs Added: 16
  
  By Department:
  - Business Administration: 3 programs (BBA, Diploma, MBA)
  - Marketing: 2 programs (Bachelor, Diploma)
  - Civil Engineering: 2 programs (Bachelor, Diploma)
  - Electrical Engineering: 2 programs (Bachelor, Diploma)
  - Software Engineering: 3 programs (Bachelor, Diploma, Masters)
  - Information Systems: 2 programs (Bachelor, Diploma)
  - Data Science: 2 programs (Bachelor, Masters)
  
  Program Types:
  - Bachelor: 7 programs
  - Diploma: 7 programs
  - Masters: 2 programs
  
  Payment Types:
  - Full Payment: 7 programs
  - Semester Payment: 9 programs
*/
