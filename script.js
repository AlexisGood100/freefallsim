const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let projectile = { x: 0, y: 0, velX: 20, velY: 20 };
let g = 9.8;
let time = 0;
let launched = false;
const scale = 20;

const target = {
  x: 600,
  y: 200,
  radius: 15,
  speedX: 0.2,
  speedY: 0.2,
  directionX: 1,
  directionY: 1
};

const trail = [];
const targetTrail = [];
const maxTrailLength = 20;

const message = document.getElementById("message");

let score = 0;
let totalHits = 0;
let totalMisses = 0;
let gameTimer = 60;
let gameActive = true;

document.getElementById("startBtn").addEventListener("click", () => {
  if (!gameActive) return;

  projectile.velX = parseFloat(document.getElementById("velX").value);
  projectile.velY = parseFloat(document.getElementById("velY").value);
  g = parseFloat(document.getElementById("gravity").value);

  const newSpeed = parseFloat(document.getElementById("targetSpeed").value);
  target.speedX = newSpeed;
  target.speedY = newSpeed;

  projectile.x = 0;
  projectile.y = 0;
  time = 0;
  launched = true;
  message.textContent = "";
  trail.length = 0;
});

function update() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameActive) {
    // Move target
    target.x += target.speedX * target.directionX;
    target.y += target.speedY * target.directionY;

    if (target.x > canvas.width - target.radius || target.x < target.radius) {
      target.directionX *= -1;
    }
    if (target.y > canvas.height - target.radius || target.y < target.radius) {
      target.directionY *= -1;
    }

    // Target trail
    targetTrail.push({ x: target.x, y: target.y });
    if (targetTrail.length > maxTrailLength) targetTrail.shift();

    for (let i = 0; i < targetTrail.length; i++) {
      ctx.beginPath();
      ctx.arc(targetTrail[i].x, targetTrail[i].y, target.radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 0, 0, ${i / maxTrailLength})`;
      ctx.fill();
    }

    // Draw target
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  // Update projectile
  if (launched) {
    time += 0.05;
    projectile.x = projectile.velX * time;
    projectile.y = projectile.velY * time + 0.5 * (-g) * Math.pow(time, 2);

    const drawX = projectile.x * scale;
    const drawY = canvas.height - (projectile.y * scale);

    trail.push({ x: drawX, y: drawY });
    if (trail.length > maxTrailLength) trail.shift();

    for (let i = 0; i < trail.length; i++) {
      ctx.beginPath();
      ctx.arc(trail[i].x, trail[i].y, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${i / maxTrailLength})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(drawX, drawY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "cyan";
    ctx.fill();

    const dist = Math.hypot(drawX - target.x, drawY - target.y);
    if (dist < target.radius + 8) {
      message.textContent = "You hit the target! 🎯";
      score += 10;
      totalHits++;
      launched = false;
      updateStats();
    }

    if (drawX > canvas.width || drawY > canvas.height || drawY < 0) {
      message.textContent = "You missed!";
      score -= 5;
      totalMisses++;
      launched = false;
      updateStats();
    }
  }

  // Draw scoreboard and timer
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Hits: ${totalHits}  Misses: ${totalMisses}`, 10, 40);

  const hitAverage = totalHits + totalMisses > 0 ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1) : 0;
  ctx.fillText(`Hit %: ${hitAverage}%`, 10, 60);
  ctx.fillText(`Time Left: ${gameTimer}s`, 10, 80);

  requestAnimationFrame(update);
}

function updateStats() {
  const hitAverage = totalHits + totalMisses > 0 ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1) : 0;
  console.log(`Hits: ${totalHits}, Misses: ${totalMisses}, Hit %: ${hitAverage}%`);
}

function countdown() {
  if (!gameActive) return;
  if (gameTimer > 0) {
    gameTimer--;
    setTimeout(countdown, 1000);
  } else {
    gameActive = false;
    message.textContent = `⏰ Time's up! Final Score: ${score}`;
  }
}

update();
countdown();
