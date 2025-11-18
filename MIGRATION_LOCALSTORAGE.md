# 🧹 MIGRATION localStorage → D1 Database

**Objectif** : Architecture 100% clean - Toutes les données métier en DB avec isolation multi-tenant parfaite

## ✅ Base de données - PRÊTE

### Colonnes ajoutées (migration 0006) :
- ✅ `organizations.warehouse_config` (JSON)
- ✅ `organizations.zones_config` (JSON)
- ✅ `users.onboarding_completed` (déjà présent)
- ✅ Table `user_preferences` (complète)

---

## 🔨 TRAVAIL À FAIRE - Frontend

### 1. Onboarding (`src/pages/Onboarding.tsx`)

**AVANT** (localStorage):
```typescript
localStorage.setItem('warehouseConfig', JSON.stringify(data));
localStorage.setItem('onboardingCompleted', 'true');
```

**APRÈS** (API D1):
```typescript
// Sauvegarder dans organizations.warehouse_config
await fetchAPI('/api/onboarding/complete', {
  method: 'POST',
  body: JSON.stringify({ warehouse_config: data })
});

// Mettre à jour users.onboarding_completed automatiquement côté backend
```

### 2. WarehouseDashboard (`src/pages/WarehouseDashboard.tsx`)

**AVANT**:
```typescript
const savedWarehouse = localStorage.getItem('warehouseConfig');
const savedZones = localStorage.getItem('zonesConfig');
```

**APRÈS**:
```typescript
// Charger depuis API
const { warehouse_config, zones_config } = await fetchAPI('/api/organizations/config');
```

### 3. ReviewPrompt (`src/components/ReviewPrompt.tsx`)

**AVANT**:
```typescript
const user = JSON.parse(localStorage.getItem('wms_user') || '{}');
```

**APRÈS**:
```typescript
// Utiliser AuthContext (déjà disponible)
import { useAuth } from '../contexts/AuthContext';
const { user } = useAuth();
```

### 4. OnboardingSimple (`src/pages/OnboardingSimple.tsx`)

**AVANT**:
```typescript
localStorage.setItem('onboardingCompleted', 'true');
```

**APRÈS**:
```typescript
await fetchAPI('/api/onboarding/complete', { method: 'POST' });
```

---

## 🔧 APIs Backend à créer/modifier

### A. Route Onboarding (`worker/src/routes/onboarding.ts`)

Modifier `POST /api/onboarding/complete` :
```typescript
// Ajouter sauvegarde warehouse_config
await c.env.DB.prepare(`
  UPDATE organizations
  SET warehouse_config = ?
  WHERE id = ?
`).bind(JSON.stringify(body.warehouse_config), organizationId).run();

// Marquer onboarding terminé
await c.env.DB.prepare(`
  UPDATE users
  SET onboarding_completed = 1
  WHERE id = ?
`).bind(userId).run();
```

### B. Nouvelle route Organizations Config

Créer `GET /api/organizations/config` :
```typescript
app.get('/config', async (c) => {
  const { organizationId } = getAuthUser(c);

  const org = await c.env.DB.prepare(`
    SELECT warehouse_config, zones_config
    FROM organizations
    WHERE id = ?
  `).bind(organizationId).first();

  return c.json({
    warehouse_config: org.warehouse_config ? JSON.parse(org.warehouse_config) : null,
    zones_config: org.zones_config ? JSON.parse(org.zones_config) : null
  });
});
```

Créer `PUT /api/organizations/config` :
```typescript
app.put('/config', async (c) => {
  const { organizationId } = getAuthUser(c);
  const body = await c.req.json();

  await c.env.DB.prepare(`
    UPDATE organizations
    SET warehouse_config = ?,
        zones_config = ?
    WHERE id = ?
  `).bind(
    JSON.stringify(body.warehouse_config),
    JSON.stringify(body.zones_config),
    organizationId
  ).run();

  return c.json({ success: true });
});
```

---

## ✅ CE QUI PEUT RESTER en localStorage (OK)

```typescript
// Token JWT - Standard sécurisé
localStorage.setItem('wms_auth_token', token);

// Préférence UI locale seulement
localStorage.setItem('theme', 'dark');
```

---

## 📋 CHECKLIST

### Base de données :
- [x] Migration 0006 créée
- [x] Migration appliquée en local
- [ ] Migration à appliquer en production (plus tard)

### Backend :
- [ ] Modifier `/api/onboarding/complete`
- [ ] Créer `/api/organizations/config` (GET)
- [ ] Créer `/api/organizations/config` (PUT)

### Frontend :
- [ ] Nettoyer `Onboarding.tsx`
- [ ] Nettoyer `OnboardingSimple.tsx`
- [ ] Nettoyer `WarehouseDashboard.tsx`
- [ ] Nettoyer `ReviewPrompt.tsx`

### Tests :
- [ ] Tester onboarding complet
- [ ] Tester chargement config warehouse
- [ ] Vérifier isolation multi-tenant
- [ ] Test avec 2 organisations différentes

---

## 🎯 RÉSULTAT FINAL

Après cette migration :
- ✅ **100% des données métier en D1**
- ✅ **Isolation multi-tenant parfaite partout**
- ✅ **Pas de données perdues au clear localStorage**
- ✅ **Architecture production-ready**
- ✅ **Multi-device : même config sur mobile/desktop**

---

## 🔄 Rollback

Si besoin de revenir en arrière :
```bash
git checkout d8c353a
```

**Dernière mise à jour** : 18 janvier 2025
**Estimé** : 2h de travail pour tout nettoyer
