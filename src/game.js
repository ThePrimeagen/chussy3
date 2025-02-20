const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Game logic will go here
    
    // Schedule next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
