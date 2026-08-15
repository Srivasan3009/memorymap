import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Map as MapIcon, Brain, Target, Flame, BarChart3, Plus, ArrowRight,
  Layers, Clock, Trophy, AlertTriangle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { MASTERY_META, masteryRank, MASTERY_LEVELS } from '../utils/mastery';
import { timeAgo } from '../utils/dates';

export default function DashboardPage() {
  const { maps, quizHistory, activity, stats } = useApp();

  const statCards = [
    { icon: MapIcon, label: 'Maps Created', value: stats.mapsCreated, color: 'var(--primary-soft)' },
    { icon: Brain, label: 'Concepts Learned', value: stats.conceptsLearned, color: 'var(--success)' },
    { icon: Trophy, label: 'Quizzes Taken', value: stats.totalQuizzes, color: 'var(--warning)' },
    { icon: Target, label: 'Avg. Accuracy', value: `${stats.avgAccuracy}%`, color: 'var(--accent)' },
    { icon: Flame, label: 'Day Streak', value: stats.streak, color: '#fb923c' }
  ];

  const masteryDist = useMemo(() => {
    const counts = { unknown: 0, learning: 0, familiar: 0, mastered: 0 };
    maps.forEach((m) => {
      Object.values(m.mastery || {}).forEach((lv) => {
        if (counts[lv] !== undefined) counts[lv] += 1;
      });
    });
    return counts;
  }, [maps]);

  const weakList = useMemo(() => {
    const list = [];
    maps.forEach((m) => {
      Object.entries(m.mastery || {}).forEach(([cid, lv]) => {
        if (masteryRank(lv) < masteryRank(MASTERY_LEVELS.FAMILIAR)) {
          const concept = m.getConcept(cid);
          if (concept) list.push({ map: m, concept, level: lv });
        }
      });
    });
    return list.slice(0, 6);
  }, [maps]);

  return (
    <div className="landing">
      <div className="bg-scene"><div className="bg-blob blob-1" /><div className="bg-blob blob-2" /></div>
      <Navbar />

      <div className="container" style={{ padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', marginBottom: 6 }}>Learning <span className="gradient-text">Dashboard</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Your progress across every knowledge map.</p>
          </div>
          <Link to="/create" className="btn btn-primary">
            <Plus size={16} /> New Map
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 26 }}>
          {statCards.map((s, i) => (
            <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <s.icon size={20} style={{ color: s.color }} />
              <div className="value">{s.value}</div>
              <div className="label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Mastery distribution */}
        {maps.length > 0 && (
          <div className="card" style={{ padding: 24, marginBottom: 26 }}>
            <h3 style={{ fontSize: 16, marginBottom: 18 }}>Mastery Distribution</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 90, marginBottom: 10 }}>
              {Object.entries(masteryDist).map(([lv, count]) => {
                const max = Math.max(1, ...Object.values(masteryDist));
                const meta = MASTERY_META[lv];
                return (
                  <div key={lv} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{count}</div>
                    <div style={{
                      height: `${(count / max) * 100}%`,
                      minHeight: count > 0 ? 10 : 2,
                      background: meta.color,
                      borderRadius: '8px 8px 0 0',
                      opacity: count > 0 ? 1 : 0.15
                    }} />
                    <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 8 }}>{meta.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Maps + Weak concepts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, marginBottom: 26 }} className="dash-grid">
          <div>
            <h3 style={{ fontSize: 17, marginBottom: 14 }}>Your Maps</h3>
            {maps.length === 0 ? (
              <div className="card empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon"><Layers size={30} /></div>
                <h3>No knowledge maps yet</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: 300 }}>Create your first map, or open the demo to see how it all works.</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Link to="/create" className="btn btn-primary">Create a Map</Link>
                  <Link to="/map/demo-electrostatics" className="btn">Open Demo</Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {maps.map((m, i) => {
                  const learned = Object.values(m.mastery || {}).filter((lv) => masteryRank(lv) >= masteryRank(MASTERY_LEVELS.FAMILIAR)).length;
                  const pct = m.concepts.length ? Math.round((learned / m.concepts.length) * 100) : 0;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/map/${m.id}`} className="card" style={{ padding: 18, display: 'block', textDecoration: 'none', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div className="logo-mark" style={{ width: 40, height: 40 }}><MapIcon size={18} /></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 650, color: 'var(--text)', fontSize: 15 }}>{m.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{m.subject} · {m.concepts.length} concepts</div>
                          </div>
                          <ArrowRight size={16} color="var(--text-dim)" />
                        </div>
                        <div style={{ height: 6, borderRadius: 4, background: 'var(--surface-strong)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 4 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-dim)' }}>
                          <span>{learned} learned</span><span>{pct}% mastered</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: 17, marginBottom: 14 }}>Needs Review</h3>
            {weakList.length === 0 ? (
              <div className="card empty-state" style={{ padding: 30 }}>
                <div className="empty-state-icon" style={{ width: 54, height: 54 }}><AlertTriangle size={22} /></div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>No weak concepts. Quiz on your maps to discover them.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {weakList.map(({ map: m, concept, level }) => (
                  <Link key={`${m.id}-${concept.id}`} to={`/map/${m.id}`} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <span className="node-mastery-dot" style={{ background: MASTERY_META[level].color, width: 9, height: 9 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{concept.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{m.title}</div>
                    </div>
                    <span className="badge" style={{ color: MASTERY_META[level].color }}>{MASTERY_META[level].label}</span>
                  </Link>
                ))}
              </div>
            )}

            <h3 style={{ fontSize: 17, margin: '28px 0 14px' }}>Recent Activity</h3>
            {activity.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                No activity yet. Create a map to get started!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activity.slice(0, 6).map((a) => (
                  <div key={a.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <Clock size={14} color="var(--text-dim)" />
                    <span style={{ flex: 1, color: 'var(--text-muted)' }}>{a.label}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: 11.5 }}>{timeAgo(a.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quiz history */}
        {quizHistory.length > 0 && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Quiz History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quizHistory.slice(0, 8).map((q) => {
                const map = maps.find((m) => m.id === q.mapId);
                const pct = q.total ? Math.round((q.score / q.total) * 100) : 0;
                return (
                  <div key={q.id} className="result-row">
                    <Trophy size={15} color={pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'} />
                    <span style={{ fontSize: 13 }}>{map?.title || 'Map'} quiz</span>
                    <span className="badge" style={{ marginLeft: 'auto' }}>{q.score}/{q.total} · {pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 880px) { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}