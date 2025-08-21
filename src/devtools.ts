// DevTools extension: Adds a sidebar to the Elements panel with a custom HTML table
chrome.devtools.panels.elements.createSidebarPane(
    "Descendant Count",
    function (sidebar) {
        sidebar.setPage('sidebar.html');
    }
);
