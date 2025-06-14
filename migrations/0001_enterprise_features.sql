
-- Add enterprise sharing tables

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS shared_passwords (
  id SERIAL PRIMARY KEY,
  password_id INTEGER NOT NULL REFERENCES passwords(id),
  shared_by_user_id INTEGER NOT NULL REFERENCES users(id),
  shared_with_user_id INTEGER REFERENCES users(id),
  team_id INTEGER REFERENCES teams(id),
  permissions TEXT NOT NULL DEFAULT 'view',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CHECK (shared_with_user_id IS NOT NULL OR team_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS shared_vaults (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  team_id INTEGER REFERENCES teams(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS shared_vault_passwords (
  id SERIAL PRIMARY KEY,
  vault_id INTEGER NOT NULL REFERENCES shared_vaults(id),
  password_id INTEGER NOT NULL REFERENCES passwords(id),
  added_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(vault_id, password_id)
);

CREATE TABLE IF NOT EXISTS shared_vault_members (
  id SERIAL PRIMARY KEY,
  vault_id INTEGER NOT NULL REFERENCES shared_vaults(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  permissions TEXT NOT NULL DEFAULT 'view',
  invited_by_user_id INTEGER NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(vault_id, user_id)
);

CREATE TABLE IF NOT EXISTS emergency_access (
  id SERIAL PRIMARY KEY,
  grantor_id INTEGER NOT NULL REFERENCES users(id),
  emergency_contact_id INTEGER NOT NULL REFERENCES users(id),
  access_level TEXT NOT NULL DEFAULT 'view',
  waiting_period INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  last_activated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(grantor_id, emergency_contact_id)
);

-- Create indexes for better performance
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_shared_passwords_shared_with ON shared_passwords(shared_with_user_id);
CREATE INDEX idx_shared_passwords_shared_by ON shared_passwords(shared_by_user_id);
CREATE INDEX idx_shared_vault_members_user_id ON shared_vault_members(user_id);
CREATE INDEX idx_shared_vault_members_vault_id ON shared_vault_members(vault_id);
CREATE INDEX idx_emergency_access_grantor ON emergency_access(grantor_id);
CREATE INDEX idx_emergency_access_contact ON emergency_access(emergency_contact_id);
