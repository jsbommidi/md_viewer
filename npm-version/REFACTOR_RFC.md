# RFC: Directory open + FileSource module

Deepen module: replace single-file upload with VSCode-style directory open + clickable md file tree. Extract `FileSource` as a deep module with a tiny data-API core and one presentational tree component.

## Motivation

`App.js` (131 LOC) mixes UI, state, and file I/O. Adding dir support inline would bloat it. A deep `FileSource` module hides the messy parts (FileList → tree, lazy read, blob-URL lifecycle, relative-path resolution) behind a 3-function hook plus one dumb render component.

Local-use tool. No tests. No prod hardening. Simple.

## Final shape

### Core data API (no UI)

```js
// src/FileSource/useFileSource.js
const { root, pickDirectory, open } = useFileSource();

// root: TreeNode | null
// pickDirectory(): Promise<void>   — opens OS dir picker
// open(path): Promise<{ text, resolveAsset }>
//   text          — raw md text, untouched
//   resolveAsset(href) — href string -> blob URL | md path | null | external href
```

```ts
type TreeNode =
  | { type: 'dir'; name: string; path: string; children: TreeNode[] }
  | { type: 'file'; name: string; path: string };
```

### Tree component (presentational, stateless)

```jsx
<FileTree node={root} activePath={active} onSelect={setActive} />
```

Pure render. No context. No internal state beyond expand/collapse.

## What FileSource hides

- `<input type="file" webkitdirectory multiple>` mounted hidden, click-triggered, resolves Promise on `change`.
- FileList → nested TreeNode: split `webkitRelativePath` on `/`, strip root segment, sort dirs-first, alpha within.
- Tree shows `.md` + `.markdown` + ancestor dirs. Non-md files kept in flat `Map<path, File>` for asset lookup but hidden from tree.
- `open(path)`: `FileReader.readAsText` on md file; cached in `Map<path, string>`.
- `resolveAsset(href)`: normalize `./`/`../` against active file's dir, look up in flat Map, mint `URL.createObjectURL` lazy, cache in `Map<path, blobUrl>`.
- External URLs (`http://`, `https://`, `mailto:`) pass through unchanged.
- Blob URL lifecycle: revoke all on next `pickDirectory()` and on unmount via `useEffect` cleanup.

## Consumer wiring (App.js sketch)

```jsx
const { root, pickDirectory, open } = useFileSource();
const [activePath, setActivePath] = useState(null);
const [doc, setDoc] = useState({ text: welcomeMd, resolveAsset: () => null });

useEffect(() => {
  if (!activePath) return;
  open(activePath).then(setDoc);
}, [activePath, open]);

return (
  <div className="App">
    <header>
      <button onClick={pickDirectory}>Open Folder</button>
      {/* existing upload/editor/clear buttons stay */}
    </header>
    <div className="container">
      {root && (
        <aside className="sidebar">
          <FileTree node={root} activePath={activePath} onSelect={setActivePath} />
        </aside>
      )}
      <main className="preview markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            img: ({ src, ...p }) => <img {...p} src={doc.resolveAsset(src) ?? src} />,
            a: ({ href, children, ...p }) => {
              const r = doc.resolveAsset(href);
              if (typeof r === 'object' && r?.type === 'md') {
                return <a {...p} href="#" onClick={e => { e.preventDefault(); setActivePath(r.path); }}>{children}</a>;
              }
              return <a {...p} href={r ?? href}>{children}</a>;
            },
          }}
        >{doc.text}</ReactMarkdown>
      </main>
    </div>
  </div>
);
```

Note on `resolveAsset` return shape: for md-to-md links it returns `{ type: 'md', path }` so the `a` override can intercept and call `setActivePath` instead of navigating. For images and non-md assets, returns a blob URL string. For external, returns the original href. For missing/unresolved, returns `null`.

## File layout

```
src/FileSource/
  useFileSource.js    — hook, class impl inside
  FileTree.jsx        — presentational tree
  buildTree.js        — FileList -> TreeNode
  resolvePath.js      — ./, ../ normalization
  index.js            — re-exports
```

## Dependency category

Cross-boundary (browser fs APIs: File, FileReader, URL.createObjectURL, webkitdirectory input). All isolated inside the module; consumer never touches these directly.

## Tradeoffs accepted

- `webkitdirectory` loads whole FileList eagerly — fine for local notes, bad for 10k-file repos.
- No live watch — re-pick dir to see edits.
- No File System Access API — Safari/FF support matters more than write capability.
- Existing single-file upload stays as second code path; welcome text stays as initial doc.
- Editor toggle: when a file is active, editing diverges from disk. Accept divergence for now (no save-to-disk). Editor shows `doc.text` copy; edits update local markdown state only.

## Non-goals

- No tests.
- No save/write back to disk.
- No fs watch / auto-reload.
- No multi-dir sessions.
- No drag-drop dir (punt until asked).

## Implementation steps

1. Create `src/FileSource/buildTree.js` — flat FileList → nested TreeNode, md-filtered, dirs-first sort.
2. Create `src/FileSource/resolvePath.js` — posix-join, collapse `./` `../`, classify external vs relative.
3. Create `src/FileSource/useFileSource.js` — class holds `filesMap`, `blobCache`, `textCache`; hook exposes `{ root, pickDirectory, open }`.
4. Create `src/FileSource/FileTree.jsx` — recursive render, expand/collapse via local `useState` per node or lifted Set, active-path highlight.
5. Update `src/App.js` — add sidebar, wire hook, add `img`/`a` component overrides to ReactMarkdown.
6. Update `src/App.css` — sidebar pane, tree node styles, active highlight, dir-arrow, indentation.
7. Manual test locally: pick a dir with nested md + images, click around, verify images render and relative md links switch active file.
