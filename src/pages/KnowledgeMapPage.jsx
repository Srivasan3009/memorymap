import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Maximize, GraduationCap, Layers, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildDemoMap } from '../data/demoData';
import { KnowledgeGraph } from '../features/knowledge-map/KnowledgeGraph';
import { ConceptPanel } from '../features/tutor/ConceptPanel';

export default function KnowledgeMapPage() {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const { getMap, setConceptMastery, removeMap, toast, addMap } = useApp();

  const isDemo = mapId === 'demo-electrostatics';
  const [map, setMapState] = useState(() => {
    const stored = getMap(mapId);
    if (stored) return stored;
    if (isDemo) return buildDemoMap();
    return null;
  });

  const [collapsed, setCollapsed] = useState(new Set());
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [fitSignal, setFitSignal] = useState(0);

  // Persist demo map into app storage so progress carries over.
  useEffect(() => {
    if (isDemo && map) {
      addMap(map);
    }
  }, [isDemo, map, addMap]);

  // Keep the page in sync when maps change in storage (mastery updates etc).
  useEffect(() => {
    if (isDemo) return;
    const stored = getMap(mapId);
    if (stored) setMapState(stored);
  }, [mapId, getMap, isDemo]);

  const handleUpdateMastery = (conceptId, level) => {
    if (isDemo) {
      setMapState((prev) => ({
        ...prev,
        mastery: { ...(prev.mastery || {}), [conceptId]: level }
      }));
      addMap({ ...map, mastery: { ...(map.mastery || {}), [conceptId]: level } });
    } else {
      setConceptMastery(mapId, conceptId, level);
      const stored = getMap(mapId);
      if (stored) setMapState(stored);
    }
  };

  const handleExpand = (conceptId) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(conceptId)) next.delete(conceptId);
      else next.add(conceptId);
      return next;
    });
  };

  const handleNodeClick = (id) => {
    setActiveId(id);
    setPanelOpen(true);
  };

  const activeConcept = activeId ? map?.getConcept(activeId) : null;

  const searchMatches = useMemo(() => {
    if (!map || !search.trim()) return null;
    const q = search.trim().toLowerCase();
    return new Set(
      map.concepts.filter((c) => c.name.toLowerCase().includes(q)).map((c) => c.id)
    );
  }, [map, search]);

  const handleDelete = () => {
    if (isDemo) return;
    if (!window.confirm('Delete this map? This cannot be undone.')) return;
    removeMap(mapId);
    toast('Map deleted', 'success');
    navigate('/dashboard');
  };

  if (!map) {
    return (
      <div className="empty-state" style={{ minHeight: '70vh' }}>
        <div className="empty-state-icon"><Layers size={30} /></div>
        <h2>Map not found</h2>
        <p style={{ color: 'var(--text-muted)' }}>This knowledge map does not exist anymore.</p>
        <Link to="/create" className="btn btn-primary">Create a new map</Link>
      </div>
    );
  }

  return (
    <div className="km-wrap">
      <div className="km-toolbar">
        <Link to="/" className="btn btn-sm btn-ghost"><ArrowLeft size={16} /></Link>
        <div className="title">
          {map.title}
          <span className="badge">{map.subject}</span>
          <span className="badge desktop-only">{map.concepts.length} concepts</span>
        </div>

        <div className="km-search">
          <Search size={15} />
          <input
            placeholder="Search concepts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-accent btn-sm" onClick={() => navigate(`/map/${map.id}/quiz`)}>
          <GraduationCap size={15} /> Quiz
        </button>
        {!isDemo && (
          <button className="btn btn-sm" onClick={handleDelete} title="Delete map">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="km-canvas">
        <KnowledgeGraph
          map={map}
          collapsed={collapsed}
          activeId={activeId}
          onNodeClick={handleNodeClick}
          onExpand={handleExpand}
          showMinimap
          height="100%"
          fitSignal={fitSignal}
        />

        {searchMatches && (
          <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 15 }}>
            <div className="card" style={{ padding: '10px 14px', fontSize: 13 }}>
              {searchMatches.size > 0
                ? `${searchMatches.size} match${searchMatches.size > 1 ? 'es' : ''} found`
                : 'No matches'}
            </div>
          </div>
        )}

        <div className="km-legend desktop-only">
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Legend</div>
          <div className="km-legend-item"><span className="km-legend-dot" style={{ background: '#818cf8' }} /> Core Topic</div>
          <div className="km-legend-item"><span className="km-legend-dot" style={{ background: '#22d3ee' }} /> Main Concept</div>
          <div className="km-legend-item"><span className="km-legend-dot" style={{ background: '#38bdf8' }} /> Supporting</div>
          <div className="km-legend-item"><span className="km-legend-dot" style={{ background: '#a78bfa' }} /> Detail</div>
          <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0 2px', paddingTop: 6 }}>
            <div className="km-legend-item"><span className="km-legend-dot" style={{ background: '#34d399' }} /> Mastered</div>
            <div className="km-legend-item"><span className="km-legend-dot" style={{ background: '#38bdf8' }} /> Familiar</div>
            <div className="km-legend-item"><span className="km-legend-dot" style={{ background: '#f59e0b' }} /> Learning</div>
            <div className="km-legend-item"><span className="km-legend-dot" style={{ background: '#94a3b8' }} /> Unknown</div>
          </div>
        </div>

        <div className="km-controls">
          <button className="km-control" onClick={() => setFitSignal((s) => s + 1)} title="Reset view">
            <Maximize size={16} />
          </button>
        </div>
      </div>

      {panelOpen && activeConcept && (
        <ConceptPanel
          map={map}
          concept={activeConcept}
          onClose={() => { setPanelOpen(false); setActiveId(null); }}
          onUpdateMastery={handleUpdateMastery}
        />
      )}
    </div>
  );
}