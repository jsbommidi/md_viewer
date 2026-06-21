import React, { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/github-dark.css';
import './App.css';
import { useFileSource, FileTree } from './FileSource';

const WELCOME_MD = `# Welcome to md-viewer

## Getting Started

GitHub-styled markdown viewer. Open a folder, click any \`.md\` file in the tree, or upload a single file. Toggle the editor to edit.

### Features

- Open a directory (VSCode-style) and browse md files
- Relative links and images resolved against the folder
- GitHub-flavored markdown + syntax highlighting

### Try it

1. Click **Open Folder** to pick a directory
2. Click any file in the sidebar
`;

const NOOP_RESOLVE = () => null;

function App() {
  const { root, pickDirectory, open } = useFileSource();

  const [activePath, setActivePath] = useState(null);
  const [markdown, setMarkdown] = useState(WELCOME_MD);
  const [resolveAsset, setResolveAsset] = useState(() => NOOP_RESOLVE);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (!activePath) return;
    let cancelled = false;
    open(activePath).then((doc) => {
      if (cancelled) return;
      setMarkdown(doc.text);
      setResolveAsset(() => doc.resolveAsset);
    });
    return () => {
      cancelled = true;
    };
  }, [activePath, open]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setActivePath(null);
      setResolveAsset(() => NOOP_RESOLVE);
      setMarkdown(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setActivePath(null);
    setResolveAsset(() => NOOP_RESOLVE);
    setMarkdown('');
  };

  const toggleEditor = () => setEditorOpen((v) => !v);

  const renderImg = useCallback(
    ({ alt, src, ...props }) => {
      const r = resolveAsset(src);
      const finalSrc = typeof r === 'string' ? r : src;
      return <img alt={alt} src={finalSrc} {...props} style={{ maxWidth: '100%' }} />;
    },
    [resolveAsset]
  );

  const renderAnchor = useCallback(
    ({ href, children, ...props }) => {
      const r = resolveAsset(href);
      if (r && typeof r === 'object' && r.type === 'md') {
        return (
          <a
            {...props}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActivePath(r.path);
            }}
          >
            {children}
          </a>
        );
      }
      const finalHref = typeof r === 'string' ? r : href;
      return (
        <a {...props} href={finalHref}>
          {children}
        </a>
      );
    },
    [resolveAsset]
  );

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>md-viewer</h1>
          <p>GitHub-styled markdown preview</p>
        </div>
        <div className="header-controls">
          <button className="open-dir-btn" onClick={pickDirectory}>
            Open Folder
          </button>
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
        {root && (
          <aside className="sidebar">
            <div className="sidebar-header">{root.name || 'Explorer'}</div>
            <FileTree node={root} activePath={activePath} onSelect={setActivePath} />
          </aside>
        )}

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
          <h2>{activePath ? activePath : 'Preview'}</h2>
          <div className="preview markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{ img: renderImg, a: renderAnchor }}
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
