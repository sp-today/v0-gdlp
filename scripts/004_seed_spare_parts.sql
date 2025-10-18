-- Seed spare parts database with genuine and counterfeit parts (idempotent)

INSERT INTO public.spare_parts (part_name, part_number, device_type, brand, model, gs1_code, manufacturer, price, is_genuine, authenticity_verified_at)
VALUES
('iPhone 13 Battery', 'A2846', 'smartphone', 'Apple', 'iPhone 13', '8901234567890', 'Apple Inc.', 4999, TRUE, NOW()),
('iPhone 13 Screen', 'A2846-SCREEN', 'smartphone', 'Apple', 'iPhone 13', '8901234567891', 'Apple Inc.', 12999, TRUE, NOW()),
('Samsung Galaxy A12 Battery', 'EB-BA125ABU', 'smartphone', 'Samsung', 'Galaxy A12', '8901234567892', 'Samsung Electronics', 2499, TRUE, NOW()),
('Samsung Galaxy A12 Screen', 'GH96-13787A', 'smartphone', 'Samsung', 'Galaxy A12', '8901234567893', 'Samsung Electronics', 5999, TRUE, NOW()),
('Counterfeit iPhone 13 Battery', 'A2846-FAKE', 'smartphone', 'Apple', 'iPhone 13', '8901234567894', 'Unknown Manufacturer', 999, FALSE, NOW()),
('Counterfeit Samsung Battery', 'EB-BA125ABU-FAKE', 'smartphone', 'Samsung', 'Galaxy A12', '8901234567895', 'Unknown Manufacturer', 499, FALSE, NOW()),
('OnePlus 9 Battery', 'BLP829', 'smartphone', 'OnePlus', 'OnePlus 9', '8901234567896', 'OnePlus Technology', 2999, TRUE, NOW()),
('OnePlus 9 Screen', 'AMOLED-OP9', 'smartphone', 'OnePlus', 'OnePlus 9', '8901234567897', 'OnePlus Technology', 8999, TRUE, NOW()),
('MacBook Pro Charger', 'A1719', 'laptop', 'Apple', 'MacBook Pro 15', '8901234567898', 'Apple Inc.', 9999, TRUE, NOW()),
('Dell XPS Battery', 'WDXOR', 'laptop', 'Dell', 'XPS 13', '8901234567899', 'Dell Inc.', 5999, TRUE, NOW())
ON CONFLICT (part_number) DO NOTHING;
