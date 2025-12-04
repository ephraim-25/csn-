-- Insert the 26 official provinces of DRC if they don't exist
INSERT INTO public.provinces (nom, code, chef_lieu) VALUES
  ('Kinshasa', 'KIN', 'Kinshasa'),
  ('Kongo-Central', 'KOC', 'Matadi'),
  ('Kwango', 'KWG', 'Kenge'),
  ('Kwilu', 'KWL', 'Kikwit'),
  ('Mai-Ndombe', 'MND', 'Inongo'),
  ('Équateur', 'EQU', 'Mbandaka'),
  ('Mongala', 'MON', 'Lisala'),
  ('Nord-Ubangi', 'NUB', 'Gbadolite'),
  ('Sud-Ubangi', 'SUB', 'Gemena'),
  ('Tshuapa', 'TSH', 'Boende'),
  ('Tshopo', 'TSP', 'Kisangani'),
  ('Bas-Uele', 'BUE', 'Buta'),
  ('Haut-Uele', 'HUE', 'Isiro'),
  ('Ituri', 'ITU', 'Bunia'),
  ('Nord-Kivu', 'NKV', 'Goma'),
  ('Sud-Kivu', 'SKV', 'Bukavu'),
  ('Maniema', 'MAN', 'Kindu'),
  ('Haut-Katanga', 'HKA', 'Lubumbashi'),
  ('Lualaba', 'LUA', 'Kolwezi'),
  ('Haut-Lomami', 'HLO', 'Kamina'),
  ('Tanganyika', 'TAN', 'Kalemie'),
  ('Lomami', 'LOM', 'Kabinda'),
  ('Kasaï-Oriental', 'KOR', 'Mbuji-Mayi'),
  ('Kasaï-Central', 'KCE', 'Kananga'),
  ('Kasaï', 'KAS', 'Tshikapa'),
  ('Sankuru', 'SAN', 'Lusambo')
ON CONFLICT DO NOTHING;

-- Insert the 3 required research centers
INSERT INTO public.centres_recherche (nom, acronyme, adresse, province_id, site_web, description) 
SELECT 
  'Institut de Recherche en Sciences de la Santé',
  'IRSS',
  'Avenue de la Science, Kinshasa',
  (SELECT id FROM public.provinces WHERE code = 'KIN' LIMIT 1),
  'https://irss.cd',
  'Institut national de recherche en sciences de la santé'
WHERE NOT EXISTS (SELECT 1 FROM public.centres_recherche WHERE acronyme = 'IRSS');

INSERT INTO public.centres_recherche (nom, acronyme, adresse, province_id, site_web, description) 
SELECT 
  'Centre de Recherche en Sciences Naturelles de Lwiro',
  'CRSN-Lwiro',
  'Lwiro, Kabare',
  (SELECT id FROM public.provinces WHERE code = 'SKV' LIMIT 1),
  'https://crsn-lwiro.cd',
  'Centre de recherche pluridisciplinaire en sciences naturelles'
WHERE NOT EXISTS (SELECT 1 FROM public.centres_recherche WHERE acronyme = 'CRSN-Lwiro');

INSERT INTO public.centres_recherche (nom, acronyme, adresse, province_id, site_web, description) 
SELECT 
  'Institut Géographique du Congo',
  'IGC',
  'Avenue des Cliniques, Kinshasa',
  (SELECT id FROM public.provinces WHERE code = 'KIN' LIMIT 1),
  'https://igc.cd',
  'Institut national de cartographie et géographie'
WHERE NOT EXISTS (SELECT 1 FROM public.centres_recherche WHERE acronyme = 'IGC');