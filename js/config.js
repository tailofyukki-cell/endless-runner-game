export const DIFFICULTIES = {
    easy: {
        label: 'イージー',
        initialSpeed: 250,
        acceleration: 3.8,
        spawnGap: [860, 1160],
        startThreat: 0,
        color: '#62c9a6'
    },
    normal: {
        label: 'ノーマル',
        initialSpeed: 310,
        acceleration: 5.4,
        spawnGap: [740, 1030],
        startThreat: 0,
        color: '#f2b95d'
    },
    hard: {
        label: 'ハード',
        initialSpeed: 370,
        acceleration: 7.2,
        spawnGap: [650, 900],
        startThreat: 1,
        color: '#ef7b73'
    }
};

export const THREAT_LEVELS = [
    { score: 0, label: 'ウォームアップ', multiplier: 1, allowed: ['spike', 'crate'] },
    { score: 100, label: 'スピードアップ', multiplier: 1.1, allowed: ['spike', 'crate', 'doubleSpike'] },
    { score: 250, label: '注意ゾーン', multiplier: 1.2, allowed: ['spike', 'crate', 'doubleSpike', 'bird'] },
    { score: 450, label: '全力疾走', multiplier: 1.33, allowed: ['spike', 'crate', 'doubleSpike', 'bird', 'tallCrate'] }
];

export const OBSTACLE_TYPES = {
    spike: {
        width: 34,
        height: 38,
        minGap: 0,
        lane: 'ground',
        hitboxInset: 5,
        color: '#ef6b66'
    },
    doubleSpike: {
        width: 66,
        height: 38,
        minGap: 80,
        lane: 'ground',
        hitboxInset: 7,
        color: '#ef6b66'
    },
    crate: {
        width: 42,
        height: 48,
        minGap: 46,
        lane: 'ground',
        hitboxInset: 5,
        color: '#b6763e'
    },
    tallCrate: {
        width: 46,
        height: 68,
        minGap: 130,
        lane: 'ground',
        hitboxInset: 6,
        color: '#9b5b35'
    },
    bird: {
        width: 48,
        height: 26,
        minGap: 170,
        lane: 'air',
        hitboxInset: 6,
        color: '#5a8ee7'
    }
};

export const PICKUP_TYPES = {
    coin: {
        width: 20,
        height: 20,
        color: '#f6c84d',
        glow: '#ffe9a5'
    },
    shield: {
        width: 28,
        height: 32,
        color: '#65d9ff',
        glow: '#c6f5ff',
        duration: 0
    },
    slow: {
        width: 28,
        height: 28,
        color: '#b48aff',
        glow: '#e3d8ff',
        duration: 5
    }
};

export const GAME_CONSTANTS = {
    canvasHeight: 420,
    groundHeight: 74,
    playerX: 125,
    playerWidth: 28,
    playerHeight: 50,
    gravity: 1900,
    jumpVelocity: -710,
    introDelay: 1.5,
    maxDeltaTime: 0.034,
    scorePerSecond: 10,
    coinChance: 0.52,
    powerUpChance: 0.105,
    minimumEntitySpacing: 130
};

export const SKINS = [
    { id: 'sky', name: 'スカイ', jacket: '#26a9b6', shoe: '#f4ae45', unlock: '最初から利用可能' },
    { id: 'coral', name: 'コーラル', jacket: '#ec7668', shoe: '#f6d27a', unlock: '累計コイン15枚', coinCost: 15 },
    { id: 'midnight', name: 'ミッドナイト', jacket: '#4c5ea8', shoe: '#9ed9f5', unlock: '累計コイン45枚', coinCost: 45 },
    { id: 'comet', name: 'コメット', jacket: '#875fd8', shoe: '#f4d56b', unlock: 'ハードでスコア100', hardScore: 100 }
];

export const THEMES = [
    {
        id: 'meadow',
        name: 'メドウ',
        unlock: '最初から利用可能',
        skyTop: '#5bc7f3', skyBottom: '#d6f2ff', nightTop: '#17264f', nightBottom: '#344c80',
        mountain: '#366ca9', mountainDark: '#254d7c', forest: '#195e50', grass: '#69a944', grassDark: '#427f35', dirt: '#8d5d3a', stone: '#603828'
    },
    {
        id: 'sunset',
        name: 'サンセット',
        unlock: '累計コイン20枚',
        coinCost: 20,
        skyTop: '#ef9671', skyBottom: '#ffe0a5', nightTop: '#462356', nightBottom: '#744165',
        mountain: '#9d5d85', mountainDark: '#633959', forest: '#4f5b54', grass: '#9e8743', grassDark: '#70602f', dirt: '#875041', stone: '#5d3536'
    },
    {
        id: 'aurora',
        name: 'オーロラ',
        unlock: 'ハードでスコア100',
        hardScore: 100,
        skyTop: '#2d4c8e', skyBottom: '#93e1dd', nightTop: '#152d56', nightBottom: '#286d73',
        mountain: '#4471a2', mountainDark: '#294d76', forest: '#17666a', grass: '#53ad83', grassDark: '#28765c', dirt: '#5c596b', stone: '#3c3a54'
    }
];

export const ACHIEVEMENTS = [
    { id: 'first-run', title: '初めの一歩', description: '1回プレイする', reward: 3 },
    { id: 'coin-collector', title: '収集家', description: '累計コイン25枚', reward: 8 },
    { id: 'shield-save', title: '守護者', description: 'シールドで接触を防ぐ', reward: 6 },
    { id: 'score-250', title: '風を切る者', description: 'スコア250に到達', reward: 10 },
    { id: 'hard-100', title: '挑戦者', description: 'ハードでスコア100', reward: 12 },
    { id: 'daily-complete', title: 'デイリー達成', description: '日替わりチャレンジを達成', reward: 10 }
];

export const DAILY_CHALLENGES = [
    { id: 'score-80', label: 'スコア80に到達', target: 80, metric: 'score' },
    { id: 'coins-6', label: '1回でコイン6枚集める', target: 6, metric: 'runCoins' },
    { id: 'survive-40', label: '40秒走り抜ける', target: 40, metric: 'seconds' },
    { id: 'score-150', label: 'スコア150に到達', target: 150, metric: 'score' }
];
