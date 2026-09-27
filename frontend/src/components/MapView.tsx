import type { HuntingSession, PublicReport } from '../types';

interface MapViewProps {
  sessions: HuntingSession[];
  reports: PublicReport[];
  selectedSession: HuntingSession | null;
  onSelectSession: (session: HuntingSession | null) => void;
  onAddReportClick: () => void;
}

export function MapView({
  sessions,
  reports,
  selectedSession,
  onSelectSession,
  onAddReportClick
}: MapViewProps) {

  return (
    <div className="relative w-full h-[65vh] md:h-[72vh] rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
      {/* Simulation cartographique interactive SVG haute précision et réactive */}
      <svg
        className="w-full h-full object-cover select-none cursor-grab active:cursor-grabbing"
        viewBox="0 0 1000 700"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grille cartographique topo */}
          <pattern id="topoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          <radialGradient id="forestGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fond cartographique */}
        <rect width="1000" height="700" fill="#0f172a" />
        <rect width="1000" height="700" fill="url(#topoGrid)" />

        {/* Sentiers de randonnée (GR/PR) */}
        <path
          d="M 120 620 Q 250 480 340 400 T 520 280 T 780 180"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeDasharray="6 4"
          opacity="0.7"
        />
        <text x="340" y="390" fill="#38bdf8" fontSize="12" fontWeight="600" opacity="0.8">
          Sentier GR - Crêtes de Grésigne
        </text>

        <path
          d="M 450 680 Q 550 510 680 430 T 910 320"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />

        {/* Affichage des Zones et Sessions de Battues */}
        {sessions.map((session) => {
          const isActive = session.status === 'ACTIVE';
          const isPlanned = session.status === 'PLANNED';
          
          // Calcul simple de position pour la démo cartographique
          const pathD =
            session.id === 'session-live-01'
              ? 'M 250 250 L 520 210 L 580 380 L 360 480 L 210 400 Z'
              : 'M 620 380 L 880 340 L 920 520 L 710 590 Z';

          return (
            <g
              key={session.id}
              className="cursor-pointer transition-all duration-300"
              onClick={() => onSelectSession(session)}
            >
              {/* Polygone de la zone */}
              <path
                d={pathD}
                fill={isActive ? '#ef4444' : isPlanned ? '#f97316' : '#10b981'}
                fillOpacity={selectedSession?.id === session.id ? 0.45 : 0.25}
                stroke={isActive ? '#ef4444' : isPlanned ? '#f97316' : '#10b981'}
                strokeWidth={selectedSession?.id === session.id ? 3 : 2}
                className={isActive ? 'animate-pulse' : ''}
              />

              {/* Étiquette centrale sur la zone */}
              <g transform={session.id === 'session-live-01' ? 'translate(360, 320)' : 'translate(760, 440)'}>
                <rect
                  x="-80"
                  y="-18"
                  width="160"
                  height="36"
                  rx="18"
                  fill="#1e293b"
                  stroke={isActive ? '#ef4444' : '#f97316'}
                  strokeWidth="1.5"
                />
                <circle cx="-58" cy="0" r="6" fill={isActive ? '#ef4444' : '#f97316'} />
                <text
                  x="6"
                  y="4"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {isActive ? 'BATTUE EN COURS' : 'BATTUE PRÉVUE'}
                </text>
              </g>
            </g>
          );
        })}

        {/* Signalements Publics (Points d'intérêts sur la carte) */}
        {reports.map((rep) => {
          const isDog = rep.reportType === 'DOG_SIGHTING';
          const cx = isDog ? 410 : 310;
          const cy = isDog ? 360 : 430;

          return (
            <g
              key={rep.id}
              transform={`translate(${cx}, ${cy})`}
              className="cursor-pointer group"
            >
              <circle cx="0" cy="0" r="14" fill="#fbbf24" fillOpacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="12" fill="#d97706" stroke="#fef3c7" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                {isDog ? '🐕' : '⚠️'}
              </text>
            </g>
          );
        })}

        {/* Position de l'utilisateur (Point Bleu) */}
        <g transform="translate(180, 520)">
          <circle cx="0" cy="0" r="12" fill="#3b82f6" fillOpacity="0.3" className="animate-ping" />
          <circle cx="0" cy="0" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="2.5" />
          <text x="14" y="5" fill="#93c5fd" fontSize="11" fontWeight="600">
            Votre position
          </text>
        </g>
      </svg>

      {/* Barre d'état en haut à gauche */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-200">
            Direct Tarn & Occitanie • Mise à jour temps réel
          </span>
        </div>
      </div>

      {/* Légende interactive en bas à gauche */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-xl flex flex-wrap gap-4 text-xs font-medium z-20">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          <span className="text-slate-300">Battue active (Zone Déconseillée)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
          <span className="text-slate-300">Planifiée (À venir)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">Zone Sereine / Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400">🐕 / ⚠️</span>
          <span className="text-slate-300">Signalements (Chien / Panneau)</span>
        </div>
      </div>

      {/* Bouton d'action rapide Signalement (Floating Action Button) */}
      <button
        onClick={onAddReportClick}
        className="absolute bottom-4 right-4 z-20 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all cursor-pointer border border-amber-300"
      >
        <span className="text-lg">📢</span>
        <span>Signaler (Chien / Tir / Panneau)</span>
      </button>
    </div>
  );
}
