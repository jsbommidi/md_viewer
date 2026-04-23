import React, { useState } from 'react';

function TreeNode({ node, activePath, onSelect, depth }) {
  const [open, setOpen] = useState(depth < 1);

  const indent = depth * 16;

  if (node.type === 'file') {
    const isActive = node.path === activePath;
    return (
      <div
        className={`ft-file${isActive ? ' ft-active' : ''}`}
        style={{ paddingLeft: 10 + indent }}
        onClick={() => onSelect(node.path)}
        title={node.path}
      >
        <span className="ft-arrow" aria-hidden="true" />
        <span className="ft-icon">📄</span>
        <span className="ft-name">{node.name}</span>
      </div>
    );
  }

  return (
    <div className="ft-dir">
      <div
        className="ft-dir-row"
        style={{ paddingLeft: 10 + indent }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ft-arrow">{open ? '▾' : '▸'}</span>
        <span className="ft-icon">{open ? '📂' : '📁'}</span>
        <span className="ft-name">{node.name}</span>
      </div>
      {open && node.children.length > 0 && (
        <div className="ft-children">
          {node.children.map((c) => (
            <TreeNode
              key={c.path || c.name}
              node={c}
              activePath={activePath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ node, activePath, onSelect }) {
  if (!node) return null;
  return (
    <div className="ft-root">
      <TreeNode node={node} activePath={activePath} onSelect={onSelect} depth={0} />
    </div>
  );
}
