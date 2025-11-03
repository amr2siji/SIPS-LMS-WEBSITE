# Quick Setup Guide - Comprehensive Registration Form

## Step 1: Apply Database Migration

### Using Supabase Dashboard (Recommended):

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"+ New Query"**
4. Copy and paste the following SQL:

```sql
-- Add comprehensive registration fields to registrations table
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS name_with_initials text,
  ADD COLUMN IF NOT EXISTS nic text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS permanent_address text,
  ADD COLUMN IF NOT EXISTS mobile_number text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text,
  ADD COLUMN IF NOT EXISTS emergency_contact_mobile text,
  ADD COLUMN IF NOT EXISTS ol_qualifications text,
  ADD COLUMN IF NOT EXISTS al_qualifications text,
  ADD COLUMN IF NOT EXISTS other_qualifications text,
  ADD COLUMN IF NOT EXISTS nic_document_url text,
  ADD COLUMN IF NOT EXISTS birth_certificate_url text,
  ADD COLUMN IF NOT EXISTS qualification_certificate_url text;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_registrations_nic ON registrations(nic);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
```

5. Click **"Run"** to execute the migration
6. Verify success message appears

## Step 2: Setup Storage Buckets

### Check if 'documents' bucket exists:

1. Go to **Storage** in Supabase Dashboard (left sidebar)
2. If `documents` bucket doesn't exist:
   - Click **"+ New bucket"**
   - Name: `documents`
   - Public bucket: **No** (for security)
   - Click **"Create bucket"**

### Create folder structure:

The following folders will be created automatically when files are uploaded:
- `nic-documents/`
- `birth-certificates/`
- `qualification-certificates/`
- `payment-proofs/`

### Configure bucket permissions:

1. Click on the `documents` bucket
2. Click **"Policies"** tab
3. Add a policy to allow inserts:

```sql
-- Allow anonymous users to upload documents
CREATE POLICY "Anyone can upload documents"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'documents');
```

4. Add a policy to allow reading (optional - if documents should be viewable):

```sql
-- Allow authenticated users to read documents
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

## Step 3: Test the Registration Form

1. Open your LMS website
2. Navigate to the **Register Online** page (`/register`)
3. Fill in all required fields:
   - Personal Information (4 fields)
   - Contact Information (3 fields)
   - Emergency Contact (3 fields)
   - Educational Qualifications (3 fields)
   - Programme Selection (1 field)
   - Document Uploads (4 files)

4. Click **"Submit Registration"**
5. Verify success message appears
6. Check Supabase Dashboard → **Table Editor** → `registrations` table
7. Confirm new record exists with all data

## Step 4: Verify File Uploads

1. Go to **Storage** → `documents` bucket in Supabase Dashboard
2. Check that folders were created:
   - `nic-documents/`
   - `birth-certificates/`
   - `qualification-certificates/`
   - `payment-proofs/`
3. Verify files were uploaded with unique names (timestamp-random.extension)

## Step 5: (Optional) Regenerate TypeScript Types

To remove the temporary type workaround in `Register.tsx`:

```bash
# If you have Supabase CLI set up:
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

Then in `Register.tsx`, replace:
```typescript
const { error: insertError } = await (supabase as any)
```

With:
```typescript
const { error: insertError } = await supabase
```

## Troubleshooting

### Issue: "Failed to submit registration"
**Solution:** Check browser console for specific error. Common causes:
- Storage bucket doesn't exist or has wrong permissions
- File size exceeds 50MB limit
- Network connection issue
- Missing required fields

### Issue: "File upload failed"
**Solution:** 
- Verify `documents` bucket exists
- Check storage bucket policies allow inserts
- Ensure file size is under 50MB
- Confirm file type is PDF, JPG, JPEG, or PNG

### Issue: TypeScript errors in Register.tsx
**Solution:** This is expected until database types are regenerated. The form will still work correctly. The `(supabase as any)` workaround bypasses the type checking.

### Issue: Programme dropdown is empty
**Solution:**
- Check that programmes exist in the `programs` table
- Ensure programmes have `is_active = true`
- Verify RLS policies allow public read access to programs table

## What's Next?

After setup is complete:
1. Test registration flow thoroughly
2. Create admin dashboard view for reviewing registrations
3. Set up email notifications for new registrations
4. Consider adding payment gateway integration
5. Create student account creation workflow from approved registrations

## Quick Test Data

Use this for testing:

```
Full Name: Test Student
Name with Initials: T.S. Kumar
NIC: 199912345678
Date of Birth: 1999-05-20
Permanent Address: 456 Test Road, Colombo 07
Mobile: 0771234567
Email: test@example.com
Emergency Contact: Parent Name
Relationship: Father
Emergency Mobile: 0779876543
O/L: 9A's (Year: 2015)
A/L: 3A's - Physical Science (Year: 2018)
Other Qualifications: (leave empty or add diploma info)
```

Upload any PDF or image file under 50MB for the 4 document uploads.

---

**Setup Time:** ~10 minutes
**Difficulty:** Easy
**Prerequisites:** Supabase project access, Storage enabled

✅ After completing these steps, your comprehensive registration form will be fully functional!
