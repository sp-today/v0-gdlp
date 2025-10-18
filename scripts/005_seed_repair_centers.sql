-- Seed repair centers database (idempotent)

-- Ensure a placeholder auth user exists for repair centers. This creates one user in auth.users and a matching public.profiles row
-- only if no profiles of type 'repair_center' exist yet.

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_type = 'repair_center') THEN
		-- Create an auth user and profile for seeding repair centers
		INSERT INTO auth.users (id, email, encrypted_password)
		VALUES (gen_random_uuid(), 'seed+repair-centers@example.local', 'seed-placeholder')
		RETURNING id INTO STRICT _; -- we ignore the returned id here, will fetch below
	END IF;
END$$;

-- Get a user id to assign to repair centers: prefer an existing repair_center profile, otherwise the first profile.
WITH seed_user AS (
	SELECT id FROM public.profiles WHERE user_type = 'repair_center' LIMIT 1
	UNION ALL
	SELECT id FROM public.profiles LIMIT 1
)
INSERT INTO public.repair_centers (user_id, center_name, location, latitude, longitude, phone_number, email, rating, total_reviews, is_verified, specializations)
SELECT su.id, data.center_name, data.location, data.latitude, data.longitude, data.phone_number, data.email, data.rating, data.total_reviews, data.is_verified, data.specializations
FROM (
	VALUES
		('TechFix Delhi', 'Connaught Place, New Delhi', 28.6329::numeric, 77.1197::numeric, '+91-11-4567-8901', 'contact@techfixdelhi.com', 4.8::numeric, 245::int, TRUE, ARRAY['smartphone', 'laptop', 'tablet']),
		('Mobile Care Mumbai', 'Bandra, Mumbai', 19.0596::numeric, 72.8295::numeric, '+91-22-1234-5678', 'support@mobilecaremumbai.com', 4.6::numeric, 189::int, TRUE, ARRAY['smartphone', 'smartwatch']),
		('Laptop Experts Bangalore', 'Indiranagar, Bangalore', 12.9716::numeric, 77.6412::numeric, '+91-80-9876-5432', 'info@laptopexpertsbng.com', 4.7::numeric, 156::int, TRUE, ARRAY['laptop', 'tablet']),
		('Device Hospital Hyderabad', 'Hitech City, Hyderabad', 17.3850::numeric, 78.4867::numeric, '+91-40-5555-6666', 'hello@devicehospital.com', 4.5::numeric, 203::int, TRUE, ARRAY['smartphone', 'laptop', 'smartwatch']),
		('Quick Repair Chennai', 'T. Nagar, Chennai', 13.0341::numeric, 80.2622::numeric, '+91-44-2222-3333', 'service@quickrepairchennai.com', 4.4::numeric, 127::int, TRUE, ARRAY['smartphone', 'headphones'])
	) AS data(center_name, location, latitude, longitude, phone_number, email, rating, total_reviews, is_verified, specializations),
	(SELECT id FROM seed_user LIMIT 1) su
ON CONFLICT (user_id, center_name) DO NOTHING;
