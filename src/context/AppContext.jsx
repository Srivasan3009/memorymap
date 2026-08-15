import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { KEYS, load, save } from '../utils/storage';
import { MASTERY_LEVELS, nextMastery, lowestMastery, masteryRank, MASTERY_META } from '../utils/mastery';
import { toDateKey } from '../utils/dates';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const [maps, setMaps] = useState(() => load(KEYS.maps, []));
  const [quizHistory, setQuizHistory] = useState(() => load(KEYS.quizHistory, []));
  const [activity, setActivity] = useState(() => load(KEYS.activity, []));
  const [toasts, setToasts] = useState([]);

  useEffect(() => { save(KEYS.maps, maps); }, [maps]);
  useEffect(() => { save(KEYS.quizHistory, quizHistory); }, [quizHistory]);
  useEffect(() => { save(KEYS.activity, activity); }, [activity]);

  // ── Toasts ───────────────────────────────────────────────────────────────
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  // ── Maps ─────────────────────────────────────────────────────────────────
  const addMap = useCallback((map) => {
    setMaps((prev) => {
      const existing = prev.findIndex((m) => m.id === map.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = map;
        return next;
      }
      return [map, ...prev];
    });
    return map;
  }, []);

  const updateMap = useCallback((map) => {
    setMaps((prev) => prev.map((m) => (m.id === map.id ? map : m)));
  }, []);

  const removeMap = useCallback((id) => {
    setMaps((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const getMap = useCallback((id) => maps.find((m) => m.id === id) || null, [maps]);

  // ── Mastery ──────────────────────────────────────────────────────────────
  const recordQuiz = useCallback(
    ({ mapId, conceptResults, score, total }) => {
      const entry = {
        id: `quiz-${Date.now()}`,
        mapId,
        score,
        total,
        conceptResults,
        timestamp: Date.now()
      };
      setQuizHistory((prev) => [entry, ...prev]);

      // Update mastery for each concept based on correctness.
      setMaps((prev) =>
        prev.map((map) => {
          if (map.id !== mapId) return map;
          const mastery = { ...map.mastery };
          const resultsByConcept = {};
          conceptResults.forEach((r) => {
            if (!resultsByConcept[r.conceptId]) resultsByConcept[r.conceptId] = { correct: 0, total: 0 };
            resultsByConcept[r.conceptId].total += 1;
            if (r.correct) resultsByConcept[r.conceptId].correct += 1;
          });
          Object.entries(resultsByConcept).forEach(([cid, { correct, total }]) => {
            const current = mastery[cid] || MASTERY_LEVELS.UNKNOWN;
            let target;
            if (correct === total) target = nextMastery(current);
            else if (correct === 0) target = MASTERY_LEVELS.UNKNOWN;
            else target = current;
            mastery[cid] = target;
          });
          return { ...map, mastery };
        })
      );

      // Log activity.
      setActivity((prev) => [
        {
          id: `act-${Date.now()}`,
          type: 'quiz',
          label: `Completed a quiz (${score}/${total})`,
          timestamp: Date.now()
        },
        ...prev
      ]);
      return entry;
    },
    []
  );

  const setConceptMastery = useCallback((mapId, conceptId, level) => {
    setMaps((prev) =>
      prev.map((map) => {
        if (map.id !== mapId) return map;
        return { ...map, mastery: { ...map.mastery, [conceptId]: level } };
      })
    );
  }, []);

  const recordActivity = useCallback((type, label) => {
    setActivity((prev) => [{ id: `act-${Date.now()}`, type, label, timestamp: Date.now() }, ...prev]);
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalQuizzes = quizHistory.length;
    const totalQuestions = quizHistory.reduce((s, q) => s + q.total, 0);
    const correctQuestions = quizHistory.reduce((s, q) => s + q.score, 0);
    const avgAccuracy = totalQuestions ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

    // Concepts learned = concepts at familiar or mastered across all maps.
    const conceptMasteryCounts = {};
    maps.forEach((map) => {
      Object.entries(map.mastery || {}).forEach(([cid, level]) => {
        if (masteryRank(level) >= masteryRank(MASTERY_LEVELS.FAMILIAR)) {
          conceptMasteryCounts[cid] = level;
        }
      });
    });

    // Weak concepts = unknown/learning across maps.
    const weakConceptIds = new Set();
    maps.forEach((map) => {
      Object.entries(map.mastery || {}).forEach(([cid, level]) => {
        if (masteryRank(level) < masteryRank(MASTERY_LEVELS.FAMILIAR)) weakConceptIds.add(cid);
      });
    });

    // Learning streak (consecutive days with activity).
    const streak = computeStreak(activity.map((a) => a.timestamp));

    // Subject progress.
    const bySubject = {};
    maps.forEach((map) => {
      if (!bySubject[map.subject]) bySubject[map.subject] = { learned: 0, total: map.concepts.length, quiz: 0 };
      bySubject[map.subject].total = map.concepts.length;
      Object.entries(map.mastery || {}).forEach(([, level]) => {
        if (masteryRank(level) >= masteryRank(MASTERY_LEVELS.FAMILIAR)) bySubject[map.subject].learned += 1;
      });
    });

    return {
      mapsCreated: maps.length,
      totalConcepts: maps.reduce((s, m) => s + m.concepts.length, 0),
      conceptsLearned: Object.keys(conceptMasteryCounts).length,
      totalQuizzes,
      avgAccuracy,
      weakConcepts: weakConceptIds.size,
      streak,
      bySubject
    };
  }, [maps, quizHistory, activity]);

  const value = {
    maps,
    quizHistory,
    activity,
    toasts,
    toast,
    addMap,
    updateMap,
    removeMap,
    getMap,
    recordQuiz,
    setConceptMastery,
    recordActivity,
    stats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function computeStreak(timestamps) {
  if (!timestamps.length) return 0;
  const days = new Set(timestamps.map((t) => toDateKey(new Date(t))));
  let streak = 0;
  const today = toDateKey(new Date());
  let cursor = new Date();
  if (!days.has(today)) {
    // Allow yesterday as the start of an ongoing streak.
    cursor = new Date(cursor.setDate(cursor.getDate() - 1));
    if (!days.has(toDateKey(cursor))) return 0;
  }
  while (days.has(toDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.setDate(cursor.getDate() - 1));
  }
  return streak;
}