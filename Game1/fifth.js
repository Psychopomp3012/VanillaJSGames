/** @type {HTMLCanvasElement} */

const CANVAS = document.getElementById("canvas1");
const ctx = CANVAS.getContext('2d');
CANVAS.width = window.innerWidth;
CANVAS.height = window.innerHeight;

const collisionCANVAS = document.getElementById("collisionCanvas");
const collisionCtx = collisionCANVAS.getContext('2d');
collisionCANVAS.width = window.innerWidth;
collisionCANVAS.height = window.innerHeight;

let score = 0;
let gameOver = false;
ctx.font = '50px Impact';

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];

class Raven {

    constructor() {

        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = CANVAS.width; // They start moving from left
        this.y = Math.random() * (CANVAS.height - this.height); // if raven is generated below the down
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColours = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.colour = "rgb(" + this.randomColours[0] + ', ' + this.randomColours[1] + ', ' + this.randomColours[2] + ')';
        this.hasTrail = Math.random() > 0.5; // true for 50% of values

    }

    update(deltatime) {

        if (this.y < 0 || this.y > CANVAS.height - this.height) {

            this.directionY *= -1;

        }

        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < -this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltatime;
        if (this.timeSinceFlap > this.flapInterval) {

            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.colour));
                } 

            }
            

        }

        if (this.x < 0 - this.width) gameOver = true;

    }

    draw() {

        collisionCtx.fillStyle = this.colour;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);

    }

}

let explosions = [];

class Explosion {

    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'Ice attack 2.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }

    update(deltatime) {

        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }

    }

    draw() {

        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);

    }

}

let particles = [];
class Particle {

    constructor(x, y, size, colour) {

        this.size = size;
        this.x = x + this.size / 2;
        this.y = y + this.size / 3;
        
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.colour = colour

    }

    update() {

        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;

    }

    draw() {

        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

    }

}

function drawScore() {

    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 55, 80);

}

function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER', CANVAS.width/2, CANVAS.height/2 - 25);
    ctx.fillText('Your score is: ' + score, CANVAS.width/2, CANVAS.height/2 + 25);
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER', CANVAS.width/2 + 5, CANVAS.height/2 + 5 - 25);
    ctx.fillText('Your score is: ' + score, CANVAS.width/2 + 5, CANVAS.height/2 + 5 + 25);

    let gameOverSound = new Audio();
    gameOverSound.src = 'game over.wav';
    gameOverSound.play();


}

window.addEventListener('click', function(e) {

    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if (object.randomColours[0] === pc[0] && object.randomColours[1] === pc[1] && object.randomColours[2] === pc[2]) {
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    });

});

function animate(timestamp) {

    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
    collisionCtx.clearRect(0, 0, CANVAS.width, CANVAS.height);
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;

    if (timeToNextRaven > ravenInterval) {

        ravens.push(new Raven());
        timeToNextRaven = 0; // count restart
        ravens.sort(function(a, b) {

            return a.width - b.width; // ascending

        });

    }

    drawScore();

    [...particles, ...ravens, ...explosions].forEach(object => object.update(deltatime));
    [...particles, ...ravens, ...explosions].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = particles.filter(object => !object.markedForDeletion);
    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}

animate(0);



function tempButtonFunction() {

    window.location.href = "../Sixth/sixth.html";

}