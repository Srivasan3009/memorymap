import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildDemoMap } from '../data/demoData';
import { ai } from '../services/aiService';
import { QUIZ_TYPES as T } from '../utils/types';
import { PageLoader, Spinner } from '../components/ui';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
  const { mapId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getMap, toast } = useApp();

  const isDemo = mapId === 'demo-electrostatics';
  const focusConceptId = searchParams.get('concept');

  const map = useMemo(() => {
    const stored = getMap(mapId);
    if (stored) return stored;
    if (isDemo) return buildDemoMap();
    return null;
  }, [mapId, isDemo]);

  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [shortAnswer, setShortAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (!map) { setLoading(false); return; }
    setLoading(true);
    const conceptIds = focusConceptId ? [focusConceptId] : map.concepts.slice(0, 6).map((c) => c.id);
    ai.generateQuiz({ map, conceptIds, count: focusConceptId ? 3 : 5 })
      .then((qs) => setQuestions(qs))
      .catch(() => setError('Could not generate a quiz right now. Please try again.'))
      .finally(() => setLoading(false));
  }, [mapId, focusConceptId]);

  const current = questions?.[index];
  const isLast = index === questions?.length - 1;

  const submitAnswer = async (value) => {
    if (revealed) return;
    setEvaluating(true);
    try {
      const result = await ai.evaluateAnswer({ question: current, answer: value });
      setAnswers((prev) => [...prev, { questionId: current.id, conceptId: current.conceptId, correct: result.correct }]);
      setSelected(value);
      setRevealed(true);
    } catch {
      toast('Could not evaluate answer.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const handleShortAnswer = async () => {
    if (!shortAnswer.trim() || revealed) return;
    await submitAnswer(shortAnswer.trim());
  };

  const next = () => {
    setSelected(null);
    setRevealed(false);
    setShortAnswer('');
    setIndex((i) => i + 1);
  };

  const finish = () => {
    const score = answers.filter((a) => a.correct).length;
    navigate(`/map/${map.id}/quiz-result`, {
      state: {
        quizId: `quiz-${Date.now()}`,
        mapId: map.id,
        mapTitle: map.title,
        score,
        total: answers.length,
        answers
      }
    });
  };

  if (loading) return <PageLoader label="Generating your quiz…" />;

  if (!map || !questions) {
    return (
      <div className="empty-state" style={{ minHeight: '70vh' }}>
        <div className="empty-state-icon"><GraduationCap size={30} /></div>
        <h2>{error || 'Quiz unavailable'}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Something went wrong generating this quiz.</p>
        <Link to={map ? `/map/${map.id}` : '/'} className="btn btn-primary">Back to map</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="km-toolbar">
        <Link to={`/map/${map.id}`} className="btn btn-sm btn-ghost"><ArrowLeft size={16} /> Map</Link>
        <div className="title">
          <GraduationCap size={17} color="var(--primary-soft)" /> Quiz · {map.title}
        </div>
        <span className="badge">Question {index + 1} of {questions.length}</span>
      </div>

      <div className="quiz-wrap">
        <div className="quiz-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--surface-strong)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', minWidth: 60, textAlign: 'right' }}>
              {Math.round(((index + (revealed ? 1 : 0)) / questions.length) * 100)}%
            </span>
          </div>

          <div className="card" style={{ padding: 30 }} key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="badge"><Sparkles size={12} /> {current.conceptName}</span>
              <span className="badge">{current.type === T.MULTIPLE_CHOICE ? 'Multiple choice' : current.type === T.TRUE_FALSE ? 'True / False' : 'Short answer'}</span>
            </div>

            <h2 style={{ fontSize: 19, lineHeight: 1.5, marginBottom: 24 }}>{current.question}</h2>

            {current.type !== T.SHORT_ANSWER ? (
              <div>
                {current.options.map((opt, i) => {
                  let cls = 'quiz-option';
                  if (revealed) {
                    if (i === current.correctAnswer) cls += ' correct';
                    else if (selected === i) cls += ' incorrect';
                  }
                  return (
                    <button
                      key={i}
                      className={cls}
                      disabled={revealed}
                      onClick={() => submitAnswer(i)}
                    >
                      <span className="quiz-option-letter">{LETTERS[i]}</span>
                      {opt}
                      {revealed && i === current.correctAnswer && <CheckCircle2 size={16} color="var(--success)" style={{ marginLeft: 'auto' }} />}
                      {revealed && selected === i && i !== current.correctAnswer && <XCircle size={16} color="var(--danger)" style={{ marginLeft: 'auto' }} />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <textarea
                  className="textarea"
                  placeholder="Type your answer…"
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleShortAnswer()}
                  disabled={revealed}
                />
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 12 }}
                  onClick={handleShortAnswer}
                  disabled={revealed || !shortAnswer.trim() || evaluating}
                >
                  {evaluating ? <Spinner size={15} /> : 'Submit Answer'}
                </button>
              </div>
            )}

            {revealed && current.explanation && (
              <div className="quiz-explanation" style={{ marginTop: 16 }}>
                <strong style={{ color: answers[answers.length - 1]?.correct ? 'var(--success)' : 'var(--danger)' }}>
                  {answers[answers.length - 1]?.correct ? 'Correct!' : 'Not quite.'}
                </strong>{' '}
                {current.explanation}
              </div>
            )}

            {revealed && (
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
                {isLast ? (
                  <button className="btn btn-primary btn-lg" onClick={finish} style={{ minWidth: 180 }}>
                    See Results →
                  </button>
                ) : (
                  <button className="btn btn-primary btn-lg" onClick={next} style={{ minWidth: 180 }}>
                    Next Question →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}