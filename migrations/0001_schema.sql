CREATE TABLE IF NOT EXISTS categories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT    NOT NULL UNIQUE,
  color TEXT   NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  hours       REAL    NOT NULL CHECK(hours > 0),
  date        TEXT    NOT NULL, -- YYYY-MM-DD
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_entries_category_date ON entries(category_id, date);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);

-- Seed default categories
INSERT OR IGNORE INTO categories (name, color) VALUES
  ('Chess',       '#818cf8'),
  ('Game Dev',    '#34d399'),
  ('Reading',     '#fbbf24'),
  ('Philosophy',  '#f472b6'),
  ('Product',     '#60a5fa');
