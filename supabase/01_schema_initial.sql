-- ==============================================================================
-- SCHEMA POSTGRESQL / POSTGIS : PLATEFORME PARTAGE NATURE & CHASSE
-- ==============================================================================
-- Active l'extension spatiale PostGIS si disponible
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Table des ACCA / Sociétés de Chasse locales
CREATE TABLE IF NOT EXISTS hunting_societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_insee VARCHAR(10) NOT NULL,
    commune_name VARCHAR(255) NOT NULL,
    society_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(30),
    access_pin VARCHAR(64) NOT NULL, -- Hash PIN ou code cabane
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Zones Géographiques Délimitées
CREATE TABLE IF NOT EXISTS hunting_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES hunting_societies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Limite géographique au format GeoJSON (Polygon / MultiPolygon)
    geojson_geometry JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des Battues / Sessions de Chasse (Temps Réel & Calendrier)
CREATE TABLE IF NOT EXISTS hunting_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES hunting_zones(id) ON DELETE CASCADE,
    society_id UUID REFERENCES hunting_societies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED', -- 'PLANNED', 'ACTIVE', 'COMPLETED', 'EXPIRED'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    auto_timeout_at TIMESTAMP WITH TIME ZONE, -- Clôture forcée (timeout)
    custom_polygon JSONB, -- Tracé libre précis du jour si différent de la zone globale
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table des Signalements Usagers & Promeneurs (Chiens, Chasseurs, Tirs)
CREATE TABLE IF NOT EXISTS public_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL, -- 'DOG_SIGHTING', 'SHOTS_HEARD', 'SIGN_POSTED', 'HUNTERS_PRESENT'
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    photo_url TEXT, -- Lien photo stocké (Supabase Storage / Base64 local)
    status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED', -- 'PENDING', 'VERIFIED', 'RESOLVED'
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '6 hours') NOT NULL
);

-- Index pour requêtes géospatiales et temporelles
CREATE INDEX IF NOT EXISTS idx_sessions_status ON hunting_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_time ON hunting_sessions(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_reports_expires ON public_reports(expires_at);
