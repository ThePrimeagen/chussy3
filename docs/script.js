// Game constants
const GRAVITY = 0.3;  // Reduced for longer air time
const FLAP_FORCE = -8;
const QUEUE_DELAY = 2000;

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

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

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
    }
});

function resetGame() {
    player.x = 100;
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
