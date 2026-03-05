/**
 * NavbarRules - Bootstrap 3 → Bootstrap 5 navbar structural transformations
 *
 * Handles:
 *   - navbar-header div removal (replaced with d-flex align-items-center)
 *   - icon-bar spans → navbar-toggler-icon
 *   - caret <b> elements removal
 *   - divider <li> → <li><hr class="dropdown-divider">
 *   - dropdown-header <li> → <li><h6 class="dropdown-header">
 *   - Add nav-item to bare <li> inside .navbar-nav
 *   - Add nav-link to bare <a> inside .navbar-nav > li
 *   - Add navbar-expand-lg when no expand breakpoint class is present
 *
 * Priority: 6 (structural DOM changes last)
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
        this._addNavItemClasses(doc, changes);
        this._addNavLinkClasses(doc, changes);
        this._addNavbarExpand(doc, changes);
    }

    // ── Toggler ──────────────────────────────────────────────────────────────

    _migrateNavbarToggler(doc, changes) {
        const togglers = doc.body.querySelectorAll('.navbar-toggler, .navbar-toggle');

        togglers.forEach(toggler => {
            const iconBars = toggler.querySelectorAll('.icon-bar');
            if (iconBars.length > 0) {
                iconBars.forEach(bar => bar.remove());

                if (!toggler.querySelector('.navbar-toggler-icon')) {
                    const icon = doc.createElement('span');
                    icon.className = 'navbar-toggler-icon';
                    toggler.appendChild(icon);
                }

                changes.push({
                    type: 'navbar',
                    rule: this.name,
                    element: toggler.tagName.toLowerCase(),
                    selector: this._sel(toggler),
                    oldClass: 'span.icon-bar (×3)',
                    newClass: 'span.navbar-toggler-icon',
                    description: 'Replaced 3× icon-bar spans with single navbar-toggler-icon'
                });
            }
        });
    }

    // ── Carets ───────────────────────────────────────────────────────────────

    _removeCarets(doc, changes) {
        doc.body.querySelectorAll('b.caret, span.caret').forEach(caret => {
            const parent = caret.parentElement;
            caret.remove();
            changes.push({
                type: 'navbar',
                rule: this.name,
                element: parent ? parent.tagName.toLowerCase() : 'unknown',
                selector: parent ? this._sel(parent) : '',
                oldClass: '<b class="caret">',
                newClass: '(removed — BS5 adds caret via CSS ::after)',
                description: 'Removed caret element — Bootstrap 5 renders this automatically via CSS'
            });
        });
    }

    // ── Dividers ─────────────────────────────────────────────────────────────

    _migrateDividers(doc, changes) {
        doc.body.querySelectorAll('li.divider, li[role="separator"]').forEach(li => {
            const isEmpty   = li.textContent.trim() === '';
            const isSepRole = li.getAttribute('role') === 'separator';
            if (!isEmpty && !isSepRole) return;

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
                selector: this._sel(li),
                oldClass: 'li.divider',
                newClass: 'li > hr.dropdown-divider',
                description: 'Migrated divider list item to dropdown-divider hr'
            });
        });
    }

    // ── Dropdown headers ─────────────────────────────────────────────────────

    _migrateDropdownHeaders(doc, changes) {
        doc.body.querySelectorAll('li.dropdown-header').forEach(li => {
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
                selector: this._sel(li),
                oldClass: 'li.dropdown-header',
                newClass: 'li > h6.dropdown-header',
                description: 'Migrated dropdown-header li to h6 inside li'
            });
        });
    }

    // ── navbar-header wrapper ────────────────────────────────────────────────

    _migrateNavbarHeader(doc, changes) {
        doc.body.querySelectorAll('.navbar-header').forEach(el => {
            el.classList.remove('navbar-header');
            el.classList.add('d-flex', 'align-items-center');

            changes.push({
                type: 'navbar',
                rule: this.name,
                element: el.tagName.toLowerCase(),
                selector: this._sel(el),
                oldClass: 'navbar-header',
                newClass: 'd-flex align-items-center',
                description: 'Replaced navbar-header (removed in BS5) with d-flex align-items-center'
            });
        });
    }

    // ── nav-item on bare <li> inside .navbar-nav ─────────────────────────────

    _addNavItemClasses(doc, changes) {
        doc.body.querySelectorAll('.navbar-nav > li').forEach(li => {
            if (!li.classList.contains('nav-item')) {
                li.classList.add('nav-item');
                changes.push({
                    type: 'navbar',
                    rule: this.name,
                    element: 'li',
                    selector: this._sel(li),
                    oldClass: '(no nav-item)',
                    newClass: 'nav-item',
                    description: 'Added required .nav-item class to <li> inside .navbar-nav'
                });
            }
        });
    }

    // ── nav-link on bare <a> inside .navbar-nav > li ─────────────────────────

    _addNavLinkClasses(doc, changes) {
        doc.body.querySelectorAll('.navbar-nav > li > a').forEach(a => {
            // Don't touch dropdown-toggle anchors that already have a link class
            if (!a.classList.contains('nav-link') && !a.classList.contains('navbar-brand')) {
                a.classList.add('nav-link');
                changes.push({
                    type: 'navbar',
                    rule: this.name,
                    element: 'a',
                    selector: this._sel(a),
                    oldClass: '(no nav-link)',
                    newClass: 'nav-link',
                    description: 'Added required .nav-link class to <a> inside .navbar-nav li'
                });
            }
        });
    }

    // ── navbar-expand-lg when no expand class present ────────────────────────

    _addNavbarExpand(doc, changes) {
        const expandClasses = ['navbar-expand', 'navbar-expand-sm', 'navbar-expand-md',
                               'navbar-expand-lg', 'navbar-expand-xl', 'navbar-expand-xxl'];

        doc.body.querySelectorAll('nav.navbar').forEach(nav => {
            const hasExpand = expandClasses.some(cls => nav.classList.contains(cls));
            if (!hasExpand) {
                nav.classList.add('navbar-expand-lg');
                changes.push({
                    type: 'navbar',
                    rule: this.name,
                    element: 'nav',
                    selector: this._sel(nav),
                    oldClass: '(missing navbar-expand-*)',
                    newClass: 'navbar-expand-lg',
                    description: 'Added navbar-expand-lg — BS5 requires explicit expand breakpoint (adjust breakpoint if needed)',
                    warning: 'navbar-expand-lg was inferred. Review this breakpoint — use navbar-expand-sm/md/xl as appropriate for your layout.'
                });
            }
        });
    }

    // ── Utility ──────────────────────────────────────────────────────────────

    _sel(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) {
            const classes = Array.from(element.classList).slice(0, 2).join('.');
            return `${element.tagName.toLowerCase()}.${classes}`;
        }
        return element.tagName.toLowerCase();
    }
}
