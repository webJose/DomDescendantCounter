// Clipboard operations module
import type { DescendantData } from './types.js';
import { showCopyModal } from './modal.js';

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
function showCopySuccess(copyBtn: HTMLButtonElement) {
    const buttonContent = copyBtn.querySelector('.button-content') as HTMLElement;
    const successMessage = copyBtn.querySelector('.success-message') as HTMLElement;
    
    // Hide the icon and show success message
    buttonContent.style.display = 'none';
    successMessage.style.display = 'inline';
    
    setTimeout(() => {
        // Restore the icon and hide success message
        buttonContent.style.display = 'inline';
        successMessage.style.display = 'none';
    }, 1500);
}

// Final fallback - show modal with text to copy manually
function showCopyFallback(text: string) {
    showCopyModal(text);
}

// Copy table to clipboard with fallback methods
export async function copyTableToClipboard(data: DescendantData | null, generateMarkdownTable: (data: DescendantData) => string) {
    if (!data || !data.counts) {
        alert('No data to copy. Please select an element first.');
        return;
    }

    const tableMarkdown = generateMarkdownTable(data);
    const copyBtn = document.getElementById('copyTableMarkdown') as HTMLButtonElement;

    try {
        // Method 1: Try using background script with better permissions
        const backgroundSuccess = await tryClipboardViaBackground(tableMarkdown);
        if (backgroundSuccess) {
            showCopySuccess(copyBtn);
            return;
        }

        // Method 2: Try using the inspected page's context for clipboard access
        const clipboardSuccess = await tryClipboardInInspectedPage(tableMarkdown);
        if (clipboardSuccess) {
            showCopySuccess(copyBtn);
            return;
        }

        // Method 3: Try modern Clipboard API in current context
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(tableMarkdown);
            showCopySuccess(copyBtn);
            return;
        }
        
        // Method 4: Fallback using execCommand (deprecated but more compatible)
        if (copyUsingExecCommand(tableMarkdown)) {
            showCopySuccess(copyBtn);
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
