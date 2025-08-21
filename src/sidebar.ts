// Main sidebar script - DOM Descendant Counter Extension
import type { DescendantData } from './types.js';
import { getData } from './data-collector.js';
import { setTitle, renderTable } from './ui.js';
import { generateMarkdownTable, exportToMarkdown } from './markdown.js';
import { copyTableToClipboard, testCopyModal } from './clipboard.js';

// Store current data for export/copy operations
let currentData: DescendantData | null = null;

// Handle selection changes in DevTools Elements panel
chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
    chrome.devtools.inspectedWindow.eval<DescendantData | null>(
        `(${getData.toString()})()`,
        {},
        (res, err) => {
            if (err) {
                console.error(err);
                return;
            }
            if (res) {
                currentData = res; // Store data for export/copy
                setTitle(res.currentNode);
                renderTable(res.counts, res.total, res.visible);
            }
        }
    );
});

// Setup export and copy buttons
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportMarkdown');
    const copyBtn = document.getElementById('copyTableMarkdown');
    const testBtn = document.getElementById('testCopyModal');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportToMarkdown(currentData));
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyTableToClipboard(currentData, generateMarkdownTable));
    }
    
    // Test button to directly show the modal with sample data
    if (testBtn) {
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
    }
    
    // Listen for sort changes to re-render table
    document.addEventListener('sortChanged', () => {
        if (currentData) {
            setTitle(currentData.currentNode);
            renderTable(currentData.counts, currentData.total, currentData.visible);
        }
    });
});

// Initial state
setTitle(null);
renderTable(null);
