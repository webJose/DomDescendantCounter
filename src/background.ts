// Background script for handling clipboard operations
// This runs in a more privileged context than DevTools panels

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'copyToClipboard') {
        copyToClipboard(request.text)
            .then(success => {
                sendResponse({ success });
            })
            .catch(error => {
                console.error('Background clipboard failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        
        // Return true to indicate we'll respond asynchronously
        return true;
    }
});

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        // Method 1: Try modern Clipboard API in background context
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Method 2: Try creating an offscreen document for clipboard access
        // This is a newer approach for Manifest V3 extensions
        if (chrome.offscreen) {
            try {
                await chrome.offscreen.createDocument({
                    url: 'offscreen.html',
                    reasons: ['CLIPBOARD'],
                    justification: 'Copy table data to clipboard'
                });
                
                // Send message to offscreen document to handle clipboard
                const response = await chrome.runtime.sendMessage({
                    action: 'offscreenCopy',
                    text: text
                });
                
                return response.success;
            } catch (offscreenError) {
                console.log('Offscreen clipboard not available:', offscreenError);
            }
        }
        
        // Method 3: Fallback to execCommand via content script injection
        return await tryExecCommandViaTab(text);
        
    } catch (error) {
        console.error('All background clipboard methods failed:', error);
        return false;
    }
}

async function tryExecCommandViaTab(text: string): Promise<boolean> {
    try {
        // Get active tab
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab?.id) return false;
        
        // Inject content script to handle clipboard
        const results = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (textToCopy: string) => {
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
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
                    console.error('Content script clipboard failed:', err);
                    return false;
                }
            },
            args: [text]
        });
        
        return results[0]?.result === true;
    } catch (error) {
        console.error('Tab injection failed:', error);
        return false;
    }
}
