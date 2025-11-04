-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS payments CASCADE;

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  intake_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('complete', 'installment')),
  proof_file_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  amount DECIMAL(10, 2),
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_program_id ON payments(program_id);
CREATE INDEX IF NOT EXISTS idx_payments_intake_id ON payments(intake_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_uploaded_at ON payments(uploaded_at);

-- Add RLS policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Students can view their own payments
CREATE POLICY "Students can view their own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own payments
CREATE POLICY "Students can insert their own payments"
  ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Admin and instructors can view all payments
CREATE POLICY "Admin and instructors can view all payments"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'instructor')
    )
  );

-- Admin can update payment status
CREATE POLICY "Admin can update payments"
  ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE payments IS 'Stores student payment records and proof documents';
