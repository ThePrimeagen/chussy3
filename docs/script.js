// Game constants
const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// Game state
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

function updateGame() {
    if (gameOver) return;

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
}

function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !player.isJumping && !gameOver) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
    }
    if (e.code === 'KeyR' && gameOver) {
        resetGame();
    }
});

function resetGame() {
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
