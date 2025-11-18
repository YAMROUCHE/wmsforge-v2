/**
 * Helper pour extraire organization_id de manière rétrocompatible
 * Si l'auth middleware n'est pas encore appliqué, retourne 1 par défaut
 */
import { Context } from 'hono';

export function getOrganizationId(c: Context): number {
  try {
    const user = c.get('user');
    if (user && user.organizationId) {
      return user.organizationId;
    }
  } catch (e) {
    // Auth pas encore appliqué
  }
  // Fallback pour rétrocompatibilité
  return 1;
}
