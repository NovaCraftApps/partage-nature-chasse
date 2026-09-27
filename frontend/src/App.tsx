import { useState, useEffect } from 'react';
import type { HuntingSession, PublicReport } from './types';
import { INITIAL_SESSIONS, INITIAL_REPORTS, INITIAL_ZONES } from './mockData';
import { MapView } from './components/MapView';
import { ReportModal } from './components/ReportModal';
import { HunterAdminPanel } from './components/HunterAdminPanel';
import { SessionDetailsModal } from './components/SessionDetailsModal';

export function App() {
  const [sessions, setSessions] = useState<HuntingSession[]>(() => {
    const saved = localStorage.getItem('pnc_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [reports, setReports] = useState<PublicReport[]>(() => {
    const saved = localStorage.getItem('pnc_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [selectedSession, setSelectedSession] = useState<HuntingSession | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'MAP' | 'REPORTS' | 'ADMIN'>('MAP');

  // Sauvegarde locale pour persistance et mode hors-ligne
  useEffect(() => {
    localStorage.setItem('pnc_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('pnc_reports', JSON.stringify(reports));
  }, [reports]);

  // Surveillance active du Timeout automatique (Côté Frontend Client)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setSessions((prev) =>
        prev.map((s) => {
          if (s.status === 'ACTIVE' && s.autoTimeoutAt) {
            const timeoutTime = new Date(s.autoTimeoutAt).getTime();
            if (now >= timeoutTime) {
              return {
                ...s,
                status: 'EXPIRED',
                endTime: new Date().toISOString(),
                notes: `${s.notes || ''} [Clôturée automatiquement par expiration du délai max]`
              };
            }
          }
          return s;
        })
      );
    }, 15000); // Test toutes les 15 secondes

    return () => clearInterval(interval);
  }, []);

  const handleStartHunt = (zoneId: string, durationHours: number, notes: string) => {
    const zone = INITIAL_ZONES.find((z) => z.id === zoneId) || INITIAL_ZONES[0];
    const now = new Date();
    const timeout = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    const newSession: HuntingSession = {
      id: `session-${Date.now()}`,
      zoneId: zone.id,
      zoneName: zone.name,
      commune: zone.commune,
      societyName: 'ACCA Territoriale',
      status: 'ACTIVE',
      startTime: now.toISOString(),
      autoTimeoutAt: timeout.toISOString(),
      coordinates: zone.coordinates,
      notes: notes || 'Battue déclarée en direct par le chef de traque.',
      leadHunterContact: '06.00.00.00.00'
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveTab('MAP');
  };

  const handleStopHunt = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'COMPLETED', endTime: new Date().toISOString() }
          : s
      )
    );
  };

  const handleAddReport = (
    reportData: Omit<PublicReport, 'id' | 'reportedAt' | 'expiresAt'>
  ) => {
    const now = new Date();
    const newReport: PublicReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      reportedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString()
    };

    setReports((prev) => [newReport, ...prev]);
  };

  const activeSessionsCount = sessions.filter((s) => s.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* En-tête de navigation principale */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌿</span>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
                Partage Nature <span className="text-emerald-400 font-medium text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Vigilance Chasse</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Tarn & Occitanie • Coexistence sereine en forêt
              </p>
            </div>
          </div>

          {/* Onglets de navigation */}
          <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'MAP'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗺️ Carte
            </button>
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'REPORTS'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📢 Alertes ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ADMIN'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎯 Espace ACCA
            </button>
          </nav>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Bandeau d'information dynamique */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${activeSessionsCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <span className="text-xl">{activeSessionsCount > 0 ? '⚠️' : '✅'}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {activeSessionsCount > 0
                  ? `${activeSessionsCount} battue(s) actuellement en cours dans votre secteur`
                  : 'Aucune battue signalée en ce moment dans votre secteur'}
              </p>
              <p className="text-xs text-slate-400">
                Pensez à porter des couleurs visibles et à tenir les animaux de compagnie à proximité.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <span>🐕</span>
              <span>Signaler un chien / tir</span>
            </button>
          </div>
        </div>

        {activeTab === 'MAP' && (
          <div className="flex flex-col gap-6">
            <MapView
              sessions={sessions}
              reports={reports}
              selectedSession={selectedSession}
              onSelectSession={setSelectedSession}
              onAddReportClick={() => setIsReportModalOpen(true)}
            />

            {/* Fiches récapitulatives des zones sous la carte */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => {
                const isActive = session.status === 'ACTIVE';
                const isPlanned = session.status === 'PLANNED';

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-md cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : isPlanned
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isActive ? '🔴 En direct' : isPlanned ? '🟠 Planifiée' : '🟢 Terminée'}
                        </span>
                        <span className="text-xs text-slate-500">{session.commune}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mb-1">{session.zoneName}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{session.notes}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>{session.societyName}</span>
                      <span className="text-emerald-400 font-semibold hover:underline">Voir détails →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Signalements communautaires en direct</h3>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="bg-amber-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer"
              >
                + Ajouter une alerte
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-4 items-start shadow-md"
                >
                  <div className="text-3xl p-3 bg-amber-500/10 rounded-xl">
                    {rep.reportType === 'DOG_SIGHTING' ? '🐕' : '⚠️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">
                        {rep.reportType === 'DOG_SIGHTING' ? 'Chien aperçu sur le sentier' : 'Panneau / Tirs'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(rep.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 mt-1">{rep.description}</p>

                    {rep.photoUrl && (
                      <div className="mt-3 w-28 h-20 rounded-lg overflow-hidden border border-slate-700">
                        <img src={rep.photoUrl} alt="Photo signalement" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ADMIN' && (
          <HunterAdminPanel
            sessions={sessions}
            onStartHunt={handleStartHunt}
            onStopHunt={handleStopHunt}
          />
        )}
      </main>

      {/* Modal Signalement */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleAddReport}
      />

      {/* Modal Détails Battue */}
      <SessionDetailsModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />

      {/* Pied de page */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 text-center text-xs text-slate-500">
        <p>Partage Nature • Initiative pour la cohabitation pacifique et la sécurité des espaces ruraux et forestiers.</p>
        <p className="mt-1">Compatible PWA & consultation hors-ligne sur sentiers.</p>
      </footer>
    </div>
  );
}

export default App;
