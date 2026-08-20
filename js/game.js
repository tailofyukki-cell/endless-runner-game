import {
    DIFFICULTIES,
    GAME_CONSTANTS,
    OBSTACLE_TYPES,
    PICKUP_TYPES,
    THREAT_LEVELS
} from './config.js?v=runner-layout-20260821';

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function rectanglesOverlap(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

export class GameWorld {
    constructor(difficulty = 'normal', emit = () => {}) {
        this.difficultyId = difficulty;
        this.settings = DIFFICULTIES[difficulty];
        this.emit = emit;
        this.width = 800;
        this.height = GAME_CONSTANTS.canvasHeight;
        this.reset();
    }

    reset() {
        this.elapsed = 0;
        this.introRemaining = GAME_CONSTANTS.introDelay;
        this.score = 0;
        this.coinsCollected = 0;
        this.distance = 0;
        this.isOver = false;
        this.shieldActive = false;
        this.slowRemaining = 0;
        this.threatIndex = clamp(this.settings.startThreat, 0, THREAT_LEVELS.length - 1);
        this.lastThreatIndex = this.threatIndex;
        this.obstacles = [];
        this.pickups = [];
        this.particles = [];
        this.spawnRemaining = 1.4;
        this.lastEntityRight = 0;
        this.player = {
            x: 0,
            y: 0,
            width: GAME_CONSTANTS.playerWidth,
            height: GAME_CONSTANTS.playerHeight,
            velocityY: 0,
            isGrounded: true,
            runPhase: 0,
            jumpCount: 0
        };
        this.resize(this.width, this.height);
    }

    resize(width, height) {
        this.width = Math.max(320, width);
        this.height = Math.max(260, height);
        this.groundY = this.height - GAME_CONSTANTS.groundHeight;
        if (this.player) {
            this.player.x = clamp(
                Math.round(this.width * GAME_CONSTANTS.playerInsetRatio),
                GAME_CONSTANTS.playerInsetMin,
                GAME_CONSTANTS.playerInsetMax
            );
            if (this.player.isGrounded || this.player.y > this.groundY - this.player.height) {
                this.player.y = this.groundY - this.player.height;
            }
        }
    }

    get threat() {
        return THREAT_LEVELS[this.threatIndex];
    }

    get speed() {
        const rawSpeed = this.settings.initialSpeed + this.settings.acceleration * this.elapsed;
        const boostedSpeed = rawSpeed * this.threat.multiplier;
        return this.slowRemaining > 0 ? boostedSpeed * 0.53 : boostedSpeed;
    }

    primaryAction() {
        if (this.isOver || !this.player.isGrounded) {
            return false;
        }
        this.player.velocityY = GAME_CONSTANTS.jumpVelocity;
        this.player.isGrounded = false;
        this.player.jumpCount += 1;
        this.emit('jump', { x: this.player.x + this.player.width / 2, y: this.player.y + this.player.height });
        return true;
    }

    update(deltaTime) {
        if (this.isOver) {
            return;
        }

        const dt = Math.min(deltaTime, GAME_CONSTANTS.maxDeltaTime);
        this.elapsed += dt;
        this.distance += this.speed * dt;
        this.score = Math.floor(this.elapsed * GAME_CONSTANTS.scorePerSecond);
        this.player.runPhase += dt * (this.player.isGrounded ? 13 : 5);
        this.slowRemaining = Math.max(0, this.slowRemaining - dt);

        this.updateThreat();
        this.updatePlayer(dt);
        this.updateEntities(dt);
        this.updateParticles(dt);

        if (this.introRemaining > 0) {
            this.introRemaining = Math.max(0, this.introRemaining - dt);
            return;
        }

        this.spawnRemaining -= dt;
        if (this.spawnRemaining <= 0) {
            this.spawnSequence();
        }
    }

    updateThreat() {
        let nextIndex = this.settings.startThreat;
        for (let index = 0; index < THREAT_LEVELS.length; index += 1) {
            if (this.score >= THREAT_LEVELS[index].score) {
                nextIndex = Math.max(nextIndex, index);
            }
        }
        this.threatIndex = clamp(nextIndex, 0, THREAT_LEVELS.length - 1);
        if (this.threatIndex !== this.lastThreatIndex) {
            this.lastThreatIndex = this.threatIndex;
            this.emit('threat', { threat: this.threat, score: this.score });
        }
    }

    updatePlayer(dt) {
        const player = this.player;
        player.velocityY += GAME_CONSTANTS.gravity * dt;
        player.y += player.velocityY * dt;

        const floor = this.groundY - player.height;
        if (player.y >= floor) {
            if (!player.isGrounded && player.velocityY > 120) {
                this.emit('land', { x: player.x + player.width / 2, y: this.groundY });
            }
            player.y = floor;
            player.velocityY = 0;
            player.isGrounded = true;
        }
    }

    updateEntities(dt) {
        const movement = this.speed * dt;
        const playerHitbox = this.getPlayerHitbox();

        for (let index = this.obstacles.length - 1; index >= 0; index -= 1) {
            const obstacle = this.obstacles[index];
            obstacle.x -= movement;
            obstacle.phase += dt * 6;
            if (obstacle.x + obstacle.width < -60) {
                this.obstacles.splice(index, 1);
                continue;
            }
            if (rectanglesOverlap(playerHitbox, this.getObstacleHitbox(obstacle))) {
                if (this.shieldActive) {
                    this.shieldActive = false;
                    this.obstacles.splice(index, 1);
                    this.emitBurst(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, '#8cf4ff', 18);
                    this.emit('shield-save', { obstacle });
                    continue;
                }
                this.endGame();
                return;
            }
        }

        for (let index = this.pickups.length - 1; index >= 0; index -= 1) {
            const pickup = this.pickups[index];
            pickup.x -= movement;
            pickup.phase += dt * 5;
            if (pickup.x + pickup.width < -60) {
                this.pickups.splice(index, 1);
                continue;
            }
            if (rectanglesOverlap(playerHitbox, pickup)) {
                this.collectPickup(pickup);
                this.pickups.splice(index, 1);
            }
        }
    }

    updateParticles(dt) {
        for (let index = this.particles.length - 1; index >= 0; index -= 1) {
            const particle = this.particles[index];
            particle.life -= dt;
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
                continue;
            }
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vy += 460 * dt;
        }
    }

    spawnSequence() {
        const typeId = this.chooseObstacleType();
        const type = OBSTACLE_TYPES[typeId];
        const obstacle = this.createObstacle(typeId, type);
        this.obstacles.push(obstacle);

        const gap = randomBetween(...this.settings.spawnGap) + type.minGap;
        this.spawnRemaining = gap / Math.max(this.speed, 1);
        this.lastEntityRight = obstacle.x + obstacle.width;

        const pickupRoll = Math.random();
        if (pickupRoll < GAME_CONSTANTS.coinChance) {
            this.spawnCoinTrail(obstacle);
        } else if (pickupRoll < GAME_CONSTANTS.coinChance + GAME_CONSTANTS.powerUpChance) {
            this.spawnPowerUp(obstacle);
        }
    }

    chooseObstacleType() {
        const allowed = this.threat.allowed;
        const weighted = allowed.flatMap((typeId) => {
            const weight = typeId === 'spike' ? 4 : typeId === 'crate' ? 3 : 1;
            return Array(weight).fill(typeId);
        });
        return weighted[Math.floor(Math.random() * weighted.length)];
    }

    createObstacle(typeId, type) {
        const x = this.width + 48;
        let y = this.groundY - type.height;
        if (type.lane === 'air') {
            y = this.groundY - 145;
        }
        return {
            id: typeId,
            x,
            y,
            width: type.width,
            height: type.height,
            phase: Math.random() * Math.PI * 2,
            color: type.color,
            hitboxInset: type.hitboxInset
        };
    }

    spawnCoinTrail(obstacle) {
        const count = obstacle.id === 'bird' ? 3 : Math.random() < 0.36 ? 3 : 2;
        const startX = obstacle.x + obstacle.width + 48;
        const baseY = obstacle.id === 'bird'
            ? this.groundY - 92
            : this.groundY - 105;
        for (let index = 0; index < count; index += 1) {
            this.pickups.push(this.createPickup('coin', startX + index * 31, baseY - Math.sin(index * 0.85) * 22));
        }
    }

    spawnPowerUp(obstacle) {
        const id = Math.random() < 0.56 ? 'shield' : 'slow';
        const x = obstacle.x + obstacle.width + 98;
        const y = this.groundY - 110;
        this.pickups.push(this.createPickup(id, x, y));
    }

    createPickup(id, x, y) {
        const type = PICKUP_TYPES[id];
        return {
            id,
            x,
            y,
            width: type.width,
            height: type.height,
            phase: Math.random() * Math.PI * 2,
            color: type.color,
            glow: type.glow
        };
    }

    collectPickup(pickup) {
        const centerX = pickup.x + pickup.width / 2;
        const centerY = pickup.y + pickup.height / 2;
        if (pickup.id === 'coin') {
            this.coinsCollected += 1;
            this.emitBurst(centerX, centerY, pickup.color, 8);
            this.emit('coin', { total: this.coinsCollected, x: centerX, y: centerY });
            return;
        }
        if (pickup.id === 'shield') {
            this.shieldActive = true;
            this.emitBurst(centerX, centerY, pickup.color, 14);
            this.emit('shield', { x: centerX, y: centerY });
            return;
        }
        this.slowRemaining = PICKUP_TYPES.slow.duration;
        this.emitBurst(centerX, centerY, pickup.color, 14);
        this.emit('slow', { duration: this.slowRemaining, x: centerX, y: centerY });
    }

    endGame() {
        this.isOver = true;
        this.emitBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ef6b66', 22);
        this.emit('game-over', {
            score: this.score,
            runCoins: this.coinsCollected,
            seconds: this.elapsed,
            difficulty: this.difficultyId
        });
    }

    getPlayerHitbox() {
        const player = this.player;
        return {
            x: player.x + 5,
            y: player.y + 7,
            width: player.width - 10,
            height: player.height - 7
        };
    }

    getObstacleHitbox(obstacle) {
        const inset = obstacle.hitboxInset;
        return {
            x: obstacle.x + inset,
            y: obstacle.y + inset,
            width: obstacle.width - inset * 2,
            height: obstacle.height - inset
        };
    }

    emitBurst(x, y, color, amount) {
        for (let index = 0; index < amount; index += 1) {
            const life = randomBetween(0.28, 0.62);
            this.particles.push({
                x,
                y,
                vx: randomBetween(-145, 145),
                vy: randomBetween(-215, -40),
                size: randomBetween(2, 5),
                life,
                maxLife: life,
                color
            });
        }
    }
}
