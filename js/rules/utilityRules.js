/**
 * UtilityRules - Bootstrap 3 → Bootstrap 5 utility class transformations
 * Handles: float utilities, text alignment, visibility classes
 * Priority: 2
 */
class UtilityRules {
    constructor() {
        this.name = 'Utility Classes';
        this.priority = 2;

        // Simple utility mappings
        this.simpleMap = {
            'pull-right': 'float-end',
            'pull-left': 'float-start',
            'text-right': 'text-end',
            'text-left': 'text-start',
            'center-block': 'mx-auto d-block',
            'text-justify': 'text-justify', // Removed in BS5 but keeping for now
            'text-nowrap': 'text-nowrap', // Unchanged
            'text-lowercase': 'text-lowercase', // Unchanged
            'text-uppercase': 'text-uppercase', // Unchanged
            'text-capitalize': 'text-capitalize' // Unchanged
        };

        // Responsive visibility mappings (complex - require multiple classes)
        this.visibilityMap = {
            'hidden-xs': 'd-none d-sm-block',
            'hidden-sm': 'd-sm-none d-md-block',
            'hidden-md': 'd-md-none d-lg-block',
            'hidden-lg': 'd-lg-none d-xl-block',
            'hidden-xl': 'd-xl-none',
            'visible-xs': 'd-block d-sm-none',
            'visible-xs-block': 'd-block d-sm-none',
            'visible-xs-inline': 'd-inline d-sm-none',
            'visible-xs-inline-block': 'd-inline-block d-sm-none',
            'visible-sm': 'd-none d-sm-block d-md-none',
            'visible-sm-block': 'd-none d-sm-block d-md-none',
            'visible-sm-inline': 'd-none d-sm-inline d-md-none',
            'visible-sm-inline-block': 'd-none d-sm-inline-block d-md-none',
            'visible-md': 'd-none d-md-block d-lg-none',
            'visible-md-block': 'd-none d-md-block d-lg-none',
            'visible-md-inline': 'd-none d-md-inline d-lg-none',
            'visible-md-inline-block': 'd-none d-md-inline-block d-lg-none',
            'visible-lg': 'd-none d-lg-block d-xl-none',
            'visible-lg-block': 'd-none d-lg-block d-xl-none',
            'visible-lg-inline': 'd-none d-lg-inline d-xl-none',
            'visible-lg-inline-block': 'd-none d-lg-inline-block d-xl-none'
        };
    }

    apply(doc, changes) {
        // Apply simple mappings
        Object.keys(this.simpleMap).forEach(oldClass => {
            const newClasses = this.simpleMap[oldClass];
            const elements = doc.body.querySelectorAll(`.${CSS.escape(oldClass)}`);

            elements.forEach(element => {
                if (!element.classList.contains(oldClass)) return;

                element.classList.remove(oldClass);
                const newClassArray = newClasses.split(/\s+/).filter(c => c);
                newClassArray.forEach(cls => element.classList.add(cls));

                changes.push({
                    type: 'utility',
                    rule: this.name,
                    element: element.tagName.toLowerCase(),
                    selector: this._getElementSelector(element),
                    oldClass: oldClass,
                    newClass: newClasses,
                    description: `Replaced '${oldClass}' with '${newClasses}'`
                });
            });
        });

        // Apply responsive visibility mappings
        Object.keys(this.visibilityMap).forEach(oldClass => {
            const newClasses = this.visibilityMap[oldClass];
            const elements = doc.body.querySelectorAll(`.${CSS.escape(oldClass)}`);

            elements.forEach(element => {
                if (!element.classList.contains(oldClass)) return;

                element.classList.remove(oldClass);
                const newClassArray = newClasses.split(/\s+/).filter(c => c);
                newClassArray.forEach(cls => element.classList.add(cls));

                changes.push({
                    type: 'utility',
                    rule: this.name,
                    element: element.tagName.toLowerCase(),
                    selector: this._getElementSelector(element),
                    oldClass: oldClass,
                    newClass: newClasses,
                    description: `Replaced visibility class '${oldClass}' with '${newClasses}'`
                });
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
