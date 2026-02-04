/**
 * Editor - Manages code editor functionality and example snippets
 */
class Editor {
    constructor() {
        this.examples = {
            grid: `<div class="container">
  <div class="row">
    <div class="col-xs-12 col-md-8">
      <h1>Main Content</h1>
    </div>
    <div class="col-xs-6 col-md-4 pull-right">
      <h2>Sidebar</h2>
    </div>
  </div>
</div>`,

            form: `<form class="form-horizontal">
  <div class="form-group">
    <label class="control-label col-sm-2">Email</label>
    <div class="col-sm-10">
      <input type="email" class="form-control input-lg">
      <span class="help-block">Enter your email address</span>
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button class="btn btn-default">Submit</button>
    </div>
  </div>
</form>`,

            panel: `<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">Panel Title</h3>
  </div>
  <div class="panel-body">
    <p>Panel content goes here.</p>
    <button class="btn btn-default btn-xs pull-right">Action</button>
  </div>
  <div class="panel-footer">
    Panel footer
  </div>
</div>`,

            buttons: `<div class="btn-toolbar">
  <button class="btn btn-default pull-left">Default</button>
  <button class="btn btn-primary">Primary</button>
  <button class="btn btn-success btn-xs">Small Success</button>
  <button class="btn btn-danger pull-right">Danger</button>
</div>
<div class="text-right hidden-xs">
  <span class="label label-info">Info Label</span>
  <span class="label label-warning">Warning Label</span>
</div>`,

            complex: `<div class="container-fluid">
  <div class="row">
    <div class="col-xs-12 col-md-4 col-md-offset-2">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h3 class="panel-title">User Profile</h3>
        </div>
        <div class="panel-body">
          <form>
            <div class="form-group">
              <label class="control-label">Username</label>
              <input class="form-control input-sm">
            </div>
            <div class="form-group">
              <label class="control-label">Bio</label>
              <textarea class="form-control"></textarea>
              <span class="help-block">Tell us about yourself</span>
            </div>
            <button class="btn btn-default pull-right">Save</button>
          </form>
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-md-6 hidden-sm">
      <div class="well">
        <h4 class="text-center">Welcome!</h4>
        <p class="text-right">This is a complex layout example.</p>
        <img class="img-responsive img-circle center-block" src="placeholder.jpg" alt="Profile">
      </div>
    </div>
  </div>
</div>`
        };
    }

    /**
     * Load an example snippet
     */
    loadExample(exampleName) {
        return this.examples[exampleName] || '';
    }

    /**
     * Get list of available examples
     */
    getExamplesList() {
        return Object.keys(this.examples);
    }

    /**
     * Format HTML with basic indentation
     */
    formatHTML(html) {
        // Simple HTML formatting
        let formatted = html.trim();
        formatted = formatted.replace(/></g, '>\n<');

        // Basic indentation
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const indentedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';

            if (trimmed.startsWith('</')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            const indented = '  '.repeat(indentLevel) + trimmed;

            if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
                indentLevel++;
            }

            return indented;
        });

        return indentedLines.filter(line => line).join('\n');
    }
}
