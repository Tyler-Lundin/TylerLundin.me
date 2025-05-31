-- Create admin_passwords table
CREATE TABLE IF NOT EXISTS admin_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_1_hash TEXT NOT NULL,
  password_2_hash TEXT NOT NULL,
  password_3_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE admin_passwords ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read the password hashes
CREATE POLICY "Allow authenticated users to read password hashes"
  ON admin_passwords
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow service role to insert/update password hashes
CREATE POLICY "Allow service role to manage password hashes"
  ON admin_passwords
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_admin_passwords_updated_at
  BEFORE UPDATE ON admin_passwords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 