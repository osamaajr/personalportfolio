(() => {
  const storageKey = 'portfolio-theme';
  const root = document.documentElement;
  const toggles = document.querySelectorAll('[data-theme-toggle]');

  const setTheme = (theme) => {
    const isDark = theme === 'dark';
    root.dataset.theme = isDark ? 'dark' : '';
    toggles.forEach((toggle) => {
      toggle.checked = isDark;
    });

    try {
      localStorage.setItem(storageKey, isDark ? 'dark' : 'light');
    } catch (_) {}
  };

  const storedTheme = (() => {
    try {
      return localStorage.getItem(storageKey);
    } catch (_) {
      return null;
    }
  })();

  setTheme(storedTheme === 'dark' ? 'dark' : 'light');

  toggles.forEach((toggle) => {
    toggle.addEventListener('change', () => {
      setTheme(toggle.checked ? 'dark' : 'light');
    });
  });
})();
