# Markdown Viewer

A beautiful, GitHub-styled markdown viewer built with React. Preview your markdown files with real-time syntax highlighting and authentic GitHub styling.

## Features

**GitHub-Flavored Markdown Support**
- Tables
- Task lists
- Strikethrough
- Autolinks
- Full GFM compliance

**Beautiful GitHub Dark Theme**
- Authentic GitHub styling
- Dark mode optimized
- Responsive design

**Syntax Highlighting**
- 50+ language support
- GitHub Dark theme
- Line-by-line highlighting

**Real-Time Preview**
- Live editor and preview panes
- Side-by-side comparison
- Instant updates

**File Upload**
- Upload `.md` or `.txt` files
- Quick file loading

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the App

Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

**Port Configuration:**
- The default port is **3000** (configured in the `react-scripts` package, not hardcoded in your code)
- To change the port, set the `PORT` environment variable:
  ```bash
  PORT=5000 npm start
  ```
- Or modify the `start` script in `package.json`:
  ```json
  "start": "PORT=5000 react-scripts start"
  ```

### Building for Production

Create an optimized production build:
```bash
npm run build
```

## Usage

1. **Write Markdown**: Type or paste markdown in the left editor pane
2. **See Preview**: View the rendered output in the right preview pane with GitHub styling
3. **Upload Files**: Click "Upload File" to load `.md` or `.txt` files
4. **Clear**: Click "Clear" to reset the editor

## Technologies Used

- **React** - UI framework
- **react-markdown** - Markdown parsing
- **remark-gfm** - GitHub Flavored Markdown support
- **rehype-highlight** - Syntax highlighting
- **github-markdown-css** - Authentic GitHub styling
- **highlight.js** - Code highlighting library

## Project Structure

```
src/
├── App.js          # Main component with editor and preview
├── App.css         # Styling and layout
├── index.js        # React entry point
└── index.css       # Global styles
```

## Keyboard Shortcuts

- **Tab** in editor: Insert 2 spaces (for indentation)
- **Ctrl/Cmd + A**: Select all text

## Tips

- Use triple backticks with language name for syntax highlighting:
  ```javascript
  console.log('Hello World');
  ```

- Create tables with pipes and dashes:
  ```
  | Column 1 | Column 2 |
  |----------|----------|
  | Cell 1   | Cell 2   |
  ```

- Create task lists with `- [ ]` and `- [x]`:
  ```
  - [x] Completed task
  - [ ] Pending task
  ```

## License

MIT License - feel free to use this project for any purpose.
