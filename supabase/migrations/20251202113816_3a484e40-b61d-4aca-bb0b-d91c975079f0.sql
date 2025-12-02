-- =============================================
-- MIGRATION 1: AJOUTER LES NOUVEAUX RÔLES
-- =============================================

-- Ajouter les nouveaux rôles à l'enum existant
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'moderateur';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'invite';