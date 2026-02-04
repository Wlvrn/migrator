/**
 * FormRules - Bootstrap 3 → Bootstrap 5 form control transformations
 * Handles: form-group, control-label, help-block, input sizing
 * Priority: 4
 */
class FormRules {
    constructor() {
        this.name = 'Form Controls';
        this.priority = 4;

        this.map = {
            'form-group': 'mb-3',
            'control-label': 'form-label',
            'help-block': 'form-text',
            'input-lg': 'form-control-lg',
            'input-sm': 'form-control-sm',
            'form-control-feedback': 'invalid-feedback',
            'has-success': 'was-validated',
            'has-error': 'was-validated',
            'has-warning': 'was-validated'
        };
    }

    apply(doc, changes) {
        Object.keys(this.map).forEach(oldClass => {
            const newClass = this.map[oldClass];
            const elements = doc.body.querySelectorAll(`.${CSS.escape(oldClass)}`);

            elements.forEach(element => {
                if (!element.classList.contains(oldClass)) return;

                element.classList.remove(oldClass);
                element.classList.add(newClass);

                changes.push({
                    type: 'form',
                    rule: this.name,
                    element: element.tagName.toLowerCase(),
                    selector: this._getElementSelector(element),
                    oldClass: oldClass,
                    newClass: newClass,
                    description: `Replaced '${oldClass}' with '${newClass}'`
                });
            });
        });

        // Handle form-horizontal (needs row class added)
        const horizontalForms = doc.body.querySelectorAll('.form-horizontal');
        horizontalForms.forEach(form => {
            // Form-horizontal still exists in BS5 but form-groups need 'row' class
            const formGroups = form.querySelectorAll('.mb-3');
            formGroups.forEach(group => {
                if (!group.classList.contains('row')) {
                    group.classList.add('row');

                    changes.push({
                        type: 'form',
                        rule: this.name,
                        element: group.tagName.toLowerCase(),
                        selector: this._getElementSelector(group),
                        oldClass: group.className,
                        newClass: group.className,
                        description: 'Added row class to horizontal form group'
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
