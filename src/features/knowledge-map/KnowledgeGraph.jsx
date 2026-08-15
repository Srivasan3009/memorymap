import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState,
  Handle, Position, MarkerType
} from '@xyflow/react';
import { Network } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { CONCEPT_CATEGORIES as C } from '../../utils/types';
import { MASTERY_META } from '../../utils/mastery';

const CATEGORY_COLORS = {
  [C.ROOT]: '#818cf8',
  [C.MAJOR]: '#22d3ee',
  [C.MINOR]: '#38bdf8',
  [C.DETAIL]: '#a78bfa'
};

const CATEGORY_LABELS = {
  [C.ROOT]: 'Core Topic',
  [C.MAJOR]: 'Main Concept',
  [C.MINOR]: 'Supporting',
  [C.DETAIL]: 'Detail'
};

// Left-to-right layered tree layout computed from the graph relationships.
export function layoutGraph(map, { width = 1600, height = 800 } = {}) {
  const nodes = map.concepts;
  const edges = map.relationships;

  const root = nodes.find((n) => n.category === C.ROOT) || nodes[0];

  // BFS from the root assigns each node its shortest-path depth.
  const children = {};
  edges.forEach((e) => {
    (children[e.source] ||= []).push(e.target);
  });

  const depth = {};
  const queue = [root.id];
  depth[root.id] = 0;
  const seen = new Set([root.id]);
  while (queue.length) {
    const id = queue.shift();
    const next = (children[id] || []).filter((c) => !seen.has(c));
    next.forEach((c) => {
      seen.add(c);
      depth[c] = depth[id] + 1;
      queue.push(c);
    });
  }
  // Any unreachable nodes sit one level past the deepest.
  const maxDepth = Math.max(0, ...nodes.map((n) => depth[n.id] ?? 0));
  nodes.forEach((n) => {
    if (depth[n.id] === undefined) depth[n.id] = maxDepth + 1;
  });

  const byLevel = {};
  nodes.forEach((n) => {
    const lv = depth[n.id];
    (byLevel[lv] ||= []).push(n.id);
  });
  const levelList = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
  const maxLevel = levelList.length ? Math.max(...levelList) : 0;

  // Column x positions: generous spacing so nodes never overlap horizontally.
  const columnWidth = Math.max(300, width / (maxLevel + 1.6));
  const positions = {};
  nodes.forEach((n) => {
    const lv = depth[n.id];
    positions[n.id] = { x: 90 + lv * columnWidth, y: 0 };
  });

  // Vertical placement: spread within each level; widen the layout so a full
  // level fits with breathing room.
  const slot = {};
  levelList.forEach((lv) => {
    const ids = byLevel[lv];
    const count = ids.length;
    ids.forEach((id, i) => {
      positions[id].y = height * ((i + 1) / (count + 1));
    });
  });

  return { positions };
}

function MasteryDot({ mastery }) {
  const color = MASTERY_META[mastery]?.color || '#94a3b8';
  return <span className="node-mastery-dot" style={{ background: color }} title={`Mastery: ${MASTERY_META[mastery]?.label}`} />;
}

function ConceptNode({ data, selected }) {
  const { concept, mastery, highlighted, dimmed } = data;
  const color = CATEGORY_COLORS[concept.category] || '#38bdf8';
  const cls = [
    'mm-node',
    `node-${concept.category}`,
    selected ? 'selected' : '',
    highlighted ? 'highlighted' : '',
    dimmed ? 'dimmed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} style={{ borderLeft: `3px solid ${color}` }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div className="node-name">
        <MasteryDot mastery={mastery} />
        <span>{concept.name}</span>
        {data.onExpand && (
          <span
            className="node-expand nodrag"
            style={{ pointerEvents: 'all', position: 'relative', zIndex: 5 }}
            onClick={(e) => { e.stopPropagation(); data.onExpand(concept.id); }}
            title="Expand/collapse branch"
          >
            {data.collapsed ? '+' : '−'}
          </span>
        )}
      </div>
      <div className="node-cat">{CATEGORY_LABELS[concept.category] || concept.category}</div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

// Computes which concepts should be hidden given the collapsed branch set.
function computeHidden(map, collapsed) {
  const hidden = new Set();
  if (!collapsed?.size) return hidden;
  const queue = [...collapsed];
  while (queue.length) {
    const id = queue.shift();
    map.getChildren(id).forEach((child) => {
      if (!hidden.has(child.id)) {
        hidden.add(child.id);
        queue.push(child.id);
      }
    });
  }
  return hidden;
}

const nodeTypes = { concept: ConceptNode };

export function KnowledgeGraph({
  map,
  collapsed = new Set(),
  activeId,
  onNodeClick,
  onExpand,
  height = '100%',
  fitView = true,
  showMinimap = false,
  fitSignal = 0
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const fitDone = useRef(false);
  const flowInstanceRef = useRef(null);

  // Rebuild graph only when the map structure or collapsed set changes.
  const graph = useMemo(() => {
    const { positions } = layoutGraph(map);
    const hidden = computeHidden(map, collapsed);

    const flowNodes = map.concepts
      .filter((c) => !hidden.has(c.id))
      .map((concept) => ({
        id: concept.id,
        type: 'concept',
        position: positions[concept.id] || { x: 0, y: 0 },
        data: {
          concept,
          mastery: map.mastery?.[concept.id] || 'unknown',
          onExpand: onExpand || null,
          collapsed: collapsed.has(concept.id),
          highlighted: false,
          dimmed: false
        }
      }));

    const flowEdges = map.relationships
      .filter((e) => !hidden.has(e.source) && !hidden.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || '',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { stroke: '#64748b', strokeWidth: 1.4 },
        labelStyle: { fill: '#94a3b8', fontSize: 10 },
        labelBgStyle: { fill: '#0c1226', fillOpacity: 0.85 }
      }));

    return { flowNodes, flowEdges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, collapsed]);

  useEffect(() => {
    setNodes(graph.flowNodes);
    setEdges(graph.flowEdges);
    fitDone.current = false;
  }, [graph, setNodes, setEdges]);

  // Apply highlight/dim without rebuilding positions (preserves user drags).
  useEffect(() => {
    if (!activeId) {
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, highlighted: false, dimmed: false } })));
      return;
    }
    const related = new Set(map.getRelated(activeId).map((c) => c.id));
    related.add(activeId);
    setNodes((nds) =>
      nds.map((n) => {
        if (!map.getConcept(n.id)) return n;
        return {
          ...n,
          data: {
            ...n.data,
            highlighted: related.has(n.id),
            dimmed: !related.has(n.id)
          }
        };
      })
    );
  }, [activeId, map, setNodes]);

  const onNodeClickCb = useCallback((_, node) => {
    if (onNodeClick) onNodeClick(node.id);
  }, [onNodeClick]);

  const onInit = useCallback((instance) => {
    flowInstanceRef.current = instance;
    if (fitView && !fitDone.current) {
      setTimeout(() => instance.fitView({ padding: 0.15, duration: 400 }), 50);
      fitDone.current = true;
    }
  }, [fitView]);

  // Re-center when the reset signal changes.
  useEffect(() => {
    if (fitSignal > 0 && flowInstanceRef.current) {
      flowInstanceRef.current.fitView({ padding: 0.15, duration: 500 });
    }
  }, [fitSignal]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClickCb}
      onInit={onInit}
      nodeTypes={nodeTypes}
      fitView={false}
      minZoom={0.2}
      maxZoom={2}
      style={{ height }}
      proOptions={{ hideAttribution: true }}
      nodesConnectable={false}
    >
      <Background color="#1e293b" gap={26} size={1} />
      <Controls position="bottom-left" showInteractive={false} style={{ opacity: 0.85 }} />
      {showMinimap && (
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(7, 11, 24, 0.7)"
          nodeColor={(n) => CATEGORY_COLORS[n.data?.concept?.category] || '#38bdf8'}
          style={{ background: 'rgba(7,11,24,0.9)' }}
        />
      )}
    </ReactFlow>
  );
}

export function MiniMapPreview({ map }) {
  return (
    <div className="card" style={{ height: 480, overflow: 'hidden', position: 'relative' }}>
      <KnowledgeGraph map={map} fitView height="100%" showMinimap />
      <div style={{
        position: 'absolute', top: 18, left: 22, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 10,
        background: 'rgba(12,18,38,0.85)', border: '1px solid var(--border)',
        backdropFilter: 'blur(8px)', fontSize: 13, fontWeight: 600
      }}>
        <Network size={14} color="var(--primary-soft)" /> {map.title} · {map.concepts.length} concepts
      </div>
    </div>
  );
}