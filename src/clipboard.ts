// Clipboard operations module
import type { DescendantData } from './types.js';
import copyModalTemplate from './assets/copy-modal.html?raw';

// Try clipboard via background script
function tryClipboardViaBackground(text: string): Promise<boolean> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { action: 'copyToClipboard', text: text },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Background script communication failed:', chrome.runtime.lastError);
                    resolve(false);
                    return;
                }
                resolve(response?.success === true);
            }
        );
    });
}

// Try to use clipboard in the inspected page's context (cross-origin workaround)
function tryClipboardInInspectedPage(text: string): Promise<boolean> {
    return new Promise((resolve) => {
        chrome.devtools.inspectedWindow.eval(
            `
            (async function() {
                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(${JSON.stringify(text)});
                        return true;
                    }
                    
                    // Fallback to execCommand in inspected page
                    const textArea = document.createElement('textarea');
                    textArea.value = ${JSON.stringify(text)};
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    const result = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return result;
                } catch (err) {
                    console.error('Inspected page clipboard failed:', err);
                    return false;
                }
            })()
            `,
            {},
            (result, isException) => {
                if (isException || !result) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        );
    });
}

// Fallback method using deprecated execCommand
function copyUsingExecCommand(text: string): boolean {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
    } catch (err) {
        console.error('execCommand failed:', err);
        return false;
    }
}

// Show success feedback
function showCopySuccess(copyBtn: HTMLButtonElement, originalText: string | null) {
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#00ff88';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
    }, 1500);
}

// Final fallback - show modal with text to copy manually
function showCopyFallback(text: string) {
    // Create a temporary container to parse the HTML template
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = copyModalTemplate;
    
    // Extract and inject the styles into the document head
    const styleElement = tempDiv.querySelector('style');
    if (styleElement && !document.querySelector('#copy-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'copy-modal-styles';
        style.textContent = styleElement.textContent;
        document.head.appendChild(style);
    }
    
    // Extract the modal element (the body content of our template)
    const modal = tempDiv.querySelector('.modal-overlay') as HTMLElement;
    if (!modal) {
        console.error('Modal template is malformed');
        // Fallback to alert if template fails
        alert(`Copy this text manually:\n\n${text}`);
        return;
    }
    
    // Find and populate the textarea with our text
    const textArea = modal.querySelector('.modal-textarea') as HTMLTextAreaElement;
    if (textArea) {
        textArea.value = text;
        // Auto-select the text when modal opens
        setTimeout(() => {
            textArea.focus();
            textArea.select();
        }, 100);
    }
    
    // Setup Select All button functionality
    const selectBtn = modal.querySelector('.modal-select-btn') as HTMLButtonElement;
    if (selectBtn && textArea) {
        selectBtn.onclick = () => {
            textArea.focus();
            textArea.select();
        };
    }
    
    // Setup close button functionality
    const closeBtn = modal.querySelector('.modal-close-btn') as HTMLButtonElement;
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.body.removeChild(modal);
            // Clean up styles when modal is closed (optional)
            const styleEl = document.querySelector('#copy-modal-styles');
            if (styleEl) styleEl.remove();
        };
    }
    
    // Close modal when clicking outside content area
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            // Clean up styles when modal is closed (optional)
            const styleEl = document.querySelector('#copy-modal-styles');
            if (styleEl) styleEl.remove();
        }
    };
    
    // Close modal on Escape key
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleKeydown);
            // Clean up styles when modal is closed (optional)
            const styleEl = document.querySelector('#copy-modal-styles');
            if (styleEl) styleEl.remove();
        }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Add to DOM
    document.body.appendChild(modal);
}

// Copy table to clipboard with fallback methods
export async function copyTableToClipboard(data: DescendantData | null, generateMarkdownTable: (data: DescendantData) => string) {
    if (!data || !data.counts) {
        alert('No data to copy. Please select an element first.');
        return;
    }

    const tableMarkdown = generateMarkdownTable(data);
    const copyBtn = document.getElementById('copyTableMarkdown') as HTMLButtonElement;
    const originalText = copyBtn.textContent;

    try {
        // Method 1: Try using background script with better permissions
        const backgroundSuccess = await tryClipboardViaBackground(tableMarkdown);
        if (backgroundSuccess) {
            showCopySuccess(copyBtn, originalText);
            return;
        }

        // Method 2: Try using the inspected page's context for clipboard access
        const clipboardSuccess = await tryClipboardInInspectedPage(tableMarkdown);
        if (clipboardSuccess) {
            showCopySuccess(copyBtn, originalText);
            return;
        }

        // Method 3: Try modern Clipboard API in current context
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(tableMarkdown);
            showCopySuccess(copyBtn, originalText);
            return;
        }
        
        // Method 4: Fallback using execCommand (deprecated but more compatible)
        if (copyUsingExecCommand(tableMarkdown)) {
            showCopySuccess(copyBtn, originalText);
            return;
        }
        
        // Method 5: Final fallback - show text in a modal for manual copying
        showCopyFallback(tableMarkdown);
        
    } catch (err) {
        console.error('All clipboard methods failed:', err);
        // Fallback to showing the text for manual copying
        showCopyFallback(tableMarkdown);
    }
}

// Export for testing purposes
export function testCopyModal(data: DescendantData, generateMarkdownTable: (data: DescendantData) => string) {
    const tableMarkdown = generateMarkdownTable(data);
    showCopyFallback(tableMarkdown);
}
