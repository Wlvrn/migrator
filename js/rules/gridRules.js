/**
 * GridRules - Bootstrap 3 → Bootstrap 5 grid system transformations
 * Handles: col-xs-*, offsets, push/pull utilities, and new col-xxl-* support
 * Priority: 1 (highest - applied first)
 */
class GridRules {
    constructor() {
        this.name = 'Grid System';
        this.priority = 1;

        // Grid breakpoints
        this.breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    }

    /**
     * Apply grid transformation rules
     * @param {Document} doc - Parsed HTML document
     * @param {Array} changes - Array to track changes
     */
    apply(doc, changes) {
        // Find all elements with grid classes
        const gridElements = doc.body.querySelectorAll('[class*="col-"]');

        gridElements.forEach(element => {
            const classList = Array.from(element.classList);
            const originalClasses = element.className;
            let modified = false;

            // Process each class
            classList.forEach(cls => {
                // 1. Handle col-xs-* → col-* (xs is now the default in BS5)
                if (/^col-xs-(\d+)$/.test(cls)) {
                    const match = cls.match(/^col-xs-(\d+)$/);
                    const colNumber = match[1];
                    element.classList.remove(cls);
                    element.classList.add(`col-${colNumber}`);
                    modified = true;

                    changes.push({
                        type: 'grid',
                        rule: this.name,
                        element: element.tagName.toLowerCase(),
                        selector: this._getElementSelector(element),
                        oldClass: cls,
                        newClass: `col-${colNumber}`,
                        description: `Migrated ${cls} to col-${colNumber} (xs is now default)`
                    });
                }

                // 2. Handle col-{breakpoint}-offset-{n} → offset-{breakpoint}-{n}
                if (/^col-(\w+)-offset-(\d+)$/.test(cls)) {
                    const match = cls.match(/^col-(\w+)-offset-(\d+)$/);
                    const breakpoint = match[1];
                    const offsetNumber = match[2];

                    element.classList.remove(cls);

                    // Handle xs specially (it becomes just "offset-{n}")
                    const newClass = breakpoint === 'xs'
                        ? `offset-${offsetNumber}`
                        : `offset-${breakpoint}-${offsetNumber}`;

                    element.classList.add(newClass);
                    modified = true;

                    changes.push({
                        type: 'grid',
                        rule: this.name,
                        element: element.tagName.toLowerCase(),
                        selector: this._getElementSelector(element),
                        oldClass: cls,
                        newClass: newClass,
                        description: `Migrated ${cls} to ${newClass} (new offset syntax)`
                    });
                }

                // 3. Handle push/pull utilities (col-{breakpoint}-push-{n} / col-{breakpoint}-pull-{n})
                // In BS5, use order utilities instead
                if (/^col-(\w+)-push-(\d+)$/.test(cls)) {
                    const match = cls.match(/^col-(\w+)-push-(\d+)$/);
                    const breakpoint = match[1];

                    element.classList.remove(cls);

                    // Use order utility as replacement
                    // Note: This is a simplification - may need manual adjustment
                    const newClass = breakpoint === 'xs' ? 'order-last' : `order-${breakpoint}-last`;
                    element.classList.add(newClass);
                    modified = true;

                    changes.push({
                        type: 'grid',
                        rule: this.name,
                        element: element.tagName.toLowerCase(),
                        selector: this._getElementSelector(element),
                        oldClass: cls,
                        newClass: newClass,
                        description: `Migrated ${cls} to ${newClass} (push/pull removed, use order utilities)`,
                        warning: 'Push/pull utilities removed in BS5. Using order utility as replacement - may need manual adjustment.'
                    });
                }

                if (/^col-(\w+)-pull-(\d+)$/.test(cls)) {
                    const match = cls.match(/^col-(\w+)-pull-(\d+)$/);
                    const breakpoint = match[1];

                    element.classList.remove(cls);

                    const newClass = breakpoint === 'xs' ? 'order-first' : `order-${breakpoint}-first`;
                    element.classList.add(newClass);
                    modified = true;

                    changes.push({
                        type: 'grid',
                        rule: this.name,
                        element: element.tagName.toLowerCase(),
                        selector: this._getElementSelector(element),
                        oldClass: cls,
                        newClass: newClass,
                        description: `Migrated ${cls} to ${newClass} (push/pull removed, use order utilities)`,
                        warning: 'Push/pull utilities removed in BS5. Using order utility as replacement - may need manual adjustment.'
                    });
                }
            });

            // Log summary if element was modified
            if (modified) {
                const newClasses = element.className;
                if (originalClasses !== newClasses) {
                    changes.push({
                        type: 'grid',
                        rule: this.name,
                        element: element.tagName.toLowerCase(),
                        selector: this._getElementSelector(element),
                        oldClass: originalClasses,
                        newClass: newClasses,
                        description: `Grid classes updated for ${element.tagName.toLowerCase()}`
                    });
                }
            }
        });

        // Handle container-fluid (unchanged, but verify)
        const containers = doc.body.querySelectorAll('.container-fluid, .container');
        containers.forEach(element => {
            // Container classes are unchanged in BS5, but we'll log for completeness
            if (element.classList.contains('container') || element.classList.contains('container-fluid')) {
                // No change needed, but could add info message
            }
        });
    }

    /**
     * Generate a CSS selector for an element
     * @param {Element} element - DOM element
     * @returns {string} CSS selector
     */
    _getElementSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }

        if (element.className) {
            const classes = Array.from(element.classList).slice(0, 2).join('.');
            return `${element.tagName.toLowerCase()}.${classes}`;
        }

        return element.tagName.toLowerCase();
    }

    /**
     * Get breakpoint tier (for potential future use)
     * @param {string} breakpoint - Breakpoint name
     * @returns {number} Tier index
     */
    _getBreakpointTier(breakpoint) {
        const index = this.breakpoints.indexOf(breakpoint);
        return index >= 0 ? index : 0;
    }
}
