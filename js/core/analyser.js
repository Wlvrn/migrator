/**
 * Analyser - Severity-tiered Bootstrap 3 issue scanner
 *
 * Scans HTML (and raw text) for Bootstrap 3 patterns and categorises them
 * as CRITICAL / HIGH / MEDIUM / LOW / MANUAL_REVIEW.
 *
 * Does NOT modify the document — pure read-only analysis.
 *
 * Severity definitions:
 *   CRITICAL  — will cause a runtime exception or total render failure
 *   HIGH      — broken UI or non-functional interactive components
 *   MEDIUM    — visible regressions; component renders but looks wrong
 *   LOW       — deprecated classes that still render via browser CSS fallback
 *   MANUAL    — patterns the auto-migrator cannot safely fix (dynamic class
 *               construction, JS plugin calls, Razor helper attributes)
 */
class Analyser {
    constructor() {
        this.SEVERITY = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low', MANUAL: 'manual' };

        // ── Text-pattern checks (run on raw HTML string) ────────────────────
        this.textChecks = [
            // CRITICAL
            {
                id: 'bootstrap-js-no-bundle',
                severity: this.SEVERITY.CRITICAL,
                label: 'Bootstrap JS loaded without Popper bundle',
                pattern: /["']bootstrap(?:\.min)?\.js["']/g,
                fix: 'Replace with bootstrap.bundle.min.js (includes Popper 2)',
                autoFixable: false
            },
            {
                id: 'bootstrap-theme-css',
                severity: this.SEVERITY.CRITICAL,
                label: 'bootstrap-theme.css referenced — removed in BS5',
                pattern: /bootstrap-theme(?:\.min)?\.css/g,
                fix: 'Remove this stylesheet — no equivalent in Bootstrap 5',
                autoFixable: false
            },
            // HIGH — data attributes (auto-fixable)
            {
                id: 'data-toggle',
                severity: this.SEVERITY.HIGH,
                label: 'data-toggle= found — must be data-bs-toggle=',
                pattern: /\bdata-toggle=/g,
                fix: 'Rename to data-bs-toggle=',
                autoFixable: true
            },
            {
                id: 'data-dismiss',
                severity: this.SEVERITY.HIGH,
                label: 'data-dismiss= found — must be data-bs-dismiss=',
                pattern: /\bdata-dismiss=/g,
                fix: 'Rename to data-bs-dismiss=',
                autoFixable: true
            },
            {
                id: 'data-target',
                severity: this.SEVERITY.HIGH,
                label: 'data-target= found — must be data-bs-target=',
                pattern: /\bdata-target=/g,
                fix: 'Rename to data-bs-target=',
                autoFixable: true
            },
            // HIGH — structural (auto-fixable)
            {
                id: 'navbar-header',
                severity: this.SEVERITY.HIGH,
                label: '.navbar-header div — wrapper removed in BS5',
                pattern: /class="[^"]*navbar-header[^"]*"/g,
                fix: 'Remove wrapper div; place brand + toggler directly in container-fluid',
                autoFixable: true
            },
            {
                id: 'icon-bar',
                severity: this.SEVERITY.HIGH,
                label: 'icon-bar spans in toggler — replaced in BS5',
                pattern: /class="[^"]*icon-bar[^"]*"/g,
                fix: 'Replace 3× icon-bar spans with single <span class="navbar-toggler-icon">',
                autoFixable: true
            },
            {
                id: 'navbar-no-expand',
                severity: this.SEVERITY.HIGH,
                label: '<nav class="navbar"> missing navbar-expand-{breakpoint}',
                pattern: /class="[^"]*navbar(?:\s+navbar-(?:default|inverse|light|dark|static-top|fixed-top|fixed-bottom))*\s*"/g,
                fix: 'Add navbar-expand-lg (or appropriate breakpoint) to the <nav> element',
                autoFixable: false
            },
            // MANUAL — JS plugin calls
            {
                id: 'jquery-modal',
                severity: this.SEVERITY.MANUAL,
                label: "jQuery .modal() call — BS5 uses native API",
                pattern: /\$\([^)]+\)\.modal\s*\(/g,
                fix: "Replace with: var m = new bootstrap.Modal(el); m.show() / m.hide()",
                autoFixable: false
            },
            {
                id: 'jquery-popover',
                severity: this.SEVERITY.MANUAL,
                label: "jQuery .popover() init — BS5 requires explicit initialisation",
                pattern: /\$\([^)]+\)\.popover\s*\(/g,
                fix: "Use: new bootstrap.Popover(el) for each element",
                autoFixable: false
            },
            {
                id: 'jquery-tooltip',
                severity: this.SEVERITY.MANUAL,
                label: "jQuery .tooltip() init — BS5 requires explicit initialisation",
                pattern: /\$\([^)]+\)\.tooltip\s*\(/g,
                fix: "Use: new bootstrap.Tooltip(el) for each element",
                autoFixable: false
            },
            {
                id: 'jquery-collapse',
                severity: this.SEVERITY.MANUAL,
                label: "jQuery .collapse() call — BS5 uses native API",
                pattern: /\$\([^)]+\)\.collapse\s*\(/g,
                fix: "Replace with: new bootstrap.Collapse(el).toggle()",
                autoFixable: false
            },
            // MANUAL — dynamic class construction
            {
                id: 'dynamic-btn-default',
                severity: this.SEVERITY.MANUAL,
                label: 'Possible dynamic btn-default construction',
                pattern: /["']btn[- ]["']\s*\+/g,
                fix: 'Review dynamically constructed button class strings — btn-default → btn-secondary',
                autoFixable: false
            },
            {
                id: 'dynamic-panel',
                severity: this.SEVERITY.MANUAL,
                label: 'Possible dynamic panel class construction',
                pattern: /["']panel[- ]["']\s*\+/g,
                fix: 'Review dynamically constructed panel class strings — panel → card',
                autoFixable: false
            },
            {
                id: 'dynamic-col-xs',
                severity: this.SEVERITY.MANUAL,
                label: 'Possible dynamic col-xs class construction',
                pattern: /["']col-xs-["']\s*\+/g,
                fix: 'Review dynamically constructed col-xs-* strings — col-xs-N → col-N',
                autoFixable: false
            }
        ];

        // ── DOM-element checks (run on parsed document) ─────────────────────
        this.domChecks = [
            // MEDIUM — class replacements
            { id: 'pull-left',      severity: this.SEVERITY.MEDIUM, selector: '.pull-left',      label: '.pull-left',       fix: 'float-start',                   autoFixable: true },
            { id: 'pull-right',     severity: this.SEVERITY.MEDIUM, selector: '.pull-right',     label: '.pull-right',      fix: 'float-end',                     autoFixable: true },
            { id: 'text-right',     severity: this.SEVERITY.MEDIUM, selector: '.text-right',     label: '.text-right',      fix: 'text-end',                      autoFixable: true },
            { id: 'text-left',      severity: this.SEVERITY.MEDIUM, selector: '.text-left',      label: '.text-left',       fix: 'text-start',                    autoFixable: true },
            { id: 'col-xs',         severity: this.SEVERITY.MEDIUM, selector: '[class*="col-xs-"]', label: 'col-xs-* grid', fix: 'col-* (drop the xs prefix)',    autoFixable: true },
            { id: 'btn-default',    severity: this.SEVERITY.MEDIUM, selector: '.btn-default',    label: '.btn-default',     fix: 'btn-secondary',                 autoFixable: true },
            { id: 'btn-xs',         severity: this.SEVERITY.MEDIUM, selector: '.btn-xs',         label: '.btn-xs',          fix: 'btn-sm',                        autoFixable: true },
            { id: 'panel',          severity: this.SEVERITY.MEDIUM, selector: '.panel',          label: '.panel',           fix: '.card + child class renames',   autoFixable: true },
            { id: 'panel-heading',  severity: this.SEVERITY.MEDIUM, selector: '.panel-heading',  label: '.panel-heading',   fix: '.card-header',                  autoFixable: true },
            { id: 'panel-body',     severity: this.SEVERITY.MEDIUM, selector: '.panel-body',     label: '.panel-body',      fix: '.card-body',                    autoFixable: true },
            { id: 'panel-footer',   severity: this.SEVERITY.MEDIUM, selector: '.panel-footer',   label: '.panel-footer',    fix: '.card-footer',                  autoFixable: true },
            { id: 'well',           severity: this.SEVERITY.MEDIUM, selector: '.well',           label: '.well',            fix: '.card.card-body',               autoFixable: true },
            { id: 'label-badge',    severity: this.SEVERITY.MEDIUM, selector: '.label',          label: '.label (badge)',   fix: '.badge.bg-*',                   autoFixable: true },
            { id: 'form-group',     severity: this.SEVERITY.MEDIUM, selector: '.form-group',     label: '.form-group',      fix: '.mb-3',                         autoFixable: true },
            { id: 'control-label',  severity: this.SEVERITY.MEDIUM, selector: '.control-label',  label: '.control-label',   fix: '.form-label',                   autoFixable: true },
            { id: 'help-block',     severity: this.SEVERITY.MEDIUM, selector: '.help-block',     label: '.help-block',      fix: '.form-text',                    autoFixable: true },
            { id: 'input-group-addon', severity: this.SEVERITY.MEDIUM, selector: '.input-group-addon', label: '.input-group-addon', fix: '.input-group-text',    autoFixable: true },
            { id: 'navbar-toggle',  severity: this.SEVERITY.MEDIUM, selector: '.navbar-toggle',  label: '.navbar-toggle',   fix: '.navbar-toggler',               autoFixable: true },
            { id: 'navbar-default', severity: this.SEVERITY.MEDIUM, selector: '.navbar-default', label: '.navbar-default',  fix: '.navbar-light.bg-light',        autoFixable: true },
            { id: 'navbar-right',   severity: this.SEVERITY.MEDIUM, selector: '.navbar-right',   label: '.navbar-right',    fix: '.ms-auto',                      autoFixable: true },
            { id: 'center-block',   severity: this.SEVERITY.MEDIUM, selector: '.center-block',   label: '.center-block',    fix: '.mx-auto.d-block',              autoFixable: true },
            { id: 'close-btn',      severity: this.SEVERITY.MEDIUM, selector: '.close',          label: '.close button',    fix: '.btn-close (empty, no × char)', autoFixable: true },
            { id: 'sr-only',        severity: this.SEVERITY.MEDIUM, selector: '.sr-only',        label: '.sr-only',         fix: '.visually-hidden',              autoFixable: true },
            { id: 'page-header',    severity: this.SEVERITY.MEDIUM, selector: '.page-header',    label: '.page-header',     fix: '.pb-2.mb-4.border-bottom',      autoFixable: true },
            { id: 'jumbotron',      severity: this.SEVERITY.MEDIUM, selector: '.jumbotron',      label: '.jumbotron',       fix: '.bg-light.p-5.rounded',         autoFixable: true },
            { id: 'thumbnail',      severity: this.SEVERITY.MEDIUM, selector: '.thumbnail',      label: '.thumbnail',       fix: '.card',                         autoFixable: true },
            // MEDIUM — form validation states
            { id: 'has-error',   severity: this.SEVERITY.MEDIUM, selector: '.has-error',   label: '.has-error on form-group', fix: 'Add .is-invalid to the input itself; remove from wrapper', autoFixable: false },
            { id: 'has-success', severity: this.SEVERITY.MEDIUM, selector: '.has-success', label: '.has-success on form-group', fix: 'Add .is-valid to the input itself; remove from wrapper', autoFixable: false },
            // LOW — visibility classes
            { id: 'hidden-xs', severity: this.SEVERITY.LOW, selector: '.hidden-xs', label: '.hidden-xs', fix: '.d-none.d-sm-block', autoFixable: true },
            { id: 'hidden-sm', severity: this.SEVERITY.LOW, selector: '.hidden-sm', label: '.hidden-sm', fix: '.d-sm-none.d-md-block', autoFixable: true },
            { id: 'hidden-md', severity: this.SEVERITY.LOW, selector: '.hidden-md', label: '.hidden-md', fix: '.d-md-none.d-lg-block', autoFixable: true },
            { id: 'hidden-lg', severity: this.SEVERITY.LOW, selector: '.hidden-lg', label: '.hidden-lg', fix: '.d-lg-none', autoFixable: true },
            { id: 'visible-xs', severity: this.SEVERITY.LOW, selector: '.visible-xs', label: '.visible-xs', fix: '.d-block.d-sm-none', autoFixable: true },
            // HIGH — nav items missing BS5 classes
            {
                id: 'nav-item-missing',
                severity: this.SEVERITY.HIGH,
                selector: '.navbar-nav > li:not(.nav-item)',
                label: '<li> in .navbar-nav missing .nav-item',
                fix: 'Add .nav-item to each <li> inside .navbar-nav',
                autoFixable: true
            },
            {
                id: 'nav-link-missing',
                severity: this.SEVERITY.HIGH,
                selector: '.navbar-nav > li > a:not(.nav-link)',
                label: '<a> in .navbar-nav missing .nav-link',
                fix: 'Add .nav-link to each <a> inside .navbar-nav > li',
                autoFixable: true
            },
            // HIGH — navbar missing expand class
            {
                id: 'navbar-no-expand-dom',
                severity: this.SEVERITY.HIGH,
                selector: 'nav.navbar:not([class*="navbar-expand"])',
                label: '<nav class="navbar"> missing navbar-expand-{breakpoint}',
                fix: 'Add .navbar-expand-lg (or appropriate breakpoint) to the nav element',
                autoFixable: false
            }
        ];
    }

    /**
     * Run a full analysis on HTML string + parsed document.
     * @param {string} htmlString  — raw HTML input
     * @param {Document} doc       — parsed DOM (from HTMLParser)
     * @returns {AnalysisReport}
     */
    analyse(htmlString, doc) {
        const issues = [];

        // Text pattern checks
        this.textChecks.forEach(check => {
            const matches = [...htmlString.matchAll(check.pattern)];
            if (matches.length > 0) {
                issues.push({
                    ...check,
                    count: matches.length,
                    context: matches.slice(0, 3).map(m => m[0])
                });
            }
        });

        // DOM element checks
        if (doc && doc.body) {
            this.domChecks.forEach(check => {
                try {
                    const elements = doc.body.querySelectorAll(check.selector);
                    if (elements.length > 0) {
                        issues.push({
                            ...check,
                            count: elements.length,
                            context: Array.from(elements).slice(0, 3).map(el =>
                                el.outerHTML.split('>')[0] + '>'
                            )
                        });
                    }
                } catch (e) {
                    // Invalid selector — skip
                }
            });
        }

        return this._buildReport(issues, htmlString);
    }

    /**
     * Build the structured report object.
     */
    _buildReport(issues, htmlString) {
        const bySeverity = {
            [this.SEVERITY.CRITICAL]: [],
            [this.SEVERITY.HIGH]:     [],
            [this.SEVERITY.MEDIUM]:   [],
            [this.SEVERITY.LOW]:      [],
            [this.SEVERITY.MANUAL]:   []
        };

        issues.forEach(issue => bySeverity[issue.severity].push(issue));

        const autoFixable  = issues.filter(i => i.autoFixable).reduce((s, i) => s + i.count, 0);
        const manualReview = issues.filter(i => !i.autoFixable).reduce((s, i) => s + i.count, 0);
        const totalIssues  = issues.reduce((s, i) => s + i.count, 0);

        // Effort estimate
        let effort = 'Low';
        if (totalIssues > 40 || bySeverity.critical.length > 0) effort = 'High';
        else if (totalIssues > 15 || bySeverity.high.length > 2) effort = 'Medium';

        return {
            issues,
            bySeverity,
            stats: {
                total: totalIssues,
                autoFixable,
                manualReview,
                bySeverity: Object.fromEntries(
                    Object.entries(bySeverity).map(([k, v]) => [k, v.reduce((s, i) => s + i.count, 0)])
                ),
                effort
            }
        };
    }
}
