import { useState } from 'react';
import type { HuntingSession } from '../types';

interface HunterAdminPanelProps {
  sessions: HuntingSession[];
  onStartHunt: (zoneId: string, durationHours: number, notes: string, customPolygon?: [number, number][]) => void;
  onPlanHunt: (
    title: string,
    zoneId: string,
    startDate: string,
    startTime: string,
    endTime: string,
    notes: string,
    recurrenceDays: string[],
    customPolygon?: [number, number][]
  ) => void;
  onStopHunt: (sessionId: string) => void;
  // Contrôle du tracé sur la carte
  isDrawingMode: boolean;
  setIsDrawingMode: (val: boolean) => void;
  drawingPoints: [number, number][];
  onClearDrawing: () => void;
}

export function HunterAdminPanel({
  sessions,
  onStartHunt,
  onPlanHunt,
  onStopHunt,
  isDrawingMode,
  setIsDrawingMode,
  drawingPoints,
  onClearDrawing
}: HunterAdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'LIVE' | 'PLANNING'>('LIVE');

  // État Live
  const [selectedZone, setSelectedZone] = useState('zone-gresigne-nord');
  const [duration, setDuration] = useState(4);
  const [huntNotes, setHuntNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // État Planification (Semaine / Mois)
  const [planTitle, setPlanTitle] = useState('Battue planifiée Grand Gibier');
  const [planDate, setPlanDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [planStartTime, setPlanStartTime] = useState('08:00');
  const [planEndTime, setPlanEndTime] = useState('13:00');
  const [planNotes, setPlanNotes] = useState('');
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>(['Dimanche']);

  // Vérification d'accès simplifiée par PIN ACCA
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === '8100' || pinCode === '1234') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Code PIN ACCA invalide (Essayez 8100 pour la démo).');
    }
  };

  const activeHunt = sessions.find((s) => s.status === 'ACTIVE');
  const plannedHunts = sessions.filter((s) => s.status === 'PLANNED');

  const toggleRecurrenceDay = (day: string) => {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-2xl">🎯</span>
          <div>
            <h3 className="font-bold text-lg text-white">Espace Responsable de Battue (ACCA)</h3>
            <p className="text-xs text-slate-400">Tracé cartographique sur-mesure & planification hebdomadaire/mensuelle</p>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setIsDrawingMode(false);
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
          >
            Déconnexion
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="max-w-sm mx-auto flex flex-col gap-3 py-6">
          <p className="text-sm text-slate-300 text-center">
            Saisissez le code PIN de votre cabane de chasse pour piloter les battues et le calendrier prévisionnel.
          </p>
          <input
            type="password"
            maxLength={6}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="Code PIN (ex: 8100)"
            className="text-center tracking-widest text-xl bg-slate-800 border border-slate-700 rounded-xl py-3 text-white focus:outline-none focus:border-emerald-500"
          />
          {errorMsg && <p className="text-red-400 text-xs text-center">{errorMsg}</p>}
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            Déverrouiller le Pupitre
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Sous-onglets de gestion */}
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveSubTab('LIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'LIVE'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🔴 Direct Live Terrain
            </button>
            <button
              onClick={() => setActiveSubTab('PLANNING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'PLANNING'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📅 Planification (Semaine / Mois)
            </button>
          </div>

          {/* Outil de dessin de la zone de chasse */}
          <div className="bg-sky-950/40 border border-sky-600/50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✏️</span>
              <div>
                <h4 className="text-sm font-bold text-sky-200">
                  {isDrawingMode ? 'Mode Dessin Cartographique Activé' : 'Tracer une zone de chasse sur-mesure sur la carte IGN'}
                </h4>
                <p className="text-xs text-slate-300">
                  {isDrawingMode
                    ? `Cliquez sur la carte pour délimiter les contours (${drawingPoints.length} point(s) posé(s)).`
                    : 'Permet de dessiner précisément le polygone de la traque du jour au lieu du massif complet.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isDrawingMode ? (
                <>
                  <button
                    onClick={onClearDrawing}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    Effacer ({drawingPoints.length})
                  </button>
                  <button
                    onClick={() => setIsDrawingMode(false)}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg cursor-pointer"
                  >
                    Valider le tracé ({drawingPoints.length} pts)
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsDrawingMode(true)}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <span>✏️</span>
                  <span>{drawingPoints.length > 0 ? `Modifier tracé (${drawingPoints.length} pts)` : 'Dessiner sur la carte'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ONGLET 1 : DIRECT LIVE */}
          {activeSubTab === 'LIVE' && (
            <div>
              {activeHunt ? (
                <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="text-red-400 font-bold uppercase text-xs tracking-wider">
                        Battue en cours sur le terrain
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{activeHunt.zoneName}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Démarrée à {new Date(activeHunt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                      Arrêt automatique programmé à {new Date(activeHunt.autoTimeoutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {activeHunt.notes && <p className="text-xs text-red-200 mt-2 italic">« {activeHunt.notes} »</p>}
                  </div>

                  <button
                    onClick={() => onStopHunt(activeHunt.id)}
                    className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-black px-6 py-4 rounded-xl shadow-xl transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🛑</span>
                    <span>TERMINER LA BATTUE (ZONE DÉGAGÉE)</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl">
                  <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <span>➕</span> Démarrer une nouvelle battue en direct
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Secteur / Forêt de référence
                      </label>
                      <select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-emerald-500"
                      >
                        <option value="zone-gresigne-nord">Massif Nord Grésigne (Puycelsi)</option>
                        <option value="zone-cantaranne-vallee">Vallée Cantaranne (Privezac)</option>
                        <option value="zone-gaillac-coteaux">Forêt de Sivens (Castelnau)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Durée max estimée (Timeout automatique anti-oubli)
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-emerald-500"
                      >
                        <option value={2}>2 heures (Courte battue matinale)</option>
                        <option value={4}>4 heures (Matinée standard)</option>
                        <option value={6}>6 heures (Journée complète)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Consigne aux promeneurs / gibier traqué
                    </label>
                    <input
                      type="text"
                      value={huntNotes}
                      onChange={(e) => setHuntNotes(e.target.value)}
                      placeholder="Ex: Battue sangliers avec chiens courants, vallon nord"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      onStartHunt(
                        selectedZone,
                        duration,
                        huntNotes,
                        drawingPoints.length >= 3 ? drawingPoints : undefined
                      );
                      setHuntNotes('');
                      onClearDrawing();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>📢</span>
                    <span>
                      DÉMARRER ET SIGNALER LA BATTUE EN DIRECT {drawingPoints.length >= 3 ? '(AVEC TRACÉ CARTO)' : ''}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ONGLET 2 : PLANIFICATION SEMAINE / MOIS */}
          {activeSubTab === 'PLANNING' && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl">
                <h4 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                  <span>📅</span> Planifier des battues prévisionnelles (Semaine / Mois)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Intitulé de la battue
                    </label>
                    <input
                      type="text"
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Secteur concerné
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-orange-500"
                    >
                      <option value="zone-gresigne-nord">Massif Nord Grésigne (Puycelsi)</option>
                      <option value="zone-cantaranne-vallee">Vallée Cantaranne (Privezac)</option>
                      <option value="zone-gaillac-coteaux">Forêt de Sivens (Castelnau)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={planDate}
                      onChange={(e) => setPlanDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      value={planStartTime}
                      onChange={(e) => setPlanStartTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      value={planEndTime}
                      onChange={(e) => setPlanEndTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Récurrence hebdomadaire */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Récurrence hebdomadaire programmée pour la saison / le mois
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Jeudi', 'Samedi', 'Dimanche', 'Jours fériés'].map((day) => {
                      const isSelected = recurrenceDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleRecurrenceDay(day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-600 border-orange-500 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Notes & Consignes
                  </label>
                  <input
                    type="text"
                    value={planNotes}
                    onChange={(e) => setPlanNotes(e.target.value)}
                    placeholder="Ex: Calendrier régulier de battues hivernales, respecter le balisage"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-orange-500"
                  />
                </div>

                <button
                  onClick={() => {
                    onPlanHunt(
                      planTitle,
                      selectedZone,
                      planDate,
                      planStartTime,
                      planEndTime,
                      planNotes,
                      recurrenceDays,
                      drawingPoints.length >= 3 ? drawingPoints : undefined
                    );
                    setPlanNotes('');
                    onClearDrawing();
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📅</span>
                  <span>ENREGISTRER LA PLANIFICATION AU CALENDRIER PUBLIC</span>
                </button>
              </div>

              {/* Liste des battues planifiées */}
              <div>
                <h5 className="text-sm font-bold text-slate-300 mb-3">
                  Battues prévues au calendrier ({plannedHunts.length})
                </h5>
                <div className="flex flex-col gap-3">
                  {plannedHunts.map((s) => (
                    <div
                      key={s.id}
                      className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                          <strong className="text-sm text-white">{s.zoneName}</strong>
                          <span className="text-xs text-slate-400">({s.commune})</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Prévue le {new Date(s.startTime).toLocaleDateString()} de {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} à {s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                        {s.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{s.notes}</p>}
                      </div>
                      <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-md border border-orange-400/20">
                        Programmée
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
