<template>
  <div
    class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Game Header: Score & Record -->
    <div class="w-full flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 shadow-inner mb-2.5">
      <div>
        <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Счёт</span>
        <span class="text-base font-extrabold text-emerald-400 font-mono leading-none">{{ score }}</span>
      </div>
      <div class="text-right">
        <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Рекорд</span>
        <span class="text-base font-extrabold text-indigo-400 font-mono leading-none">{{ highscore }}</span>
      </div>
    </div>

    <!-- Canvas Wrapper with custom proportions -->
    <div class="flex-1 w-full max-w-sm flex items-center justify-center relative my-1">
      <canvas
        ref="gameCanvas"
        class="border-2 border-slate-850 rounded-2xl bg-slate-900/30 shadow-2xl aspect-square w-full"
        width="400"
        height="400"
      ></canvas>

      <!-- Game Over Overlay -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-10"
      >
        <div class="w-16 h-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <i class="bi bi-skull text-3xl"></i>
        </div>
        <h2 class="text-xl font-black text-white leading-tight mb-1 font-heading">
          ИГРА ОКОНЧЕНА
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-4">
          Счёт: <span class="text-emerald-400 font-bold font-mono">{{ score }} очков</span>
        </p>
        <button
          @click="restartGame"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md cursor-pointer active:scale-95"
        >
          Играть снова
        </button>
      </div>

      <!-- Start Overlay -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10"
      >
        <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
          <i class="bi bi-play-circle-fill text-3xl"></i>
        </div>
        <h2 class="text-lg font-black text-white mb-1 font-heading uppercase tracking-wide">
          Змейка HD
        </h2>
        <p class="text-[11px] font-semibold text-slate-400 max-w-[200px] mb-5 leading-normal">
          Управляйте свайпами в пяти направлениях, собирайте элементы и бейте рекорды!
        </p>
        <button
          @click="startGame"
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md cursor-pointer active:scale-95"
        >
          СТАРТ
        </button>
      </div>
    </div>

    <!-- Adaptive instructions with dynamic visual aid -->
    <div class="w-full max-w-[320px] py-2.5 px-3 bg-slate-900 border border-slate-800/60 rounded-2xl text-center text-slate-400 text-[10px] font-semibold leading-normal shrink-0 mt-3 flex items-center justify-center gap-1.5">
      <i class="bi bi-phone-vibrate text-indigo-400 text-sm"></i>
      <span>Проведите пальцем (<span class="text-slate-200 text-xs">Свайп</span>) на игровом поле для поворота.</span>
    </div>
  </div>
</template>

<script>
import { playSound } from "../../utils/audioHelper";

export default {
  data() {
    return {
      score: 0,
      highscore: Number(localStorage.getItem("game_snake_highscore")) || 0,
      gameOver: false,
      hasStarted: false,
      snake: [],
      direction: "RIGHT",
      nextDirection: "RIGHT",
      food: { x: 0, y: 0 },
      gridSize: 20,
      tileCount: 20,
      gameInterval: null,
      speed: 130, // MS per tick
      touchStart: { x: 0, y: 0 }
    };
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    this.drawInitialGrid();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.gameInterval) clearInterval(this.gameInterval);
  },
  methods: {
    drawInitialGrid() {
      const canvas = this.$refs.gameCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw standard clean Grid
      ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < this.tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * this.gridSize, 0);
        ctx.lineTo(i * this.gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * this.gridSize);
        ctx.lineTo(canvas.width, i * this.gridSize);
        ctx.stroke();
      }
    },
    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.direction = "RIGHT";
      this.nextDirection = "RIGHT";
      this.speed = 130;
      
      // Snake center initialization
      this.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      
      this.spawnFood();
      
      if (this.gameInterval) clearInterval(this.gameInterval);
      this.gameInterval = setInterval(this.gameLoop, this.speed);
      playSound.levelUp();
    },
    restartGame() {
      this.startGame();
    },
    spawnFood() {
      let valid = false;
      while (!valid) {
        this.food.x = Math.floor(Math.random() * this.tileCount);
        this.food.y = Math.floor(Math.random() * this.tileCount);
        
        // Ensure food does not spawn inside the snake
        valid = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y);
      }
    },
    gameLoop() {
      if (!this.hasStarted || this.gameOver) return;
      this.direction = this.nextDirection;
      
      // Move snake head
      let head = { ...this.snake[0] };
      
      if (this.direction === "UP") head.y--;
      else if (this.direction === "DOWN") head.y++;
      else if (this.direction === "LEFT") head.x--;
      else if (this.direction === "RIGHT") head.x++;
      
      // Check wall collision
      if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
        this.endGame();
        return;
      }
      
      // Check self tail collision
      if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        this.endGame();
        return;
      }
      
      // Insert new head
      this.snake.unshift(head);
      
      // See if food eaten
      if (head.x === this.food.x && head.y === this.food.y) {
        this.score += 10;
        if (this.score > this.highscore) {
          this.highscore = this.score;
          localStorage.setItem("game_snake_highscore", this.highscore);
        }
        playSound.score();
        this.spawnFood();
        
        // Slightly increase speed
        if (this.speed > 75) {
          this.speed -= 3;
          clearInterval(this.gameInterval);
          this.gameInterval = setInterval(this.gameLoop, this.speed);
        }
      } else {
        // Remove tail
        this.snake.pop();
      }
      
      this.draw();
    },
    draw() {
      const canvas = this.$refs.gameCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      
      // Background Clean redraw
      ctx.fillStyle = "#0c1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw subtle grid
      ctx.strokeStyle = "rgba(79, 70, 229, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < this.tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * this.gridSize, 0);
        ctx.lineTo(i * this.gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * this.gridSize);
        ctx.lineTo(canvas.width, i * this.gridSize);
        ctx.stroke();
      }
      
      // Draw Food with neon glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#10b981";
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      // Round beautiful food
      const cx = this.food.x * this.gridSize + this.gridSize / 2;
      const cy = this.food.y * this.gridSize + this.gridSize / 2;
      ctx.arc(cx, cy, this.gridSize / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw Snake with nice progressive scale/color gradient
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#4f46e5";
      
      this.snake.forEach((segment, idx) => {
        // Fade shade from deep indigo/purple to vibrant sky-blue/indigo
        if (idx === 0) {
          ctx.fillStyle = "#6366f1"; // Head
          ctx.shadowBlur = 14;
        } else {
          ctx.fillStyle = `rgba(99, 102, 241, ${1 - idx / (this.snake.length + 5)})`;
          ctx.shadowBlur = 4;
        }
        
        const pad = 1.5;
        ctx.beginPath();
        ctx.roundRect(
          segment.x * this.gridSize + pad,
          segment.y * this.gridSize + pad,
          this.gridSize - pad * 2,
          this.gridSize - pad * 2,
          5
        );
        ctx.fill();
      });
      
      // Reset shadows
      ctx.shadowBlur = 0;
    },
    endGame() {
      this.gameOver = true;
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
      }
      playSound.gameOver();
    },
    changeDirection(dir) {
      if (!this.hasStarted || this.gameOver) return;
      
      let changed = false;
      if (dir === "UP" && this.direction !== "DOWN") {
        this.nextDirection = "UP";
        changed = true;
      } else if (dir === "DOWN" && this.direction !== "UP") {
        this.nextDirection = "DOWN";
        changed = true;
      } else if (dir === "LEFT" && this.direction !== "RIGHT") {
        this.nextDirection = "LEFT";
        changed = true;
      } else if (dir === "RIGHT" && this.direction !== "LEFT") {
        this.nextDirection = "RIGHT";
        changed = true;
      }

      if (changed) {
        playSound.tick();
      }
    },
    handleKeyDown(event) {
      if (!this.hasStarted || this.gameOver) return;
      
      if (event.code === "ArrowUp" || event.code === "KeyW") this.changeDirection("UP");
      else if (event.code === "ArrowDown" || event.code === "KeyS") this.changeDirection("DOWN");
      else if (event.code === "ArrowLeft" || event.code === "KeyA") this.changeDirection("LEFT");
      else if (event.code === "ArrowRight" || event.code === "KeyD") this.changeDirection("RIGHT");
    },
    onTouchStart(e) {
      if (!this.hasStarted || this.gameOver) return;
      if (!e || !e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      if (!touch) return;
      this.touchStart = {
        x: touch.clientX,
        y: touch.clientY
      };
    },
    onTouchEnd(e) {
      if (!this.hasStarted || this.gameOver) return;
      if (!e || !e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - this.touchStart.x;
      const dy = touch.clientY - this.touchStart.y;
      
      const minDistance = 25; // threshold for swipe action
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minDistance) {
          if (dx > 0) this.changeDirection("RIGHT");
          else this.changeDirection("LEFT");
        }
      } else {
        if (Math.abs(dy) > minDistance) {
          if (dy > 0) this.changeDirection("DOWN");
          else this.changeDirection("UP");
        }
      }
    }
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
