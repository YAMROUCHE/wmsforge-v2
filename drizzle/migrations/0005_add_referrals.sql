-- Migration : Système de parrainage
-- Date : 2025-01-18

-- Table des codes de parrainage
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referrals_count INTEGER DEFAULT 0,
  credits_earned REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Table des parrainages effectués
CREATE TABLE IF NOT EXISTS referral_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_user_id INTEGER NOT NULL,
  referred_user_id INTEGER NOT NULL,
  referred_organization_id INTEGER NOT NULL,
  referral_code TEXT NOT NULL,
  reward_amount REAL DEFAULT 0,
  reward_type TEXT DEFAULT 'credit', -- credit, discount, free_month
  status TEXT DEFAULT 'pending', -- pending, completed, paid
  converted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_conversions_referrer ON referral_conversions(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_conversions_referred ON referral_conversions(referred_user_id);

-- Ajouter colonne pour tracker d'où vient l'utilisateur
ALTER TABLE users ADD COLUMN referred_by_code TEXT;
