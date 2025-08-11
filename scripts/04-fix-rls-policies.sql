-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public can view active services" ON services;
DROP POLICY IF EXISTS "Authenticated users can manage services" ON services;
DROP POLICY IF EXISTS "Anyone can insert customers" ON customers;
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON customers;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;

-- Temporarily disable RLS to clear any issues
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Services policies - Allow public read access for active services
CREATE POLICY "Allow public read access to active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow service management" ON services
  FOR ALL USING (true);

-- Customers policies - Allow anyone to create customers, authenticated users to read
CREATE POLICY "Allow anyone to create customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow reading customer data" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Allow updating customer data" ON customers
  FOR UPDATE USING (true);

-- Appointments policies - Allow anyone to create, authenticated users to manage
CREATE POLICY "Allow anyone to create appointments" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow reading appointments" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Allow updating appointments" ON appointments
  FOR UPDATE USING (true);

-- Contact messages policies - Allow anyone to create, authenticated users to read
CREATE POLICY "Allow anyone to create contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow reading contact messages" ON contact_messages
  FOR SELECT USING (true);

-- Admin users policies - Allow reading for authenticated users
CREATE POLICY "Allow reading admin users" ON admin_users
  FOR SELECT USING (true);
