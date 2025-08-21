// Table sorting functionality
import { dom } from '@fortawesome/fontawesome-svg-core';
import type { DescendantData } from './types.js';

type SortColumn = 'name' | 'count' | 'visible';
type SortDirection = 'asc' | 'desc';

interface SortState {
    column: SortColumn | null;
    direction: SortDirection;
}

let currentSort: SortState = { column: null, direction: 'desc' };

// Sort the data entries based on current sort state
export function sortTableData(data: DescendantData['counts']): Array<[string, { count: number; visible: number }]> {
    const entries = Object.entries(data).filter(([key]) => key !== 'total' && key !== 'visible');
    
    if (!currentSort.column) {
        // Default sort by count descending
        return entries.sort(([,a], [,b]) => b.count - a.count);
    }
    
    return entries.sort(([nameA, dataA], [nameB, dataB]) => {
        let comparison = 0;
        
        switch (currentSort.column) {
            case 'name':
                comparison = nameA.localeCompare(nameB);
                break;
            case 'count':
                comparison = dataA.count - dataB.count;
                break;
            case 'visible':
                comparison = dataA.visible - dataB.visible;
                break;
        }
        
        return currentSort.direction === 'asc' ? comparison : -comparison;
    });
}

// Initialize sort functionality for table headers
export function initializeSorting() {
    const table = document.getElementById('countsTable');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        // Make headers clickable
        header.style.cursor = 'pointer';
        header.style.userSelect = 'none';
        header.style.position = 'relative';
        
        header.addEventListener('click', () => {
            const column = getColumnFromIndex(index);
            if (column) {
                handleSort(column);
            }
        });
    });
}

// Handle sort click
function handleSort(column: SortColumn) {
    // Toggle direction if same column, otherwise start with desc for count/visible, asc for name
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = column === 'name' ? 'asc' : 'desc';
    }
    
    updateSortIndicators();
    
    // Trigger re-render with current data
    const event = new CustomEvent('sortChanged');
    document.dispatchEvent(event);
}

// Update visual sort indicators
function updateSortIndicators() {
    const table = document.getElementById('countsTable');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        const column = getColumnFromIndex(index);
        const sortIndicator = header.querySelector('.sort-indicator');
        
        // Remove previous styling
        header.classList.remove('sorted');
        
        if (sortIndicator) {
            // Clear the current content and create new icon
            sortIndicator.innerHTML = '';
            
            let iconName = 'sort';
            if (column === currentSort.column) {
                iconName = currentSort.direction === 'asc' ? 'sort-up' : 'sort-down';
                header.classList.add('sorted');
                header.setAttribute('aria-sort', currentSort.direction === 'asc' ? 'ascending' : 'descending');
            } else {
                header.setAttribute('aria-sort', 'none');
            }
            
            // Create new icon element
            const iconElement = document.createElement('i');
            iconElement.className = `fas fa-${iconName}`;
            iconElement.setAttribute('aria-hidden', 'true');
            sortIndicator.appendChild(iconElement);
        }
    });
    
    // Trigger FontAwesome to convert new icons to SVG
    dom.i2svg({ node: table });
}

// Get column type from header index
function getColumnFromIndex(index: number): SortColumn | null {
    switch (index) {
        case 0: return 'name';
        case 1: return 'count';
        case 2: return 'visible';
        default: return null;
    }
}

// Reset sort state (useful when data changes)
export function resetSort() {
    currentSort = { column: null, direction: 'desc' };
    updateSortIndicators();
}

// Get current sort state (useful for exports)
export function getCurrentSort(): SortState {
    return { ...currentSort };
}
