/**
 * Differ - Generate visual diffs and highlight changes
 */
class Differ {
    constructor(originalHTML, transformedHTML, changes) {
        this.original = originalHTML;
        this.transformed = transformedHTML;
        this.changes = changes;
    }

    /**
     * Generate diff with highlighting
     * @returns {Object} Diff data with annotated HTML
     */
    generateDiff() {
        return {
            before: this._escapeHTML(this.original),
            after: this._highlightChanges(this.transformed),
            stats: this._generateStats()
        };
    }

    /**
     * Highlight changed lines in the HTML
     */
    _highlightChanges(html) {
        // For now, just escape HTML
        // In a more advanced version, we could highlight specific changed lines
        return this._escapeHTML(html);
    }

    /**
     * Escape HTML for display
     */
    _escapeHTML(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Generate change statistics
     */
    _generateStats() {
        const stats = {
            total: this.changes.length,
            byType: {},
            byRule: {}
        };

        this.changes.forEach(change => {
            stats.byType[change.type] = (stats.byType[change.type] || 0) + 1;
            stats.byRule[change.rule] = (stats.byRule[change.rule] || 0) + 1;
        });

        return stats;
    }

    /**
     * Format changes for display
     */
    formatChangesForDisplay() {
        const grouped = {};

        this.changes.forEach(change => {
            if (!grouped[change.type]) {
                grouped[change.type] = [];
            }
            grouped[change.type].push(change);
        });

        return grouped;
    }
}
