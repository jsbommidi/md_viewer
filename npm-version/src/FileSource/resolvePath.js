const EXTERNAL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|mailto:|tel:)/i;

export function isExternal(href) {
  return !href || EXTERNAL_RE.test(href);
}

export function dirname(path) {
  const i = path.lastIndexOf('/');
  return i < 0 ? '' : path.slice(0, i);
}

export function joinPath(baseDir, rel) {
  const stripped = rel.replace(/^\.\//, '');
  const parts = (baseDir ? baseDir.split('/') : []).concat(stripped.split('/'));
  const out = [];
  for (const p of parts) {
    if (p === '' || p === '.') continue;
    if (p === '..') out.pop();
    else out.push(p);
  }
  return out.join('/');
}

export function stripHashQuery(href) {
  const h = href.indexOf('#');
  const q = href.indexOf('?');
  let end = href.length;
  if (h >= 0) end = Math.min(end, h);
  if (q >= 0) end = Math.min(end, q);
  return { path: href.slice(0, end), suffix: href.slice(end) };
}

export function isMarkdownPath(path) {
  return /\.(md|markdown)$/i.test(path);
}
