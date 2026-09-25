/* Nexus IA V1.9.6 — mobile menu */
(() => {
  function initMobileMenu() {
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    const openButton = document.getElementById('mobileMenuButton');
    const closeButton = document.getElementById('closeMobileMenu');
    if (!drawer || !backdrop || !openButton) return;

    const setMobileMenu = (open) => {
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      backdrop.hidden = !open;
      backdrop.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('mobile-menu-open', open);
      openButton.setAttribute('aria-expanded', String(open));
      if (open) closeButton?.focus({ preventScroll: true });
      else openButton.focus({ preventScroll: true });
    };

    openButton.setAttribute('aria-expanded', 'false');
    openButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMobileMenu(true);
    });

    closeButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMobileMenu(false);
    });

    backdrop.addEventListener('click', () => setMobileMenu(false));
    drawer.addEventListener('click', (event) => event.stopPropagation());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && drawer.classList.contains('open')) setMobileMenu(false);
    });

    document.getElementById('mobileNewChatButton')?.addEventListener('click', () => {
      document.getElementById('newChatButton')?.click();
      setMobileMenu(false);
    });

    drawer.querySelectorAll('.mobile-tool').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'memory') document.getElementById('memoryButton')?.click();
        if (action === 'help') document.getElementById('helpButton')?.click();
        if (action === 'clear-memory') document.getElementById('clearMemoryButton')?.click();
        setMobileMenu(false);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMobileMenu, { once: true });
  else initMobileMenu();
})();
