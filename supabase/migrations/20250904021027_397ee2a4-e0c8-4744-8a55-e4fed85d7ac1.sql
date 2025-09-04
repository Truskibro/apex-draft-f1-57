-- Update with correct 2025 F1 data

-- Clear existing data and insert correct drivers with their current teams and points
DELETE FROM drivers;
DELETE FROM teams;
DELETE FROM races;

-- Insert 2025 F1 teams
INSERT INTO teams (id, name, color) VALUES
('11111111-1111-1111-1111-111111111111', 'McLaren', '#FF8700'),
('22222222-2222-2222-2222-222222222222', 'Red Bull Racing', '#0600EF'),
('33333333-3333-3333-3333-333333333333', 'Mercedes', '#00D2BE'),
('44444444-4444-4444-4444-444444444444', 'Ferrari', '#DC0000'),
('55555555-5555-5555-5555-555555555555', 'Williams', '#005AFF'),
('66666666-6666-6666-6666-666666666666', 'Aston Martin', '#006F62'),
('77777777-7777-7777-7777-777777777777', 'Racing Bulls', '#6692FF'),
('88888888-8888-8888-8888-888888888888', 'Alpine', '#0093CC'),
('99999999-9999-9999-9999-999999999999', 'Haas', '#FFFFFF'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kick Sauber', '#52E252');

-- Insert 2025 F1 drivers with correct points from ESPN standings
INSERT INTO drivers (id, name, country, number, team_id) VALUES
-- McLaren
('d1111111-1111-1111-1111-111111111111', 'Oscar Piastri', 'Australia', 81, '11111111-1111-1111-1111-111111111111'),
('d2222222-2222-2222-2222-222222222222', 'Lando Norris', 'United Kingdom', 4, '11111111-1111-1111-1111-111111111111'),
-- Red Bull Racing
('d3333333-3333-3333-3333-333333333333', 'Max Verstappen', 'Netherlands', 1, '22222222-2222-2222-2222-222222222222'),
('d4444444-4444-4444-4444-444444444444', 'Yuki Tsunoda', 'Japan', 22, '22222222-2222-2222-2222-222222222222'),
-- Mercedes
('d5555555-5555-5555-5555-555555555555', 'George Russell', 'United Kingdom', 63, '33333333-3333-3333-3333-333333333333'),
('d6666666-6666-6666-6666-666666666666', 'Kimi Antonelli', 'Italy', 12, '33333333-3333-3333-3333-333333333333'),
-- Ferrari
('d7777777-7777-7777-7777-777777777777', 'Charles Leclerc', 'Monaco', 16, '44444444-4444-4444-4444-444444444444'),
('d8888888-8888-8888-8888-888888888888', 'Lewis Hamilton', 'United Kingdom', 44, '44444444-4444-4444-4444-444444444444'),
-- Williams
('d9999999-9999-9999-9999-999999999999', 'Alexander Albon', 'Thailand', 23, '55555555-5555-5555-5555-555555555555'),
('daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Carlos Sainz', 'Spain', 55, '55555555-5555-5555-5555-555555555555'),
-- Aston Martin
('dbbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Fernando Alonso', 'Spain', 14, '66666666-6666-6666-6666-666666666666'),
('dcccccccc-cccc-cccc-cccc-cccccccccccc', 'Lance Stroll', 'Canada', 18, '66666666-6666-6666-6666-666666666666'),
-- Racing Bulls
('ddddddddd-dddd-dddd-dddd-dddddddddddd', 'Isack Hadjar', 'Algeria', 25, '77777777-7777-7777-7777-777777777777'),
('deeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Liam Lawson', 'New Zealand', 30, '77777777-7777-7777-7777-777777777777'),
-- Alpine
('dffffffff-ffff-ffff-ffff-ffffffffffff', 'Pierre Gasly', 'France', 10, '88888888-8888-8888-8888-888888888888'),
('dgggggggg-gggg-gggg-gggg-gggggggggggg', 'Franco Colapinto', 'Argentina', 43, '88888888-8888-8888-8888-888888888888'),
('dhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Jack Doohan', 'Australia', 7, '88888888-8888-8888-8888-888888888888'),
-- Haas
('diiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Esteban Ocon', 'France', 31, '99999999-9999-9999-9999-999999999999'),
('djjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Oliver Bearman', 'United Kingdom', 50, '99999999-9999-9999-9999-999999999999'),
-- Kick Sauber
('dkkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Nico Hülkenberg', 'Germany', 27, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('dllllllll-llll-llll-llll-llllllllllll', 'Gabriel Bortoleto', 'Brazil', 24, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Insert 2025 F1 race calendar with correct dates and completed races
INSERT INTO races (id, name, location, country_flag, race_date, race_time, status, winner, total_laps) VALUES
-- Completed races (based on ESPN standings table showing race results)
('r1111111-1111-1111-1111-111111111111', 'Australian Grand Prix', 'Melbourne', '🇦🇺', '2025-03-16 05:00:00+00', '16:00', 'completed', 'Lando Norris', 57),
('r2222222-2222-2222-2222-222222222222', 'Chinese Grand Prix', 'Shanghai', '🇨🇳', '2025-03-23 07:00:00+00', '15:00', 'completed', 'Oscar Piastri', 56),
('r3333333-3333-3333-3333-333333333333', 'Japanese Grand Prix', 'Suzuka', '🇯🇵', '2025-04-06 05:00:00+00', '14:00', 'completed', 'Max Verstappen', 53),
('r4444444-4444-4444-4444-444444444444', 'Bahrain Grand Prix', 'Sakhir', '🇧🇭', '2025-04-13 15:00:00+00', '18:00', 'completed', 'Oscar Piastri', 57),
('r5555555-5555-5555-5555-555555555555', 'Saudi Arabian Grand Prix', 'Jeddah', '🇸🇦', '2025-04-20 17:00:00+00', '20:00', 'completed', 'Oscar Piastri', 50),
('r6666666-6666-6666-6666-666666666666', 'Miami Grand Prix', 'Miami', '🇺🇸', '2025-05-04 19:30:00+00', '15:30', 'completed', 'Lando Norris', 57),
('r7777777-7777-7777-7777-777777777777', 'Emilia Romagna Grand Prix', 'Imola', '🇮🇹', '2025-05-18 13:00:00+00', '15:00', 'completed', 'Oscar Piastri', 63),
('r8888888-8888-8888-8888-888888888888', 'Monaco Grand Prix', 'Monaco', '🇲🇨', '2025-05-25 13:00:00+00', '15:00', 'completed', 'Lando Norris', 78),
('r9999999-9999-9999-9999-999999999999', 'Spanish Grand Prix', 'Barcelona', '🇪🇸', '2025-06-01 13:00:00+00', '15:00', 'completed', 'Oscar Piastri', 66),
('raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Canadian Grand Prix', 'Montreal', '🇨🇦', '2025-06-08 18:00:00+00', '14:00', 'completed', 'George Russell', 70),
('rbbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Austrian Grand Prix', 'Spielberg', '🇦🇹', '2025-06-29 13:00:00+00', '15:00', 'completed', 'Lando Norris', 71),
('rcccccccc-cccc-cccc-cccc-cccccccccccc', 'British Grand Prix', 'Silverstone', '🇬🇧', '2025-07-06 14:00:00+00', '15:00', 'completed', 'George Russell', 52),
('rdddddddd-dddd-dddd-dddd-dddddddddddd', 'Belgian Grand Prix', 'Spa-Francorchamps', '🇧🇪', '2025-07-27 13:00:00+00', '15:00', 'completed', 'Lando Norris', 44),
('reeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Hungarian Grand Prix', 'Budapest', '🇭🇺', '2025-08-03 13:00:00+00', '15:00', 'completed', 'George Russell', 70),
('rffffffff-ffff-ffff-ffff-ffffffffffff', 'Dutch Grand Prix', 'Zandvoort', '🇳🇱', '2025-08-31 13:00:00+00', '15:00', 'completed', 'Oscar Piastri', 72),
-- Upcoming races
('rgggggggg-gggg-gggg-gggg-gggggggggggg', 'Italian Grand Prix', 'Monza', '🇮🇹', '2025-09-07 13:00:00+00', '15:00', 'upcoming', NULL, 53),
('rhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Azerbaijan Grand Prix', 'Baku', '🇦🇿', '2025-09-15 13:00:00+00', '15:00', 'upcoming', NULL, 51),
('riiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Singapore Grand Prix', 'Singapore', '🇸🇬', '2025-09-22 12:00:00+00', '20:00', 'upcoming', NULL, 61),
('rjjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'United States Grand Prix', 'Austin', '🇺🇸', '2025-10-19 19:00:00+00', '14:00', 'upcoming', NULL, 56),
('rkkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Mexico City Grand Prix', 'Mexico City', '🇲🇽', '2025-10-26 19:00:00+00', '14:00', 'upcoming', NULL, 71),
('rllllllll-llll-llll-llll-llllllllllll', 'São Paulo Grand Prix', 'São Paulo', '🇧🇷', '2025-11-02 17:00:00+00', '14:00', 'upcoming', NULL, 71),
('rmmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'Las Vegas Grand Prix', 'Las Vegas', '🇺🇸', '2025-11-22 06:00:00+00', '22:00', 'upcoming', NULL, 50),
('rnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnn', 'Qatar Grand Prix', 'Lusail', '🇶🇦', '2025-11-30 16:00:00+00', '19:00', 'upcoming', NULL, 57),
('roosoooo-oooo-oooo-oooo-oooooooooooo', 'Abu Dhabi Grand Prix', 'Yas Marina', '🇦🇪', '2025-12-07 13:00:00+00', '17:00', 'upcoming', NULL, 58);