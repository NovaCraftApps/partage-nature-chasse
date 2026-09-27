import { useState } from 'react';
import type { PublicReport, ReportType } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<PublicReport, 'id' | 'reportedAt' | 'expiresAt'>) => void;
}

export function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('DOG_SIGHTING');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmit({
      reportType,
      description,
      latitude: 44.005, // Simulation géolocalisation
      longitude: 1.735,
      photoUrl: photoPreview || undefined,
      authorType: 'PROMENEUR'
    });

    setDescription('');
    setPhotoPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📢</span>
            <h3 className="text-xl font-bold text-white">Nouveau Signalement Terrain</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Type de signalement
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReportType('DOG_SIGHTING')}
                className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  reportType === 'DOG_SIGHTING'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🐕</span>
                <span>Chien aperçu</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('SIGN_POSTED')}
                className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  reportType === 'SIGN_POSTED'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>⚠️</span>
                <span>Panneau de battue</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('SHOTS_HEARD')}
                className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  reportType === 'SHOTS_HEARD'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>💥</span>
                <span>Tirs entendus</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('HUNTERS_PRESENT')}
                className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  reportType === 'HUNTERS_PRESENT'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>👥</span>
                <span>Poste de chasse</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Détails & Précisions (Collier, race, attitude, direction)
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Chien courant noir et blanc avec collier vert, très calme, en bordure du ruisseau..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Ajouter une photo (Recommandé si chien errant/perdu)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
            />
            {photoPreview && (
              <div className="mt-3 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-600">
                <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-1 right-1 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs text-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-medium text-slate-300 transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 py-3 rounded-xl font-bold text-slate-950 transition-all shadow-lg cursor-pointer"
            >
              Publier le signalement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
