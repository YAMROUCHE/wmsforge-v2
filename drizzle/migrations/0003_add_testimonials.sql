-- Migration: Add testimonials system
-- Created: 2025-01-17

-- Table for customer testimonials/reviews
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,

  -- Review content
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,

  -- Author info
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,

  -- Metadata
  is_verified BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- External review links
  g2_review_url TEXT,
  capterra_review_url TEXT,
  trustpilot_review_url TEXT,

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_organization ON testimonials(organization_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_user ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_public ON testimonials(is_public, is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);

-- Table for review prompts tracking (to avoid spamming users)
CREATE TABLE IF NOT EXISTS review_prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,

  -- Tracking
  prompt_shown_at TEXT NOT NULL DEFAULT (datetime('now')),
  prompt_type TEXT NOT NULL DEFAULT 'in_app', -- 'in_app', 'email', 'notification'
  was_clicked BOOLEAN DEFAULT false,
  review_submitted BOOLEAN DEFAULT false,

  -- Metadata
  days_since_signup INTEGER,
  orders_processed INTEGER,
  tasks_completed INTEGER,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_prompts_user ON review_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_review_prompts_org ON review_prompts(organization_id);
