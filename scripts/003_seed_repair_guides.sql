-- Seed repair guides for Vernacular Fix Hub (idempotent)

-- Each INSERT below runs only if a matching title+model+issue_category does not already exist.

INSERT INTO public.repair_guides (device_type, brand, model, issue_category, title, description, steps, difficulty_level, estimated_time_minutes, tools_required, language, success_rate)
SELECT 'smartphone', 'Apple', 'iPhone 13', 'battery', 'Replace iPhone 13 Battery', 'Step-by-step guide to replace a degraded battery in iPhone 13',
  '[{"title": "Power Off Device", "description": "Turn off your iPhone completely", "warnings": ["Ensure device is powered off before proceeding"]},
    {"title": "Remove SIM Tray", "description": "Use SIM ejector tool to remove the SIM tray", "tips": ["Keep the SIM tray in a safe place"]},
    {"title": "Remove Pentalobe Screws", "description": "Remove the two pentalobe screws at the bottom", "warnings": ["Do not lose these screws"]},
    {"title": "Separate Screen", "description": "Carefully separate the screen using a suction cup", "tips": ["Heat the edges slightly for easier separation"]},
    {"title": "Disconnect Battery", "description": "Disconnect the battery connector", "warnings": ["Be careful not to damage the connector"]},
    {"title": "Remove Old Battery", "description": "Peel off adhesive strips and remove the battery", "tips": ["Use isopropyl alcohol to remove adhesive residue"]},
    {"title": "Install New Battery", "description": "Place new battery and connect the connector", "warnings": ["Ensure proper alignment before connecting"]},
    {"title": "Reassemble Device", "description": "Reassemble all components in reverse order", "tips": ["Test before fully sealing"]}]'::jsonb,
  'medium', 45, ARRAY['Pentalobe screwdriver', 'Suction cup', 'Spudger', 'Battery replacement kit'], 'en', 0.92
WHERE NOT EXISTS (
  SELECT 1 FROM public.repair_guides rg WHERE rg.title = 'Replace iPhone 13 Battery' AND rg.model = 'iPhone 13' AND rg.issue_category = 'battery'
);

INSERT INTO public.repair_guides (device_type, brand, model, issue_category, title, description, steps, difficulty_level, estimated_time_minutes, tools_required, language, success_rate)
SELECT 'smartphone', 'Samsung', 'Galaxy A12', 'screen', 'Replace Samsung Galaxy A12 Screen', 'Guide to replace a cracked or damaged screen',
  '[{"title": "Power Off Device", "description": "Turn off your Galaxy A12 completely"},
    {"title": "Remove Back Cover", "description": "Carefully peel off the back cover"},
    {"title": "Disconnect Battery", "description": "Disconnect the battery connector"},
    {"title": "Remove Screen Connector", "description": "Disconnect the screen flex cable"},
    {"title": "Remove Old Screen", "description": "Carefully remove the damaged screen"},
    {"title": "Install New Screen", "description": "Place new screen and connect the flex cable"},
    {"title": "Reconnect Battery", "description": "Reconnect the battery connector"},
    {"title": "Reassemble Device", "description": "Put back the cover and power on"}]'::jsonb,
  'medium', 40, ARRAY['Screwdriver set', 'Spudger', 'Screen replacement kit'], 'en', 0.88
WHERE NOT EXISTS (
  SELECT 1 FROM public.repair_guides rg WHERE rg.title = 'Replace Samsung Galaxy A12 Screen' AND rg.model = 'Galaxy A12' AND rg.issue_category = 'screen'
);

INSERT INTO public.repair_guides (device_type, brand, model, issue_category, title, description, steps, difficulty_level, estimated_time_minutes, tools_required, language, success_rate)
SELECT 'smartphone', 'Apple', 'iPhone 13', 'charging', 'Fix iPhone 13 Charging Issues', 'Troubleshoot and fix common charging problems',
  '[{"title": "Clean Charging Port", "description": "Use a small brush to clean the charging port", "tips": ["Use compressed air for better results"]},
    {"title": "Check Cable", "description": "Inspect the charging cable for damage"},
    {"title": "Try Different Charger", "description": "Test with a different charger and cable"},
    {"title": "Force Restart", "description": "Force restart your iPhone", "tips": ["This can resolve software issues"]},
    {"title": "Update iOS", "description": "Check for and install iOS updates"},
    {"title": "Reset Settings", "description": "Reset network settings if issue persists"}]'::jsonb,
  'easy', 15, ARRAY['Small brush', 'Compressed air'], 'en', 0.95
WHERE NOT EXISTS (
  SELECT 1 FROM public.repair_guides rg WHERE rg.title = 'Fix iPhone 13 Charging Issues' AND rg.model = 'iPhone 13' AND rg.issue_category = 'charging'
);

INSERT INTO public.repair_guides (device_type, brand, model, issue_category, title, description, steps, difficulty_level, estimated_time_minutes, tools_required, language, success_rate)
SELECT 'smartphone', 'Samsung', 'Galaxy A12', 'software', 'Fix Samsung Galaxy A12 Software Issues', 'Resolve common software problems',
  '[{"title": "Clear Cache", "description": "Clear app cache to improve performance"},
    {"title": "Uninstall Problem Apps", "description": "Remove recently installed problematic apps"},
    {"title": "Factory Reset", "description": "Perform a factory reset if issues persist", "warnings": ["This will erase all data"]},
    {"title": "Update Android", "description": "Check for and install Android updates"}]'::jsonb,
  'easy', 20, ARRAY[]::text[], 'en', 0.90
WHERE NOT EXISTS (
  SELECT 1 FROM public.repair_guides rg WHERE rg.title = 'Fix Samsung Galaxy A12 Software Issues' AND rg.model = 'Galaxy A12' AND rg.issue_category = 'software'
);

INSERT INTO public.repair_guides (device_type, brand, model, issue_category, title, description, steps, difficulty_level, estimated_time_minutes, tools_required, language, success_rate)
SELECT 'smartphone', 'Apple', 'iPhone 13', 'battery', 'iPhone 13 ब्याटरी बदलें', 'iPhone 13 में खराब ब्याटरी को बदलने के लिए चरण-दर-चरण गाइड',
  '[{"title": "डिवाइस बंद करें", "description": "अपने iPhone को पूरी तरह बंद करें"},
    {"title": "SIM ट्रे निकालें", "description": "SIM इजेक्टर टूल का उपयोग करके SIM ट्रे निकालें"},
    {"title": "पेंटालोब स्क्रू हटाएं", "description": "नीचे के दो पेंटालोब स्क्रू हटाएं"},
    {"title": "स्क्रीन अलग करें", "description": "सक्शन कप का उपयोग करके स्क्रीन को सावधानीपूर्वक अलग करें"},
    {"title": "ब्याटरी डिस्कनेक्ट करें", "description": "ब्याटरी कनेक्टर को डिस्कनेक्ट करें"},
    {"title": "पुरानी ब्याटरी निकालें", "description": "चिपकने वाली पट्टियों को छीलें और ब्याटरी निकालें"},
    {"title": "नई ब्याटरी लगाएं", "description": "नई ब्याटरी रखें और कनेक्टर को कनेक्ट करें"},
    {"title": "डिवाइस को फिर से जोड़ें", "description": "सभी घटकों को विपरीत क्रम में फिर से जोड़ें"}]'::jsonb,
  'medium', 45, ARRAY['Pentalobe screwdriver', 'Suction cup', 'Spudger', 'Battery replacement kit'], 'hi', 0.92
WHERE NOT EXISTS (
  SELECT 1 FROM public.repair_guides rg WHERE rg.title = 'iPhone 13 ब्याटरी बदलें' AND rg.model = 'iPhone 13' AND rg.issue_category = 'battery'
);
