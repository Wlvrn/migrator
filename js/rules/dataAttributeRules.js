/**
 * DataAttributeRules - Bootstrap 3 → Bootstrap 5 data attribute transformations
 * Handles: data-toggle, data-target, data-dismiss, data-parent, data-ride, etc.
 * Priority: 0 (highest - applied before all class rules)
 *
 * Bootstrap 5 renamed all data-* attributes to data-bs-* to avoid conflicts
 * with other libraries and third-party code.
 */
class DataAttributeRules {
    constructor() {
        this.name = 'Data Attributes';
        this.priority = 0;

        // Direct 1:1 attribute renames
        this.attributeMap = {
            'data-toggle':    'data-bs-toggle',
            'data-target':    'data-bs-target',
            'data-dismiss':   'data-bs-dismiss',
            'data-parent':    'data-bs-parent',
            'data-ride':      'data-bs-ride',
            'data-slide':     'data-bs-slide',
            'data-slide-to':  'data-bs-slide-to',
            'data-spy':       'data-bs-spy',
            'data-offset':    'data-bs-offset',
            'data-interval':  'data-bs-interval',
            'data-keyboard':  'data-bs-keyboard',
            'data-pause':     'data-bs-pause',
            'data-wrap':      'data-bs-wrap',
            'data-touch':     'data-bs-touch',
            'data-content':   'data-bs-content',
            'data-placement': 'data-bs-placement',
            'data-trigger':   'data-bs-trigger',
            'data-container': 'data-bs-container',
            'data-template':  'data-bs-template',
            'data-title':     'data-bs-title',
            'data-delay':     'data-bs-delay',
            'data-html':      'data-bs-html',
            'data-animation': 'data-bs-animation',
            'data-backdrop':  'data-bs-backdrop',
            'data-focus':     'data-bs-focus',
            'data-show':      'data-bs-show',
        };
    }

    /**
     * Apply data attribute renaming rules to every element in the document
     * @param {Document} doc - Parsed HTML document
     * @param {Array} changes - Array to track changes
     */
    apply(doc, changes) {
        const allElements = doc.body.querySelectorAll('*');

        allElements.forEach(element => {
            Object.entries(this.attributeMap).forEach(([oldAttr, newAttr]) => {
                if (element.hasAttribute(oldAttr)) {
                    const value = element.getAttribute(oldAttr);

                    // Only rename — do not add if data-bs-* already exists
                    if (!element.hasAttribute(newAttr)) {
                        element.setAttribute(newAttr, value);
                    }
                    element.removeAttribute(oldAttr);

                    changes.push({
                        type: 'data-attribute',
                        rule: this.name,
                        element: element.tagName.toLowerCase(),
                        selector: this._getElementSelector(element),
                        oldClass: `${oldAttr}="${value}"`,
                        newClass: `${newAttr}="${value}"`,
                        description: `Renamed ${oldAttr} to ${newAttr}`
                    });
                }
            });
        });
    }

    _getElementSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) {
            const classes = Array.from(element.classList).slice(0, 2).join('.');
            return `${element.tagName.toLowerCase()}.${classes}`;
        }
        return element.tagName.toLowerCase();
    }
}
