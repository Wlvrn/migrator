/**
 * Migrator - Main orchestration engine for Bootstrap 3 → 5 migration
 * Coordinates all rule sets and manages the transformation process
 */
class Migrator {
    constructor() {
        // Initialize rule sets in priority order
        this.rules = [
            new GridRules(),        // Priority 1
            new UtilityRules(),     // Priority 2
            new ComponentRules(),   // Priority 3
            new FormRules(),        // Priority 4
            new ClassMapRules()     // Priority 5 (catch-all)
        ];

        this.changes = [];
        this.warnings = [];
        this.errors = [];
    }

    /**
     * Migrate Bootstrap 3 HTML to Bootstrap 5
     * @param {string} htmlString - Bootstrap 3 HTML code
     * @returns {Object} Result object with migrated HTML and metadata
     */
    migrate(htmlString) {
        // Reset state
        this.changes = [];
        this.warnings = [];
        this.errors = [];

        // Parse HTML
        const parser = new HTMLParser(htmlString);
        const doc = parser.parse();

        if (!parser.isValid()) {
            this.errors.push(...parser.getErrors());
            return {
                success: false,
                html: htmlString,
                changes: [],
                warnings: [],
                errors: this.errors
            };
        }

        // Collect warnings from parser
        this.warnings.push(...parser.getWarnings());

        // Apply rules in priority order
        this.rules
            .sort((a, b) => a.priority - b.priority)
            .forEach(ruleSet => {
                try {
                    ruleSet.apply(doc, this.changes);
                } catch (error) {
                    this.errors.push(`Error in ${ruleSet.name}: ${error.message}`);
                }
            });

        // Rebuild HTML
        const migratedHTML = parser.rebuild();

        // Collect warnings from changes
        const changeWarnings = this.changes
            .filter(change => change.warning)
            .map(change => change.warning);
        this.warnings.push(...changeWarnings);

        return {
            success: true,
            html: migratedHTML,
            originalHTML: htmlString,
            changes: this.changes,
            warnings: this.warnings,
            errors: this.errors,
            stats: this._generateStats()
        };
    }

    /**
     * Generate statistics about the migration
     * @returns {Object} Statistics object
     */
    _generateStats() {
        const stats = {
            totalChanges: this.changes.length,
            byType: {},
            byRule: {},
            affectedElements: new Set()
        };

        this.changes.forEach(change => {
            // Count by type
            stats.byType[change.type] = (stats.byType[change.type] || 0) + 1;

            // Count by rule
            stats.byRule[change.rule] = (stats.byRule[change.rule] || 0) + 1;

            // Track affected elements
            if (change.selector) {
                stats.affectedElements.add(change.selector);
            }
        });

        stats.affectedElements = stats.affectedElements.size;

        return stats;
    }

    /**
     * Get detailed report of changes
     * @returns {string} Formatted report
     */
    getReport() {
        const stats = this._generateStats();

        let report = `Bootstrap 3 → 5 Migration Report\n`;
        report += `=====================================\n\n`;
        report += `Total Changes: ${stats.totalChanges}\n`;
        report += `Affected Elements: ${stats.affectedElements}\n\n`;

        report += `Changes by Type:\n`;
        Object.keys(stats.byType).forEach(type => {
            report += `  ${type}: ${stats.byType[type]}\n`;
        });

        report += `\nChanges by Rule:\n`;
        Object.keys(stats.byRule).forEach(rule => {
            report += `  ${rule}: ${stats.byRule[rule]}\n`;
        });

        if (this.warnings.length > 0) {
            report += `\nWarnings (${this.warnings.length}):\n`;
            this.warnings.forEach((warning, i) => {
                report += `  ${i + 1}. ${warning}\n`;
            });
        }

        if (this.errors.length > 0) {
            report += `\nErrors (${this.errors.length}):\n`;
            this.errors.forEach((error, i) => {
                report += `  ${i + 1}. ${error}\n`;
            });
        }

        return report;
    }
}
