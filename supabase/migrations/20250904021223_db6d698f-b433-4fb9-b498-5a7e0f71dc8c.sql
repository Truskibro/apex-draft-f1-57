-- Update with correct 2025 F1 data

-- Clear existing data and insert correct drivers with their current teams and points
DELETE FROM drivers;
DELETE FROM teams;
DELETE FROM races;

-- Insert 2025 F1 teams
INSERT INTO teams (name, color) VALUES
('McLaren', '#FF8700'),
('Red Bull Racing', '#0600EF'),
('Mercedes', '#00D2BE'),
('Ferrari', '#DC0000'),
('Williams', '#005AFF'),
('Aston Martin', '#006F62'),
('Racing Bulls', '#6692FF'),
('Alpine', '#0093CC'),
('Haas', '#FFFFFF'),
('Kick Sauber', '#52E252');

-- Insert 2025 F1 drivers with correct teams
INSERT INTO drivers (name, country, number, team_id) VALUES
-- McLaren drivers
('Oscar Piastri', 'Australia', 81, (SELECT id FROM teams WHERE name = 'McLaren')),
('Lando Norris', 'United Kingdom', 4, (SELECT id FROM teams WHERE name = 'McLaren')),
-- Red Bull Racing drivers
('Max Verstappen', 'Netherlands', 1, (SELECT id FROM teams WHERE name = 'Red Bull Racing')),
('Yuki Tsunoda', 'Japan', 22, (SELECT id FROM teams WHERE name = 'Red Bull Racing')),
-- Mercedes drivers
('George Russell', 'United Kingdom', 63, (SELECT id FROM teams WHERE name = 'Mercedes')),
('Kimi Antonelli', 'Italy', 12, (SELECT id FROM teams WHERE name = 'Mercedes')),
-- Ferrari drivers
('Charles Leclerc', 'Monaco', 16, (SELECT id FROM teams WHERE name = 'Ferrari')),
('Lewis Hamilton', 'United Kingdom', 44, (SELECT id FROM teams WHERE name = 'Ferrari')),
-- Williams drivers
('Alexander Albon', 'Thailand', 23, (SELECT id FROM teams WHERE name = 'Williams')),
('Carlos Sainz', 'Spain', 55, (SELECT id FROM teams WHERE name = 'Williams')),
-- Aston Martin drivers
('Fernando Alonso', 'Spain', 14, (SELECT id FROM teams WHERE name = 'Aston Martin')),
('Lance Stroll', 'Canada', 18, (SELECT id FROM teams WHERE name = 'Aston Martin')),
-- Racing Bulls drivers
('Isack Hadjar', 'Algeria', 25, (SELECT id FROM teams WHERE name = 'Racing Bulls')),
('Liam Lawson', 'New Zealand', 30, (SELECT id FROM teams WHERE name = 'Racing Bulls')),
-- Alpine drivers
('Pierre Gasly', 'France', 10, (SELECT id FROM teams WHERE name = 'Alpine')),
('Franco Colapinto', 'Argentina', 43, (SELECT id FROM teams WHERE name = 'Alpine')),
('Jack Doohan', 'Australia', 7, (SELECT id FROM teams WHERE name = 'Alpine')),
-- Haas drivers
('Esteban Ocon', 'France', 31, (SELECT id FROM teams WHERE name = 'Haas')),
('Oliver Bearman', 'United Kingdom', 50, (SELECT id FROM teams WHERE name = 'Haas')),
-- Kick Sauber drivers
('Nico Hülkenberg', 'Germany', 27, (SELECT id FROM teams WHERE name = 'Kick Sauber')),
('Gabriel Bortoleto', 'Brazil', 24, (SELECT id FROM teams WHERE name = 'Kick Sauber'));

-- Insert 2025 F1 race calendar with correct dates and completed races
INSERT INTO races (name, location, country_flag, race_date, race_time, status, winner, total_laps) VALUES
-- Completed races (based on ESPN standings table showing race results)
('Australian Grand Prix', 'Melbourne', '🇦🇺', '2025-03-16 05:00:00+00', '16:00', 'completed', 'Lando Norris', 57),
('Chinese Grand Prix', 'Shanghai', '🇨🇳', '2025-03-23 07:00:00+00', '15:00', 'completed', 'Oscar Piastri', 56),
('Japanese Grand Prix', 'Suzuka', '🇯🇵', '2025-04-06 05:00:00+00', '14:00', 'completed', 'Max Verstappen', 53),
('Bahrain Grand Prix', 'Sakhir', '🇧🇭', '2025-04-13 15:00:00+00', '18:00', 'completed', 'Oscar Piastri', 57),
('Saudi Arabian Grand Prix', 'Jeddah', '🇸🇦', '2025-04-20 17:00:00+00', '20:00', 'completed', 'Oscar Piastri', 50),
('Miami Grand Prix', 'Miami', '🇺🇸', '2025-05-04 19:30:00+00', '15:30', 'completed', 'Lando Norris', 57),
('Emilia Romagna Grand Prix', 'Imola', '🇮🇹', '2025-05-18 13:00:00+00', '15:00', 'completed', 'Oscar Piastri', 63),
('Monaco Grand Prix', 'Monaco', '🇲🇨', '2025-05-25 13:00:00+00', '15:00', 'completed', 'Lando Norris', 78),
('Spanish Grand Prix', 'Barcelona', '🇪🇸', '2025-06-01 13:00:00+00', '15:00', 'completed', 'Oscar Piastri', 66),
('Canadian Grand Prix', 'Montreal', '🇨🇦', '2025-06-08 18:00:00+00', '14:00', 'completed', 'George Russell', 70),
('Austrian Grand Prix', 'Spielberg', '🇦🇹', '2025-06-29 13:00:00+00', '15:00', 'completed', 'Lando Norris', 71),
('British Grand Prix', 'Silverstone', '🇬🇧', '2025-07-06 14:00:00+00', '15:00', 'completed', 'George Russell', 52),
('Belgian Grand Prix', 'Spa-Francorchamps', '🇧🇪', '2025-07-27 13:00:00+00', '15:00', 'completed', 'Lando Norris', 44),
('Hungarian Grand Prix', 'Budapest', '🇭🇺', '2025-08-03 13:00:00+00', '15:00', 'completed', 'George Russell', 70),
('Dutch Grand Prix', 'Zandvoort', '🇳🇱', '2025-08-31 13:00:00+00', '15:00', 'completed', 'Oscar Piastri', 72),
-- Upcoming races
('Italian Grand Prix', 'Monza', '🇮🇹', '2025-09-07 13:00:00+00', '15:00', 'upcoming', NULL, 53),
('Azerbaijan Grand Prix', 'Baku', '🇦🇿', '2025-09-15 13:00:00+00', '15:00', 'upcoming', NULL, 51),
('Singapore Grand Prix', 'Singapore', '🇸🇬', '2025-09-22 12:00:00+00', '20:00', 'upcoming', NULL, 61),
('United States Grand Prix', 'Austin', '🇺🇸', '2025-10-19 19:00:00+00', '14:00', 'upcoming', NULL, 56),
('Mexico City Grand Prix', 'Mexico City', '🇲🇽', '2025-10-26 19:00:00+00', '14:00', 'upcoming', NULL, 71),
('São Paulo Grand Prix', 'São Paulo', '🇧🇷', '2025-11-02 17:00:00+00', '14:00', 'upcoming', NULL, 71),
('Las Vegas Grand Prix', 'Las Vegas', '🇺🇸', '2025-11-22 06:00:00+00', '22:00', 'upcoming', NULL, 50),
('Qatar Grand Prix', 'Lusail', '🇶🇦', '2025-11-30 16:00:00+00', '19:00', 'upcoming', NULL, 57),
('Abu Dhabi Grand Prix', 'Yas Marina', '🇦🇪', '2025-12-07 13:00:00+00', '17:00', 'upcoming', NULL, 58);