-- Test basic database operations
SELECT 'Database connection successful' as status;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('services', 'customers', 'appointments', 'contact_messages', 'admin_users');

-- Check services count
SELECT COUNT(*) as services_count FROM services;

-- Test inserting a contact message (this should work now)
INSERT INTO contact_messages (first_name, last_name, email, message) 
VALUES ('Test', 'User', 'test@example.com', 'Test message from SQL script');

-- Verify the insert worked
SELECT COUNT(*) as contact_messages_count FROM contact_messages;
