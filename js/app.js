/**
 * App - Main application initialization and event handling
 */
class App {
    constructor() {
        this.migrator = new Migrator();
        this.analyser = new Analyser();
        this.editor   = new Editor();
        this.currentResult   = null;
        this.currentAnalysis = null;
        this.uploadedFilename = null;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.inputArea      = document.getElementById('inputArea');
        this.outputArea     = document.getElementById('outputArea');
        this.outputSection  = document.getElementById('outputSection');
        this.migrateBtn     = document.getElementById('migrateBtn');
        this.analyseBtn     = document.getElementById('analyseBtn');
        this.copyOutputBtn  = document.getElementById('copyOutputBtn');
        this.clearBtn       = document.getElementById('clearBtn');
        this.exampleSnippets = document.getElementById('exampleSnippets');
        this.formatInputBtn = document.getElementById('formatInputBtn');
        this.downloadBtn    = document.getElementById('downloadBtn');
        this.helpBtn        = document.getElementById('helpBtn');
        this.helpModal      = document.getElementById('helpModal');
        this.closeHelp      = document.getElementById('closeHelp');
        this.uploadBtn      = document.getElementById('uploadBtn');
        this.fileInput      = document.getElementById('fileInput');
    }

    attachEventListeners() {
        this.migrateBtn.addEventListener('click', () => this.handleMigrate());
        this.analyseBtn.addEventListener('click', () => this.handleAnalyse());
        this.copyOutputBtn.addEventListener('click', () => this.handleCopyOutput());
        this.clearBtn.addEventListener('click', () => this.handleClear());
        this.exampleSnippets.addEventListener('change', e => this.handleLoadExample(e));
        this.formatInputBtn.addEventListener('click', () => this.handleFormatInput());
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.closeHelp.addEventListener('click', () => this.hideHelp());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', e => this.handleFileUpload(e));

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', e => this.handleTabSwitch(e));
        });

        window.addEventListener('click', e => {
            if (e.target === this.helpModal) this.hideHelp();
        });
    }

    // ── Analyse ───────────────────────────────────────────────────────────────

    handleAnalyse() {
        const input = this.inputArea.value.trim();
        if (!input) { Toast.warning('Please enter some Bootstrap 3 HTML code'); return; }

        this.analyseBtn.disabled = true;
        this.analyseBtn.textContent = 'Analysing…';

        setTimeout(() => {
            try {
                const parser = new HTMLParser(input);
                const doc    = parser.parse();
                this.currentAnalysis = this.analyser.analyse(input, doc);

                this.outputSection.style.display = 'block';

                // Switch to the analysis tab
                this._activateTab('analysis');

                this.renderAnalysis(this.currentAnalysis);

                const { total, effort } = this.currentAnalysis.stats;
                Toast.info(`Analysis complete — ${total} issue${total !== 1 ? 's' : ''} found · Effort: ${effort}`);
            } catch (err) {
                Toast.error('Analysis error: ' + err.message);
            } finally {
                this.analyseBtn.disabled = false;
                this.analyseBtn.textContent = 'Analyse';
            }

            this.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    }

    renderAnalysis(report) {
        const el = document.getElementById('analysisContent');
        if (!el) return;

        const { stats, bySeverity } = report;

        const severityMeta = {
            critical: { label: 'CRITICAL',      icon: '🔴', desc: 'Runtime exception or total render failure' },
            high:     { label: 'HIGH',           icon: '🟠', desc: 'Broken UI or non-functional components' },
            medium:   { label: 'MEDIUM',         icon: '🟡', desc: 'Visual regressions — renders but looks wrong' },
            low:      { label: 'LOW',            icon: '🟢', desc: 'Deprecated but still renders via browser fallback' },
            manual:   { label: 'MANUAL REVIEW',  icon: '🔵', desc: 'Cannot be auto-fixed — requires human review' }
        };

        const effortColour = { Low: '#198754', Medium: '#fd7e14', High: '#dc3545' };

        let html = `
        <div class="analysis-summary">
            <div class="analysis-stats-row">
                <div class="astat astat-total"><strong>${stats.total}</strong><span>Total Issues</span></div>
                <div class="astat astat-auto"><strong>${stats.autoFixable}</strong><span>Auto-fixable</span></div>
                <div class="astat astat-manual"><strong>${stats.manualReview}</strong><span>Manual Review</span></div>
                <div class="astat astat-effort" style="border-left-color:${effortColour[stats.effort]}">
                    <strong style="color:${effortColour[stats.effort]}">${stats.effort}</strong>
                    <span>Effort Estimate</span>
                </div>
            </div>
            <div class="analysis-severity-bar">
                ${Object.entries(stats.bySeverity).filter(([,c]) => c > 0).map(([sev, count]) => `
                    <span class="sev-pill sev-${sev}">${severityMeta[sev].icon} ${severityMeta[sev].label}: ${count}</span>
                `).join('')}
            </div>
            ${stats.autoFixable > 0 ? `<p class="analysis-tip">💡 Click <strong>Migrate to Bootstrap 5</strong> to automatically fix the ${stats.autoFixable} auto-fixable issue${stats.autoFixable !== 1 ? 's' : ''}.</p>` : ''}
        </div>`;

        // Render each severity group that has issues
        Object.entries(bySeverity).forEach(([sev, issues]) => {
            if (!issues.length) return;
            const meta = severityMeta[sev];
            html += `
            <div class="analysis-group">
                <h4 class="analysis-group-title sev-bg-${sev}">
                    ${meta.icon} ${meta.label} <span class="sev-count">(${issues.reduce((s, i) => s + i.count, 0)})</span>
                    <small>${meta.desc}</small>
                </h4>
                <div class="analysis-items">
                    ${issues.map((issue, idx) => `
                        <div class="analysis-item">
                            <div class="analysis-item-header">
                                <span class="analysis-item-num">${idx + 1}</span>
                                <span class="analysis-item-label">${issue.label}</span>
                                <span class="analysis-item-count">${issue.count}×</span>
                                ${issue.autoFixable
                                    ? '<span class="analysis-badge auto">⚡ auto-fixable</span>'
                                    : '<span class="analysis-badge manual">👁 manual</span>'}
                            </div>
                            <div class="analysis-item-fix">
                                <strong>Fix:</strong> ${this._escapeHTML(issue.fix)}
                            </div>
                            ${issue.context && issue.context.length ? `
                                <div class="analysis-item-context">
                                    <strong>Found:</strong>
                                    ${issue.context.map(c => `<code>${this._escapeHTML(c)}</code>`).join(' ')}
                                    ${issue.count > 3 ? `<em>…and ${issue.count - 3} more</em>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>`;
        });

        if (stats.total === 0) {
            html = `<div class="analysis-clean">
                ✅ <strong>No Bootstrap 3 issues detected.</strong>
                This HTML fragment appears to already use Bootstrap 5 conventions.
            </div>`;
        }

        el.innerHTML = html;
    }

    // ── Migrate ───────────────────────────────────────────────────────────────

    handleMigrate() {
        const input = this.inputArea.value.trim();
        if (!input) { Toast.warning('Please enter some Bootstrap 3 HTML code'); return; }

        this.migrateBtn.disabled = true;
        this.migrateBtn.textContent = 'Migrating…';

        setTimeout(() => {
            try {
                this.currentResult = this.migrator.migrate(input);

                if (!this.currentResult.success) {
                    Toast.error('Migration failed: ' + this.currentResult.errors.join(', '));
                    return;
                }

                this.outputSection.style.display = 'block';
                this.outputArea.value = this.currentResult.html;

                const differ = new Differ(
                    this.currentResult.originalHTML,
                    this.currentResult.html,
                    this.currentResult.changes
                );
                const diff = differ.generateDiff();

                document.getElementById('beforeCode').innerHTML = diff.before;
                document.getElementById('afterCode').innerHTML  = diff.after;

                this.renderChanges(this.currentResult.changes, this.currentResult.stats);

                // Run a post-migration analysis and show residual issues count
                const parser  = new HTMLParser(this.currentResult.html);
                const postDoc = parser.parse();
                const postAnalysis = this.analyser.analyse(this.currentResult.html, postDoc);
                this.currentAnalysis = postAnalysis;
                this.renderAnalysis(postAnalysis);

                const changeCount  = this.currentResult.changes.length;
                const residual     = postAnalysis.stats.total;
                Toast.success(`Migration complete! ${changeCount} changes applied.`);

                if (residual > 0) {
                    setTimeout(() => Toast.warning(`${residual} item${residual !== 1 ? 's' : ''} still need manual review — check Analysis tab`), 1500);
                }

                if (this.currentResult.warnings.length > 0 && residual === 0) {
                    setTimeout(() => Toast.warning(`${this.currentResult.warnings.length} warnings — check Changes tab`), 1500);
                }

                this._activateTab('sideBySide');
            } catch (err) {
                Toast.error('Unexpected error: ' + err.message);
            } finally {
                this.migrateBtn.disabled = false;
                this.migrateBtn.textContent = 'Migrate to Bootstrap 5 →';
            }

            this.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    renderChanges(changes, stats) {
        const summaryEl = document.getElementById('changesSummary');
        const listEl    = document.getElementById('changesList');

        summaryEl.innerHTML = `
            <h3>Migration Summary</h3>
            <div class="stats-grid">
                <div class="stat-item"><strong>${stats.totalChanges}</strong><span>Total Changes</span></div>
                <div class="stat-item"><strong>${stats.affectedElements}</strong><span>Affected Elements</span></div>
                <div class="stat-item"><strong>${Object.keys(stats.byType).length}</strong><span>Change Types</span></div>
            </div>
            <div class="stats-breakdown">
                <h4>Changes by Type:</h4>
                <ul>
                    ${Object.entries(stats.byType).map(([type, count]) =>
                        `<li><strong>${type}:</strong> ${count} changes</li>`
                    ).join('')}
                </ul>
            </div>`;

        const grouped = {};
        changes.forEach(c => {
            if (!grouped[c.type]) grouped[c.type] = [];
            grouped[c.type].push(c);
        });

        let html = '<div class="changes-groups">';
        Object.entries(grouped).forEach(([type, typeChanges]) => {
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
                                        <span class="old-class">${this._escapeHTML(change.oldClass)}</span>
                                        <span class="arrow">→</span>
                                        <span class="new-class">${this._escapeHTML(change.newClass)}</span>
                                    </div>
                                    ${change.warning ? `<div class="change-warning">⚠️ ${change.warning}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        });
        html += '</div>';
        listEl.innerHTML = html;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    _activateTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const content = document.getElementById(tabName);
        if (btn) btn.classList.add('active');
        if (content) content.classList.add('active');
    }

    _escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Other handlers ────────────────────────────────────────────────────────

    async handleCopyOutput() {
        if (!this.currentResult) return;
        const result = await ClipboardManager.copy(this.currentResult.html);
        result.success ? Toast.success(result.message) : Toast.error(result.message);
    }

    handleClear() {
        this.inputArea.value = '';
        this.outputArea.value = '';
        this.outputSection.style.display = 'none';
        this.currentResult   = null;
        this.currentAnalysis = null;
        this.uploadedFilename = null;
        this.exampleSnippets.value = '';
        Toast.info('Cleared all content');
    }

    handleLoadExample(e) {
        const name = e.target.value;
        if (!name) return;
        this.inputArea.value = this.editor.loadExample(name);
        Toast.info(`Loaded ${name} example`);
    }

    handleFormatInput() {
        const input = this.inputArea.value.trim();
        if (!input) return;
        this.inputArea.value = this.editor.formatHTML(input);
        Toast.success('HTML formatted');
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!/\.(html|htm|vbhtml|cshtml|razor)$/i.test(file.name)) {
            Toast.error('Unsupported file type. Please upload .html, .htm, .vbhtml, .cshtml, or .razor files.');
            this.fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            let content = event.target.result;
            const needsStrip = RazorStripper.needsStripping(file.name);

            if (needsStrip) {
                const { stripped, removedCount } = RazorStripper.strip(content);
                content = stripped;
                if (removedCount > 0) {
                    Toast.warning(`Razor/VB syntax stripped from "${file.name}" — review before migrating`);
                }
            }

            this.inputArea.value = content;
            this.uploadedFilename = file.name;
            this.fileInput.value  = '';
            if (!needsStrip) Toast.info(`Loaded "${file.name}"`);
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
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = downloadName; a.click();
        URL.revokeObjectURL(url);
        Toast.success(`Downloaded "${downloadName}"`);
    }

    handleTabSwitch(e) {
        this._activateTab(e.target.dataset.tab);
    }

    showHelp() { this.helpModal.style.display = 'block'; }
    hideHelp() { this.helpModal.style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
