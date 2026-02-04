/**
 * Clipboard - Copy to clipboard functionality
 */
class ClipboardManager {
    /**
     * Copy text to clipboard
     */
    static async copy(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                // Use modern clipboard API
                await navigator.clipboard.writeText(text);
                return { success: true, message: 'Copied to clipboard!' };
            } else {
                // Fallback for older browsers
                return this._fallbackCopy(text);
            }
        } catch (error) {
            return { success: false, message: 'Failed to copy: ' + error.message };
        }
    }

    /**
     * Fallback copy method for older browsers
     */
    static _fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return { success: true, message: 'Copied to clipboard!' };
        } catch (error) {
            document.body.removeChild(textArea);
            return { success: false, message: 'Failed to copy' };
        }
    }
}
