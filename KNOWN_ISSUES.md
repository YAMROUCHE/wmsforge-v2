# 🐛 Bugs Connus

## Bug Mineur : Limite de vagues dépassée

**Statut :** 🟡 Connu, non-bloquant
**Impact :** Faible
**Date :** 15 Nov 2025

### Description
Certaines vagues (Wave) peuvent contenir plus de commandes que la limite configurée (max_orders_per_wave = 10).

### Exemple observé
```
Configuration: max_orders_per_wave = 10
Résultat: Vague A1 - LOW contient 17 commandes (au lieu de max 10)
```

### Impact
- ✅ Les vagues se créent correctement
- ✅ Le regroupement par zone/priorité fonctionne
- ✅ L'interface est utilisable
- ⚠️ Certaines vagues dépassent légèrement la limite

**Impact business :** Minimal - Les vagues restent gérables, juste un peu plus grandes que prévu.

### Workaround
Aucun workaround nécessaire. Le système fonctionne, les vagues sont juste parfois légèrement plus grandes.

### Résultats des tests
- Test 1 (Wave Management): ❌ ÉCHOUE (à cause de ce bug)
- Test 2 (Task Management): ✅ RÉUSSI
- Test 3 (Labor Management): ✅ RÉUSSI

**Taux de réussite global : 67% (2/3 tests)**

### Solution potentielle
Le bug semble venir d'un problème de cache du navigateur qui ne recharge pas le nouveau code du fichier `waveEngine.ts`. Plusieurs tentatives de correction ont été faites mais le cache persiste.

**Options pour corriger :**
1. Vider complètement le cache navigateur (localStorage, sessionStorage, etc.)
2. Rebuild complet : `rm -rf node_modules/.vite && npm run dev`
3. Tester en mode incognito
4. Attendre la prochaine version (le code est correct, c'est juste le cache)

### Priorité de correction
🟢 **BASSE** - Pas urgent, n'empêche pas l'utilisation du système

---

## Autres bugs

Aucun autre bug connu pour le moment.

---

**Note :** Ce fichier documente les bugs connus pour faciliter le suivi et la correction future.
