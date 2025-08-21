// Theme detection and CSS loading utility
export function initializeTheme() {
    // Remove any existing theme stylesheets
    const existingThemeLinks = document.querySelectorAll('link[data-theme]');
    existingThemeLinks.forEach(link => link.remove());
    
    // Detect user's preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    
    // Load the appropriate theme CSS
    loadThemeCSS(theme);
    
    // Listen for theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        loadThemeCSS(newTheme);
    });
}

function loadThemeCSS(theme: 'light' | 'dark') {
    // Remove existing theme stylesheet
    const existingLink = document.querySelector('link[data-theme]');
    if (existingLink) {
        existingLink.remove();
    }
    
    // Create and append new theme stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./public/style-${theme}.css`;
    link.setAttribute('data-theme', theme);
    
    // Insert before any existing stylesheets to allow overrides
    const firstLink = document.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
        firstLink.parentNode?.insertBefore(link, firstLink.nextSibling);
    } else {
        document.head.appendChild(link);
    }
}
