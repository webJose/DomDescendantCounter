// Main sidebar script - DOM Descendant Counter Extension
import '@fortawesome/fontawesome-free/css/all.css';
import { copyTableToClipboard, testCopyModal } from './clipboard.js';
import { getData } from './data-collector.js';
import { exportToMarkdown, generateMarkdownTable } from './markdown.js';
import type { DescendantData } from './types.js';
import { renderTable, setTitle } from './ui.js';

// Store current data for export/copy operations
let currentData: DescendantData | null = null;

function handleSelection() {
    chrome.devtools.inspectedWindow.eval<DescendantData | null>(
        `(${getData.toString()})()`,
        {},
        (res, err) => {
            if (err) {
                console.error(err);
                return;
            }
            currentData = res; // Store data for export/copy
            if (res) {
                setTitle(res.currentNode);
                renderTable(res.counts, res.total, res.visible);
            }
            else {
                setTitle(null);
                renderTable(null);
            }
        }
    );
}

// Handle selection changes in DevTools Elements panel
chrome.devtools.panels.elements.onSelectionChanged.addListener(handleSelection);

// Setup export and copy buttons
document.addEventListener('DOMContentLoaded', () => {
    const recalculateBtn = document.getElementById('recalculateCounts')!;
    const exportBtn = document.getElementById('exportMarkdown')!;
    const copyBtn = document.getElementById('copyTableMarkdown')!;
    const testBtn = document.getElementById('testCopyModal')!;

    recalculateBtn.addEventListener('click', () => handleSelection());
    exportBtn.addEventListener('click', () => exportToMarkdown(currentData));
    copyBtn.addEventListener('click', () => copyTableToClipboard(currentData, generateMarkdownTable));
    // Test button to directly show the modal with sample data
    testBtn.addEventListener('click', () => {
        const testData = currentData || {
            currentNode: { tag: 'div', classList: ['test-class'], id: 'test-element' },
            total: 42,
            visible: 35,
            counts: {
                'div': { count: 15, visible: 12 },
                'span': { count: 8, visible: 7 },
                'p': { count: 5, visible: 4 },
                'img': { count: 3, visible: 2 },
                'a': { count: 11, visible: 10 }
            }
        };
        testCopyModal(testData, generateMarkdownTable);
    });

    // Listen for sort changes to re-render table
    document.addEventListener('sortChanged', () => {
        if (currentData) {
            setTitle(currentData.currentNode);
            renderTable(currentData.counts, currentData.total, currentData.visible);
        }
    });

    handleSelection();
});
