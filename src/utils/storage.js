const PREFIX = 'memorymap:';

export const KEYS = {
  maps: 'maps',
  quizHistory: 'quizHistory',
  activity: 'activity',
  user: 'user'
};

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function loadMap(id) {
  const maps = load(KEYS.maps, []);
  return maps.find((m) => m.id === id) || null;
}

export function saveMap(map) {
  const maps = load(KEYS.maps, []);
  const idx = maps.findIndex((m) => m.id === map.id);
  if (idx >= 0) maps[idx] = map;
  else maps.unshift(map);
  save(KEYS.maps, maps);
}

export function deleteMap(id) {
  const maps = load(KEYS.maps, []).filter((m) => m.id !== id);
  save(KEYS.maps, maps);
}

export function listMaps() {
  return load(KEYS.maps, []);
}