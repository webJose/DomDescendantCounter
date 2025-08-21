// Modal utility functions for displaying HTML template-based modals

// Generic function to show a modal from an HTML template
export function showModal(htmlTemplate: string, config?: {
    populateContent?: (modal: HTMLElement) => void;
    onClose?: () => void;
}): HTMLElement {
    // Create a temporary container to parse the HTML template
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlTemplate;
    
    // Extract and inject styles into the document head
    const styleElement = tempDiv.querySelector('style');
    let injectedStyleId: string | null = null;
    
    if (styleElement) {
        const styleId = styleElement.id;
        if (!styleId) {
            throw new Error('Style element in modal template must have an ID');
        }
        
        // Only inject if not already present
        if (!document.querySelector(`#${styleId}`)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = styleElement.textContent;
            document.head.appendChild(style);
            injectedStyleId = styleId; // Track that we injected this style
        }
    }
    
    // Extract the modal element (the body content of our template)
    const modal = tempDiv.querySelector('.modal-overlay') as HTMLElement;
    // Let it throw if modal is null - no defensive check needed
    
    // Populate content if provided
    if (config?.populateContent) {
        config.populateContent(modal);
    }
    
    // Set up close functionality
    const closeModal = () => {
        modal.remove();
        document.removeEventListener('keydown', handleKeydown);
        
        // Clean up injected styles
        if (injectedStyleId) {
            const injectedStyle = document.querySelector(`#${injectedStyleId}`);
            if (injectedStyle) {
                injectedStyle.remove();
            }
        }
        
        if (config?.onClose) {
            config.onClose();
        }
    };
    
    // Close on Escape key
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
        }
    };
    
    // Close button functionality
    const closeButtons = modal.querySelectorAll('.modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeydown);
    
    // Add to DOM
    document.body.appendChild(modal);
    
    return modal;
}

// Specific function for the copy modal
export function showCopyModal(text: string): void {
    import('./assets/copy-modal.html?raw').then(({ default: copyModalTemplate }) => {
        showModal(copyModalTemplate, {
            populateContent: (modal) => {
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
                
                // Select All button functionality
                const selectButton = modal.querySelector('.modal-select-btn');
                if (selectButton && textArea) {
                    selectButton.addEventListener('click', () => {
                        textArea.focus();
                        textArea.select();
                    });
                }
            }
        });
    });
}

// Specific function for the help visible modal
export function showHelpVisibleModal(): void {
    import('./assets/help-visible-modal.html?raw').then(({ default: helpModalTemplate }) => {
        showModal(helpModalTemplate);
    });
}
