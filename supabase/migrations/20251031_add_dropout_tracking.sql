-- Add dropout tracking fields to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS dropout_reason text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS dropout_date date;

-- Add payment method and reference number to payments table if not exists
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'bank_transfer';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_number text;

-- Update applications table to track more details
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES programs(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_date timestamptz DEFAULT now();
ALTER TABLE applications ADD COLUMN IF NOT EXISTS remarks text;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_students_program ON students(program_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_program ON batches(program_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
