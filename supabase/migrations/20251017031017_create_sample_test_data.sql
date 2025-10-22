/*
  # Create Sample Test Data for LMS

  This migration creates sample data for testing purposes including:
  - Sample programs
  - Sample courses
  - Sample batches
  
  Note: User accounts must be created through Supabase Auth API separately.
  This migration only creates supporting data.
*/

-- Insert sample programs
INSERT INTO programs (id, name, description, duration, level, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Business Administration', 'Comprehensive business management program covering all aspects of modern business practices, leadership, and strategic management.', '4 years', 'Bachelor', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Engineering Technology', 'Advanced engineering program focusing on practical applications of engineering principles and emerging technologies.', '4 years', 'Bachelor', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Healthcare Management', 'Specialized program for healthcare administration and management professionals.', '3 years', 'Diploma', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Information Systems', 'Cutting-edge program in information technology, software development, and systems management.', '4 years', 'Bachelor', true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Applied Sciences', 'Interdisciplinary science program with focus on practical applications and research.', '3 years', 'Bachelor', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses for Business Administration
INSERT INTO courses (id, program_id, code, name, description, credits, is_active) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'BUS101', 'Introduction to Business', 'Fundamentals of business operations and management', 3, true),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'BUS201', 'Marketing Principles', 'Core concepts in marketing and consumer behavior', 3, true),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'BUS301', 'Financial Management', 'Financial planning, analysis, and decision making', 3, true),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'BUS401', 'Strategic Management', 'Advanced strategic planning and business strategy', 3, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample courses for Engineering Technology
INSERT INTO courses (id, program_id, code, name, description, credits, is_active) VALUES
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'ENG101', 'Engineering Mathematics', 'Mathematical foundations for engineering', 4, true),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'ENG201', 'Circuit Theory', 'Electrical circuits and systems analysis', 4, true),
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'ENG301', 'Digital Systems', 'Digital electronics and microprocessor systems', 4, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample courses for Information Systems
INSERT INTO courses (id, program_id, code, name, description, credits, is_active) VALUES
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'IT101', 'Programming Fundamentals', 'Introduction to programming and software development', 3, true),
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'IT201', 'Database Management', 'Database design and SQL programming', 3, true),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'IT301', 'Web Development', 'Modern web technologies and frameworks', 3, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample batches
INSERT INTO batches (id, program_id, name, start_date, end_date, is_active) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'BA-2024-A', '2024-01-15', '2027-12-31', true),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'ENG-2024-A', '2024-01-15', '2027-12-31', true),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'IT-2024-A', '2024-01-15', '2027-12-31', true)
ON CONFLICT (id) DO NOTHING;
