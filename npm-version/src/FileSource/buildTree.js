import { isMarkdownPath } from './resolvePath';

// Strip shared root segment (webkitRelativePath always starts with picked dir name).
function stripRoot(files) {
  const out = [];
  let rootName = null;
  for (const f of files) {
    const rel = f.webkitRelativePath || f.name;
    const slash = rel.indexOf('/');
    if (slash < 0) {
      out.push({ path: rel, file: f });
      continue;
    }
    const first = rel.slice(0, slash);
    if (rootName === null) rootName = first;
    const path = first === rootName ? rel.slice(slash + 1) : rel;
    out.push({ path, file: f });
  }
  return { entries: out, rootName: rootName ?? 'files' };
}

// Flat list -> nested tree, md-only in display but keep everything in filesMap.
export function buildTree(fileList) {
  const { entries, rootName } = stripRoot(fileList);
  const filesMap = new Map();
  for (const { path, file } of entries) filesMap.set(path, file);

  // Only md paths create visible tree nodes; ancestor dirs implied.
  const mdPaths = entries.map((e) => e.path).filter(isMarkdownPath).sort();

  const root = { type: 'dir', name: rootName, path: '', children: [] };
  const dirMap = new Map([['', root]]);

  const ensureDir = (dirPath) => {
    if (dirMap.has(dirPath)) return dirMap.get(dirPath);
    const parts = dirPath.split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');
    const parent = ensureDir(parentPath);
    const node = { type: 'dir', name, path: dirPath, children: [] };
    parent.children.push(node);
    dirMap.set(dirPath, node);
    return node;
  };

  for (const p of mdPaths) {
    const slash = p.lastIndexOf('/');
    const dirPath = slash < 0 ? '' : p.slice(0, slash);
    const name = slash < 0 ? p : p.slice(slash + 1);
    const dir = ensureDir(dirPath);
    dir.children.push({ type: 'file', name, path: p });
  }

  sortTree(root);
  return { root, filesMap };
}

function sortTree(node) {
  if (node.type !== 'dir') return;
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const c of node.children) sortTree(c);
}
