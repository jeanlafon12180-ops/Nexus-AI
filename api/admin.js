import crypto from 'node:crypto';

function unauthorized(res) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Nexus IA Admin"');
  return res.status(401).json({ error: 'Accès administrateur requis.' });
}

function authorized(req) {
  const configured = process.env.NEXUS_ADMIN_PASSWORD;
  if (!configured) return false;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const raw = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const colon = raw.indexOf(':');
  if (colon < 0) return false;
  const password = raw.slice(colon + 1);
  const a = Buffer.from(password);
  const b = Buffer.from(configured);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!authorized(req)) return process.env.NEXUS_ADMIN_PASSWORD ? unauthorized(res) : res.status(503).json({ error: 'NEXUS_ADMIN_PASSWORD n’est pas configuré côté serveur.' });

  return res.status(200).json({
    ok: true,
    version: '3.0.0',
    name: 'Nexus IA',
    generatedAt: new Date().toISOString(),
    runtime: process.version,
    environment: process.env.VERCEL_ENV || 'unknown',
    checks: {
      aiEngine: Boolean(process.env.POLLINATIONS_API_KEY),
      imageEngine: Boolean(process.env.POLLINATIONS_API_KEY),
      videoEngine: Boolean(process.env.POLLINATIONS_API_KEY),
      musicEngine: Boolean(process.env.POLLINATIONS_API_KEY),
      adminProtection: true
    },
    privacy: {
      historyStoredByServer: false,
      historyScope: 'browser profile',
      sharedLegacyHistoryKey: false
    },
    note: 'Le tableau de bord affiche des diagnostics serveur en temps réel. Les erreurs détaillées restent dans les Runtime Logs Vercel.'
  });
}
