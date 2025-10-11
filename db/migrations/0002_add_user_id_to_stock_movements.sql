-- Migration: Ajouter user_id à stock_movements
ALTER TABLE stock_movements ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id) DEFAULT 1;
