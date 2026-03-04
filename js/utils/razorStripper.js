/**
 * RazorStripper - Strips Razor/VBHtml server-side syntax from .vbhtml, .cshtml, .razor files
 *
 * Strips in this order to avoid cascading corruption:
 *   1. @{ ... } code blocks (multi-line)
 *   2. @* ... *@ comments
 *   3. @if / @for / @foreach / @while / @using / @section blocks with braces (up to 5 passes for nesting)
 *   4. Standalone directive lines: @model, @using, @inherits, @inject, etc.
 *   5. Inline @( ... ) explicit expressions
 *   6. Inline @identifier chains (e.g. @Model.Name, @ViewBag.Title)
 *   7. Remaining stray @ characters
 *   8. Collapse 3+ consecutive blank lines to one
 *
 * Note: VBHtml multi-line @If ... End If blocks use VB syntax (no braces) and
 * are not fully stripped by this utility. Simple @property and @expression
 * references are handled. Users should review output from .vbhtml files carefully.
 */
class RazorStripper {
    /**
     * Strip Razor/VB syntax from source text.
     * @param {string} source - Raw file content
     * @returns {{ stripped: string, removedCount: number }}
     */
    static strip(source) {
        let text = source;
        let removedCount = 0;

        const track = (before, after) => {
            removedCount += (before.match(/@/g) || []).length - (after.match(/@/g) || []).length;
            return after;
        };

        // 1. @{ ... } code blocks
        text = track(text, text.replace(/@\{[\s\S]*?\}/g, ''));

        // 2. @* ... *@ Razor comments
        text = track(text, text.replace(/@\*[\s\S]*?\*@/g, ''));

        // 3. Block control structures: @keyword (condition) { ... }
        //    Run multiple passes to handle nested blocks
        const blockKeywords = 'if|else if|else|for|foreach|while|switch|using|section|functions|helper|lock';
        const blockPattern = new RegExp(
            `@(?:${blockKeywords})\\s*(?:\\([^)]*\\))?\\s*\\{[^{}]*\\}`,
            'g'
        );
        for (let i = 0; i < 5; i++) {
            const before = text;
            text = track(text, text.replace(blockPattern, ''));
            if (text === before) break;
        }

        // 4. Directive-only lines (@model, @using, @inherits, etc.)
        text = track(text, text.replace(
            /^[ \t]*@(?:model|using|inherits|addTagHelper|removeTagHelper|inject|layout|namespace|page|implements|attribute)\b[^\n]*\n?/gm,
            ''
        ));

        // 5. Inline @( ... ) explicit expressions
        text = track(text, text.replace(/@\([^)]*\)/g, ''));

        // 6. Inline @identifier chains (e.g. @Model.Name, @item.Id, @ViewBag.Title)
        text = track(text, text.replace(/@[A-Za-z_][A-Za-z0-9_.[\]()]*/g, ''));

        // 7. Any remaining lone @ characters
        text = track(text, text.replace(/@/g, ''));

        // 8. Collapse 3+ consecutive blank lines to one blank line
        text = text.replace(/\n{3,}/g, '\n\n');

        return { stripped: text.trim(), removedCount };
    }

    /**
     * Determine whether a filename needs Razor stripping.
     * @param {string} filename
     * @returns {boolean}
     */
    static needsStripping(filename) {
        return /\.(vbhtml|cshtml|razor)$/i.test(filename);
    }

    /**
     * Derive the download filename from the uploaded filename.
     * Examples:
     *   myView.vbhtml  → myView.bootstrap5.html
     *   layout.cshtml  → layout.bootstrap5.html
     *   index.html     → index.bootstrap5.html
     * @param {string} filename
     * @returns {string}
     */
    static deriveDownloadName(filename) {
        const base = filename.replace(/\.[^.]+$/, '');
        return `${base}.bootstrap5.html`;
    }
}
