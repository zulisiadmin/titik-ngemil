ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'tenant';

CREATE TABLE IF NOT EXISTS tenant_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  category TEXT,
  phone TEXT,
  story TEXT,
  booth INTEGER,
  booth_status TEXT NOT NULL DEFAULT 'buka',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenant_menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tenant_menu_user ON tenant_menu_items(user_id);

INSERT OR IGNORE INTO tenant_profiles (user_id, category, phone, story, booth)
SELECT users.id, applications.category, applications.phone, applications.pitch, applications.booth
FROM users LEFT JOIN applications ON applications.user_id = users.id;
