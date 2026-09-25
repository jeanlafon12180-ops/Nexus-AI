import { getModelRoutingStatus } from './model-router.js';
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

async function getGithubStatus() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const [repoResponse, commitsResponse] = await Promise.all([
      fetch('https://api.github.com/repos/jeanlafon12180-ops/Nexus-AI', {
        headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'Nexus-IA-Admin' },
        signal: controller.signal
      }),
      fetch('https://api.github.com/repos/jeanlafon12180-ops/Nexus-AI/commits?per_page=1', {
        headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'Nexus-IA-Admin' },
        signal: controller.signal
      })
    ]);
    clearTimeout(timeout);
    if (!repoResponse.ok || !commitsResponse.ok) throw new Error('GitHub API indisponible');
    const repo = await repoResponse.json();
    const commits = await commitsResponse.json();
    const latest = commits?.[0];
    return {
      ok: true,
      repository: repo.full_name,
      private: Boolean(repo.private),
      defaultBranch: repo.default_branch,
      openIssues: repo.open_issues_count,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      lastCommit: latest ? {
        sha: latest.sha,
        message: latest.commit?.message?.split('\\n')[0] || '',
        author: latest.commit?.author?.name || latest.author?.login || 'inconnu',
        date: latest.commit?.author?.date || null
      } : null,
      url: repo.html_url
    };
  } catch (error) {
    return { ok: false, error: error.message || 'GitHub indisponible' };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!authorized(req)) return process.env.NEXUS_ADMIN_PASSWORD ? unauthorized(res) : res.status(503).json({ error: 'NEXUS_ADMIN_PASSWORD n’est pas configuré côté serveur.' });

  return res.status(200).json({
    ok: true,
    version: '3.3.0',
    name: 'Nexus IA',
    generatedAt: new Date().toISOString(),
    runtime: process.version,
    environment: process.env.VERCEL_ENV || 'unknown',
    checks: {
      github: true,
      aiEngine: Boolean(process.env.OPENAI_API_KEY || process.env.NEXUS_FALLBACK_API_KEY || process.env.POLLINATIONS_API_KEY),
      imageEngine: Boolean(process.env.POLLINATIONS_API_KEY),
      videoEngine: Boolean(process.env.POLLINATIONS_API_KEY),
      musicEngine: Boolean(process.env.POLLINATIONS_API_KEY),
      adminProtection: true
    },
    github: await getGithubStatus(),
    modelRouting: getModelRoutingStatus(),
    privacy: {
      historyStoredByServer: false,
      historyScope: 'browser profile',
      sharedLegacyHistoryKey: false
    },
    note: 'Le tableau de bord V3.3 affiche des diagnostics serveur en temps réel. Les erreurs détaillées restent dans les Runtime Logs Vercel.'
  });
}
