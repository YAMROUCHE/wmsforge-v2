-- Migration : Éliminer localStorage - Tout en DB
-- Date : 2025-01-18

-- Ajouter colonnes dans organizations pour warehouse config
ALTER TABLE organizations ADD COLUMN warehouse_config TEXT;
ALTER TABLE organizations ADD COLUMN zones_config TEXT;

-- Les autres champs utiles existent déjà :
-- - users.onboarding_completed (déjà présent)
-- - user_preferences (table complète déjà présente)

-- Commentaires :
-- warehouse_config : JSON stockant la config de l'entrepôt
-- zones_config : JSON stockant les zones/layout
