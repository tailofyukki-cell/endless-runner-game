import { DAILY_CHALLENGES } from './config.js';

const STORAGE_KEY = 'endless-runner-expanded-v1';

function createDefaultData() {
    return {
        version: 1,
        bestScores: { easy: 0, normal: 0, hard: 0 },
        totalCoins: 0,
        totalRuns: 0,
        totalSeconds: 0,
        achievements: [],
        unlockedSkins: ['sky'],
        unlockedThemes: ['meadow'],
        selectedSkin: 'sky',
        selectedTheme: 'meadow',
        settings: {
            muted: false,
            volume: 0.5,
            reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
        },
        daily: null
    };
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function finiteNonNegative(value, fallback = 0) {
    return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function stringArray(value) {
    return Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string'))] : [];
}

function normalizeData(raw) {
    const defaults = createDefaultData();
    if (!isObject(raw)) return defaults;

    const bestScores = isObject(raw.bestScores) ? raw.bestScores : {};
    const settings = isObject(raw.settings) ? raw.settings : {};
    const daily = isObject(raw.daily) ? raw.daily : null;

    return {
        ...defaults,
        version: 1,
        bestScores: {
            easy: finiteNonNegative(bestScores.easy),
            normal: finiteNonNegative(bestScores.normal),
            hard: finiteNonNegative(bestScores.hard)
        },
        totalCoins: finiteNonNegative(raw.totalCoins),
        totalRuns: finiteNonNegative(raw.totalRuns),
        totalSeconds: finiteNonNegative(raw.totalSeconds),
        achievements: stringArray(raw.achievements),
        unlockedSkins: stringArray(raw.unlockedSkins).includes('sky') ? stringArray(raw.unlockedSkins) : ['sky', ...stringArray(raw.unlockedSkins)],
        unlockedThemes: stringArray(raw.unlockedThemes).includes('meadow') ? stringArray(raw.unlockedThemes) : ['meadow', ...stringArray(raw.unlockedThemes)],
        selectedSkin: typeof raw.selectedSkin === 'string' ? raw.selectedSkin : defaults.selectedSkin,
        selectedTheme: typeof raw.selectedTheme === 'string' ? raw.selectedTheme : defaults.selectedTheme,
        settings: {
            muted: Boolean(settings.muted),
            volume: Math.min(1, Math.max(0, Number.isFinite(settings.volume) ? settings.volume : defaults.settings.volume)),
            reducedMotion: Boolean(settings.reducedMotion)
        },
        daily: daily && typeof daily.dateKey === 'string' && typeof daily.id === 'string'
            ? {
                dateKey: daily.dateKey,
                id: daily.id,
                progress: finiteNonNegative(daily.progress),
                completed: Boolean(daily.completed),
                rewardClaimed: Boolean(daily.rewardClaimed)
            }
            : null
    };
}

function dateKeyFor(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function hashText(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function getDailyChallengeFor(dateKey = dateKeyFor()) {
    return DAILY_CHALLENGES[hashText(dateKey) % DAILY_CHALLENGES.length];
}

export function ensureDailyChallenge(data, dateKey = dateKeyFor()) {
    const challenge = getDailyChallengeFor(dateKey);
    if (!data.daily || data.daily.dateKey !== dateKey || data.daily.id !== challenge.id) {
        data.daily = { dateKey, id: challenge.id, progress: 0, completed: false, rewardClaimed: false };
    }
    return challenge;
}

export function loadSaveData() {
    try {
        return normalizeData(JSON.parse(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
        return createDefaultData();
    }
}

export function persistSaveData(data) {
    const normalized = normalizeData(data);
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
        // Private browsing or storage exhaustion should not stop the game.
    }
    return normalized;
}

export function recordRun(data, result) {
    const challenge = ensureDailyChallenge(data);
    const score = finiteNonNegative(result.score);
    const runCoins = finiteNonNegative(result.runCoins);
    const seconds = finiteNonNegative(result.seconds);
    const difficulty = ['easy', 'normal', 'hard'].includes(result.difficulty) ? result.difficulty : 'normal';

    data.totalRuns += 1;
    data.totalCoins += runCoins;
    data.totalSeconds += seconds;
    data.bestScores[difficulty] = Math.max(data.bestScores[difficulty], score);

    const metricValues = {
        score,
        runCoins,
        seconds
    };
    data.daily.progress = Math.max(data.daily.progress, metricValues[challenge.metric] || 0);
    data.daily.completed = data.daily.progress >= challenge.target;
    return { challenge, isNewBest: data.bestScores[difficulty] === score };
}

export function unlockAchievement(data, id) {
    if (data.achievements.includes(id)) return false;
    data.achievements.push(id);
    return true;
}

export function resetSaveData() {
    const fresh = createDefaultData();
    persistSaveData(fresh);
    return fresh;
}
