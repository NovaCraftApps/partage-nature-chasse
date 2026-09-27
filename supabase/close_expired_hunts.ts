// Edge Function / Script d'exécution automatique (Supabase ou Cron Node/Python)
// Déclenchée toutes les 15 minutes pour clôturer automatiquement les battues dont le timeout est dépassé
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function closeExpiredHunts() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date().toISOString();

  console.log(`[AutoTimeout] Vérification des battues expirées à ${now}...`);

  // Sélectionne toutes les battues encore au statut ACTIVE dont l'heure de timeout est dépassée
  const { data: expiredSessions, error: fetchError } = await supabase
    .from('hunting_sessions')
    .select('id, title, auto_timeout_at')
    .eq('status', 'ACTIVE')
    .lt('auto_timeout_at', now);

  if (fetchError) {
    console.error('[AutoTimeout] Erreur de récupération :', fetchError);
    return;
  }

  if (!expiredSessions || expiredSessions.length === 0) {
    console.log('[AutoTimeout] Aucune battue expirée trouvée.');
    return;
  }

  console.log(`[AutoTimeout] ${expiredSessions.length} battue(s) expirée(s) trouvée(s). Clôture en cours...`);

  const idsToUpdate = expiredSessions.map((s) => s.id);

  const { error: updateError } = await supabase
    .from('hunting_sessions')
    .update({ 
      status: 'EXPIRED',
      end_time: now,
      notes: 'Clôture automatique de sécurité par le système (Timeout dépassé).'
    })
    .in('id', idsToUpdate);

  if (updateError) {
    console.error('[AutoTimeout] Erreur lors de la mise à jour :', updateError);
  } else {
    console.log(`[AutoTimeout] Succès : ${idsToUpdate.length} battue(s) passée(s) au statut EXPIRED.`);
  }
}
