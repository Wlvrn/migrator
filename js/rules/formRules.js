/**
 * FormRules - Bootstrap 3 → Bootstrap 5 form control transformations
 * Handles: form-group, control-label, help-block, input sizing,
 *          alert dismiss buttons, and form validation state classes.
 * Priority: 4
 */
class FormRules {
    constructor() {
        this.name = 'Form Controls';
        this.priority = 4;

        // Simple 1:1 class swaps
        this.map = {
            'form-group':             'mb-3',
            'control-label':          'form-label',
            'help-block':             'form-text',
            'input-lg':               'form-control-lg',
            'input-sm':               'form-control-sm',
            'form-control-feedback':  'invalid-feedback'
        };
    }

    apply(doc, changes) {
        this._applySimpleMap(doc, changes);
        this._migrateFormHorizontal(doc, changes);
        this._migrateValidationStates(doc, changes);
        this._migrateAlertDismiss(doc, changes);
    }

    // ── Simple class swaps ───────────────────────────────────────────────────

    _applySimpleMap(doc, changes) {
        Object.entries(this.map).forEach(([oldClass, newClass]) => {
            doc.body.querySelectorAll(`.${CSS.escape(oldClass)}`).forEach(el => {
                if (!el.classList.contains(oldClass)) return;

                el.classList.remove(oldClass);
                newClass.split(/\s+/).filter(Boolean).forEach(c => el.classList.add(c));

                changes.push({
                    type: 'form',
                    rule: this.name,
                    element: el.tagName.toLowerCase(),
                    selector: this._sel(el),
                    oldClass,
                    newClass,
                    description: `Replaced '${oldClass}' with '${newClass}'`
                });
            });
        });
    }

    // ── form-horizontal ──────────────────────────────────────────────────────

    _migrateFormHorizontal(doc, changes) {
        doc.body.querySelectorAll('.form-horizontal').forEach(form => {
            // form-horizontal no longer exists in BS5 — remove the class,
            // the grid columns on labels/inputs provide the horizontal layout.
            form.classList.remove('form-horizontal');
            changes.push({
                type: 'form',
                rule: this.name,
                element: form.tagName.toLowerCase(),
                selector: this._sel(form),
                oldClass: 'form-horizontal',
                newClass: '(removed)',
                description: 'Removed form-horizontal — use Bootstrap 5 grid columns on labels/inputs directly',
                warning: 'form-horizontal removed in BS5. Label/input column layout must be maintained via col-* classes directly.'
            });
        });
    }

    // ── Validation states ─────────────────────────────────────────────────────
    //
    // BS3: wrapper div gets has-error / has-success / has-warning
    // BS5: the input itself gets is-invalid / is-valid
    //      feedback message gets invalid-feedback / valid-feedback
    //
    // Auto-migration: remove the state class from the wrapper and add
    // is-invalid / is-valid to the first input/select/textarea inside it.
    // Flag a warning so the developer verifies the output.

    _migrateValidationStates(doc, changes) {
        const stateMap = {
            'has-error':   'is-invalid',
            'has-success': 'is-valid',
            'has-warning': 'is-invalid'  // BS5 has no warning state — use invalid
        };

        Object.entries(stateMap).forEach(([oldClass, newClass]) => {
            doc.body.querySelectorAll(`.${CSS.escape(oldClass)}`).forEach(wrapper => {
                wrapper.classList.remove(oldClass);

                // Apply state class to the first interactive element inside
                const input = wrapper.querySelector('input, select, textarea');
                if (input && !input.classList.contains(newClass)) {
                    input.classList.add(newClass);
                }

                // Rename any help-block to the appropriate feedback class
                const feedback = wrapper.querySelector('.form-text');
                if (feedback) {
                    const feedbackClass = newClass === 'is-valid' ? 'valid-feedback' : 'invalid-feedback';
                    feedback.classList.remove('form-text');
                    feedback.classList.add(feedbackClass);
                }

                changes.push({
                    type: 'form',
                    rule: this.name,
                    element: wrapper.tagName.toLowerCase(),
                    selector: this._sel(wrapper),
                    oldClass: `${oldClass} (on wrapper)`,
                    newClass: `${newClass} (moved to input)`,
                    description: `Migrated ${oldClass} — moved validation state from wrapper to input element`,
                    warning: `${oldClass} removed from wrapper; ${newClass} applied to first input. Verify with Html.ValidationMessageFor() if using Razor helpers.`
                });
            });
        });
    }

    // ── Alert dismiss button ─────────────────────────────────────────────────
    //
    // BS3: <button class="close" data-dismiss="alert"><span>&times;</span></button>
    // BS5: <button class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    // Note: data-dismiss → data-bs-dismiss is handled by DataAttributeRules,
    //       so here we only need to fix the class and remove the × content.

    _migrateAlertDismiss(doc, changes) {
        doc.body.querySelectorAll('button.close, button.btn-close').forEach(btn => {
            const isAlertDismiss =
                btn.getAttribute('data-dismiss') === 'alert' ||
                btn.getAttribute('data-bs-dismiss') === 'alert';

            if (!isAlertDismiss) return;

            const originalHTML = btn.outerHTML;

            // Swap class
            if (btn.classList.contains('close') && !btn.classList.contains('btn-close')) {
                btn.classList.remove('close');
                btn.classList.add('btn-close');
            }

            // Remove inner × content — BS5 uses CSS background-image
            if (btn.innerHTML.trim()) {
                btn.innerHTML = '';
            }

            // Ensure aria-label
            if (!btn.hasAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'Close');
            }

            changes.push({
                type: 'form',
                rule: this.name,
                element: 'button',
                selector: this._sel(btn),
                oldClass: 'close (with × content)',
                newClass: 'btn-close (empty, aria-label="Close")',
                description: 'Migrated alert dismiss button from .close to .btn-close; removed × content'
            });
        });
    }

    // ── Utility ──────────────────────────────────────────────────────────────

    _sel(el) {
        if (el.id) return `#${el.id}`;
        if (el.className) {
            const classes = Array.from(el.classList).slice(0, 2).join('.');
            return `${el.tagName.toLowerCase()}.${classes}`;
        }
        return el.tagName.toLowerCase();
    }
}
