// Canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
window.localStorage.setItem('maxScore', 0);

if (window.screen.width <= 720) {
  canvas.width = window.screen.width;
  canvas.height = window.screen.height;
} else {
  canvas.width = 800;
  canvas.height = 500;
}

let score = 0;
let gameFrame = 0;
ctx.font = '40px Georgia';
let gameSpeed = 1;
let gameOver = false;

// Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
  x: canvas.width/2,
  y: canvas.height/2,
  click: false
}
canvas.addEventListener('mousedown', function() {
  mouse.click = true;
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mouseup', function() {
  mouse.click = false;
});

// Player
const playerLeft = new Image();
playerLeft.src = 'assets/fish_swim_left.png';
const playerRight = new Image();
playerRight.src = 'assets/fish_swim_right.png';

class Player {
  constructor() {
    this.x = canvas.width;
    this.y = canvas.height/2;
    this.radius = 50;
    this.angle = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.frame = 0;
    this.spriteWidth = 498;
    this.spriteHeight = 327;
  }
  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    let theta = Math.atan2(dy, dx);
    this.angle = theta;

    if (mouse.x != this.x) {
      this.x -= dx/30; // x boyinsha tezligi
    }
    if (mouse.y != this.y) {
      this.y -= dy/30; // y boyinsha tezligi
    }

    // Issue ---->
    if (gameFrame % 5 == 0) {
      this.frame++;
      if (this.frame >= 12) this.frame = 0;
      if (this.frame == 3 || this.frame == 7 || this.frame == 11){
        this.frameX = 0;
      } else {
        this.frameX++;
      }
      if (this.frame < 3) this.frameY = 0;
      else if (this.frame < 7) this.frameY = 1;
      else if (this.frame < 11) this.frameY = 2;
      else this.frameY = 0;
    }
    // <------
  }
  draw() {
    if(mouse.click) {
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.x >= mouse.x) {
      ctx.drawImage(
        playerLeft, // src img
        this.frameX * this.spriteWidth, // sx
        this.frameY * this.spriteHeight, // sy
        this.spriteWidth, // sw
        this.spriteHeight, // sy
        0 - 60, // dx
        0 - 45, // dy
        this.spriteWidth/4, // dw
        this.spriteHeight/4 // dy
      );
    } else {
      ctx.drawImage(
        playerRight, 
        this.frameX * this.spriteWidth, 
        this.frameY * this.spriteHeight, 
        this.spriteWidth, 
        this.spriteHeight, 
        0 - 60, 
        0 - 45, 
        this.spriteWidth/4, 
        this.spriteHeight/4
      );
    }
    ctx.restore();
  }
}
const player = new Player();

// Bubbles
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = 'assets/bubble_pop_frame_01.png';

class Bubble {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 100;
    this.radius = 50;
    this.frameX = 0;
    this.frameY = 0;
    this.frame = 0;
    this.spriteWidth = 393;
    this.spriteHeight = 511;
    this.speed = Math.random() * 5 + 1;
    this.distance;
    this.counted = false;
    this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
  }
  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx*dx + dy*dy);
  }
  draw() {
    ctx.drawImage(
      bubbleImage,
      this.x - 65, 
      this.y - 65, 
      this.radius * 2.6, 
      this.radius * 2.6
    );
  }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = 'assets/Plop.ogg';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = 'assets/bubbles-single2.wav';

function handleBubbles() {
  if (gameFrame % 50 == 0) {
    bubblesArray.push(new Bubble());
  }
  for (let i = 0; i < bubblesArray.length; i++) {
    bubblesArray[i].update();
    bubblesArray[i].draw();
    if (bubblesArray[i].y < 0 - bubblesArray[i].radius * 2) {
      bubblesArray.splice(i, 1);
      i--;
    } else if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) { // collision
      if (!bubblesArray[i].counted) {
        if (bubblesArray[i].sound == 'sound1') {
          bubblePop1.play();
        } else {
          bubblePop2.play();
        }
        score++;
        bubblesArray.splice(i, 1);
        i--;
        if (window.localStorage.getItem('maxScore') < score) {
          window.localStorage.setItem('maxScore', score);
        }
      }
    }
  }
}

// Repeating backgrounds
const background = new Image();
background.src = 'assets/background1.png';

const BG = {
  x1: 0,
  x2: canvas.width,
  y: 0,
  width: canvas.width,
  height: canvas.height,
}

function handleBackground() {
  BG.x1 -= gameSpeed;
  if (BG.x1 < -BG.width) BG.x1 = BG.width;
  BG.x2 -= gameSpeed;
  if (BG.x2 < -BG.width) BG.x2 = BG.width;
  ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
  ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

// Enemies
const enemies = [
  {
    src: "assets/rest_to_left_sheet.png",
    frameX: 5,
    frameY: 0,
    enemyWidth: 256,
    enemyHeight: 256,
  }
];

const enemyImage = new Image();
enemyImage.src = 'assets/enemy1.png';

class Enemy1 {
  constructor() {
    this.x = canvas.width + 200;
    this.y = Math.random() * (canvas.height - 150) + 120;
    this.radius = 30;
    this.speed = Math.random() * 2 + 2;
    this.frame = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 418;
    this.spriteHeight = 397;
  }
  draw() {
    ctx.drawImage(
      enemyImage, // src img
      this.frameX * this.spriteWidth, // sx
      this.frameY * this.spriteHeight, // sy
      this.spriteWidth, // sw
      this.spriteHeight, // sh
      this.x - 30, // dx
      this.y - 35, // dy
      this.spriteWidth / 6, // dw
      this.spriteHeight / 6 // dh
    );
  }
  update() {
    this.x -= this.speed;
    if(this.x < 0 - this.radius * 2) {
      this.x = canvas.width + 200;
      this.y = Math.random() * (canvas.height - 150) + 90;
      this.speed = Math.random() * 2 + 2;
    }
    if (gameFrame % 5 == 0) {
      this.frame++;
      if (this.frame >= 12) this.frame = 0;
      if (this.frame == 3 || this.frame == 7 || this.frame == 11){
        this.frameX = 0;
      } else {
        this.frameX++;
      }
      if (this.frame < 3) this.frameY = 0;
      else if (this.frame < 7) this.frameY = 1;
      else if (this.frame < 11) this.frameY = 2;
      else this.frameY = 0;
    }
    // collision with player
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.radius + player.radius) {
      handleGameOver();
    }
  }
}

class Enemy2 {
  constructor() {
    this.x = canvas.width + 200;
    this.y = Math.random() * (canvas.height - 150) + 120;
    this.radius = 30;
    this.speed = Math.random() * 2 + 2;
    this.img = new Image();
    this.img.src = 'assets/rest_to_left_sheet.png';
    this.frame = 0;
    this.frameX = 0;
    // this.frameY = 0;
    this.spriteWidth = 256;
    this.spriteHeight = 256;
  }
  draw() {
    ctx.drawImage(
      this.img, // src img
      this.frameX * this.spriteWidth, // sx
      0, // sy
      this.spriteWidth, // sw
      this.spriteHeight, // sh
      this.x - 30, // dx (adjusting to center the image horizontally)
      this.y - 35, // dy (adjusting to center the image vertically)
      this.spriteWidth / 3, // dw
      this.spriteHeight / 3 // dh
    );
  }
  update() {
    this.x -= this.speed;
    if(this.x < 0 - this.radius * 2) {
      this.x = canvas.width + 200;
      this.y = Math.random() * (canvas.height - 150) + 90;
      this.speed = Math.random() * 2 + 2;
    }
    if (gameFrame % 5 == 0) {
      this.frame++;
      if (this.frame >= 6) this.frame = 0;
      if (this.frame == 5){
        this.frameX = 0;
      } else {
        this.frameX++;
      }
    }
    // collision with player
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.radius + player.radius) {
      handleGameOver();
    }
  }
}

const enemy1 = new Enemy1();
const enemy2 = new Enemy2();

function handleEnemies() {
  enemy1.draw();
  enemy1.update();

  enemy2.draw();
  enemy2.update();
}


// Game Over
function handleGameOver() {
  ctx.fillStyle = 'white';
  ctx.fillText('GAME OVER, you reached score ' + score, 110, 250);
  gameOver = true;
}

// Game Over Sound
const gameOverSound = document.createElement('audio');
gameOverSound.src = "assets/game_over_1.mp3";

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  handleBackground();
  handleBubbles();

  player.update();
  player.draw();

  handleEnemies();

  ctx.fillStyle = 'black';
  ctx.font = '20px "Press Start 2P"';
  ctx.fillText('Score:', canvas.width - 150, 40);
  ctx.font = '40px Honk';
  ctx.fillText(score, canvas.width - 150, 70);
  // ctx.fillText('Record score: ' + window.localStorage.getItem('maxScore'), 10, 100);

  gameFrame++;
  if (!gameOver) requestAnimationFrame(animate);
  else gameOverSound.play();
}
animate();

window.addEventListener('resize', function() {
  canvasPosition = canvas.getBoundingClientRect();
})