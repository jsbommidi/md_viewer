import { useCallback, useEffect, useRef, useState } from 'react';
import { buildTree } from './buildTree';
import {
  dirname,
  isExternal,
  isMarkdownPath,
  joinPath,
  stripHashQuery,
} from './resolvePath';

function readText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target.result);
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

function pickDirectoryViaInput() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.style.display = 'none';
    input.onchange = () => {
      const files = input.files;
      document.body.removeChild(input);
      resolve(files && files.length ? files : null);
    };
    // User-cancel on OS picker doesn't fire change; orphan input is fine.
    document.body.appendChild(input);
    input.click();
  });
}

export function useFileSource() {
  const [root, setRoot] = useState(null);
  const filesRef = useRef(new Map());
  const blobCacheRef = useRef(new Map()); // path -> blob URL
  const textCacheRef = useRef(new Map()); // path -> md text

  const revokeAllBlobs = useCallback(() => {
    for (const url of blobCacheRef.current.values()) URL.revokeObjectURL(url);
    blobCacheRef.current.clear();
  }, []);

  useEffect(() => revokeAllBlobs, [revokeAllBlobs]);

  const pickDirectory = useCallback(async () => {
    const files = await pickDirectoryViaInput();
    if (!files) return;
    revokeAllBlobs();
    textCacheRef.current.clear();
    const { root: newRoot, filesMap } = buildTree(files);
    filesRef.current = filesMap;
    setRoot(newRoot);
  }, [revokeAllBlobs]);

  const assetUrlFor = useCallback((path) => {
    const cache = blobCacheRef.current;
    if (cache.has(path)) return cache.get(path);
    const file = filesRef.current.get(path);
    if (!file) return null;
    const url = URL.createObjectURL(file);
    cache.set(path, url);
    return url;
  }, []);

  const open = useCallback(
    async (path) => {
      const file = filesRef.current.get(path);
      if (!file) return { text: '', resolveAsset: () => null };

      let text = textCacheRef.current.get(path);
      if (text == null) {
        text = await readText(file);
        textCacheRef.current.set(path, text);
      }

      const baseDir = dirname(path);
      const resolveAsset = (href) => {
        if (!href) return null;
        if (isExternal(href)) return href;
        const { path: bare, suffix } = stripHashQuery(href);
        if (!bare) return href; // pure #anchor
        const target = joinPath(baseDir, bare);
        if (isMarkdownPath(target) && filesRef.current.has(target)) {
          return { type: 'md', path: target, suffix };
        }
        return assetUrlFor(target);
      };

      return { text, resolveAsset };
    },
    [assetUrlFor]
  );

  return { root, pickDirectory, open };
}
