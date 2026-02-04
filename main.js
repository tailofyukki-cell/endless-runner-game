// ========================================
// Game State & Configuration
// ========================================
const gameState = {
    currentScreen: 'title', // 'title', 'game', 'gameOver'
    difficulty: 'normal',
    score: 0,
    isPlaying: false,
    gameSpeed: 5,
    gameSpeedIncrement: 0,
    obstacleSpawnRate: 0,
    frameCount: 0
};

const difficultySettings = {
    easy: {
        initialSpeed: 4,
        speedIncrement: 0.001,
        obstacleSpawnRate: 0.008,
        label: 'イージー'
    },
    normal: {
        initialSpeed: 6,
        speedIncrement: 0.002,
        obstacleSpawnRate: 0.012,
        label: 'ノーマル'
    },
    hard: {
        initialSpeed: 8,
        speedIncrement: 0.003,
        obstacleSpawnRate: 0.018,
        label: 'ハード'
    }
};

// ========================================
// Canvas Setup
// ========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const maxWidth = 800;
    const maxHeight = 400;
    const width = Math.min(window.innerWidth - 40, maxWidth);
    const height = maxHeight;
    
    canvas.width = width;
    canvas.height = height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========================================
// Player (Stick Figure)
// ========================================
const player = {
    x: 100,
    y: 0,
    width: 20,
    height: 40,
    velocityY: 0,
    gravity: 0.6,
    jumpPower: -12,
    isJumping: false,
    
    get groundY() {
        return canvas.height - 60 - this.height;
    },
    
    reset() {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isJumping = false;
    },
    
    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
        }
    },
    
    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        // Ground collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isJumping = false;
        }
    },
    
    draw() {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        const centerX = this.x + this.width / 2;
        const headY = this.y + 8;
        const bodyTopY = this.y + 15;
        const bodyBottomY = this.y + 25;
        const legY = this.y + this.height;
        
        // Head
        ctx.beginPath();
        ctx.arc(centerX, headY, 6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(centerX, bodyTopY);
        ctx.lineTo(centerX, bodyBottomY);
        ctx.stroke();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(centerX - 8, bodyTopY + 3);
        ctx.lineTo(centerX, bodyTopY + 3);
        ctx.lineTo(centerX + 8, bodyTopY + 3);
        ctx.stroke();
        
        // Legs (animated running)
        const legOffset = Math.sin(gameState.frameCount * 0.2) * 5;
        ctx.beginPath();
        ctx.moveTo(centerX, bodyBottomY);
        ctx.lineTo(centerX - 5 + legOffset, legY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, bodyBottomY);
        ctx.lineTo(centerX + 5 - legOffset, legY);
        ctx.stroke();
    }
};

// ========================================
// Obstacles
// ========================================
const obstacles = [];

class Obstacle {
    constructor() {
        this.width = 30;
        this.height = 40;
        this.x = canvas.width;
        this.y = canvas.height - 60 - this.height;
        this.speed = gameState.gameSpeed;
    }
    
    update() {
        this.x -= gameState.gameSpeed;
    }
    
    draw() {
        // Draw spike obstacle
        ctx.fillStyle = '#8B0000';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Triangle spike
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    collidesWith(player) {
        return (
            player.x < this.x + this.width - 5 &&
            player.x + player.width > this.x + 5 &&
            player.y + player.height > this.y + 5
        );
    }
}

// ========================================
// Game Functions
// ========================================
function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.currentScreen = 'game';
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.frameCount = 0;
    
    const settings = difficultySettings[difficulty];
    gameState.gameSpeed = settings.initialSpeed;
    gameState.gameSpeedIncrement = settings.speedIncrement;
    gameState.obstacleSpawnRate = settings.obstacleSpawnRate;
    
    obstacles.length = 0;
    player.reset();
    
    // Give player some time before first obstacle
    gameState.frameCount = -200;
    
    // Update UI
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('currentDifficulty').textContent = settings.label;
    
    gameLoop();
}

function gameOver() {
    gameState.isPlaying = false;
    gameState.currentScreen = 'gameOver';
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = gameState.score;
}

function backToTitle() {
    gameState.currentScreen = 'title';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('titleScreen').style.display = 'block';
}

function drawBackground() {
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, player.groundY + player.height, canvas.width, canvas.height);
    
    // Ground line
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, player.groundY + player.height);
    ctx.lineTo(canvas.width, player.groundY + player.height);
    ctx.stroke();
}

function spawnObstacle() {
    // Only spawn obstacles after initial delay
    if (gameState.frameCount > 0 && Math.random() < gameState.obstacleSpawnRate) {
        obstacles.push(new Obstacle());
    }
}

function updateGame() {
    gameState.frameCount++;
    gameState.score = Math.max(0, Math.floor(gameState.frameCount / 10));
    gameState.gameSpeed += gameState.gameSpeedIncrement;
    
    // Update player
    player.update();
    
    // Spawn obstacles
    spawnObstacle();
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        
        // Check collision
        if (obstacles[i].collidesWith(player)) {
            gameOver();
            return;
        }
        
        // Remove off-screen obstacles
        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }
    
    // Update score display
    document.getElementById('score').textContent = gameState.score;
}

function drawGame() {
    drawBackground();
    
    // Draw obstacles
    obstacles.forEach(obstacle => obstacle.draw());
    
    // Draw player
    player.draw();
}

function gameLoop() {
    if (!gameState.isPlaying) return;
    
    updateGame();
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

// ========================================
// Input Handling
// ========================================
function handleJump() {
    if (gameState.isPlaying) {
        player.jump();
    }
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleJump();
    }
});

// Mouse/Touch input on canvas
canvas.addEventListener('click', handleJump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
});

// ========================================
// UI Event Listeners
// ========================================
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.getAttribute('data-difficulty');
        startGame(difficulty);
    });
});

document.getElementById('retryBtn').addEventListener('click', () => {
    startGame(gameState.difficulty);
});

document.getElementById('backToTitleBtn').addEventListener('click', backToTitle);

// ========================================
// Initialize
// ========================================
console.log('Endless Runner Game loaded successfully!');
