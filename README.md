# Partage Nature - Plateforme de Vigilance Chasse & Promenades Sereines 🌿🎯

> Solution cartographique, collaborative et temps réel visant à réconcilier et sécuriser la cohabitation entre chasseurs, promeneurs, randonneurs et sportifs dans les espaces ruraux et forestiers.

---

## 🌟 Fonctionnalités Principales

### 1. 🗺️ Cartographie Dynamique & Direct Live
- Visualisation instantanée des secteurs forestiers :
  - 🔴 **Rouge clignotant** : Battue active en direct sur le terrain (secteur déconseillé).
  - 🟠 **Orange** : Battue programmée (calendrier prévisionnel).
  - 🟢 **Vert** : Espaces libres et sécurisés pour les loisirs de plein air.
- Affichage des tracés des sentiers balisés (GR / PR).

### 2. 📢 Signalements Communautaires Terrains
- Signalement en 1 clic par les promeneurs et usagers :
  - 🐕 Présence de **chiens de chasse isolés / errants** (avec prise de photo directe).
  - ⚠️ Panneaux "Chasse en cours" déployés aux croisements.
  - 💥 Tirs ou bruits de traque entendus.

### 3. 🎯 Pupitre Responsable ACCA / Chasseurs
- **Zéro friction** : Connexion simplifiée par code PIN cabane (ex: `8100`).
- Déclenchement d'un seul clic : *"Démarrer la battue"*.
- **Arrêt Automatique Garanti (Timeout anti-oubli)** : Clôture automatique de la battue à l'expiration de la durée prévue (ex: 4h) pour éviter les fausses alertes résiduelles.

### 4. 📱 Progressive Web App (PWA) & Mode Hors-Ligne
- Accessible directement sur smartphone par scan de QR code aux départs de sentiers sans passer par un magasin d'applications.
- Mise en cache locale des données et fonds de carte pour affichage en zone blanche forestière.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Vite, TailwindCSS v4, Lucide Icons, Vite-PWA.
- **Cartographie** : Moteur cartographique vectoriel haute performance.
- **Persistance** : Cache local réactif (`localStorage`) + Modèle de données PostgreSQL / PostGIS prêt pour Supabase.
- **Sécurité & Backend** : Schéma SQL PostGIS (`supabase/01_schema_initial.sql`) et Edge Function de timeout automatique (`supabase/close_expired_hunts.ts`).

---

## 🚀 Démarrage Rapide

```bash
# Cloner le dépôt
git clone https://github.com/NovaCraftApps/partage-nature-chasse.git
cd partage-nature-chasse/frontend

# Installer les dépendances
npm install

# Lancer le serveur local
npm run dev
```

L'application sera accessible sur `http://localhost:5175`.
