import { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { HuntingSession, PublicReport } from '../types';

// Fix icônes Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  sessions: HuntingSession[];
  reports: PublicReport[];
  selectedSession: HuntingSession | null;
  onSelectSession: (session: HuntingSession | null) => void;
  onAddReportClick: () => void;
  // Mode dessin optionnel
  isDrawingMode?: boolean;
  drawingPoints?: [number, number][];
  onMapClickForDrawing?: (lat: number, lng: number) => void;
}

// Gestionnaire de clics sur la carte pour le tracé de polygone
function MapDrawingHandler({
  isDrawingMode,
  onMapClick
}: {
  isDrawingMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isDrawingMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Ajuste automatiquement la vue sur la zone sélectionnée
function MapViewFocuser({ targetCoords }: { targetCoords: [number, number][] | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords && targetCoords.length > 0) {
      const bounds = L.latLngBounds(targetCoords.map((c) => [c[0], c[1]]));
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  }, [targetCoords, map]);
  return null;
}

export function MapView({
  sessions,
  reports,
  selectedSession,
  onSelectSession,
  onAddReportClick,
  isDrawingMode = false,
  drawingPoints = [],
  onMapClickForDrawing
}: MapViewProps) {
  // Centre initial : Région Occitanie / Forêt domaniale de Grésigne (Puycelsi - Gaillac - Albi)
  const initialCenter: [number, number] = [43.998, 1.735];
  const initialZoom = 12;

  return (
    <div className="relative w-full h-[68vh] md:h-[75vh] rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        minZoom={6}
        maxZoom={18}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Fond de Carte Topographique IGN Géoportail France & OpenTopoMap (Zoomable haute précision) */}
        <TileLayer
          attribution='&copy; <a href="https://www.ign.fr/" target="_blank">IGN France</a> / <a href="https://opentopomap.org" target="_blank">OpenTopoMap</a>'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          maxZoom={17}
        />

        <MapDrawingHandler isDrawingMode={isDrawingMode} onMapClick={onMapClickForDrawing} />
        <MapViewFocuser targetCoords={selectedSession ? selectedSession.coordinates : null} />

        {/* Tracé en cours de dessin par le responsable ACCA */}
        {isDrawingMode && drawingPoints.length > 0 && (
          <>
            <Polygon
              positions={drawingPoints}
              pathOptions={{
                color: '#38bdf8',
                weight: 3,
                fillColor: '#0284c7',
                fillOpacity: 0.35,
                dashArray: '6, 6'
              }}
            />
            {drawingPoints.map((pt, idx) => (
              <CircleMarker
                key={`draw-pt-${idx}`}
                center={pt}
                radius={6}
                pathOptions={{ color: '#ffffff', fillColor: '#0284c7', fillOpacity: 1, weight: 2 }}
              />
            ))}
          </>
        )}

        {/* Zones et Battues Réelles */}
        {sessions.map((session) => {
          const isActive = session.status === 'ACTIVE';
          const isPlanned = session.status === 'PLANNED';
          const isSelected = selectedSession?.id === session.id;

          const color = isActive ? '#ef4444' : isPlanned ? '#f97316' : '#10b981';

          return (
            <Polygon
              key={session.id}
              positions={session.coordinates}
              eventHandlers={{
                click: () => onSelectSession(session)
              }}
              pathOptions={{
                color: color,
                weight: isSelected ? 4 : 2.5,
                fillColor: color,
                fillOpacity: isSelected ? 0.45 : isActive ? 0.35 : 0.22,
                dashArray: isPlanned ? '5, 5' : undefined
              }}
            >
              <Popup>
                <div className="text-slate-900 p-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500' : 'bg-orange-500'}`} />
                    <strong className="text-sm">{isActive ? 'Battue en cours' : 'Battue prévue'}</strong>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">{session.zoneName}</h4>
                  <p className="text-xs text-slate-600 mt-1">{session.commune} • {session.societyName}</p>
                  <p className="text-xs text-slate-700 mt-1 italic">{session.notes}</p>
                  <div className="mt-2 pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                    Début : {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Signalements Publics (Chiens, Panneaux, Tirs) */}
        {reports.map((rep) => {
          const isDog = rep.reportType === 'DOG_SIGHTING';
          return (
            <CircleMarker
              key={rep.id}
              center={[rep.latitude, rep.longitude]}
              radius={10}
              pathOptions={{
                color: '#fef3c7',
                fillColor: isDog ? '#d97706' : '#ea580c',
                fillOpacity: 0.9,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-slate-900 p-1 text-xs">
                  <strong className="text-amber-800 text-sm flex items-center gap-1">
                    {isDog ? '🐕 Chien aperçu' : '⚠️ Signalement terrain'}
                  </strong>
                  <p className="mt-1 text-slate-700">{rep.description}</p>
                  {rep.photoUrl && (
                    <img src={rep.photoUrl} alt="Photo" className="mt-2 w-32 h-20 object-cover rounded-md" />
                  )}
                  <span className="block mt-2 text-[10px] text-slate-500">
                    Signalé à {new Date(rep.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Bandeau indicateur en haut à gauche */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-[400] pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-200">
            Fond Topographique IGN & OpenTopoMap • Zoom haute résolution
          </span>
        </div>
      </div>

      {/* Guide de dessin actif */}
      {isDrawingMode && (
        <div className="absolute top-4 right-4 bg-sky-950/90 backdrop-blur-md border border-sky-600 px-4 py-3 rounded-xl shadow-2xl z-[400] text-sky-200 text-xs flex flex-col gap-1 max-w-xs">
          <strong className="text-sky-300 flex items-center gap-1 text-sm">
            ✏️ Mode Tracé Libre ACCA Actif
          </strong>
          <p>Cliquez directement sur la carte pour poser les sommets du polygone ({drawingPoints.length} point{drawingPoints.length > 1 ? 's' : ''}).</p>
        </div>
      )}

      {/* Légende en bas à gauche */}
      <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-xl flex flex-wrap gap-4 text-xs font-medium z-[400]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          <span className="text-slate-300">Battue active (En cours)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
          <span className="text-slate-300">Planifiée (Semaine / Mois)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">Zone Sereine / Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">🐕</span>
          <span className="text-slate-300">Chiens signalés</span>
        </div>
      </div>

      {/* Bouton d'action rapide Signalement (Floating Action Button) */}
      {!isDrawingMode && (
        <button
          onClick={onAddReportClick}
          className="absolute bottom-4 right-4 z-[400] bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all cursor-pointer border border-amber-300"
        >
          <span className="text-lg">📢</span>
          <span>Signaler (Chien / Tir / Panneau)</span>
        </button>
      )}
    </div>
  );
}
