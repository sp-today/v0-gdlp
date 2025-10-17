-- Seed repair centers database

INSERT INTO public.repair_centers (user_id, center_name, location, latitude, longitude, phone_number, email, rating, total_reviews, is_verified, specializations) VALUES
((SELECT id FROM public.profiles LIMIT 1), 'TechFix Delhi', 'Connaught Place, New Delhi', 28.6329, 77.1197, '+91-11-4567-8901', 'contact@techfixdelhi.com', 4.8, 245, TRUE, ARRAY['smartphone', 'laptop', 'tablet']),
((SELECT id FROM public.profiles LIMIT 1), 'Mobile Care Mumbai', 'Bandra, Mumbai', 19.0596, 72.8295, '+91-22-1234-5678', 'support@mobilecaremumbai.com', 4.6, 189, TRUE, ARRAY['smartphone', 'smartwatch']),
((SELECT id FROM public.profiles LIMIT 1), 'Laptop Experts Bangalore', 'Indiranagar, Bangalore', 12.9716, 77.6412, '+91-80-9876-5432', 'info@laptopexpertsbng.com', 4.7, 156, TRUE, ARRAY['laptop', 'tablet']),
((SELECT id FROM public.profiles LIMIT 1), 'Device Hospital Hyderabad', 'Hitech City, Hyderabad', 17.3850, 78.4867, '+91-40-5555-6666', 'hello@devicehospital.com', 4.5, 203, TRUE, ARRAY['smartphone', 'laptop', 'smartwatch']),
((SELECT id FROM public.profiles LIMIT 1), 'Quick Repair Chennai', 'T. Nagar, Chennai', 13.0341, 80.2622, '+91-44-2222-3333', 'service@quickrepairchennai.com', 4.4, 127, TRUE, ARRAY['smartphone', 'headphones']);
