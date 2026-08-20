import { THEMES } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 800;
        this.height = 420;
        this.pixelRatio = 1;
        this.shake = 0;
    }

    resize() {
        const bounds = this.canvas.getBoundingClientRect();
        const width = Math.max(320, Math.floor(bounds.width));
        const height = Math.max(260, Math.floor(bounds.width * 0.525));
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.floor(width * this.pixelRatio);
        this.canvas.height = Math.floor(height * this.pixelRatio);
        this.canvas.style.height = `${height}px`;
        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        this.width = width;
        this.height = height;
        return { width, height };
    }

    render(world, options = {}) {
        const ctx = this.ctx;
        const dayProgress = ((world.elapsed / 52) % 1 + 1) % 1;
        const isNight = dayProgress > 0.63;
        const ambient = isNight ? 0.46 : 1;
        const scroll = world.distance;
        const theme = options.theme || THEMES[0];

        ctx.save();
        if (this.shake > 0 && !options.reduceMotion) {
            const offset = this.shake * 4;
            ctx.translate((Math.random() - 0.5) * offset, (Math.random() - 0.5) * offset);
            this.shake = Math.max(0, this.shake - 0.075);
        }

        this.drawSky(ctx, isNight, dayProgress, theme);
        this.drawClouds(ctx, scroll * 0.05, ambient);
        this.drawMountains(ctx, scroll * 0.11, ambient, theme);
        this.drawForest(ctx, scroll * 0.22, ambient, world.groundY, theme);
        this.drawGround(ctx, scroll, ambient, world.groundY, theme);
        this.drawPickups(ctx, world.pickups);
        this.drawObstacles(ctx, world.obstacles);
        this.drawShield(ctx, world);
        this.drawPlayer(ctx, world, options.playerStyle || {});
        this.drawParticles(ctx, world.particles, options.reduceMotion);
        this.drawWorldStatus(ctx, world);
        ctx.restore();
    }

    drawSky(ctx, isNight, progress, theme) {
        const top = isNight ? theme.nightTop : theme.skyTop;
        const bottom = isNight ? theme.nightBottom : theme.skyBottom;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, top);
        gradient.addColorStop(1, bottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        if (isNight) {
            ctx.fillStyle = 'rgba(255, 255, 232, 0.9)';
            ctx.beginPath();
            ctx.arc(this.width * 0.82, 62, 19, 0, Math.PI * 2);
            ctx.fill();
            for (let index = 0; index < 18; index += 1) {
                const x = (index * 151) % this.width;
                const y = 18 + ((index * 59) % 160);
                ctx.globalAlpha = 0.4 + (index % 3) * 0.15;
                ctx.fillRect(x, y, 2, 2);
            }
            ctx.globalAlpha = 1;
        } else if (progress > 0.48 && progress < 0.63) {
            ctx.fillStyle = 'rgba(255, 211, 129, 0.9)';
            ctx.beginPath();
            ctx.arc(this.width * 0.82, 62, 23, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = 'rgba(255, 239, 174, 0.92)';
            ctx.beginPath();
            ctx.arc(this.width * 0.82, 62, 24, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawClouds(ctx, offset, ambient) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.68 * ambient})`;
        const cloud = (x, y, scale) => {
            ctx.beginPath();
            ctx.arc(x, y, 16 * scale, 0, Math.PI * 2);
            ctx.arc(x + 21 * scale, y - 7 * scale, 21 * scale, 0, Math.PI * 2);
            ctx.arc(x + 49 * scale, y, 17 * scale, 0, Math.PI * 2);
            ctx.fill();
        };
        for (let index = -1; index < 6; index += 1) {
            const x = ((index * 198 - offset) % (this.width + 240)) - 80;
            cloud(x, 70 + (index % 3) * 37, 0.7 + (index % 2) * 0.24);
        }
    }

    drawMountains(ctx, offset, ambient, theme) {
        const baseline = this.height - 134;
        ctx.fillStyle = this.withAlpha(theme.mountain, 0.63 * ambient);
        ctx.beginPath();
        ctx.moveTo(0, baseline);
        for (let x = -220; x <= this.width + 240; x += 155) {
            const peakX = x - (offset % 155);
            ctx.lineTo(peakX + 72, baseline - 105);
            ctx.lineTo(peakX + 155, baseline);
        }
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = this.withAlpha(theme.mountainDark, 0.78 * ambient);
        ctx.beginPath();
        ctx.moveTo(0, baseline + 12);
        for (let x = -180; x <= this.width + 210; x += 125) {
            const peakX = x - ((offset * 1.45) % 125);
            ctx.lineTo(peakX + 55, baseline - 55);
            ctx.lineTo(peakX + 125, baseline + 12);
        }
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();
    }

    drawForest(ctx, offset, ambient, groundY, theme) {
        const tree = (x, size) => {
            ctx.fillStyle = this.withAlpha(theme.forest, 0.9 * ambient);
            ctx.beginPath();
            ctx.moveTo(x, groundY - size);
            ctx.lineTo(x - size * 0.38, groundY - size * 0.16);
            ctx.lineTo(x - size * 0.18, groundY - size * 0.16);
            ctx.lineTo(x - size * 0.5, groundY);
            ctx.lineTo(x + size * 0.5, groundY);
            ctx.lineTo(x + size * 0.18, groundY - size * 0.16);
            ctx.lineTo(x + size * 0.38, groundY - size * 0.16);
            ctx.closePath();
            ctx.fill();
        };
        for (let index = -1; index < 11; index += 1) {
            const x = ((index * 89 - offset) % (this.width + 130)) - 45;
            tree(x, 52 + (index % 3) * 16);
        }
    }

    drawGround(ctx, offset, ambient, groundY, theme) {
        ctx.fillStyle = this.withAlpha(theme.grass, ambient);
        ctx.fillRect(0, groundY, this.width, 11);
        ctx.fillStyle = this.withAlpha(theme.grassDark, ambient);
        ctx.fillRect(0, groundY + 10, this.width, 5);
        ctx.fillStyle = this.withAlpha(theme.dirt, ambient);
        ctx.fillRect(0, groundY + 15, this.width, this.height - groundY - 15);
        ctx.fillStyle = this.withAlpha(theme.stone, ambient);
        for (let index = -1; index < 18; index += 1) {
            const x = ((index * 74 - offset * 0.72) % (this.width + 80)) - 20;
            const y = groundY + 31 + (index % 4) * 16;
            ctx.beginPath();
            ctx.arc(x, y, 2 + (index % 3), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawObstacles(ctx, obstacles) {
        obstacles.forEach((obstacle) => {
            ctx.save();
            if (obstacle.id === 'spike' || obstacle.id === 'doubleSpike') {
                const count = obstacle.id === 'doubleSpike' ? 2 : 1;
                const span = obstacle.width / count;
                for (let index = 0; index < count; index += 1) {
                    const x = obstacle.x + index * span;
                    ctx.fillStyle = obstacle.color;
                    ctx.strokeStyle = '#9d3b45';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x + 2, obstacle.y + obstacle.height);
                    ctx.lineTo(x + span / 2, obstacle.y + 3);
                    ctx.lineTo(x + span - 2, obstacle.y + obstacle.height);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            } else if (obstacle.id === 'bird') {
                const flap = Math.sin(obstacle.phase) * 5;
                ctx.fillStyle = '#4379d4';
                ctx.beginPath();
                ctx.ellipse(obstacle.x + 25, obstacle.y + 14, 17, 11, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#d7e8ff';
                ctx.beginPath();
                ctx.ellipse(obstacle.x + 28, obstacle.y + 17, 8, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#315aaf';
                ctx.beginPath();
                ctx.moveTo(obstacle.x + 16, obstacle.y + 14);
                ctx.quadraticCurveTo(obstacle.x + 4, obstacle.y + flap, obstacle.x + 1, obstacle.y + 19);
                ctx.quadraticCurveTo(obstacle.x + 10, obstacle.y + 21, obstacle.x + 18, obstacle.y + 18);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#f6bd4c';
                ctx.beginPath();
                ctx.moveTo(obstacle.x + 41, obstacle.y + 13);
                ctx.lineTo(obstacle.x + 49, obstacle.y + 16);
                ctx.lineTo(obstacle.x + 41, obstacle.y + 18);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = obstacle.color;
                ctx.strokeStyle = '#70402e';
                ctx.lineWidth = 3;
                this.roundRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5);
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = 'rgba(255, 230, 183, 0.62)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(obstacle.x + 7, obstacle.y + 7);
                ctx.lineTo(obstacle.x + obstacle.width - 7, obstacle.y + obstacle.height - 7);
                ctx.moveTo(obstacle.x + obstacle.width - 7, obstacle.y + 7);
                ctx.lineTo(obstacle.x + 7, obstacle.y + obstacle.height - 7);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    drawPickups(ctx, pickups) {
        pickups.forEach((pickup) => {
            const bob = Math.sin(pickup.phase) * 4;
            const centerX = pickup.x + pickup.width / 2;
            const centerY = pickup.y + pickup.height / 2 + bob;
            ctx.save();
            ctx.shadowColor = pickup.glow;
            ctx.shadowBlur = pickup.id === 'coin' ? 10 : 18;
            if (pickup.id === 'coin') {
                ctx.fillStyle = pickup.color;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#d89728';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#fff1af';
                ctx.fillRect(centerX - 2, centerY - 5, 4, 10);
            } else if (pickup.id === 'shield') {
                ctx.fillStyle = pickup.color;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - 13);
                ctx.lineTo(centerX + 11, centerY - 8);
                ctx.lineTo(centerX + 9, centerY + 9);
                ctx.lineTo(centerX, centerY + 14);
                ctx.lineTo(centerX - 9, centerY + 9);
                ctx.lineTo(centerX - 11, centerY - 8);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#e9ffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                ctx.strokeStyle = pickup.color;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(centerX + 2, centerY - 7);
                ctx.lineTo(centerX - 3, centerY + 1);
                ctx.lineTo(centerX + 3, centerY + 1);
                ctx.lineTo(centerX - 3, centerY + 9);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    drawShield(ctx, world) {
        if (!world.shieldActive) return;
        const player = world.player;
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        ctx.save();
        ctx.strokeStyle = 'rgba(129, 232, 255, 0.78)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#78e4ff';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 34 + Math.sin(world.elapsed * 8) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawPlayer(ctx, world, style) {
        const player = world.player;
        const centerX = player.x + player.width / 2;
        const headY = player.y + 9;
        const bodyTop = player.y + 20;
        const bodyBottom = player.y + 34;
        const legY = player.y + player.height;
        const runOffset = player.isGrounded ? Math.sin(player.runPhase) * 6 : 2;
        const jacket = style.jacket || '#26a9b6';
        const shoe = style.shoe || '#f4ae45';

        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1b3343';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(centerX, headY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = jacket;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(centerX, bodyTop);
        ctx.lineTo(centerX, bodyBottom);
        ctx.stroke();

        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, bodyTop + 3);
        ctx.lineTo(centerX - 10, bodyTop + 9 - runOffset * 0.25);
        ctx.moveTo(centerX, bodyTop + 3);
        ctx.lineTo(centerX + 10, bodyTop + 7 + runOffset * 0.25);
        ctx.stroke();

        ctx.strokeStyle = '#273a4d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, bodyBottom);
        ctx.lineTo(centerX - 7 - runOffset * 0.35, legY - 3);
        ctx.moveTo(centerX, bodyBottom);
        ctx.lineTo(centerX + 7 + runOffset * 0.35, legY - 3);
        ctx.stroke();

        ctx.strokeStyle = shoe;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerX - 7 - runOffset * 0.35, legY - 3);
        ctx.lineTo(centerX - 12 - runOffset * 0.35, legY - 2);
        ctx.moveTo(centerX + 7 + runOffset * 0.35, legY - 3);
        ctx.lineTo(centerX + 12 + runOffset * 0.35, legY - 2);
        ctx.stroke();
        ctx.restore();
    }

    drawParticles(ctx, particles, reduceMotion) {
        if (reduceMotion) return;
        particles.forEach((particle) => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    drawWorldStatus(ctx, world) {
        if (world.introRemaining > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(18, 38, 62, 0.52)';
            this.roundRect(ctx, this.width / 2 - 112, this.height * 0.23, 224, 42, 16);
            ctx.fill();
            ctx.fillStyle = '#f8fcff';
            ctx.font = '700 16px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('準備… ジャンプで回避！', this.width / 2, this.height * 0.23 + 27);
            ctx.restore();
        }
        if (world.slowRemaining > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(91, 62, 144, 0.75)';
            this.roundRect(ctx, this.width / 2 - 70, 14, 140, 28, 14);
            ctx.fill();
            ctx.fillStyle = '#f5efff';
            ctx.font = '700 13px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`スロー ${world.slowRemaining.toFixed(1)}秒`, this.width / 2, 33);
            ctx.restore();
        }
    }

    withAlpha(hex, alpha) {
        const normalized = hex.replace('#', '');
        const value = Number.parseInt(normalized, 16);
        const red = (value >> 16) & 255;
        const green = (value >> 8) & 255;
        const blue = value & 255;
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
    }
}
