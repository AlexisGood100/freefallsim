const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
let scale = canvas.width / 40;

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.95;
  canvas.height = window.innerHeight * 0.55;
  scale = canvas.width / 40;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Call initially



let g = 9.8;
let launched = false;

let projectile = {
  velX: 15,
  velY: 15,
  time: 0
};

let targets = [
  {
    x: 600,
    y: 200,
    radius: 15,
    speedX: 0.5,
    speedY: 0.5,
    directionX: 1,
    directionY: 1,
    hue: Math.floor(Math.random() * 360),
    trail: []
  }
];

const message = document.getElementById("message");
let score = 0, totalHits = 0, totalMisses = 0, gameTimer = 60, gameActive = true;

// Sliders
const velXInput = document.getElementById("velX");
const velYInput = document.getElementById("velY");
const gravityInput = document.getElementById("gravity");
const targetSpeedInput = document.getElementById("targetSpeed");

// Label updates
function syncSliderLabels() {
  velXInput.addEventListener("input", () => document.getElementById("velXVal").textContent = velXInput.value);
  velYInput.addEventListener("input", () => document.getElementById("velYVal").textContent = velYInput.value);
  gravityInput.addEventListener("input", () => document.getElementById("gravityVal").textContent = gravityInput.value);
  targetSpeedInput.addEventListener("input", () => document.getElementById("targetSpeedVal").textContent = targetSpeedInput.value);
}
syncSliderLabels();

// Launch
document.getElementById("startBtn").addEventListener("click", () => {
  if (!gameActive || launched) return;

  projectile.velX = parseFloat(velXInput.value);
  projectile.velY = parseFloat(velYInput.value);
  g = parseFloat(gravityInput.value);
  const speed = parseFloat(targetSpeedInput.value);

  for (let t of targets) {
    t.speedX = speed;
    t.speedY = speed;
  }

  projectile.time = 0;
  launched = true;
  message.textContent = "";
});

function drawLightningTrail(trail, hue) {
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    const progress = p.age / 180;
    if (progress > 1) continue;

    const alpha = 1 - progress;
    const offset = Math.sin(i * 0.4 + performance.now() / 100) * 6;

    ctx.beginPath();
    ctx.arc(p.x, p.y + offset, 6, 0, Math.PI * 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function update() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let t of targets) {
    t.x += t.speedX * t.directionX;
    t.y += t.speedY * t.directionY;

    if (t.x > canvas.width - t.radius || t.x < t.radius) t.directionX *= -1;
    if (t.y > canvas.height - t.radius || t.y < t.radius) t.directionY *= -1;

    t.hue = (t.hue + 0.5) % 360;

    t.trail.push({ x: t.x, y: t.y, age: 0 });
    for (let j = t.trail.length - 1; j >= 0; j--) {
      t.trail[j].age++;
      if (t.trail[j].age > 180) t.trail.splice(j, 1);
    }

    drawLightningTrail(t.trail, t.hue);

    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${t.hue}, 100%, 70%)`;
    ctx.fill();
  }

  if (launched) {
    projectile.time += 0.05;
    const px = projectile.velX * projectile.time;
    const py = projectile.velY * projectile.time + 0.5 * (-g) * Math.pow(projectile.time, 2);
    const drawX = px * scale;
    const drawY = canvas.height - (py * scale);

    ctx.beginPath();
    ctx.arc(drawX, drawY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const dist = Math.hypot(drawX - t.x, drawY - t.y);
      if (dist < t.radius + 8) {
        score += 10;
        totalHits++;
        message.textContent = "🎯 Target hit and cloned!";

        let newDirX, newDirY;
        do {
          newDirX = Math.random() < 0.5 ? -1 : 1;
          newDirY = Math.random() < 0.5 ? -1 : 1;
        } while (newDirX === t.directionX && newDirY === t.directionY);

        const variedSpeed = t.speedX * (0.9 + Math.random() * 0.2);

        targets.push({
          x: t.x,
          y: t.y,
          radius: t.radius,
          speedX: variedSpeed,
          speedY: variedSpeed,
          directionX: newDirX,
          directionY: newDirY,
          hue: Math.floor(Math.random() * 360),
          trail: []
        });

        launched = false;
        projectile.time = 0;
        break;
      }
    }

    if (drawX > canvas.width || drawY > canvas.height || drawY < 0) {
      score -= 5;
      totalMisses++;
      message.textContent = "You missed!";
      launched = false;
      projectile.time = 0;
    }
  }

  ctx.fillStyle = "#fff";
  ctx.font = "14px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Hits: ${totalHits}  Misses: ${totalMisses}`, 10, 40);
  const hitAvg = totalHits + totalMisses > 0
    ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1)
    : 0;
  ctx.fillText(`Hit %: ${hitAvg}%`, 10, 60);
  ctx.fillText(`Time Left: ${gameTimer}s`, 10, 80);

  requestAnimationFrame(update);
}

function countdown() {
  if (!gameActive) return;
  if (gameTimer > 0) {
    gameTimer--;
    setTimeout(countdown, 1000);
  } else {
    gameActive = false;
    location.reload();  // Auto restart
  }
}

update();
countdown();

