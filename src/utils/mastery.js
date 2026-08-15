export const MASTERY_LEVELS = {
  UNKNOWN: 'unknown',
  LEARNING: 'learning',
  FAMILIAR: 'familiar',
  MASTERED: 'mastered'
};

export const MASTERY_ORDER = [
  MASTERY_LEVELS.UNKNOWN,
  MASTERY_LEVELS.LEARNING,
  MASTERY_LEVELS.FAMILIAR,
  MASTERY_LEVELS.MASTERED
];

export const MASTERY_META = {
  [MASTERY_LEVELS.UNKNOWN]: { label: 'Unknown', color: '#94a3b8', rank: 0 },
  [MASTERY_LEVELS.LEARNING]: { label: 'Learning', color: '#f59e0b', rank: 1 },
  [MASTERY_LEVELS.FAMILIAR]: { label: 'Familiar', color: '#38bdf8', rank: 2 },
  [MASTERY_LEVELS.MASTERED]: { label: 'Mastered', color: '#34d399', rank: 3 }
};

export function masteryRank(level) {
  return MASTERY_META[level]?.rank ?? 0;
}

export function nextMastery(level) {
  const rank = masteryRank(level);
  if (rank >= 3) return level;
  return MASTERY_ORDER[rank + 1];
}

export function lowestMastery(a, b) {
  return masteryRank(a) <= masteryRank(b) ? a : b;
}