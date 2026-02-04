/**
 * HTMLParser - Parses HTML strings and extracts Bootstrap classes for transformation
 * Uses native DOMParser for robust HTML parsing
 */
class HTMLParser {
    constructor(htmlString) {
        this.originalHTML = htmlString;
        this.doc = null;
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Parse HTML string into DOM structure
     * @returns {Document|null} Parsed document or null if parsing fails
     */
    parse() {
        try {
            const parser = new DOMParser();
            this.doc = parser.parseFromString(this.originalHTML, 'text/html');

            // Check for parser errors
            const parserError = this.doc.querySelector('parsererror');
            if (parserError) {
                this.errors.push('HTML parsing error: ' + parserError.textContent);
                return null;
            }

            // Check if DOMParser auto-corrected the HTML
            this._detectAutoCorrections();

            return this.doc;
        } catch (error) {
            this.errors.push('Failed to parse HTML: ' + error.message);
            return null;
        }
    }

    /**
     * Detect if DOMParser auto-closed tags or made corrections
     */
    _detectAutoCorrections() {
        const serialized = this._serializeBody();

        // Check for common auto-corrections
        const openTags = (this.originalHTML.match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (this.originalHTML.match(/<\/[^>]+>/g) || []).length;

        if (openTags !== closeTags) {
            this.warnings.push('Auto-closed unclosed HTML tags');
        }
    }

    /**
     * Extract all elements with Bootstrap classes
     * @returns {Array} Array of elements with class attributes
     */
    extractBootstrapElements() {
        if (!this.doc) return [];

        const elements = [];
        const allElements = this.doc.body.querySelectorAll('[class]');

        allElements.forEach(element => {
            const bootstrapClasses = this._filterBootstrapClasses(element.className);
            if (bootstrapClasses.length > 0) {
                elements.push({
                    element: element,
                    bootstrapClasses: bootstrapClasses,
                    allClasses: element.className.split(/\s+/).filter(c => c)
                });
            }
        });

        return elements;
    }

    /**
     * Filter classes to identify Bootstrap 3 patterns
     * @param {string} classString - Space-separated class string
     * @returns {Array} Array of Bootstrap class names
     */
    _filterBootstrapClasses(classString) {
        const classes = classString.split(/\s+/).filter(c => c);
        const bootstrapPatterns = [
            /^col-/,           // Grid columns
            /^offset-/,        // Offsets
            /^row$/,           // Grid row
            /^container/,      // Containers
            /^pull-/,          // Float utilities
            /^push-/,          // Push utilities
            /^hidden-/,        // Visibility
            /^visible-/,       // Visibility
            /^text-/,          // Text utilities
            /^btn/,            // Buttons
            /^panel/,          // Panels
            /^well/,           // Wells
            /^label/,          // Labels (now badges)
            /^badge/,          // Badges
            /^form-/,          // Forms
            /^control-/,       // Form controls
            /^help-/,          // Help blocks
            /^input-/,         // Input sizing
            /^img-/,           // Images
            /^table-/,         // Tables
            /^alert/,          // Alerts
            /^modal/,          // Modals
            /^dropdown/,       // Dropdowns
            /^nav/,            // Navigation
            /^navbar/,         // Navbar
            /^breadcrumb/,     // Breadcrumbs
            /^pagination/,     // Pagination
            /^pager/,          // Pager
            /^thumbnail/,      // Thumbnails
            /^media/,          // Media objects
            /^list-group/,     // List groups
            /^carousel/,       // Carousel
            /^jumbotron/,      // Jumbotron
            /^page-header/,    // Page header
            /^progress/,       // Progress bars
            /^close$/,         // Close button
            /^caret$/,         // Caret
            /^center-block$/   // Center block
        ];

        return classes.filter(className => {
            return bootstrapPatterns.some(pattern => pattern.test(className));
        });
    }

    /**
     * Serialize the document body back to HTML string
     * @returns {string} HTML string
     */
    rebuild() {
        if (!this.doc) return '';
        return this._serializeBody();
    }

    /**
     * Serialize only the body content (not the full document)
     * @returns {string} Body HTML content
     */
    _serializeBody() {
        if (!this.doc || !this.doc.body) return '';

        // Get innerHTML to avoid including <body> tags
        return this._formatHTML(this.doc.body.innerHTML);
    }

    /**
     * Format HTML with proper indentation
     * @param {string} html - HTML string to format
     * @returns {string} Formatted HTML
     */
    _formatHTML(html) {
        // Basic HTML formatting (preserves structure)
        let formatted = html;

        // Remove extra whitespace but preserve intentional spacing
        formatted = formatted.replace(/>\s+</g, '>\n<');

        // Basic indentation
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const indentedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';

            // Decrease indent for closing tags
            if (trimmed.startsWith('</')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            const indented = '  '.repeat(indentLevel) + trimmed;

            // Increase indent for opening tags (but not self-closing)
            if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
                // Check if it's not a self-closing tag
                const tagMatch = trimmed.match(/<(\w+)/);
                if (tagMatch) {
                    const tagName = tagMatch[1];
                    const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
                    if (!selfClosingTags.includes(tagName.toLowerCase())) {
                        // Check if closing tag is on the same line
                        if (!trimmed.includes(`</${tagName}>`)) {
                            indentLevel++;
                        }
                    }
                }
            }

            return indented;
        });

        return indentedLines.filter(line => line).join('\n');
    }

    /**
     * Get parse errors
     * @returns {Array} Array of error messages
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Get parse warnings
     * @returns {Array} Array of warning messages
     */
    getWarnings() {
        return this.warnings;
    }

    /**
     * Check if parsing was successful
     * @returns {boolean} True if no errors
     */
    isValid() {
        return this.errors.length === 0 && this.doc !== null;
    }
}
