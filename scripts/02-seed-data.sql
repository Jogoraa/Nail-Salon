-- Insert sample services
INSERT INTO services (name, description, price, duration, image_url) VALUES
('Classic Manicure', 'Traditional nail care with cuticle treatment, shaping, and polish', 35.00, 45, '/placeholder.svg?height=300&width=400'),
('Gel Manicure', 'Long-lasting gel polish that stays chip-free for weeks', 45.00, 60, '/placeholder.svg?height=300&width=400'),
('Luxury Pedicure', 'Complete foot treatment with exfoliation, massage, and polish', 55.00, 75, '/placeholder.svg?height=300&width=400'),
('Nail Art Design', 'Custom artistic designs and intricate nail decorations', 65.00, 90, '/placeholder.svg?height=300&width=400'),
('Acrylic Extensions', 'Durable acrylic nail extensions for length and strength', 60.00, 120, '/placeholder.svg?height=300&width=400'),
('Dip Powder Nails', 'Healthy alternative to gel with vibrant, long-lasting color', 50.00, 75, '/placeholder.svg?height=300&width=400');

-- Insert sample admin user (you'll need to add this email to your Supabase auth)
INSERT INTO admin_users (email) VALUES ('admin@nailblissstudio.com');
