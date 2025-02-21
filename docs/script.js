// Game constants
const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// Audio context and settings
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const BPM = 140;
const BEAT_LENGTH = 60 / BPM;

// Music state
let nextNoteTime = 0;
let currentBeat = 0;

// Game state
let autoplayEnabled = false;
let player = {
    x: 100,
    y: 300,
    width: 30,
    height: 30,
    velocityY: 0,
    isJumping: false
};

let obstacles = [];
let gameOver = false;
let score = 0;
let lastObstacleSpawn = 0;

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

function spawnObstacle() {
    const now = Date.now();
    if (now - lastObstacleSpawn > 1500) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 100,
            width: 30,
            height: Math.random() * 150 + 50
        });
        lastObstacleSpawn = now;
    }
}

function shouldAutoJump() {
    if (!autoplayEnabled) return false;
    
    // Find next obstacle
    const nextObstacle = obstacles.find(obs => obs.x + obs.width > player.x);
    if (!nextObstacle) return false;
    
    // Calculate if we need to jump based on distance and timing
    const distanceToObstacle = nextObstacle.x - (player.x + player.width);
    const jumpNeeded = distanceToObstacle < 100 && !player.isJumping;
    
    return jumpNeeded;
}

function updateGame() {
    if (gameOver) return;
    
    // Handle autoplay jumping
    if (shouldAutoJump()) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
    }

    // Apply gravity
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Ground collision
    if (player.y + player.height > canvas.height - 100) {
        player.y = canvas.height - 100 - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= MOVE_SPEED;
    });

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    // Collision detection
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gameOver = true;
        }
    });

    // Spawn new obstacles
    spawnObstacle();

    // Update score
    score++;
}

function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Draw player
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    ctx.fillStyle = '#666666';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${Math.floor(score/10)}`, 10, 30);

    if (gameOver) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
    }
    
    // Draw autoplay status
    ctx.fillStyle = autoplayEnabled ? '#00FF00' : '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Autoplay: ${autoplayEnabled ? 'ON' : 'OFF'} (Press 'A' to toggle)`, 10, 60);
}

function gameLoop() {
    updateGame();
    drawGame();
    updateMusic();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            if (!player.isJumping && !gameOver) {
                player.velocityY = JUMP_FORCE;
                player.isJumping = true;
                // Disable autoplay on manual jump
                autoplayEnabled = false;
            }
            break;
        case 'KeyR':
            if (gameOver) {
                resetGame();
            }
            break;
        case 'KeyA':
            autoplayEnabled = !autoplayEnabled;
            break;
    }
});

function createOscillator(freq, type = 'square') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    gainNode.gain.value = 0.1;
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    return { osc, gainNode };
}

function playNote(freq, duration = 0.1) {
    const { osc, gainNode } = createOscillator(freq);
    
    osc.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

function updateMusic() {
    const time = audioCtx.currentTime;
    
    while (nextNoteTime < time + 0.1) {
        const beatInBar = currentBeat % 4;
        
        // Base melody
        if (beatInBar === 0) {
            playNote(440); // A4
        } else if (beatInBar === 2) {
            playNote(523.25); // C5
        }
        
        // Add extra notes when scoring
        if (score > 0 && score % 10 === 0) {
            playNote(659.25, 0.2); // E5
        }
        
        nextNoteTime += BEAT_LENGTH;
        currentBeat++;
    }
}

function resetGame() {
    autoplayEnabled = false;
    nextNoteTime = audioCtx.currentTime;
    player = {
        x: 100,
        y: 300,
        width: 30,
        height: 30,
        velocityY: 0,
        isJumping: false
    };
    obstacles = [];
    gameOver = false;
    score = 0;
    lastObstacleSpawn = 0;
}

// Start game
gameLoop();
