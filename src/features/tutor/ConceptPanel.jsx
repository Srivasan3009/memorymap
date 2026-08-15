import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Lightbulb, ListChecks, FunctionSquare, Rocket, GitBranch,
  MessageSquare, Send, Zap, GraduationCap, ChevronRight, AlertTriangle
} from 'lucide-react';
import { ai } from '../../services/aiService';
import { MASTERY_LEVELS, MASTERY_META, nextMastery } from '../../utils/mastery';
import { Spinner, useEscape } from '../../components/ui';

export function ConceptPanel({ map, concept, onClose, onUpdateMastery }) {
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ask, setAsk] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState('');
  const [mastery, setMastery] = useState(map.mastery?.[concept.id] || MASTERY_LEVELS.UNKNOWN);
  const [advancing, setAdvancing] = useState(false);

  useEscape(onClose, true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAnswer('');
    setMastery(map.mastery?.[concept.id] || MASTERY_LEVELS.UNKNOWN);
    ai.explainConcept({ map, conceptId: concept.id, studentLevel: 'beginner' })
      .then((data) => {
        if (!cancelled) setTutor(data);
      })
      .catch(() => {
        if (!cancelled) setTutor(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [map, concept.id]);

  const related = map.getRelated(concept.id);

  const handleAsk = async () => {
    const q = ask.trim();
    if (!q || asking) return;
    setAsking(true);
    setAnswer('');
    try {
      const res = await ai.askQuestion({ map, conceptId: concept.id, question: q });
      setAnswer(res.answer);
    } catch {
      setAnswer('Sorry, I could not answer that right now. Try rephrasing or asking about a specific formula or example.');
    } finally {
      setAsking(false);
      setAsk('');
    }
  };

  const handleMastery = async () => {
    setAdvancing(true);
    const next = nextMastery(mastery);
    setMastery(next);
    onUpdateMastery(concept.id, next);
    setTimeout(() => setAdvancing(false), 400);
  };

  const masteryRank = MASTERY_META[mastery].rank;

  return (
    <div className="panel-overlay" onClick={onClose}>
      <aside className="concept-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 19, marginBottom: 4 }}>{concept.name}</h2>
              <span className="badge">{concept.category}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <div className="mastery-steps" style={{ width: 90 }}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`mastery-step ${i <= masteryRank ? 'on' : ''}`} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: MASTERY_META[mastery].color, fontWeight: 600 }}>
                {MASTERY_META[mastery].label}
              </span>
            </div>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="panel-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="skeleton" style={{ height: 14 }} />
              <span className="skeleton" style={{ height: 14, width: '90%' }} />
              <span className="skeleton" style={{ height: 80 }} />
            </div>
          ) : tutor ? (
            <>
              {/* Explanation */}
              <div className="panel-section">
                <h4><Lightbulb size={13} /> Simple Explanation</h4>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{tutor.explanation}</p>
                {tutor.analogy && (
                  <div className="ask-response" style={{ marginTop: 10 }}>
                    <strong style={{ color: 'var(--text)' }}>Analogy: </strong>{tutor.analogy}
                  </div>
                )}
                {tutor.commonMistake && (
                  <div className="ask-response" style={{ marginTop: 8, borderColor: 'rgba(251,191,36,0.3)' }}>
                    <strong style={{ color: 'var(--warning)' }}><AlertTriangle size={12} style={{ verticalAlign: -2 }} /> Common mistake: </strong>{tutor.commonMistake}
                  </div>
                )}
              </div>

              {/* Key points */}
              <div className="panel-section">
                <h4><ListChecks size={13} /> Key Points</h4>
                {tutor.keyPoints.map((p, i) => (
                  <div className="key-point" key={i}>
                    <ChevronRight size={14} />
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              {/* Formula */}
              {tutor.formula && (
                <div className="panel-section">
                  <h4><FunctionSquare size={13} /> Formula</h4>
                  <div className="formula-box">{tutor.formula}</div>
                </div>
              )}

              {/* Example */}
              <div className="panel-section">
                <h4><Rocket size={13} /> Real-World Example</h4>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>{tutor.example}</p>
              </div>

              {/* Related */}
              {related.length > 0 && (
                <div className="panel-section">
                  <h4><GitBranch size={13} /> Related Concepts</h4>
                  <div className="related-pills">
                    {related.map((r) => (
                      <span className="chip" key={r.id} onClick={() => { onClose(); }} style={{ cursor: 'default' }}>
                        {r.name}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 8 }}>
                    Click nodes on the map to jump between related concepts.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Zap size={28} /></div>
              <p style={{ color: 'var(--text-muted)', maxWidth: 260 }}>AI explanation unavailable. The demo content is still shown on the map.</p>
            </div>
          )}

          {/* Ask AI */}
          <div className="panel-section">
            <h4><MessageSquare size={13} /> Ask AI</h4>
            <div className="tutor-input">
              <input
                className="input"
                placeholder={`Ask about ${concept.name}…`}
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              />
              <button className="btn btn-primary" onClick={handleAsk} disabled={asking || !ask.trim()}>
                {asking ? <Spinner size={15} /> : <Send size={15} />}
              </button>
            </div>
            {answer && (
              <div className="ask-response" style={{ marginTop: 10 }}>
                {answer}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate(`/map/${map.id}/quiz?concept=${concept.id}`)}
              style={{ width: '100%' }}
            >
              <GraduationCap size={17} /> Quiz me on this concept
            </button>
            <button
              className="btn btn-lg"
              onClick={handleMastery}
              disabled={advancing || mastery === MASTERY_LEVELS.MASTERED}
              style={{ width: '100%', background: 'var(--surface-strong)' }}
            >
              {mastery === MASTERY_LEVELS.MASTERED ? 'Mastered ✓' : `Mark as ${MASTERY_META[nextMastery(mastery)].label}`}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}