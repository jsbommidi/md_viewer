import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/github-dark.css';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Viewer

## Getting Started

This is a GitHub-styled markdown viewer built with React. Use **Show Editor** in the header to edit, or upload a markdown file.

### Features

- GitHub-flavored markdown support
- Beautiful GitHub styling
- Syntax highlighting for code blocks
- Full table support
- Task lists

### Code Example

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

### Table Example

| Feature | Status |
|---------|--------|
| Markdown | Supported |
| Tables | Supported |
| Code Highlighting | Supported |

### Blockquote

> This is a blockquote. It supports multiple lines and **markdown formatting**.

### Task List

- [x] Setup React
- [x] Add markdown parsing
- [ ] Deploy to production

---

Try uploading a markdown file or paste your own markdown content!
  `);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMarkdown(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setMarkdown('');
  };

  const toggleEditor = () => {
    setEditorOpen(!editorOpen);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Markdown Viewer</h1>
          <p>GitHub-styled markdown preview</p>
        </div>
        <div className="header-controls">
          <label className="file-upload-btn">
            Upload File
            <input type="file" accept=".md,.txt" onChange={handleFileUpload} />
          </label>
          <button className="toggle-btn" onClick={toggleEditor}>
            {editorOpen ? 'Hide Editor' : 'Show Editor'}
          </button>
          <button className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>
      </header>

      <div className="container">
        {editorOpen && (
          <div className="editor-section">
            <h2>Editor</h2>
            <textarea
              className="editor"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter or paste markdown here..."
            />
          </div>
        )}

        <div className={`preview-section ${!editorOpen ? 'fullwidth' : ''}`}>
          <h2>Preview</h2>
          <div className="preview markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                img: ({ alt, src, ...props }) => (
                  <img alt={alt} src={src} {...props} style={{ maxWidth: '100%' }} />
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
