/**
 * NavbarRules - Bootstrap 3 → Bootstrap 5 navbar structural transformations
 * Handles:
 *   - navbar-header div removal
 *   - icon-bar spans → navbar-toggler-icon
 *   - caret <b> elements removal
 *   - divider <li> → <li><hr class="dropdown-divider">
 *   - dropdown-header <li> → <li><h6 class="dropdown-header">
 * Priority: 6 (after all class rules, since it touches DOM structure)
 */
class NavbarRules {
    constructor() {
        this.name = 'Navbar Structure';
        this.priority = 6;
    }

    apply(doc, changes) {
        this._migrateNavbarToggler(doc, changes);
        this._removeCarets(doc, changes);
        this._migrateDividers(doc, changes);
        this._migrateDropdownHeaders(doc, changes);
        this._migrateNavbarHeader(doc, changes);
    }

    /**
     * Replace 3x <span class="icon-bar"> inside .navbar-toggler with a
     * single <span class="navbar-toggler-icon">
     */
    _migrateNavbarToggler(doc, changes) {
        const togglers = doc.body.querySelectorAll('.navbar-toggler, .navbar-toggle');

        togglers.forEach(toggler => {
            const iconBars = toggler.querySelectorAll('.icon-bar');
            if (iconBars.length > 0) {
                // Remove all icon-bar spans
                iconBars.forEach(bar => bar.remove());

                // Add the single BS5 toggler icon if not already present
                if (!toggler.querySelector('.navbar-toggler-icon')) {
                    const icon = doc.createElement('span');
                    icon.className = 'navbar-toggler-icon';
                    toggler.appendChild(icon);
                }

                changes.push({
                    type: 'navbar',
                    rule: this.name,
                    element: toggler.tagName.toLowerCase(),
                    selector: this._getElementSelector(toggler),
                    oldClass: 'span.icon-bar (×3)',
                    newClass: 'span.navbar-toggler-icon',
                    description: 'Replaced 3× icon-bar spans with single navbar-toggler-icon'
                });
            }
        });
    }

    /**
     * Remove Bootstrap 3 caret <b class="caret"></b> elements — BS5 adds
     * the caret automatically via CSS ::after on .dropdown-toggle
     */
    _removeCarets(doc, changes) {
        const carets = doc.body.querySelectorAll('b.caret, span.caret');

        carets.forEach(caret => {
            const parent = caret.parentElement;
            caret.remove();

            changes.push({
                type: 'navbar',
                rule: this.name,
                element: parent ? parent.tagName.toLowerCase() : 'unknown',
                selector: parent ? this._getElementSelector(parent) : '',
                oldClass: '<b class="caret">',
                newClass: '(removed — BS5 adds caret via CSS)',
                description: 'Removed caret element (Bootstrap 5 adds this automatically via CSS)'
            });
        });
    }

    /**
     * Migrate BS3 divider list items:
     *   <li class="divider"></li>
     *   <li role="separator" class="divider"></li>
     * →
     *   <li><hr class="dropdown-divider"></li>
     */
    _migrateDividers(doc, changes) {
        const dividers = doc.body.querySelectorAll('li.divider, li[role="separator"]');

        dividers.forEach(li => {
            // Only process if it looks like a dropdown divider (empty or role=separator)
            const isEmpty = li.textContent.trim() === '';
            const isSeparator = li.getAttribute('role') === 'separator';

            if (!isEmpty && !isSeparator) return;

            // Clear the li and insert an <hr>
            li.innerHTML = '';
            li.removeAttribute('role');
            li.classList.remove('divider');

            const hr = doc.createElement('hr');
            hr.className = 'dropdown-divider';
            li.appendChild(hr);

            changes.push({
                type: 'navbar',
                rule: this.name,
                element: 'li',
                selector: this._getElementSelector(li),
                oldClass: 'li.divider',
                newClass: 'li > hr.dropdown-divider',
                description: 'Migrated divider list item to dropdown-divider hr'
            });
        });
    }

    /**
     * Migrate BS3 dropdown-header list items:
     *   <li class="dropdown-header">Text</li>
     * →
     *   <li><h6 class="dropdown-header">Text</h6></li>
     */
    _migrateDropdownHeaders(doc, changes) {
        const headers = doc.body.querySelectorAll('li.dropdown-header');

        headers.forEach(li => {
            const text = li.innerHTML;
            li.classList.remove('dropdown-header');
            li.innerHTML = '';

            const h6 = doc.createElement('h6');
            h6.className = 'dropdown-header';
            h6.innerHTML = text;
            li.appendChild(h6);

            changes.push({
                type: 'navbar',
                rule: this.name,
                element: 'li',
                selector: this._getElementSelector(li),
                oldClass: 'li.dropdown-header',
                newClass: 'li > h6.dropdown-header',
                description: 'Migrated dropdown-header li to h6 inside li'
            });
        });
    }

    /**
     * Migrate .navbar-header div — removed in BS5.
     * Replaces it with a div.d-flex.align-items-center, preserving children.
     */
    _migrateNavbarHeader(doc, changes) {
        const navbarHeaders = doc.body.querySelectorAll('.navbar-header');

        navbarHeaders.forEach(el => {
            el.classList.remove('navbar-header');
            el.classList.add('d-flex', 'align-items-center');

            changes.push({
                type: 'navbar',
                rule: this.name,
                element: el.tagName.toLowerCase(),
                selector: this._getElementSelector(el),
                oldClass: 'navbar-header',
                newClass: 'd-flex align-items-center',
                description: 'Replaced navbar-header (removed in BS5) with d-flex align-items-center'
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
