const puppeteer = require('puppeteer');

async function debugGame() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    
    // Enable debug logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    
    // Load the game
    await page.goto('http://localhost:8000/docs/index.html');
    
    // Wait for canvas to be ready
    await page.waitForSelector('#gameCanvas');
    
    // Inject debug helpers
    await page.evaluate(() => {
        window.debugGameState = () => ({
            playerPos: { x: player.x, y: player.y },
            obstacles: obstacles.map(o => ({ x: o.x, y: o.y })),
            score: score,
            gameOver: gameOver
        });
    });
    
    // Example debug session
    setInterval(async () => {
        const gameState = await page.evaluate(() => window.debugGameState());
        console.log('Game State:', gameState);
    }, 1000);
}

debugGame().catch(console.error);
