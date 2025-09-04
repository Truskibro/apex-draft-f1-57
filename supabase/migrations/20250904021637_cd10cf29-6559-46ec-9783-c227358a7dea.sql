-- Add championship points column to drivers table and update with correct 2025 values
ALTER TABLE drivers ADD COLUMN championship_points INTEGER DEFAULT 0;

-- Update drivers with correct 2025 championship points from ESPN standings
UPDATE drivers SET championship_points = 309 WHERE name = 'Oscar Piastri';
UPDATE drivers SET championship_points = 275 WHERE name = 'Lando Norris';
UPDATE drivers SET championship_points = 205 WHERE name = 'Max Verstappen';
UPDATE drivers SET championship_points = 184 WHERE name = 'George Russell';
UPDATE drivers SET championship_points = 151 WHERE name = 'Charles Leclerc';
UPDATE drivers SET championship_points = 109 WHERE name = 'Lewis Hamilton';
UPDATE drivers SET championship_points = 64 WHERE name = 'Kimi Antonelli';
UPDATE drivers SET championship_points = 64 WHERE name = 'Alexander Albon';
UPDATE drivers SET championship_points = 37 WHERE name = 'Nico Hülkenberg';
UPDATE drivers SET championship_points = 37 WHERE name = 'Isack Hadjar';
UPDATE drivers SET championship_points = 32 WHERE name = 'Lance Stroll';
UPDATE drivers SET championship_points = 30 WHERE name = 'Fernando Alonso';
UPDATE drivers SET championship_points = 28 WHERE name = 'Esteban Ocon';
UPDATE drivers SET championship_points = 20 WHERE name = 'Pierre Gasly';
UPDATE drivers SET championship_points = 20 WHERE name = 'Liam Lawson';
UPDATE drivers SET championship_points = 16 WHERE name = 'Oliver Bearman';
UPDATE drivers SET championship_points = 16 WHERE name = 'Carlos Sainz';
UPDATE drivers SET championship_points = 14 WHERE name = 'Gabriel Bortoleto';
UPDATE drivers SET championship_points = 12 WHERE name = 'Yuki Tsunoda';
UPDATE drivers SET championship_points = 0 WHERE name = 'Franco Colapinto';
UPDATE drivers SET championship_points = 0 WHERE name = 'Jack Doohan';