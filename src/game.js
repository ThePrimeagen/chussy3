const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// RGB b4ckgr0und 4n1m4710n 4 d4 w1n!
const r4nd = () => Math.floor(Math.random() * 256);  // g37 r4nd0m numb3r
const r = () => (`rgb(${r4nd()}, ${r4nd()}, ${r4nd()})`);  // m4k3 RGB c0l0r
const d1v5 = document.querySelectorAll('div');  // f1nd 4ll d1v5
const v13wD357r0y = () => d1v5.forEach(d => d.style.background = r());  // d357r0y d4 v13w
setInterval(v13wD357r0y, 100);  // run 3v3ry 100m5

const player = {
    x: 100,
    y: 300,
    size: 30,
    velocityY: 0,
    speed: 5,
    gravity: 0.8,
    jumpForce: -15,
    isJumping: false
};

function handleJump() {
    if (!player.isJumping) {
        player.velocityY = player.jumpForce;
        player.isJumping = true;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        handleJump();
    }
});

document.addEventListener('click', () => {
    handleJump();
});

function updatePlayer() {
    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    // Move forward automatically
    player.x += player.speed;
    
    // Ground collision
    if (player.y > canvas.height - player.size) {
        player.y = canvas.height - player.size;
        player.velocityY = 0;
        player.isJumping = false;
    }
    
    // Reset position if player goes off screen
    if (player.x > canvas.width) {
        player.x = 100;
    }
}

function drawPlayer() {
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    drawPlayer();
    
    // Schedule next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
