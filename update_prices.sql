-- Run this script in your PostgreSQL / Neon SQL Editor to instantly update all template prices to be above 5000!

UPDATE public.templates
SET price = CAST(CAST(price AS numeric) + 5000 AS text)
WHERE CAST(price AS numeric) < 5000;
