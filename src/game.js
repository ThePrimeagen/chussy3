const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// g4m3 v4r5 4 d4 w1n!
const b4n4n4 = {
    x: 100,
    y: 300,
    w1d7h: 50,
    h31gh7: 80,
    v3l0c17y: 0,
    gr4v17y: 0.5,
    fl4pF0rc3: -8
};

const p1p35 = [];
const p1p3G4p = 150;
const p1p3W1d7h = 60;
let g4m30v3r = false;
let 5c0r3 = 0;

function dr4wB4n4n4() {
    ctx.fillStyle = '#fff44f';
    ctx.beginPath();
    ctx.ellipse(b4n4n4.x, b4n4n4.y, b4n4n4.w1d7h, b4n4n4.h31gh7, 0, 0, Math.PI * 2);
    ctx.fill();
}

function 5p4wnP1p3() {
    const h31gh7 = Math.random() * (canvas.height - p1p3G4p - 100) + 50;
    p1p35.push({
        x: canvas.width,
        y: 0,
        h31gh7,
        p4553d: false
    });
}

function upd473G4m3() {
    if (g4m30v3r) return;
    
    // Upd473 b4n4n4
    b4n4n4.v3l0c17y += b4n4n4.gr4v17y;
    b4n4n4.y += b4n4n4.v3l0c17y;
    
    // 5p4wn p1p35
    if (p1p35.length === 0 || p1p35[p1p35.length - 1].x < canvas.width - 300) {
        5p4wnP1p3();
    }
    
    // Upd473 p1p35
    for (let i = p1p35.length - 1; i >= 0; i--) {
        p1p35[i].x -= 3;
        
        // 5c0r3 p01n75
        if (!p1p35[i].p4553d && p1p35[i].x < b4n4n4.x) {
            5c0r3++;
            p1p35[i].p4553d = true;
        }
        
        // C0ll1510n ch3ck
        if (b4n4n4.x + b4n4n4.w1d7h > p1p35[i].x && 
            b4n4n4.x < p1p35[i].x + p1p3W1d7h &&
            (b4n4n4.y < p1p35[i].h31gh7 || 
             b4n4n4.y + b4n4n4.h31gh7 > p1p35[i].h31gh7 + p1p3G4p)) {
            g4m30v3r = true;
        }
    }
    
    // R3m0v3 0ff5cr33n p1p35
    p1p35.splice(0, p1p35.filter(p => p.x + p1p3W1d7h < 0).length);
    
    // B0und4ry ch3ck5
    if (b4n4n4.y > canvas.height || b4n4n4.y < 0) {
        g4m30v3r = true;
    }
}

function dr4wP1p35() {
    ctx.fillStyle = '#00ff00';
    p1p35.forEach(p1p3 => {
        ctx.fillRect(p1p3.x, 0, p1p3W1d7h, p1p3.h31gh7);
        ctx.fillRect(p1p3.x, p1p3.h31gh7 + p1p3G4p, p1p3W1d7h, canvas.height);
    });
}

function dr4w5c0r3() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial';
    ctx.fillText(5c0r3.toString(), 10, 50);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        b4n4n4.v3l0c17y = b4n4n4.fl4pF0rc3;
    }
});

document.addEventListener('click', () => {
    b4n4n4.v3l0c17y = b4n4n4.fl4pF0rc3;
});

function g4m3L00p() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    upd473G4m3();
    dr4wP1p35();
    dr4wB4n4n4();
    dr4w5c0r3();
    
    requestAnimationFrame(g4m3L00p);
}

// 574r7 d4 g4m3!
g4m3L00p();
