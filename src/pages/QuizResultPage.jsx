import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ArrowLeft, BookOpen,
  RefreshCcw, Target, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildDemoMap } from '../data/demoData';
import { ai } from '../services/aiService';
import { MASTERY_LEVELS } from '../utils/mastery';
import { Spinner } from '../components/ui';

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getMap, recordQuiz, toast } = useApp();
  const state = location.state;

  const [studyPlan, setStudyPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const recordedRef = useRef(false);

  const map = useMemo(() => {
    if (!state) return null;
    const stored = getMap(state.mapId);
    if (stored) return stored;
    if (state.mapId === 'demo-electrostatics') return buildDemoMap();
    return null;
  }, [state]);

  // Record quiz once on mount.
  useEffect(() => {
    if (!state || recordedRef.current) return;
    recordedRef.current = true;
    const { mapId, score, total, answers, quizId } = state;
    const conceptResults = answers.map((a) => ({ conceptId: a.conceptId, correct: a.correct }));
    recordQuiz({ mapId, conceptResults, score, total, quizId });
  }, [state]);

  if (!state) {
    return (
      <div className="empty-state" style={{ minHeight: '70vh' }}>
        <h2>No results to show</h2>
        <Link to="/" className="btn btn-primary">Back home</Link>
      </div>
    );
  }

  const { score, total, answers, mapTitle, mapId } = state;
  const percent = total ? Math.round((score / total) * 100) : 0;

  // Group by concept to find weak areas.
  const byConcept = useMemo(() => {
    const g = {};
    answers.forEach((a) => {
      if (!g[a.conceptId]) g[a.conceptId] = { conceptId: a.conceptId, correct: 0, total: 0 };
      g[a.conceptId].total += 1;
      if (a.correct) g[a.conceptId].correct += 1;
    });
    const conceptNames = {};
    map?.concepts.forEach((c) => { conceptNames[c.id] = c.name; });
    return Object.values(g).map((x) => ({
      ...x,
      name: conceptNames[x.conceptId] || x.conceptId,
      strong: x.correct === x.total,
      weak: x.correct < x.total
    }));
  }, [answers, map]);

  const weakConcepts = byConcept.filter((c) => c.weak);
  const strongConcepts = byConcept.filter((c) => c.strong);

  const generateStudyPlan = async () => {
    if (!map) return;
    setPlanLoading(true);
    try {
      const weakIds = weakConcepts.map((c) => map.getConcept(c.conceptId)).filter(Boolean);
      const plan = await ai.generateStudyPlan({ map, weakConcepts: weakIds });
      setStudyPlan(plan);
    } catch {
      toast('Could not generate a study plan right now.', 'error');
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="km-toolbar">
        <Link to={`/map/${mapId}`} className="btn btn-sm btn-ghost"><ArrowLeft size={16} /> Map</Link>
        <div className="title">Quiz Results</div>
      </div>

      <div className="quiz-wrap">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: 720 }}>
          {/* Score hero */}
          <div className="card" style={{ padding: 40, textAlign: 'center', marginBottom: 22 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%', margin: '0 auto 18px',
              display: 'grid', placeItems: 'center',
              background: `conic-gradient(var(--success) ${percent}%, var(--surface-strong) ${percent}%)`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', inset: 10, borderRadius: '50%',
                background: 'var(--bg-soft)', display: 'grid', placeItems: 'center'
              }}>
                <span style={{ fontSize: 26, fontWeight: 800 }}>{score}/{total}</span>
              </div>
            </div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>
              {percent >= 80 ? 'Excellent work! 🎉' : percent >= 50 ? 'Good effort — keep going!' : 'Review time — you\u2019ve got this!'}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 22, color: 'var(--text-muted)', fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={15} /> {percent}% accuracy</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={15} /> {mapTitle}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--success)', marginBottom: 12, display: 'flex', gap: 7, alignItems: 'center' }}>
                <CheckCircle2 size={14} /> Strong
              </h4>
              {strongConcepts.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No strong concepts yet — quiz more!</p>}
              {strongConcepts.map((c) => (
                <div key={c.conceptId} className="result-row good" style={{ marginBottom: 8 }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span style={{ fontSize: 13.5 }}>{c.name}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--warning)', marginBottom: 12, display: 'flex', gap: 7, alignItems: 'center' }}>
                <AlertTriangle size={14} /> Needs Review
              </h4>
              {weakConcepts.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Nothing flagged — you nailed it!</p>}
              {weakConcepts.map((c) => (
                <div key={c.conceptId} className="result-row bad" style={{ marginBottom: 8 }}>
                  <AlertTriangle size={16} color="var(--warning)" />
                  <span style={{ fontSize: 13.5 }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Study plan */}
          {weakConcepts.length > 0 && (
            <div className="card" style={{ padding: 24, marginBottom: 22 }}>
              <h3 style={{ fontSize: 17, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 9 }}>
                <Target size={18} color="var(--primary-soft)" /> Recommended Review Plan
              </h3>
              {!studyPlan && !planLoading && (
                <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 14 }}>
                  Turn your weak concepts into a focused study session.
                </p>
              )}
              {planLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 14, padding: '10px 0' }}>
                  <Spinner /> Building your study plan…
                </div>
              ) : !studyPlan ? (
                <button className="btn btn-primary" onClick={generateStudyPlan}>
                  <RefreshCcw size={15} /> Generate Study Plan
                </button>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'var(--text-dim)', fontSize: 13 }}>
                    <Clock size={14} /> ~{studyPlan.totalMinutes} minutes total
                  </div>
                  {studyPlan.plan.map((step, i) => (
                    <div key={i} className="result-row" style={{ marginBottom: 10, alignItems: 'flex-start' }}>
                      <span className="badge" style={{ minWidth: 62, justifyContent: 'center' }}>{step.duration}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{step.title}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{step.description}</div>
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize: 12.5, color: 'var(--accent)', marginTop: 12 }}>💡 {studyPlan.tip}</p>
                </div>
              )}
            </div>
          )}

          {/* Answer breakdown */}
          <div className="card" style={{ padding: 24, marginBottom: 26 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Answer Breakdown</h3>
            {answers.map((a, i) => (
              <div key={i} className="result-row" style={{ marginBottom: 8 }}>
                {a.correct ? <CheckCircle2 size={16} color="var(--success)" /> : <XCircle size={16} color="var(--danger)" />}
                <span style={{ fontSize: 13 }}>Q{i + 1} · {map?.getConcept(a.conceptId)?.name || a.conceptId}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: a.correct ? 'var(--success)' : 'var(--danger)' }}>
                  {a.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/map/${mapId}`} className="btn btn-primary btn-lg">
              <ArrowRight size={17} /> Back to Knowledge Map
            </Link>
            <Link to={`/map/${mapId}/quiz`} className="btn btn-lg">
              <RefreshCcw size={17} /> Retake Quiz
            </Link>
            <Link to="/dashboard" className="btn btn-ghost btn-lg">
              <Trophy size={17} /> View Progress
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}