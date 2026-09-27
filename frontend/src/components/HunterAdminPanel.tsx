import { useState } from 'react';
import type { HuntingSession } from '../types';

interface HunterAdminPanelProps {
  sessions: HuntingSession[];
  onStartHunt: (zoneId: string, durationHours: number, notes: string) => void;
  onStopHunt: (sessionId: string) => void;
}

export function HunterAdminPanel({
  sessions,
  onStartHunt,
  onStopHunt
}: HunterAdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [selectedZone, setSelectedZone] = useState('zone-gresigne-nord');
  const [duration, setDuration] = useState(4);
  const [huntNotes, setHuntNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xl">🎯</span>
          <div>
            <h3 className="font-bold text-lg text-white">Espace Responsable de Battue (ACCA)</h3>
            <p className="text-xs text-slate-400">Activation en 1 clic & respect de la sécurité</p>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
          >
            Déconnexion
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="max-w-sm mx-auto flex flex-col gap-3 py-4">
          <p className="text-sm text-slate-300 text-center">
            Saisissez le code PIN de votre cabane de chasse pour piloter les battues du jour.
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
          {/* Statut En direct */}
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
                    Secteur / Forêt
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
                  placeholder="Ex: Battue sangliers avec chiens, secteur combe basse"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => {
                  onStartHunt(selectedZone, duration, huntNotes);
                  setHuntNotes('');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📢</span>
                <span>DÉMARRER ET SIGNALER LA BATTUE EN DIRECT</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
