import { ACHIEVEMENTS, DIFFICULTIES, SKINS, THEMES } from './js/config.js?v=runner-layout-20260821';
import { GameWorld } from './js/game.js?v=runner-layout-20260821';
import { Renderer } from './js/renderer.js';
import { AudioManager } from './js/audio.js';
import {
    ensureDailyChallenge,
    loadSaveData,
    persistSaveData,
    recordRun,
    unlockAchievement,
    resetSaveData
} from './js/storage.js';

const elements = {
    title: document.getElementById('titleScreen'),
    game: document.getElementById('gameScreen'),
    gameOver: document.getElementById('gameOverScreen'),
    canvas: document.getElementById('gameCanvas'),
    score: document.getElementById('score'),
    runCoins: document.getElementById('runCoins'),
    currentDifficulty: document.getElementById('currentDifficulty'),
    threatLabel: document.getElementById('threatLabel'),
    finalScore: document.getElementById('finalScore'),
    runSummary: document.getElementById('runSummary'),
    retry: document.getElementById('retryBtn'),
    backToTitle: document.getElementById('backToTitleBtn'),
    pause: document.getElementById('pauseBtn'),
    toast: document.getElementById('toast'),
    bestScores: document.getElementById('bestScores'),
    totalCoins: document.getElementById('totalCoins'),
    totalRuns: document.getElementById('totalRuns'),
    achievementCount: document.getElementById('achievementCount'),
    dailyTitle: document.getElementById('dailyTitle'),
    dailyProgress: document.getElementById('dailyProgress'),
    skinOptions: document.getElementById('skinOptions'),
    themeOptions: document.getElementById('themeOptions'),
    pauseOverlay: document.getElementById('pauseOverlay'),
    pauseMessage: document.getElementById('pauseMessage'),
    resume: document.getElementById('resumeBtn'),
    pauseToTitle: document.getElementById('pauseToTitleBtn'),
    settingsButton: document.getElementById('settingsBtn'),
    settingsDialog: document.getElementById('settingsDialog'),
    closeSettings: document.getElementById('closeSettingsBtn'),
    muteToggle: document.getElementById('muteToggle'),
    volumeControl: document.getElementById('volumeControl'),
    reducedMotionToggle: document.getElementById('reducedMotionToggle'),
    resetSave: document.getElementById('resetSaveBtn')
};

const renderer = new Renderer(elements.canvas);
const app = {
    state: 'title',
    difficulty: 'normal',
    world: null,
    frameId: 0,
    lastTimestamp: 0,
    toastTimeout: 0,
    countdownTimer: 0,
    saveData: loadSaveData(),
    dailyChallenge: null
};

app.dailyChallenge = ensureDailyChallenge(app.saveData);
syncCosmetics();
persistSaveData(app.saveData);
const audio = new AudioManager(app.saveData.settings);

function isUnlocked(item) {
    const coinsSatisfied = !item.coinCost || app.saveData.totalCoins >= item.coinCost;
    const hardScoreSatisfied = !item.hardScore || app.saveData.bestScores.hard >= item.hardScore;
    return coinsSatisfied && hardScoreSatisfied;
}

function syncCosmetics() {
    SKINS.filter(isUnlocked).forEach((skin) => {
        if (!app.saveData.unlockedSkins.includes(skin.id)) app.saveData.unlockedSkins.push(skin.id);
    });
    THEMES.filter(isUnlocked).forEach((theme) => {
        if (!app.saveData.unlockedThemes.includes(theme.id)) app.saveData.unlockedThemes.push(theme.id);
    });
    if (!app.saveData.unlockedSkins.includes(app.saveData.selectedSkin)) app.saveData.selectedSkin = 'sky';
    if (!app.saveData.unlockedThemes.includes(app.saveData.selectedTheme)) app.saveData.selectedTheme = 'meadow';
}

function currentSkin() {
    return SKINS.find((skin) => skin.id === app.saveData.selectedSkin) || SKINS[0];
}

function currentTheme() {
    return THEMES.find((theme) => theme.id === app.saveData.selectedTheme) || THEMES[0];
}

function showScreen(state) {
    app.state = state;
    elements.title.hidden = state !== 'title';
    elements.game.hidden = state !== 'playing' && state !== 'paused' && state !== 'countdown';
    elements.gameOver.hidden = state !== 'game-over';
    elements.pauseOverlay.hidden = state !== 'paused' && state !== 'countdown';
    if (state === 'title') updateProgressPanel();
}

function showToast(message) {
    window.clearTimeout(app.toastTimeout);
    elements.toast.textContent = message;
    elements.toast.classList.add('visible');
    app.toastTimeout = window.setTimeout(() => elements.toast.classList.remove('visible'), 2400);
}

function saveProgress() {
    app.dailyChallenge = ensureDailyChallenge(app.saveData);
    syncCosmetics();
    app.saveData = persistSaveData(app.saveData);
    audio.setSettings(app.saveData.settings);
    updateProgressPanel();
}

function updateProgressPanel() {
    app.dailyChallenge = ensureDailyChallenge(app.saveData);
    const scores = [
        ['イージー', app.saveData.bestScores.easy, 'easy'],
        ['ノーマル', app.saveData.bestScores.normal, 'normal'],
        ['ハード', app.saveData.bestScores.hard, 'hard']
    ];
    elements.bestScores.innerHTML = scores.map(([label, score, className]) => (
        `<div class="score-badge ${className}"><span>${label}</span><strong>${score}</strong></div>`
    )).join('');
    elements.totalCoins.textContent = String(app.saveData.totalCoins);
    elements.totalRuns.textContent = String(app.saveData.totalRuns);
    elements.achievementCount.textContent = `実績 ${app.saveData.achievements.length}/${ACHIEVEMENTS.length}`;
    const daily = app.saveData.daily;
    elements.dailyTitle.textContent = app.dailyChallenge.label;
    const suffix = daily.completed ? '　達成！' : '';
    elements.dailyProgress.textContent = `進捗 ${Math.floor(daily.progress)} / ${app.dailyChallenge.target}${suffix}`;
    renderCosmeticOptions();
}

function renderCosmeticOptions() {
    const renderOptions = (items, unlockedIds, selectedId, kind) => items.map((item) => {
        const unlocked = unlockedIds.includes(item.id);
        const selected = item.id === selectedId;
        const swatch = kind === 'skin' ? item.jacket : item.skyTop;
        return `<button class="cosmetic-option${selected ? ' selected' : ''}" type="button" data-cosmetic-kind="${kind}" data-cosmetic-id="${item.id}" ${unlocked ? '' : 'disabled'} aria-pressed="${selected}"><span class="cosmetic-swatch" style="background:${swatch}"></span><strong>${item.name}</strong><small>${unlocked ? (selected ? '選択中' : '選択') : item.unlock}</small></button>`;
    }).join('');
    elements.skinOptions.innerHTML = renderOptions(SKINS, app.saveData.unlockedSkins, app.saveData.selectedSkin, 'skin');
    elements.themeOptions.innerHTML = renderOptions(THEMES, app.saveData.unlockedThemes, app.saveData.selectedTheme, 'theme');
}

function resizeGame() {
    if (!app.world || elements.game.hidden) return;
    const size = renderer.resize();
    app.world.resize(size.width, size.height);
    renderer.render(app.world, { reduceMotion: app.saveData.settings.reducedMotion, playerStyle: currentSkin(), theme: currentTheme() });
}

function startGame(difficulty = app.difficulty) {
    audio.unlock();
    app.difficulty = difficulty;
    showScreen('playing');
    renderer.resize();
    app.world = new GameWorld(difficulty, handleWorldEvent);
    app.world.resize(renderer.width, renderer.height);
    app.lastTimestamp = 0;
    elements.currentDifficulty.textContent = DIFFICULTIES[difficulty].label;
    elements.score.textContent = '0';
    elements.runCoins.textContent = '0';
    elements.threatLabel.textContent = app.world.threat.label;
    cancelAnimationFrame(app.frameId);
    app.frameId = requestAnimationFrame(loop);
}

function loop(timestamp) {
    if (app.state !== 'playing' || !app.world) return;
    if (!app.lastTimestamp) app.lastTimestamp = timestamp;
    const deltaTime = (timestamp - app.lastTimestamp) / 1000;
    app.lastTimestamp = timestamp;
    app.world.update(deltaTime);
    updateHud();
    renderer.render(app.world, { reduceMotion: app.saveData.settings.reducedMotion, playerStyle: currentSkin(), theme: currentTheme() });
    if (!app.world.isOver) app.frameId = requestAnimationFrame(loop);
}

function updateHud() {
    if (!app.world) return;
    elements.score.textContent = String(app.world.score);
    elements.runCoins.textContent = String(app.world.coinsCollected);
    elements.threatLabel.textContent = app.world.threat.label;
}

function achievementById(id) {
    return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

function awardAchievement(id, messages) {
    if (!unlockAchievement(app.saveData, id)) return;
    const achievement = achievementById(id);
    if (achievement) {
        app.saveData.totalCoins += achievement.reward;
        messages.push(`実績解除「${achievement.title}」：コイン +${achievement.reward}`);
    }
}

function evaluateRunAchievements(result, messages) {
    awardAchievement('first-run', messages);
    if (app.saveData.totalCoins >= 25) awardAchievement('coin-collector', messages);
    if (result.score >= 250) awardAchievement('score-250', messages);
    if (result.difficulty === 'hard' && result.score >= 100) awardAchievement('hard-100', messages);
    if (app.saveData.daily.completed) awardAchievement('daily-complete', messages);
}

function handleWorldEvent(type, payload) {
    if (type === 'jump') {
        audio.play('jump');
    } else if (type === 'land') {
        audio.play('land');
    } else if (type === 'coin') {
        audio.play('coin');
        showToast(`コイン +1　今回 ${payload.total}枚`);
    } else if (type === 'shield') {
        audio.play('shield');
        showToast('シールド獲得！ 次の接触を1回防げます');
    } else if (type === 'slow') {
        audio.play('slow');
        showToast(`スローモーション！ ${payload.duration}秒間ゆっくり進みます`);
    } else if (type === 'shield-save') {
        audio.play('shieldSave');
        renderer.shake = 1;
        const messages = [];
        awardAchievement('shield-save', messages);
        saveProgress();
        showToast(messages[0] || 'シールドが接触を防ぎました！');
    } else if (type === 'threat') {
        audio.play('threat');
        showToast(`危険度上昇：${payload.threat.label}`);
    } else if (type === 'game-over') {
        audio.play('gameOver');
        renderer.shake = 1;
        window.setTimeout(() => showGameOver(payload), 250);
    }
}

function showGameOver(result) {
    cancelAnimationFrame(app.frameId);
    const previousBest = app.saveData.bestScores[result.difficulty];
    const { challenge, isNewBest } = recordRun(app.saveData, result);
    const messages = [];
    evaluateRunAchievements(result, messages);

    if (app.saveData.daily.completed && !app.saveData.daily.rewardClaimed) {
        app.saveData.daily.rewardClaimed = true;
        app.saveData.totalCoins += 6;
        messages.push('日替わりチャレンジ達成：コイン +6');
    }

    saveProgress();
    showScreen('game-over');
    elements.finalScore.textContent = String(result.score);
    const bestText = isNewBest && result.score > previousBest ? '　自己ベスト！' : '';
    elements.runSummary.textContent = `${DIFFICULTIES[result.difficulty].label} ／ コイン ${result.runCoins}枚 ／ ${result.seconds.toFixed(1)}秒${bestText}`;
    if (messages.length) showToast(messages[0]);
    if (challenge.completed) elements.dailyProgress.textContent = `進捗 ${Math.floor(app.saveData.daily.progress)} / ${challenge.target}　達成！`;
}

function primaryAction() {
    if (app.state === 'playing' && app.world) app.world.primaryAction();
    else if (app.state === 'paused') resumeGame();
}

function pauseGame() {
    if (app.state !== 'playing') return;
    cancelAnimationFrame(app.frameId);
    showScreen('paused');
    elements.pauseMessage.textContent = '準備ができたら再開しましょう。';
    elements.resume.focus();
}

function resumeGame() {
    if (app.state !== 'paused') return;
    let remaining = 3;
    showScreen('countdown');
    elements.pauseMessage.textContent = `${remaining}…`;
    elements.resume.disabled = true;
    elements.pauseToTitle.disabled = true;
    window.clearInterval(app.countdownTimer);
    app.countdownTimer = window.setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
            elements.pauseMessage.textContent = `${remaining}…`;
            return;
        }
        window.clearInterval(app.countdownTimer);
        elements.resume.disabled = false;
        elements.pauseToTitle.disabled = false;
        showScreen('playing');
        app.lastTimestamp = 0;
        app.frameId = requestAnimationFrame(loop);
    }, 650);
}

function openSettings() {
    elements.muteToggle.checked = app.saveData.settings.muted;
    elements.volumeControl.value = String(Math.round(app.saveData.settings.volume * 100));
    elements.reducedMotionToggle.checked = app.saveData.settings.reducedMotion;
    elements.settingsDialog.hidden = false;
    elements.closeSettings.focus();
}

function closeSettings() {
    elements.settingsDialog.hidden = true;
    elements.settingsButton.focus();
}

function updateSettings() {
    app.saveData.settings.muted = elements.muteToggle.checked;
    app.saveData.settings.volume = Number(elements.volumeControl.value) / 100;
    app.saveData.settings.reducedMotion = elements.reducedMotionToggle.checked;
    saveProgress();
}

function isInteractiveTarget(target) {
    return target instanceof HTMLElement && Boolean(target.closest('button, a, input, select, textarea'));
}

document.querySelectorAll('.difficulty-btn').forEach((button) => {
    button.addEventListener('click', () => startGame(button.dataset.difficulty));
});
elements.retry.addEventListener('click', () => startGame(app.difficulty));
elements.backToTitle.addEventListener('click', () => {
    cancelAnimationFrame(app.frameId);
    window.clearInterval(app.countdownTimer);
    showScreen('title');
});
elements.pause.addEventListener('click', pauseGame);
elements.resume.addEventListener('click', resumeGame);
elements.pauseToTitle.addEventListener('click', () => {
    window.clearInterval(app.countdownTimer);
    showScreen('title');
});
elements.settingsButton.addEventListener('click', openSettings);
elements.closeSettings.addEventListener('click', closeSettings);
[elements.muteToggle, elements.volumeControl, elements.reducedMotionToggle].forEach((control) => control.addEventListener('input', updateSettings));
elements.resetSave.addEventListener('click', () => {
    if (!window.confirm('このブラウザに保存したベストスコア、コイン、実績、設定を削除します。よろしいですか？')) return;
    app.saveData = resetSaveData();
    app.dailyChallenge = ensureDailyChallenge(app.saveData);
    saveProgress();
    showToast('このブラウザの記録をリセットしました');
});
[elements.skinOptions, elements.themeOptions].forEach((container) => {
    container.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cosmetic-id]');
        if (!button || button.disabled) return;
        const id = button.dataset.cosmeticId;
        if (button.dataset.cosmeticKind === 'skin' && app.saveData.unlockedSkins.includes(id)) {
            app.saveData.selectedSkin = id;
        }
        if (button.dataset.cosmeticKind === 'theme' && app.saveData.unlockedThemes.includes(id)) {
            app.saveData.selectedTheme = id;
        }
        saveProgress();
        showToast(`${button.querySelector('strong').textContent}を選択しました`);
    });
});
elements.canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    primaryAction();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.settingsDialog.hidden) {
        closeSettings();
        return;
    }
    if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
        if (app.state === 'playing') pauseGame();
        else if (app.state === 'paused') resumeGame();
        return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && !isInteractiveTarget(event.target)) {
        event.preventDefault();
        primaryAction();
    }
});
window.addEventListener('resize', resizeGame);

showScreen('title');
