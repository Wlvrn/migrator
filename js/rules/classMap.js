/**
 * ClassMapRules - Simple 1:1 class mappings for Bootstrap 3 → Bootstrap 5
 * This is the catch-all rule set for straightforward class replacements
 */
class ClassMapRules {
    constructor() {
        this.name = 'Simple Class Mappings';
        this.priority = 5; // Lowest priority (applied last)

        // 1:1 class mappings
        this.map = {
            // Buttons
            'btn-default': 'btn-secondary',
            'btn-xs': 'btn-sm', // BS5 removed btn-xs, use btn-sm instead

            // Images
            'img-responsive': 'img-fluid',
            'img-circle': 'rounded-circle',
            'img-rounded': 'rounded',

            // Tables
            'table-condensed': 'table-sm',

            // Typography
            'text-muted': 'text-muted', // Unchanged
            'text-primary': 'text-primary', // Unchanged
            'text-success': 'text-success', // Unchanged
            'text-info': 'text-info', // Unchanged
            'text-warning': 'text-warning', // Unchanged
            'text-danger': 'text-danger', // Unchanged

            // Contextual backgrounds
            'bg-primary': 'bg-primary', // Unchanged
            'bg-success': 'bg-success', // Unchanged
            'bg-info': 'bg-info', // Unchanged
            'bg-warning': 'bg-warning', // Unchanged
            'bg-danger': 'bg-danger', // Unchanged

            // Close icon
            'close': 'btn-close',

            // Screen readers
            'sr-only': 'visually-hidden',
            'sr-only-focusable': 'visually-hidden-focusable',

            // Responsive embeds
            'embed-responsive': 'ratio',
            'embed-responsive-16by9': 'ratio-16x9',
            'embed-responsive-4by3': 'ratio-4x3',
            'embed-responsive-item': 'ratio-item',

            // Input groups
            'input-group-addon': 'input-group-text',
            'input-group-btn': 'input-group-text',

            // Navbar
            'navbar-right': 'ms-auto',
            'navbar-left': 'me-auto',
            'navbar-fixed-top': 'fixed-top',
            'navbar-fixed-bottom': 'fixed-bottom',
            'navbar-static-top': 'sticky-top',
            'navbar-toggle': 'navbar-toggler',
            'navbar-default': 'navbar-light bg-light',

            // Breadcrumb
            'breadcrumb-item': 'breadcrumb-item', // Unchanged

            // Pagination
            'pagination-lg': 'pagination-lg', // Unchanged
            'pagination-sm': 'pagination-sm', // Unchanged

            // Media objects
            'media': 'd-flex',
            'media-body': 'flex-grow-1',
            'media-left': 'me-3',
            'media-right': 'ms-3',

            // Cards (some simple mappings, complex ones in componentRules)
            'card-block': 'card-body',
            'card-title': 'card-title', // Unchanged
            'card-text': 'card-text', // Unchanged
            'card-link': 'card-link', // Unchanged

            // Jumbotron (removed in BS5, but provide fallback)
            'jumbotron': 'bg-light p-5 rounded',
            'jumbotron-fluid': 'bg-light p-5',

            // Page header (removed in BS5)
            'page-header': 'border-bottom pb-2 mb-3',

            // Thumbnails
            'thumbnail': 'card',

            // List groups
            'list-group-item-action': 'list-group-item-action', // Unchanged

            // Badges (labels become badges)
            'label': 'badge',
            'label-default': 'badge bg-secondary',
            'label-primary': 'badge bg-primary',
            'label-success': 'badge bg-success',
            'label-info': 'badge bg-info',
            'label-warning': 'badge bg-warning',
            'label-danger': 'badge bg-danger',

            // Alerts
            'alert-dismissible': 'alert-dismissible', // Unchanged

            // Progress bars
            'progress-bar-striped': 'progress-bar-striped', // Unchanged
            'progress-bar-animated': 'progress-bar-animated', // Unchanged

            // Modals
            'modal-sm': 'modal-sm', // Unchanged
            'modal-lg': 'modal-lg', // Unchanged

            // Carousel
            'carousel-inner': 'carousel-inner', // Unchanged
            'carousel-item': 'carousel-item', // Unchanged
            'carousel-control-prev': 'carousel-control-prev', // Unchanged
            'carousel-control-next': 'carousel-control-next', // Unchanged

            // Dropdowns
            'dropdown-menu-right': 'dropdown-menu-end',
            'dropdown-menu-left': 'dropdown-menu-start',

            // Popovers & Tooltips
            'popover': 'popover', // Unchanged
            'tooltip': 'tooltip' // Unchanged
        };
    }

    /**
     * Apply class mapping rules to the document
     * @param {Document} doc - Parsed HTML document
     * @param {Array} changes - Array to track changes
     */
    apply(doc, changes) {
        Object.keys(this.map).forEach(oldClass => {
            const newClasses = this.map[oldClass];

            // Find all elements with the old class
            const elements = doc.body.querySelectorAll(`.${CSS.escape(oldClass)}`);

            elements.forEach(element => {
                // Only process if the element actually has this class
                if (!element.classList.contains(oldClass)) return;

                // Remove old class
                element.classList.remove(oldClass);

                // Add new class(es)
                const newClassArray = newClasses.split(/\s+/).filter(c => c);
                newClassArray.forEach(cls => {
                    if (!element.classList.contains(cls)) {
                        element.classList.add(cls);
                    }
                });

                // Track change
                changes.push({
                    type: 'class-map',
                    rule: this.name,
                    element: element.tagName.toLowerCase(),
                    selector: this._getElementSelector(element),
                    oldClass: oldClass,
                    newClass: newClasses,
                    description: `Replaced '${oldClass}' with '${newClasses}'`
                });
            });
        });
    }

    /**
     * Generate a CSS selector for an element (for debugging)
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
}
