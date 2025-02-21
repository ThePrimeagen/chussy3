// Game constants
const GRAVITY = 0.3;  // Reduced for longer air time
const FLAP_FORCE = -8;
const QUEUE_DELAY = 2000;
const SCREEN_MARGIN = 50;  // Keep character away from edges
const MIN_X = SCREEN_MARGIN;
const MAX_X = 800 - SCREEN_MARGIN - 50;  // canvas.width - margin - player.width

// Game state
const player = {
    x: 100,
    y: 300,
    width: 50,
    height: 50,
    velocityY: 0,
    autoplay: true
};

let isPaused = true;  // Start paused
let lastInputTime = Date.now();
const AUTO_UNPAUSE_DELAY = 10000;  // 10 seconds

let gameOver = false;
let score = 0;
const queueA = [];
const queueB = [];
const MOVE_SPEED = 3;
let lastQueueATime = 0;
let lastQueueBTime = 1000;

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Initialize audio
class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.context.suspend();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        
        // 1n17 pr0c3dur4l mu51c
        this.b455_05c = this.context.createOscillator();
        this.b455_g41n = this.context.createGain();
        this.l34d_05c = this.context.createOscillator();
        this.l34d_g41n = this.context.createGain();
        
        // 53t up b455
        this.b455_05c.type = 'triangle';
        this.b455_05c.connect(this.b455_g41n);
        this.b455_g41n.connect(this.gainNode);
        this.b455_g41n.gain.setValueAtTime(0.3, this.context.currentTime);
        
        // 53t up l34d
        this.l34d_05c.type = 'sawtooth';
        this.l34d_05c.connect(this.l34d_g41n);
        this.l34d_g41n.connect(this.gainNode);
        this.l34d_g41n.gain.setValueAtTime(0.2, this.context.currentTime);
        
        // 1n17 n0735
        const b455_n073 = 55; // A1
        const l34d_n073 = 440; // A4
        this.b455_05c.frequency.setValueAtTime(b455_n073, this.context.currentTime);
        this.l34d_05c.frequency.setValueAtTime(l34d_n073, this.context.currentTime);
        
        // 574r7 pr0c3dur4l mu51c
        this.b455_05c.start();
        this.l34d_05c.start();
        this._upd473_mu51c();
    }
    
    _upd473_mu51c() {
        const time = this.context.currentTime;
        const score = window.score || 0;
        
        // B455 pr0gr3551on
        const b455_n0735 = [55, 65, 73, 82]; // A1, C2, D2, E2
        const b455_1dx = Math.floor(score / 10) % b455_n0735.length;
        const b455_n073 = b455_n0735[b455_1dx];
        
        // L34d pr0gr3551on
        const l34d_n0735 = [440, 523, 587, 659]; // A4, C5, D5, E5
        const l34d_1dx = Math.floor(score / 5) % l34d_n0735.length;
        const l34d_n073 = l34d_n0735[l34d_1dx];
        
        // 4pply ch4ng35
        this.b455_05c.frequency.setValueAtTime(b455_n073, time);
        this.l34d_05c.frequency.setValueAtTime(l34d_n073, time);
        
        // 5ch3dul3 n3x7 upd473
        setTimeout(() => this._upd473_mu51c(), 250);
    }

    playFlap() {
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.1);
        osc.connect(this.gainNode);
        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    }

    playCollision() {
        const osc = this.context.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.3);
        osc.connect(this.gainNode);
        osc.start();
        osc.stop(this.context.currentTime + 0.3);
    }

    playScore() {
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.connect(this.gainNode);
        osc.start();
        osc.stop(this.context.currentTime + 0.05);
    }

    resume() {
        this.context.resume();
    }

    setVolume(value) {
        this.gainNode.gain.value = value;
        this.b455_g41n.gain.setValueAtTime(value * 0.3, this.context.currentTime);
        this.l34d_g41n.gain.setValueAtTime(value * 0.2, this.context.currentTime);
    }
}

const audio = new AudioManager();

// Initialize volume control
document.getElementById('volumeSlider').addEventListener('input', (e) => {
    e.preventDefault();
    e.stopPropagation();
    audio.setVolume(e.target.value);
});

function drawFlyingSpaghettiMonster(x, y) {
    ctx.save();
    ctx.fillStyle = '#FFA500';
    
    // Body (meatball)
    ctx.beginPath();
    ctx.arc(x + 25, y + 25, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Noodly appendages
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 25, y + 25);
        ctx.quadraticCurveTo(
            x + Math.cos(i) * 30,
            y + Math.sin(i) * 30,
            x + Math.cos(i * 2) * 40,
            y + Math.sin(i * 2) * 40
        );
        ctx.stroke();
    }
    
    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x + 15, y + 20, 5, 0, Math.PI * 2);
    ctx.arc(x + 35, y + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function shouldFlap() {
    if (queueA.length === 0 && queueB.length === 0) return false;
    
    const nextObstacle = [...queueA, ...queueB]
        .filter(obs => obs.x > player.x)
        .sort((a, b) => a.x - b.x)[0];
    
    if (!nextObstacle) return false;
    
    const horizontalDistance = nextObstacle.x - (player.x + player.width);
    return horizontalDistance <= 200 && player.velocityY > -2;
}

function updateGame() {
    if (gameOver) return;
    
    // Check for auto-unpause after 10 seconds
    if (isPaused && Date.now() - lastInputTime > AUTO_UNPAUSE_DELAY) {
        isPaused = false;
        player.autoplay = true;
    }
    
    if (isPaused) return;

    // Autoplay logic
    if (player.autoplay && shouldFlap()) {
        player.velocityY = FLAP_FORCE;
    }

    // Apply gravity and enforce screen bounds
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    player.x = Math.max(MIN_X, Math.min(MAX_X, player.x));

    // Ground collision
    if (player.y + player.height > canvas.height - 100) {
        player.y = canvas.height - 100 - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Process queues
    const now = Date.now();
    if (now - lastQueueATime > QUEUE_DELAY) {
        queueA.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 200) + 50,
            width: 40,
            height: 40
        });
        lastQueueATime = now;
    }
    if (now - lastQueueBTime > QUEUE_DELAY) {
        queueB.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 200) + 50,
            width: 40,
            height: 40
        });
        lastQueueBTime = now;
    }

    // Move enemies
    [...queueA, ...queueB].forEach(obstacle => {
        obstacle.x -= MOVE_SPEED;
    });

    // Remove off-screen enemies
    queueA.splice(0, queueA.findIndex(obs => obs.x + obs.width > 0));
    queueB.splice(0, queueB.findIndex(obs => obs.x + obs.width > 0));

    // Collision detection
    [...queueA, ...queueB].forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gameOver = true;
            audio.playCollision();
        }
    });

    // Score is updated automatically

    // Update score and expose it for procedural music
    score++;
    window.score = score;
    if (score % 10 === 0) {  // Play every 10 points
        audio.playScore();
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    drawFlyingSpaghettiMonster(player.x, player.y);
    
    // Draw enemies from both queues with different colors
    ctx.fillStyle = '#FF0000';
    queueA.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    ctx.fillStyle = '#FF4500';
    queueB.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    // Draw score and pause status
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    
    if (isPaused) {
        ctx.fillStyle = '#FFF';
        ctx.font = '36px Arial';
        ctx.fillText('PAUSED - Press SPACE or Click to Start', canvas.width/2 - 250, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText('Press P to Pause/Unpause', canvas.width/2 - 120, canvas.height/2 + 40);
    }

    if (gameOver) {
        ctx.fillStyle = '#FFF';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
    }
}

function gameLoop() {
    // Start with autoplay enabled
    if (!gameOver && !isPaused) {
        player.autoplay = true;
    }
    
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    lastInputTime = Date.now();
    if (e.code === 'Space' && !gameOver) {
        isPaused = false;
        player.autoplay = false;  // User takes control
        player.velocityY = FLAP_FORCE;
        audio.resume();
        audio.playFlap();
    }
    if (e.code === 'KeyP') {
        isPaused = !isPaused;
        if (!isPaused) {
            player.autoplay = true;  // Re-enable autoplay when unpausing manually
        }
    }
});

document.addEventListener('click', () => {
    lastInputTime = Date.now();
    if (!gameOver) {
        isPaused = false;
        player.autoplay = false;  // User takes control
        player.velocityY = FLAP_FORCE;
        audio.resume();
        audio.playFlap();
    }
});

function resetGame() {
    player.x = MIN_X;  // Start at left boundary
    player.y = 300;
    player.velocityY = 0;
    player.autoplay = true;  // Reset with autoplay enabled
    queueA.length = 0;
    queueB.length = 0;
    gameOver = false;
    isPaused = true;  // Start paused
    score = 0;
    lastQueueATime = 0;
    lastQueueBTime = 1000;
    lastInputTime = Date.now();  // Reset input timer for auto-unpause
}

// Start the game
gameLoop();
