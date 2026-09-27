import type { HuntingSession } from '../types';

interface SessionDetailsModalProps {
  session: HuntingSession | null;
  onClose: () => void;
}

export function SessionDetailsModal({ session, onClose }: SessionDetailsModalProps) {
  if (!session) return null;

  const isActive = session.status === 'ACTIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
            <h3 className="text-lg font-bold text-white">
              {isActive ? 'Battue en cours' : 'Battue programmée'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400">Massif / Secteur</span>
            <p className="font-semibold text-white text-base">{session.zoneName}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-xs text-slate-400">Commune</span>
              <p className="font-medium text-slate-200">{session.commune}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Responsable</span>
              <p className="font-medium text-slate-200">{session.societyName}</p>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400">Horaires & Durée</span>
            <p className="text-slate-200">
              Début : <strong className="text-white">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
              {session.autoTimeoutAt && (
                <> • Fin prévue : <strong className="text-white">{new Date(session.autoTimeoutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></>
              )}
            </p>
          </div>

          {session.notes && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                Consigne de sécurité
              </span>
              <p className="text-xs text-red-200 mt-1">{session.notes}</p>
            </div>
          )}

          {session.leadHunterContact && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Contact chef de ligne / battue :</span>
              <a
                href={`tel:${session.leadHunterContact}`}
                className="text-emerald-400 font-semibold hover:underline"
              >
                {session.leadHunterContact}
              </a>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-medium text-slate-200 transition-all cursor-pointer"
        >
          Fermer les détails
        </button>
      </div>
    </div>
  );
}
