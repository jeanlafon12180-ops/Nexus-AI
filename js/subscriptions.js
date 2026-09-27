export const NEXUS_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Pour découvrir Nexus IA.',
    features: ['Chat IA', 'Conversations', 'Fonctions de base']
  },
  go: {
    id: 'go',
    name: 'Go',
    price: 1,
    description: 'Plus de possibilités au quotidien.',
    features: ['Tout Free', 'Plus de capacité', 'Fonctions avancées']
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 4.99,
    description: 'Pour une utilisation plus complète.',
    features: ['Tout Go', 'Création multimédia', 'Priorité améliorée']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    description: 'Pour une utilisation intensive.',
    features: ['Tout Plus', 'Limites élevées', 'Fonctions Pro']
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    price: 0,
    description: 'Accès complet réservé au compte administrateur.',
    features: ['Toutes les fonctionnalités', 'Accès administration', 'Aucune limite de plan']
  }
};

const PLAN_KEY = 'nexus_ia_subscription_v1';

function readPlan() {
  try {
    const value = localStorage.getItem(PLAN_KEY);
    return NEXUS_PLANS[value] ? value : 'free';
  } catch {
    return 'free';
  }
}

function savePlan(id) {
  try { localStorage.setItem(PLAN_KEY, id); } catch {}
}

export function getCurrentPlan() {
  return NEXUS_PLANS[readPlan()] || NEXUS_PLANS.free;
}

function escapeHtml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderPlans() {
  const target = document.getElementById('subscriptionPlans');
  if (!target) return;
  const current = getCurrentPlan().id;
  target.innerHTML = Object.values(NEXUS_PLANS).map(plan => {
    const currentClass = plan.id === current ? ' current' : '';
    const adminClass = plan.id === 'admin' ? ' admin' : '';
    const price = plan.price === 0 ? '0 €' : String(plan.price).replace('.', ',') + ' €';
    return '<article class="subscription-plan'+currentClass+adminClass+'">' +
      '<h3>'+escapeHtml(plan.name)+'</h3>' +
      '<div class="subscription-price">'+price+' <small>/ mois</small></div>' +
      '<div class="subscription-description">'+escapeHtml(plan.description)+'</div>' +
      '<ul class="subscription-features">'+plan.features.map(feature => '<li>'+escapeHtml(feature)+'</li>').join('')+'</ul>' +
      '<button class="subscription-select" type="button" data-plan="'+plan.id+'">'+(plan.id === current ? 'Plan actuel' : 'Choisir')+'</button>' +
      '</article>';
  }).join('');
  target.querySelectorAll('[data-plan]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.plan;
      if (!NEXUS_PLANS[id]) return;
      if (id === 'admin') {
        alert('Le plan Admin sera attribué uniquement par le système d’administration.');
        return;
      }
      savePlan(id);
      renderPlans();
    });
  });
}

function openSubscriptionModal() {
  const modal = document.getElementById('subscriptionModal');
  if (!modal) return;
  renderPlans();
  modal.hidden = false;
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('subscription-open');
}

function closeSubscriptionModal() {
  const modal = document.getElementById('subscriptionModal');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('subscription-open');
}

window.NexusSubscription = { plans: NEXUS_PLANS, getCurrentPlan, getUsage, getPlanLimit, canUseFeature, recordUsage, open: openSubscriptionModal, close: closeSubscriptionModal };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('subscriptionButton')?.addEventListener('click', openSubscriptionModal);
  document.getElementById('mobileSubscriptionButton')?.addEventListener('click', openSubscriptionModal);
  document.querySelectorAll('[data-close-subscription]').forEach(element => element.addEventListener('click', closeSubscriptionModal));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSubscriptionModal(); });
});

const PLAN_LIMITS = {
  free: { chat: 50, image: 5, video: 0, music: 0, documents: 5 },
  go: { chat: 300, image: 30, video: 3, music: 3, documents: 30 },
  plus: { chat: 1000, image: 100, video: 15, music: 15, documents: 100 },
  pro: { chat: 5000, image: 500, video: 50, music: 50, documents: 500 },
  admin: { chat: Infinity, image: Infinity, video: Infinity, music: Infinity, documents: Infinity }
};
const USAGE_KEY = 'nexus_ia_subscription_usage_v1';

function usageKey() {
  return new Date().toISOString().slice(0, 7);
}
function readUsage() {
  try {
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    return data.month === usageKey() ? data.counts || {} : {};
  } catch { return {}; }
}
function writeUsage(counts) {
  try { localStorage.setItem(USAGE_KEY, JSON.stringify({month: usageKey(), counts})); } catch {}
}
export function getUsage(feature) {
  return readUsage()[feature] || 0;
}
export function getPlanLimit(feature) {
  const plan = getCurrentPlan();
  return PLAN_LIMITS[plan.id]?.[feature] ?? 0;
}
export function canUseFeature(feature) {
  const limit = getPlanLimit(feature);
  return limit === Infinity || getUsage(feature) < limit;
}
export function recordUsage(feature) {
  if (!canUseFeature(feature)) return false;
  const counts = readUsage();
  counts[feature] = (counts[feature] || 0) + 1;
  writeUsage(counts);
  return true;
}
export function planLimitMessage(feature) {
  const limit = getPlanLimit(feature);
  if (limit === 0) return 'Cette fonctionnalité n’est pas incluse dans ton abonnement. Choisis un plan supérieur pour y accéder.';
  return 'Tu as atteint la limite mensuelle de cette fonctionnalité (' + limit + ').';
}
