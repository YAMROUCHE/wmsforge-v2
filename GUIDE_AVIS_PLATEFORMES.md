# 🌟 Guide Complet : Obtenir des Avis Vérifiés pour 1WMS.io

## 📊 Résumé du Système d'Avis

Vous avez maintenant **deux systèmes complémentaires** :

### 1. **Système d'avis interne** (Dans l'application)
✅ Table SQL `testimonials` créée et migrée
✅ API routes `/api/testimonials` complètes
✅ Composant `ReviewPrompt` qui s'affiche automatiquement
✅ Critères intelligents : 30+ jours, 5+ commandes OU 20+ tâches
✅ Maximum 3 prompts par utilisateur
✅ Tracking complet (prompts, clics, soumissions)

### 2. **Plateformes externes** (G2, Capterra, Trustpilot)
📌 Liens directs intégrés dans le `ReviewPrompt`
📌 Guide complet ci-dessous

---

## 🚀 PARTIE 1 : Utiliser le Système Interne

### Comment ça fonctionne ?

Le composant `ReviewPrompt` s'affiche automatiquement dans votre app quand :
- L'utilisateur a créé son compte depuis 30+ jours
- Il a traité 5+ commandes OU complété 20+ tâches
- Il n'a pas déjà laissé un avis
- Il n'a pas déjà été sollicité 3 fois
- Il n'a pas refusé dans les 7 derniers jours

### Intégrer le ReviewPrompt dans une page

```tsx
// Dans src/pages/Dashboard.tsx (ou toute autre page)
import ReviewPrompt from '../components/ReviewPrompt';

export default function Dashboard() {
  return (
    <div className="p-6">
      {/* Afficher le prompt d'avis */}
      <ReviewPrompt />

      {/* Reste de votre page */}
      <h1>Dashboard</h1>
      ...
    </div>
  );
}
```

### API Endpoints disponibles

#### **GET** `/api/testimonials/public`
Récupère les avis publics (pour landing page)
```bash
curl http://localhost:8787/api/testimonials/public
```

#### **GET** `/api/testimonials` (Auth requis)
Liste tous les avis de votre organisation
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8787/api/testimonials
```

#### **POST** `/api/testimonials` (Auth requis)
Créer un nouvel avis
```bash
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Excellent WMS",
    "comment": "Cette application a transformé notre entrepôt.",
    "author_name": "Jean Dupont",
    "author_role": "Responsable Logistique",
    "author_company": "ACME Corp"
  }' \
  http://localhost:8787/api/testimonials
```

#### **PATCH** `/api/testimonials/:id` (Auth requis)
Modifier un avis (admin)
```bash
curl -X PATCH \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"is_public": true, "is_featured": true}' \
  http://localhost:8787/api/testimonials/1
```

#### **GET** `/api/testimonials/prompt/should-show` (Auth requis)
Vérifier si le prompt doit s'afficher
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8787/api/testimonials/prompt/should-show
```

---

## 🌐 PARTIE 2 : Plateformes Externes

### A. G2.com (Le plus important pour SaaS B2B)

#### Étape 1 : Créer votre profil G2

1. Allez sur https://www.g2.com/products/new
2. Cliquez sur "Add Your Product"
3. Remplissez les informations :
   - **Nom** : 1WMS.io
   - **Catégorie** : Warehouse Management Systems
   - **Description** : Le WMS moderne qui booste votre productivité de 40%
   - **Site web** : https://1wms.io (votre domaine)
   - **Logo** : Votre logo (Package icon)
   - **Screenshots** : 3-5 captures d'écran de votre app

4. Prix : Indiquez vos tarifs (299€/mois Starter, 699€/mois Pro)

#### Étape 2 : Collecter des avis G2

**URL de demande d'avis :**
```
https://www.g2.com/products/1wms-io/reviews/start
```
👆 Utilisez cette URL dans vos emails/app

**Template d'email :**
```
Objet : 2 minutes pour nous aider sur G2 ? 🙏

Bonjour {{prenom}},

Votre utilisation de 1WMS.io transforme vos opérations depuis {{nb_jours}} jours.
Vous avez déjà traité {{nb_commandes}} commandes avec succès !

Pourriez-vous partager votre expérience sur G2 ? (2 min)
👉 https://www.g2.com/products/1wms-io/reviews/start

En remerciement, recevez :
✅ 1 mois gratuit sur votre abonnement
✅ Accès anticipé aux nouvelles fonctionnalités

Merci infiniment !
L'équipe 1WMS.io
```

#### Étape 3 : Afficher le badge G2

Une fois que vous avez 10+ avis :
```html
<!-- Badge G2 officiel -->
<div id="g2-badge-container"></div>
<script src="https://widget.reviews.co.uk/badge/badge.js"></script>
<script>
  window.g2ReviewsWidget({
    productId: 'YOUR_PRODUCT_ID',
    theme: 'light'
  });
</script>
```

---

### B. Capterra (Gartner)

#### Étape 1 : Créer votre listing

1. Allez sur https://www.capterra.com/vendors/signup
2. Remplissez le formulaire vendeur
3. Soumettez votre produit pour validation (48-72h)

#### Étape 2 : URL d'avis

```
https://www.capterra.com/reviews/1wms-io/new
```

#### Avantages Capterra
- Très bien référencé sur Google
- Badge "Verified Reviewer" automatique
- Gratuit pour commencer

---

### C. Trustpilot

#### Étape 1 : Créer votre profil Business

1. https://business.trustpilot.com/signup
2. Plan gratuit disponible (limité à 100 invitations/mois)
3. Vérification de domaine requise

#### Étape 2 : Widget Trustpilot

```html
<!-- TrustBox widget -->
<div class="trustpilot-widget" data-locale="fr-FR"
     data-template-id="5419b6a8b0d04a076446a9ad"
     data-businessunit-id="YOUR_BUSINESS_ID"
     data-style-height="24px"
     data-style-width="100%"
     data-theme="light">
  <a href="https://fr.trustpilot.com/review/1wms.io" target="_blank">Trustpilot</a>
</div>
<script type="text/javascript" src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async></script>
```

---

## 🎯 PARTIE 3 : Stratégie de Collecte (30 jours)

### Semaine 1 : Préparation
- [x] ✅ Migration SQL appliquée
- [x] ✅ Routes API créées
- [x] ✅ Composant ReviewPrompt créé
- [ ] Créer profils sur G2, Capterra, Trustpilot
- [ ] Préparer screenshots de qualité
- [ ] Rédiger descriptions produits

### Semaine 2 : Identification des Champions
- [ ] Identifier 20 clients très satisfaits
- [ ] Préparer emails personnalisés
- [ ] Créer template de remerciement (1 mois gratuit)

### Semaine 3 : Campagne d'invitations
- [ ] Envoyer 5 invitations/jour (pas plus, pour rester naturel)
- [ ] Suivre les réponses
- [ ] Rappeler après 7 jours si pas de réponse

### Semaine 4 : Consolidation
- [ ] Objectif : 10+ avis sur G2
- [ ] Objectif : 5+ avis sur Capterra
- [ ] Objectif : 10+ avis internes
- [ ] Intégrer widgets sur landing page
- [ ] Partager meilleurs avis sur LinkedIn

---

## 📊 PARTIE 4 : Afficher les Avis sur Landing Page

### Mettre à jour Landing.tsx

Remplacez les avis statiques par les vrais avis de la DB :

```tsx
// Dans Landing.tsx
import { useEffect, useState } from 'react';

export default function Landing() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8787/api/testimonials/public')
      .then(res => res.json())
      .then(data => setTestimonials(data.testimonials.slice(0, 3)));
  }, []);

  return (
    <div>
      {/* ... Hero, etc. ... */}

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ce qu'ils disent de 1WMS.io
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {testimonial.title && (
                  <h3 className="font-bold text-gray-900 mb-2">{testimonial.title}</h3>
                )}

                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.comment}"
                </p>

                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-900">{testimonial.author_name}</p>
                  {testimonial.author_role && (
                    <p className="text-sm text-gray-600">{testimonial.author_role}</p>
                  )}
                  {testimonial.author_company && (
                    <p className="text-sm text-gray-600">@ {testimonial.author_company}</p>
                  )}
                  <p className="text-sm font-semibold text-green-600 mt-2">
                    ✅ Client vérifié
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 💡 PARTIE 5 : Incentives & Best Practices

### ✅ Ce qui est permis

- Offrir 1 mois gratuit après un avis honnête
- Donner accès anticipé aux features
- Entrée dans un tirage au sort
- Swag (t-shirts, stickers)
- Badge "Top Reviewer" dans l'app

### ❌ Ce qui est interdit

- Payer pour un avis positif spécifique
- Offrir récompense uniquement pour 5 étoiles
- Écrire de faux avis
- Supprimer les avis négatifs (sur plateformes externes)

### 📧 Timing optimal pour demander

**Moments parfaits :**
- Après avoir atteint un milestone (1000 commandes traitées)
- Après une migration réussie
- Après un ROI positif démontré
- Après un excellent support client
- Lors du renouvellement annuel

**À éviter :**
- Pendant les premiers jours d'utilisation
- Après un incident/bug
- Pendant les périodes de rush (Black Friday)

---

## 📈 PARTIE 6 : Mesurer le Succès

### KPIs à tracker

```sql
-- Nombre total d'avis
SELECT COUNT(*) FROM testimonials;

-- Note moyenne
SELECT AVG(rating) FROM testimonials WHERE is_public = true;

-- Taux de conversion (prompts → avis soumis)
SELECT
  (SELECT COUNT(*) FROM testimonials) * 100.0 /
  (SELECT COUNT(DISTINCT user_id) FROM review_prompts)
  AS conversion_rate;

-- Avis par plateforme
SELECT
  SUM(CASE WHEN g2_review_url IS NOT NULL THEN 1 ELSE 0 END) as g2_reviews,
  SUM(CASE WHEN capterra_review_url IS NOT NULL THEN 1 ELSE 0 END) as capterra_reviews,
  SUM(CASE WHEN g2_review_url IS NULL AND capterra_review_url IS NULL THEN 1 ELSE 0 END) as internal_reviews
FROM testimonials;
```

### Dashboard admin recommandé

Créez une page `/admin/testimonials` avec :
- Liste de tous les avis (publics et privés)
- Boutons pour approuver/rejeter
- Bouton "Mettre en vedette"
- Stats : conversion rate, note moyenne, distribution
- Timeline des avis reçus

---

## 🎁 Bonus : Email Templates

### Template 1 : Première demande
```
Objet : Vous nous aidez à grandir ? 🚀

Bonjour {{prenom}},

Cela fait {{nb_jours}} jours que vous utilisez 1WMS.io.
Vos {{nb_commandes}} commandes traitées nous montrent que notre solution vous aide vraiment !

Pourriez-vous partager votre expérience en 2 minutes ?
👉 Laisser un avis : [LIEN]

En remerciement :
🎁 1 mois gratuit offert
🔓 Accès early-access aux nouvelles features

Merci infiniment,
L'équipe 1WMS.io
```

### Template 2 : Rappel (7 jours après)
```
Objet : Dernière chance pour votre avis 😊

Bonjour {{prenom}},

Petit rappel amical : nous aimerions beaucoup avoir votre retour sur 1WMS.io.

2 minutes suffi sent : [LIEN]

PS: L'offre du mois gratuit est toujours valable ! 🎁

Merci,
L'équipe 1WMS.io
```

### Template 3 : Après soumission (remerciement)
```
Objet : Merci ! Voici votre mois gratuit 🎉

Bonjour {{prenom}},

MERCI pour votre avis sur 1WMS.io !

Comme promis, voici votre récompense :
✅ 1 mois gratuit ajouté à votre compte
✅ Accès anticipé aux features en développement

Votre feedback nous aide énormément à améliorer 1WMS.io pour tous nos clients.

À très vite !
L'équipe 1WMS.io
```

---

## 🔗 Liens Rapides

**G2** : https://www.g2.com/products/new
**Capterra** : https://www.capterra.com/vendors/signup
**Trustpilot** : https://business.trustpilot.com/signup

**Votre URL d'avis interne** : http://localhost:5173/dashboard (ReviewPrompt s'affiche auto)
**API Publique** : http://localhost:8787/api/testimonials/public

---

## ✅ Checklist Finale

- [ ] Migration appliquée (`0003_add_testimonials.sql`)
- [ ] Routes API testées (Postman/curl)
- [ ] Composant `ReviewPrompt` intégré dans Dashboard
- [ ] Profil G2 créé et configuré
- [ ] Profil Capterra créé
- [ ] Liste de 20 clients champions identifiés
- [ ] Templates d'email personnalisés
- [ ] Widgets intégrés sur landing page
- [ ] Dashboard admin créé (optionnel)

---

**Version** : 1.0.0
**Date** : 17 novembre 2025
**Auteur** : 1WMS.io Team

🎉 **Vous êtes maintenant prêt à collecter des avis vérifiés !**
