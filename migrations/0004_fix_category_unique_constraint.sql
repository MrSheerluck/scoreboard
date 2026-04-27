-- Fix unique constraint to be per-user instead of global
-- Create a new categories table with the correct constraint
CREATE TABLE categories_new (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT NOT NULL,
  color   TEXT NOT NULL,
  user_id TEXT NOT NULL,
  UNIQUE(name, user_id)
);

-- Copy data from old table
INSERT INTO categories_new (id, name, color, user_id)
SELECT id, name, color, user_id FROM categories;

-- Drop old table and rename new one
DROP TABLE categories;
ALTER TABLE categories_new RENAME TO categories;

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
