/**
 * ComponentRules - Bootstrap 3 → Bootstrap 5 component structure transformations
 * Handles: Panels→Cards, Wells→Cards, Thumbnails
 * Priority: 3
 */
class ComponentRules {
    constructor() {
        this.name = 'Component Migrations';
        this.priority = 3;
    }

    apply(doc, changes) {
        this.migratePanelsToCards(doc, changes);
        this.migrateWells(doc, changes);
    }

    /**
     * Migrate panels to cards
     */
    migratePanelsToCards(doc, changes) {
        const panels = doc.body.querySelectorAll('[class*="panel"]');

        panels.forEach(panel => {
            // Check if this is actually a panel
            if (!panel.classList.contains('panel')) return;

            const originalClasses = panel.className;

            // Replace panel classes with card classes
            if (panel.classList.contains('panel')) {
                panel.classList.remove('panel');
                panel.classList.add('card');
            }

            // Handle panel variants
            const variants = ['default', 'primary', 'success', 'info', 'warning', 'danger'];
            variants.forEach(variant => {
                if (panel.classList.contains(`panel-${variant}`)) {
                    panel.classList.remove(`panel-${variant}`);

                    if (variant !== 'default') {
                        // Add contextual background to card
                        panel.classList.add(`border-${variant}`);
                    }
                }
            });

            // Transform child elements
            const panelHeading = panel.querySelector('.panel-heading');
            if (panelHeading) {
                panelHeading.classList.remove('panel-heading');
                panelHeading.classList.add('card-header');
            }

            const panelTitle = panel.querySelector('.panel-title');
            if (panelTitle) {
                panelTitle.classList.remove('panel-title');
                panelTitle.classList.add('card-title');
            }

            const panelBody = panel.querySelector('.panel-body');
            if (panelBody) {
                panelBody.classList.remove('panel-body');
                panelBody.classList.add('card-body');
            }

            const panelFooter = panel.querySelector('.panel-footer');
            if (panelFooter) {
                panelFooter.classList.remove('panel-footer');
                panelFooter.classList.add('card-footer');
            }

            changes.push({
                type: 'component',
                rule: this.name,
                element: panel.tagName.toLowerCase(),
                selector: this._getElementSelector(panel),
                oldClass: originalClasses,
                newClass: panel.className,
                description: `Migrated panel to card structure`
            });
        });
    }

    /**
     * Migrate wells to cards
     */
    migrateWells(doc, changes) {
        const wells = doc.body.querySelectorAll('.well');

        wells.forEach(well => {
            const originalClasses = well.className;

            well.classList.remove('well');
            well.classList.add('card', 'card-body');

            // Handle well sizes
            if (well.classList.contains('well-sm')) {
                well.classList.remove('well-sm');
                well.classList.add('p-2');
            }

            if (well.classList.contains('well-lg')) {
                well.classList.remove('well-lg');
                well.classList.add('p-4');
            }

            changes.push({
                type: 'component',
                rule: this.name,
                element: well.tagName.toLowerCase(),
                selector: this._getElementSelector(well),
                oldClass: originalClasses,
                newClass: well.className,
                description: `Migrated well to card`
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
