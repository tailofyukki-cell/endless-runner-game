import assert from 'node:assert/strict';
import { GameWorld } from '../js/game.js';

const events = [];
const world = new GameWorld('normal', (type, payload) => events.push({ type, payload }));
world.resize(800, 420);

assert.equal(world.player.x, 80, '横幅800pxでは左余白を80pxに抑える');
world.resize(320, 420);
assert.equal(world.player.x, 56, '小画面でも安全な最小左余白を維持する');
world.resize(800, 420);
assert.equal(world.player.isGrounded, true, 'プレイヤーは地面から開始する');
assert.equal(world.primaryAction(), true, '地上ではジャンプできる');
assert.equal(world.primaryAction(), false, '空中で二段ジャンプできない');

world.introRemaining = 0;
world.spawnRemaining = 0;
world.update(1 / 60);
assert.ok(world.elapsed > 0, 'ゲーム時間が進む');
assert.ok(world.obstacles.length > 0, '初期猶予後に障害物が生成される');

const playerBox = world.getPlayerHitbox();
world.pickups.push({
    id: 'coin',
    x: playerBox.x + 3,
    y: playerBox.y + 3,
    width: 20,
    height: 20,
    phase: 0,
    color: '#f6c84d',
    glow: '#ffe9a5'
});
world.update(0.001);
assert.ok(world.coinsCollected >= 1, 'コイン接触で獲得数が増える');
assert.ok(events.some((event) => event.type === 'coin'), 'コイン獲得イベントが発火する');

world.shieldActive = true;
world.obstacles.push({
    id: 'crate',
    x: playerBox.x,
    y: playerBox.y,
    width: 42,
    height: 48,
    phase: 0,
    color: '#b6763e',
    hitboxInset: 5
});
world.update(0.001);
assert.equal(world.shieldActive, false, 'シールドは接触時に消費される');
assert.equal(world.isOver, false, 'シールド接触ではゲームオーバーにならない');
assert.ok(events.some((event) => event.type === 'shield-save'), 'シールド防御イベントが発火する');

world.elapsed = 26;
world.update(0.001);
assert.ok(world.threatIndex >= 2, 'スコア進行で危険度が上昇する');

console.log('GameWorld tests passed.');
