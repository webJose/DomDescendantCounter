// UI rendering and management
import type { NodeInfo, DescendantData } from './types.js';
import { sortTableData, initializeSorting } from './table-sort.js';

// Track if sorting has been initialized
let sortingInitialized = false;

export function setTitle(nodeInfo: NodeInfo | null) {
    const titleEl = document.getElementById('nodeTitle')!;
    if (!nodeInfo) {
        titleEl.textContent = '(no element selected)';
        return;
    }
    let classStr = nodeInfo.classList && nodeInfo.classList.length ? nodeInfo.classList.join('.') : '';
    if (nodeInfo.id) {
        titleEl.textContent = `${nodeInfo.tag}#${nodeInfo.id}${classStr ? '.' + classStr : ''}`;
    } else {
        titleEl.textContent = nodeInfo.tag + (classStr ? '.' + classStr : '');
    }
}

export function renderTable(data: DescendantData['counts'] | null, total: number = 0, visibleTotal: number = 0) {
    function newRow(key: string, count: number, visibleCount: number, classes?: string) {
        const tr = document.createElement('tr');
        if (classes) {
            tr.className = classes;
        }
        const tdKey = document.createElement('td');
        tdKey.textContent = key;
        tr.appendChild(tdKey);
        const tdCount = document.createElement('td');
        tdCount.textContent = count.toString();
        tr.appendChild(tdCount);
        const tdVisible = document.createElement('td');
        tdVisible.textContent = visibleCount.toString();
        tr.appendChild(tdVisible);
        return tr;
    }

    const table = document.getElementById('countsTable')!;
    const tbody = table.querySelector('tbody')!;
    const noDataEl = document.getElementById('noData')!;
    const exportBtn = document.getElementById('exportMarkdown') as HTMLButtonElement;
    const copyBtn = document.getElementById('copyTableMarkdown') as HTMLButtonElement;
    
    // Initialize sorting on first render
    if (!sortingInitialized && table) {
        initializeSorting();
        sortingInitialized = true;
    }
    
    tbody.innerHTML = '';
    if (!data || typeof data !== 'object') {
        noDataEl.style.display = '';
        table.style.display = 'none';
        if (exportBtn) exportBtn.disabled = true;
        if (copyBtn) copyBtn.disabled = true;
        return;
    }
    
    noDataEl.style.display = 'none';
    table.style.display = '';
    if (exportBtn) exportBtn.disabled = false;
    if (copyBtn) copyBtn.disabled = false;
    
    // Use sorted data instead of Object.entries
    const sortedEntries = sortTableData(data);
    sortedEntries.forEach(([key, value]) => {
        const row = newRow(key, value.count, value.visible);
        tbody.appendChild(row);
    });
    
    let span = document.getElementById("countTotal")!;
    const formatter = Intl.NumberFormat();
    span.textContent = `(${formatter.format(total)})`;
    span = document.getElementById("visibleTotal")!;
    span.textContent = `(${formatter.format(visibleTotal)})`;
}
