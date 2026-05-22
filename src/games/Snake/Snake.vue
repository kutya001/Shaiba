<template>
  <div class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative">
    <!-- Game Header: Score & Record -->
    <div class="w-full flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 shadow-inner mb-3">
      <div>
        <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Счёт</span>
        <span class="text-xl font-extrabold text-emerald-400 font-mono leading-none">{{ score }}</span>
      </div>
      <div class="text-right">
        <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Рекорд</span>
        <span class="text-xl font-extrabold text-indigo-400 font-mono leading-none">{{ highscore }}</span>
      </div>
    </div>

    <!-- Canvas Wrapper with custom proportions -->
    <div class="flex-1 w-full max-w-sm flex items-center justify-center relative">
      <canvas
        ref="gameCanvas"
        class="border-2 border-slate-800 rounded-2xl bg-slate-900/40 shadow-2xl aspect-square w-full"
        width="400"
        height="400"
      ></canvas>

      <!-- Game Over Overlay -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-10"
      >
        <div class="w-16 h-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <i class="bi bi-skull text-3xl"></i>
        </div>
        <h2 class="text-2xl font-black text-white leading-tight mb-1 font-heading">
          ИГРА ОКОНЧЕНА
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-4">
          Вы набрали: <span class="text-emerald-400 font-bold font-mono">{{ score }} очков</span>
        </p>
        <button
          @click="restartGame"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md shadow-indigo-500/35 cursor-pointer active:scale-95"
        >
          Играть снова
        </button>
      </div>

      <!-- Start Overlay -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10"
      >
        <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center text-emerald-400 mb-4">
          <i class="bi bi-play-circle-fill text-3xl"></i>
        </div>
        <h2 class="text-xl font-black text-white mb-2 font-heading">
          ЗМЕЙКА
        </h2>
        <p class="text-xs font-semibold text-slate-400 max-w-[240px] mb-5">
          Управляйте змейкой, собирайте светящиеся элементы и побейте рекорд!
        </p>
        <button
          @click="startGame"
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md shadow-emerald-550/35 cursor-pointer active:scale-95"
        >
          СТАРТИРОВАТЬ
        </button>
      </div>
    </div>

    <!-- On screen D-Pad optimized for phones -->
    <div class="w-full max-w-[220px] shrink-0 mt-3 aspect-square grid grid-cols-3 gap-2 p-2 select-none">
      <div></div>
      <button
        @click="changeDirection('UP')"
        class="h-14 bg-slate-800/80 active:bg-indigo-600 active:text-white hover:bg-slate-700 text-slate-300 rounded-2xl flex items-center justify-center transition shadow border-none cursor-pointer"
        title="Вверх"
      >
        <i class="bi bi-chevron-up text-xl font-black"></i>
      </button>
      <div></div>

      <button
        @click="changeDirection('LEFT')"
        class="h-14 bg-slate-800/80 active:bg-indigo-600 active:text-white hover:bg-slate-700 text-slate-300 rounded-2xl flex items-center justify-center transition shadow border-none cursor-pointer"
        title="Влево"
      >
        <i class="bi bi-chevron-left text-xl font-black"></i>
      </button>
      <div class="flex items-center justify-center text-slate-600">
        <i class="bi bi-controller text-lg"></i>
      </div>
      <button
        @click="changeDirection('RIGHT')"
        class="h-14 bg-slate-800/80 active:bg-indigo-600 active:text-white hover:bg-slate-700 text-slate-300 rounded-2xl flex items-center justify-center transition shadow border-none cursor-pointer"
        title="Вправо"
      >
        <i class="bi bi-chevron-right text-xl font-black"></i>
      </button>

      <div></div>
      <button
        @click="changeDirection('DOWN')"
        class="h-14 bg-slate-800/80 active:bg-indigo-600 active:text-white hover:bg-slate-700 text-slate-300 rounded-2xl flex items-center justify-center transition shadow border-none cursor-pointer"
        title="Вниз"
      >
        <i class="bi bi-chevron-down text-xl font-black"></i>
      </button>
      <div></div>
    </div>
  </div>
</template>

<script>
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
      
      // Snake center initialization
      this.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      
      this.spawnFood();
      
      if (this.gameInterval) clearInterval(this.gameInterval);
      this.gameInterval = setInterval(this.gameLoop, this.speed);
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
        this.spawnFood();
        
        // Slightly increase speed
        if (this.speed > 70) {
          this.speed -= 2;
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
          6
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
    },
    changeDirection(dir) {
      if (!this.hasStarted || this.gameOver) return;
      
      if (dir === "UP" && this.direction !== "DOWN") this.nextDirection = "UP";
      else if (dir === "DOWN" && this.direction !== "UP") this.nextDirection = "DOWN";
      else if (dir === "LEFT" && this.direction !== "RIGHT") this.nextDirection = "LEFT";
      else if (dir === "RIGHT" && this.direction !== "LEFT") this.nextDirection = "RIGHT";
    },
    handleKeyDown(event) {
      if (!this.hasStarted || this.gameOver) return;
      
      if (event.code === "ArrowUp" || event.code === "KeyW") this.changeDirection("UP");
      else if (event.code === "ArrowDown" || event.code === "KeyS") this.changeDirection("DOWN");
      else if (event.code === "ArrowLeft" || event.code === "KeyA") this.changeDirection("LEFT");
      else if (event.code === "ArrowRight" || event.code === "KeyD") this.changeDirection("RIGHT");
    },
  },
};
</script>
