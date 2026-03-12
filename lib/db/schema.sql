-- Portal Hub Database Schema
-- Initialize tables for user management, app tracking, and platform status

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL DEFAULT 'Analyst',
  org_unit VARCHAR DEFAULT 'Strategic Intelligence',
  classification_level VARCHAR DEFAULT 'UNCLASSIFIED',
  password_hash VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'under_development')) DEFAULT 'under_development',
  url VARCHAR NOT NULL,
  color VARCHAR NOT NULL,
  icon VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User App Sessions (records when users launch apps)
CREATE TABLE IF NOT EXISTS user_app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id VARCHAR NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  topic TEXT,
  launched_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User App Last Run (denormalized for performance)
CREATE TABLE IF NOT EXISTS user_app_last_run (
  user_id UUID NOT NULL,
  app_id VARCHAR NOT NULL,
  last_run_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, app_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);

-- Platform Components
CREATE TABLE IF NOT EXISTS platform_components (
  id VARCHAR PRIMARY KEY,
  label VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('operational', 'degraded', 'outage')) DEFAULT 'operational',
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Component Status History
CREATE TABLE IF NOT EXISTS component_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id VARCHAR NOT NULL REFERENCES platform_components(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL CHECK (status IN ('operational', 'degraded', 'outage')),
  note TEXT,
  recorded_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_app_sessions_user ON user_app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_sessions_app ON user_app_sessions(app_id);
CREATE INDEX IF NOT EXISTS idx_user_app_sessions_launched ON user_app_sessions(launched_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_components_status ON platform_components(status);

-- Create an index for user_app_last_run lookups
CREATE INDEX IF NOT EXISTS idx_user_app_last_run_user ON user_app_last_run(user_id);
