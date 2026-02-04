# Bootstrap 3→5 Migrator

A static web application that intelligently migrates Bootstrap 3 HTML code to Bootstrap 5 with visual diffs and detailed change tracking.

## Features

- **Intelligent Class Migration**: Automatically transforms Bootstrap 3 classes to their Bootstrap 5 equivalents
- **Grid System**: Handles `col-xs-*`, offset classes, push/pull utilities, and new `col-xxl-*` support
- **Utility Classes**: Migrates float utilities, text alignment, responsive visibility classes
- **Component Structure**: Transforms panels to cards, wells to cards, labels to badges
- **Form Controls**: Updates form-group, control-label, help-block, and input sizing classes
- **Visual Diff**: Side-by-side comparison showing before and after
- **Change Tracking**: Detailed list of all transformations with statistics
- **Example Snippets**: Pre-loaded examples to explore capabilities
- **Copy & Download**: Easy export of migrated code

## Usage

### Quick Start

1. **Open** `index.html` in any modern web browser
2. **Paste** your Bootstrap 3 HTML code into the input area
3. **Click** "Migrate to Bootstrap 5 →"
4. **Review** the changes in three tabs:
   - **Side-by-Side**: Visual diff showing before/after
   - **Changes**: Detailed list of all transformations
   - **Output**: Clean Bootstrap 5 code ready to copy
5. **Copy** the output or download as an HTML file

### Example Snippets

Use the "Load Example..." dropdown to try these examples:
- **Grid System**: Responsive column layouts
- **Form Controls**: Form groups with labels and inputs
- **Panel to Card**: Panel structure transformation
- **Buttons & Utilities**: Button groups with utility classes
- **Complex Layout**: Combination of multiple components

## Supported Transformations

### Grid System
| Bootstrap 3 | Bootstrap 5 |
|------------|-------------|
| `col-xs-12` | `col-12` |
| `col-xs-6` | `col-6` |
| `col-md-offset-2` | `offset-md-2` |
| `col-xs-offset-3` | `offset-3` |
| `col-md-push-4` | `order-md-last` ⚠️ |
| `col-md-pull-4` | `order-md-first` ⚠️ |

⚠️ Push/pull utilities were removed in BS5; order utilities are used as replacements

### Utility Classes
| Bootstrap 3 | Bootstrap 5 |
|------------|-------------|
| `pull-right` | `float-end` |
| `pull-left` | `float-start` |
| `text-right` | `text-end` |
| `text-left` | `text-start` |
| `hidden-xs` | `d-none d-sm-block` |
| `visible-xs-block` | `d-block d-sm-none` |
| `center-block` | `mx-auto d-block` |

### Components
| Bootstrap 3 | Bootstrap 5 |
|------------|-------------|
| `panel panel-default` | `card` |
| `panel-heading` | `card-header` |
| `panel-body` | `card-body` |
| `panel-footer` | `card-footer` |
| `well` | `card card-body` |
| `label` | `badge` |
| `label-primary` | `badge bg-primary` |
| `thumbnail` | `card` |

### Form Controls
| Bootstrap 3 | Bootstrap 5 |
|------------|-------------|
| `form-group` | `mb-3` |
| `control-label` | `form-label` |
| `help-block` | `form-text` |
| `input-lg` | `form-control-lg` |
| `input-sm` | `form-control-sm` |

### Buttons & Images
| Bootstrap 3 | Bootstrap 5 |
|------------|-------------|
| `btn-default` | `btn-secondary` |
| `btn-xs` | `btn-sm` |
| `img-responsive` | `img-fluid` |
| `img-circle` | `rounded-circle` |
| `img-rounded` | `rounded` |

### Navigation & Helpers
| Bootstrap 3 | Bootstrap 5 |
|------------|-------------|
| `navbar-default` | `navbar-light bg-light` |
| `navbar-right` | `ms-auto` |
| `navbar-left` | `me-auto` |
| `sr-only` | `visually-hidden` |
| `close` | `btn-close` |

## Limitations

- **HTML Only**: JavaScript plugin migrations are not included
- **Standard Classes Only**: Works with standard Bootstrap classes; custom builds may require manual review
- **Manual Review Recommended**: Always review migrated code, especially for:
  - Push/pull utilities (now use order utilities)
  - Form validation states
  - Custom component structures
- **No jQuery Migration**: Bootstrap 5 removed jQuery dependency; update JavaScript separately

## Technical Details

### Architecture

- **Parser**: Uses native browser DOMParser for robust HTML parsing
- **Rules Engine**: Chain of Responsibility pattern with 5 rule sets:
  1. Grid Rules (Priority 1)
  2. Utility Rules (Priority 2)
  3. Component Rules (Priority 3)
  4. Form Rules (Priority 4)
  5. Class Map Rules (Priority 5)
- **Differ**: Generates visual diffs and change statistics
- **No Build Step**: Pure HTML/CSS/JavaScript - no dependencies

### Browser Support

- Chrome, Firefox, Safari, Edge (modern versions)
- Requires ES6+ support
- Works offline (all processing is client-side)

### File Structure

```
migrator/
├── index.html              # Main application
├── css/
│   ├── main.css           # Core layout and typography
│   ├── editor.css         # Code editor styling
│   └── diff.css           # Diff highlighting styles
├── js/
│   ├── app.js             # Application initialization
│   ├── core/
│   │   ├── parser.js      # HTML parsing engine
│   │   ├── migrator.js    # Migration orchestrator
│   │   └── differ.js      # Diff generation
│   ├── rules/
│   │   ├── gridRules.js   # Grid transformations
│   │   ├── utilityRules.js # Utility transformations
│   │   ├── componentRules.js # Component migrations
│   │   ├── formRules.js   # Form control migrations
│   │   └── classMap.js    # 1:1 class mappings
│   ├── ui/
│   │   ├── editor.js      # Editor management
│   │   └── toast.js       # Notifications
│   └── utils/
│       └── clipboard.js   # Clipboard functionality
└── README.md              # This file
```

## Deployment

### GitHub Pages

1. Push to GitHub repository
2. Go to Settings → Pages
3. Select main branch as source
4. Access at `https://username.github.io/migrator`

### Netlify / Vercel

- Drag-and-drop the entire folder
- No build configuration needed
- Instant deployment

### Local Usage

Simply open `index.html` in any modern web browser. No server required.

## Development

### Adding New Transformation Rules

Create a new rule class in `js/rules/`:

```javascript
class CustomRules {
    constructor() {
        this.name = 'Custom Rules';
        this.priority = 6; // Set priority
    }

    apply(doc, changes) {
        // Your transformation logic
    }
}
```

Register in `js/core/migrator.js`:

```javascript
this.rules = [
    // ... existing rules
    new CustomRules()
];
```

### Adding New Examples

Edit `js/ui/editor.js` and add to the `examples` object:

```javascript
this.examples = {
    // ... existing examples
    myExample: `<div class="col-xs-12">Example HTML</div>`
};
```

## Credits

Built for systematic Bootstrap 3→5 migration in C# codebases with inline HTML strings.

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

Contributions welcome! Areas for improvement:
- Additional transformation rules
- JavaScript plugin migration
- Visual preview with actual Bootstrap rendering
- Batch file processing
- VS Code extension

## Support

For issues or questions, please open an issue on GitHub.

---

**Note**: This tool is designed to automate the majority of Bootstrap migrations, but manual review is always recommended. Test migrated code thoroughly before deploying to production.
