/**
 * App - Main application initialization and event handling
 */
class App {
    constructor() {
        this.migrator = new Migrator();
        this.editor = new Editor();
        this.currentResult = null;
        this.uploadedFilename = null;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.inputArea = document.getElementById('inputArea');
        this.outputArea = document.getElementById('outputArea');
        this.outputSection = document.getElementById('outputSection');
        this.migrateBtn = document.getElementById('migrateBtn');
        this.copyOutputBtn = document.getElementById('copyOutputBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exampleSnippets = document.getElementById('exampleSnippets');
        this.formatInputBtn = document.getElementById('formatInputBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.helpModal = document.getElementById('helpModal');
        this.closeHelp = document.getElementById('closeHelp');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('fileInput');
    }

    attachEventListeners() {
        this.migrateBtn.addEventListener('click', () => this.handleMigrate());
        this.copyOutputBtn.addEventListener('click', () => this.handleCopyOutput());
        this.clearBtn.addEventListener('click', () => this.handleClear());
        this.exampleSnippets.addEventListener('change', (e) => this.handleLoadExample(e));
        this.formatInputBtn.addEventListener('click', () => this.handleFormatInput());
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.closeHelp.addEventListener('click', () => this.hideHelp());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTabSwitch(e));
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.hideHelp();
            }
        });
    }

    handleMigrate() {
        const input = this.inputArea.value.trim();

        if (!input) {
            Toast.warning('Please enter some Bootstrap 3 HTML code');
            return;
        }

        // Show loading state
        this.migrateBtn.disabled = true;
        this.migrateBtn.textContent = 'Migrating...';

        // Perform migration
        setTimeout(() => {
            try {
                this.currentResult = this.migrator.migrate(input);

                if (!this.currentResult.success) {
                    Toast.error('Migration failed: ' + this.currentResult.errors.join(', '));
                    this.migrateBtn.disabled = false;
                    this.migrateBtn.textContent = 'Migrate to Bootstrap 5 →';
                    return;
                }

                // Show output section
                this.outputSection.style.display = 'block';

                // Populate output
                this.outputArea.value = this.currentResult.html;

                // Generate diff
                const differ = new Differ(
                    this.currentResult.originalHTML,
                    this.currentResult.html,
                    this.currentResult.changes
                );
                const diff = differ.generateDiff();

                // Update diff views
                document.getElementById('beforeCode').innerHTML = diff.before;
                document.getElementById('afterCode').innerHTML = diff.after;

                // Update changes view
                this.renderChanges(this.currentResult.changes, this.currentResult.stats);

                // Show success message
                const changeCount = this.currentResult.changes.length;
                Toast.success(`Migration complete! ${changeCount} changes applied.`);

                // Show warnings if any
                if (this.currentResult.warnings.length > 0) {
                    setTimeout(() => {
                        Toast.warning(`${this.currentResult.warnings.length} warnings - check Changes tab`);
                    }, 1500);
                }

                // Reset button
                this.migrateBtn.disabled = false;
                this.migrateBtn.textContent = 'Migrate to Bootstrap 5 →';

                // Scroll to output
                this.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                Toast.error('Unexpected error: ' + error.message);
                this.migrateBtn.disabled = false;
                this.migrateBtn.textContent = 'Migrate to Bootstrap 5 →';
            }
        }, 100);
    }

    renderChanges(changes, stats) {
        const summaryEl = document.getElementById('changesSummary');
        const listEl = document.getElementById('changesList');

        // Render summary
        summaryEl.innerHTML = `
            <h3>Migration Summary</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <strong>${stats.totalChanges}</strong>
                    <span>Total Changes</span>
                </div>
                <div class="stat-item">
                    <strong>${stats.affectedElements}</strong>
                    <span>Affected Elements</span>
                </div>
                <div class="stat-item">
                    <strong>${Object.keys(stats.byType).length}</strong>
                    <span>Change Types</span>
                </div>
            </div>
            <div class="stats-breakdown">
                <h4>Changes by Type:</h4>
                <ul>
                    ${Object.entries(stats.byType).map(([type, count]) =>
                        `<li><strong>${type}:</strong> ${count} changes</li>`
                    ).join('')}
                </ul>
            </div>
        `;

        // Group changes by type
        const groupedChanges = {};
        changes.forEach(change => {
            if (!groupedChanges[change.type]) {
                groupedChanges[change.type] = [];
            }
            groupedChanges[change.type].push(change);
        });

        // Render change list
        let html = '<div class="changes-groups">';
        Object.entries(groupedChanges).forEach(([type, typeChanges]) => {
            html += `
                <div class="change-group">
                    <h4 class="change-group-title">${type} (${typeChanges.length})</h4>
                    <div class="change-items">
                        ${typeChanges.map((change, i) => `
                            <div class="change-item">
                                <div class="change-number">${i + 1}</div>
                                <div class="change-details">
                                    <div class="change-description">${change.description}</div>
                                    <div class="change-classes">
                                        <span class="old-class">${change.oldClass}</span>
                                        <span class="arrow">→</span>
                                        <span class="new-class">${change.newClass}</span>
                                    </div>
                                    ${change.warning ? `<div class="change-warning">⚠️ ${change.warning}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        listEl.innerHTML = html;
    }

    async handleCopyOutput() {
        if (!this.currentResult) return;

        const result = await ClipboardManager.copy(this.currentResult.html);
        if (result.success) {
            Toast.success(result.message);
        } else {
            Toast.error(result.message);
        }
    }

    handleClear() {
        this.inputArea.value = '';
        this.outputArea.value = '';
        this.outputSection.style.display = 'none';
        this.currentResult = null;
        this.uploadedFilename = null;
        this.exampleSnippets.value = '';
        Toast.info('Cleared all content');
    }

    handleLoadExample(e) {
        const exampleName = e.target.value;
        if (!exampleName) return;

        const exampleCode = this.editor.loadExample(exampleName);
        this.inputArea.value = exampleCode;
        Toast.info(`Loaded ${exampleName} example`);
    }

    handleFormatInput() {
        const input = this.inputArea.value.trim();
        if (!input) return;

        const formatted = this.editor.formatHTML(input);
        this.inputArea.value = formatted;
        Toast.success('HTML formatted');
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const allowed = /\.(html|htm|vbhtml|cshtml|razor)$/i;
        if (!allowed.test(file.name)) {
            Toast.error('Unsupported file type. Please upload .html, .htm, .vbhtml, .cshtml, or .razor files.');
            this.fileInput.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            let content = event.target.result;
            const needsStrip = RazorStripper.needsStripping(file.name);

            if (needsStrip) {
                const { stripped, removedCount } = RazorStripper.strip(content);
                content = stripped;

                if (removedCount > 0) {
                    Toast.warning(
                        `Razor/VB syntax stripped from "${file.name}" — review HTML before migrating`
                    );
                }
            }

            this.inputArea.value = content;
            this.uploadedFilename = file.name;
            this.fileInput.value = '';

            if (!needsStrip) {
                Toast.info(`Loaded "${file.name}"`);
            }
        };

        reader.onerror = () => {
            Toast.error(`Failed to read "${file.name}"`);
            this.fileInput.value = '';
        };

        reader.readAsText(file);
    }

    handleDownload() {
        if (!this.currentResult) return;

        const downloadName = this.uploadedFilename
            ? RazorStripper.deriveDownloadName(this.uploadedFilename)
            : 'bootstrap5-migrated.html';

        const blob = new Blob([this.currentResult.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        a.click();
        URL.revokeObjectURL(url);

        Toast.success(`Downloaded "${downloadName}"`);
    }

    handleTabSwitch(e) {
        const tabName = e.target.dataset.tab;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    showHelp() {
        this.helpModal.style.display = 'block';
    }

    hideHelp() {
        this.helpModal.style.display = 'none';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
