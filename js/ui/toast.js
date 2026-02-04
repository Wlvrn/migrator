/**
 * Toast - Simple notification system
 */
class Toast {
    /**
     * Show a toast notification
     */
    static show(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast toast-${type} toast-show`;

        setTimeout(() => {
            toast.className = 'toast';
        }, duration);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error', 5000);
    }

    static warning(message) {
        this.show(message, 'warning', 4000);
    }

    static info(message) {
        this.show(message, 'info');
    }
}
