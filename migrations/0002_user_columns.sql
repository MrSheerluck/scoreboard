-- Add per-user scoping
ALTER TABLE categories ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE entries    ADD COLUMN user_id TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date);

-- Remove globally-seeded categories (they have no user_id)
DELETE FROM entries   WHERE category_id IN (SELECT id FROM categories WHERE user_id = '');
DELETE FROM categories WHERE user_id = '';
