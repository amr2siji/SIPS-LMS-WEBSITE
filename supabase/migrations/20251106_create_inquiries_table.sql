-- Create inquiries table for contact form submissions
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  program_id UUID REFERENCES public.programs(id),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiries"
  ON public.inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view all inquiries" ON public.inquiries;
CREATE POLICY "Admin can view all inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update inquiries" ON public.inquiries;
CREATE POLICY "Admin can update inquiries"
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP INDEX IF EXISTS idx_inquiries_status;
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
DROP INDEX IF EXISTS idx_inquiries_created_at;
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- Insert mock test data for inquiries
INSERT INTO public.inquiries (full_name, email, phone_number, program_id, message, status, created_at) VALUES
  (
    'Amal Perera',
    'amal.perera@email.com',
    '+94771234567',
    (SELECT id FROM public.programs WHERE name LIKE '%Business Management%' LIMIT 1),
    'I would like to know more about the admission requirements and course duration for the Business Management program.',
    'pending',
    NOW() - INTERVAL '2 days'
  ),
  (
    'Nisha Fernando',
    'nisha.fernando@email.com',
    '+94762345678',
    (SELECT id FROM public.programs WHERE name LIKE '%Information Technology%' LIMIT 1),
    'Can you provide information about the payment plans and scholarship opportunities for IT programs?',
    'pending',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Kasun Silva',
    'kasun.silva@email.com',
    '+94773456789',
    (SELECT id FROM public.programs WHERE name LIKE '%Accounting%' LIMIT 1),
    'What are the job prospects after completing the Accounting program? Are there any industry partnerships?',
    'contacted',
    NOW() - INTERVAL '5 days'
  ),
  (
    'Dilini Jayawardena',
    'dilini.j@email.com',
    '+94784567890',
    (SELECT id FROM public.programs WHERE name LIKE '%Marketing%' LIMIT 1),
    'I am interested in the Marketing program. Could you send me the detailed curriculum and fee structure?',
    'pending',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'Ranil Wickramasinghe',
    'ranil.w@email.com',
    '+94795678901',
    (SELECT id FROM public.programs WHERE name LIKE '%Computer Science%' LIMIT 1),
    'Do you offer weekend classes for Computer Science? I am currently working full-time.',
    'contacted',
    NOW() - INTERVAL '7 days'
  ),
  (
    'Chamari De Silva',
    'chamari.ds@email.com',
    '+94706789012',
    (SELECT id FROM public.programs WHERE name LIKE '%Tourism%' LIMIT 1),
    'What are the practical training opportunities in the Tourism Management program?',
    'resolved',
    NOW() - INTERVAL '10 days'
  ),
  (
    'Nuwan Bandara',
    'nuwan.bandara@email.com',
    '+94717890123',
    NULL,
    'I am interested in learning more about your institution and the programs you offer. Can someone contact me?',
    'pending',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'Sanduni Rajapaksa',
    'sanduni.r@email.com',
    '+94728901234',
    (SELECT id FROM public.programs WHERE name LIKE '%Human Resource%' LIMIT 1),
    'Are there any internship opportunities as part of the Human Resource Management program?',
    'contacted',
    NOW() - INTERVAL '4 days'
  ),
  (
    'Tharindu Gunasekara',
    'tharindu.g@email.com',
    '+94739012345',
    (SELECT id FROM public.programs WHERE name LIKE '%Software%' LIMIT 1),
    'What programming languages are covered in the Software Engineering course?',
    'pending',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'Malsha Kumari',
    'malsha.kumari@email.com',
    '+94780123456',
    (SELECT id FROM public.programs WHERE name LIKE '%Business%' LIMIT 1),
    'Is it possible to transfer credits from another institution to your Business program?',
    'resolved',
    NOW() - INTERVAL '15 days'
  );
