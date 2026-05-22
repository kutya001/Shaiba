<template>
  <div class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none">
    <!-- Game Header: Score, Lines, Level -->
    <div class="w-full grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-inner mb-2 text-center">
      <div>
        <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Линии</span>
        <span class="text-base font-extrabold font-mono text-cyan-400">{{ linesCleared }}</span>
      </div>
      <div>
        <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Счёт</span>
        <span class="text-base font-extrabold font-mono text-emerald-400">{{ score }}</span>
      </div>
      <div>
        <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Уровень</span>
        <span class="text-base font-extrabold font-mono text-indigo-400">{{ level }}</span>
      </div>
    </div>

    <!-- Active Area: Main Tetris Viewport -->
    <div class="flex-grow w-full max-w-[280px] flex items-center justify-center relative my-1">
      <canvas
        ref="tetrisCanvas"
        class="border-2 border-slate-800 rounded-2xl bg-slate-900/60 shadow-2xl w-full"
        width="240"
        height="480"
        style="max-height: 40vh; aspect-ratio: 1/2;"
      ></canvas>

      <!-- Game Over Modal overlay -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20"
      >
        <div class="w-14 h-14 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4">
          <i class="bi bi-exclamation-triangle-fill text-2xl"></i>
        </div>
        <h2 class="text-xl font-black text-white mb-1 tracking-tight font-heading">
          ИГРА ОКОНЧЕНА
        </h2>
        <p class="text-xs font-semibold text-slate-405 mb-4">
          Вы набрали: <span class="text-emerald-400 font-bold font-mono">{{ score }} очков</span>
        </p>
        <button
          @click="restartGame"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md shadow-indigo-505/35 cursor-pointer active:scale-95"
        >
          Начать заново
        </button>
      </div>

      <!-- Play / Pause Overlay -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20"
      >
        <div class="w-14 h-14 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
          <i class="bi bi-grid-3x3-gap-fill text-2xl"></i>
        </div>
        <h2 class="text-lg font-black text-white mb-2 font-heading uppercase tracking-wide">
          Тетрис
        </h2>
        <p class="text-[11px] font-semibold text-slate-400 max-w-[180px] mb-5">
          Вращайте и укладывайте падающие фигуры, собирая полные линии!
        </p>
        <button
          @click="startGame"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md shadow-indigo-505/45 cursor-pointer active:scale-95"
        >
          ИГРАТЬ
        </button>
      </div>
    </div>

    <!-- On-screen Controls (Optimized for Mobile fingers) -->
    <div class="w-full max-w-[320px] shrink-0 mt-2 space-y-2 select-none">
      <!-- Top buttons row: Rotate, Hard Drop -->
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="hardDrop"
          class="h-11 bg-slate-800/80 active:bg-indigo-600 hover:bg-slate-700 text-slate-100 rounded-xl flex items-center justify-center gap-1.5 transition text-xs font-bold border-none cursor-pointer"
        >
          <i class="bi bi-chevron-double-down"></i> Бросить
        </button>
        <button
          @click="rotate"
          class="h-11 bg-slate-800/80 active:bg-indigo-600 hover:bg-slate-700 text-slate-100 rounded-xl flex items-center justify-center gap-1.5 transition text-xs font-bold border-none cursor-pointer"
        >
          <i class="bi bi-arrow-clockwise text-sm"></i> Повернуть
        </button>
      </div>

      <!-- Arrow keys controls row: Left, Down, Right -->
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="moveLeft"
          class="h-12 bg-slate-800/85 active:bg-indigo-600 hover:bg-slate-750 text-slate-100 rounded-xl flex items-center justify-center transition border-none cursor-pointer"
          title="Влево"
        >
          <i class="bi bi-chevron-left text-[18px]"></i>
        </button>
        <button
          @click="moveDown"
          class="h-12 bg-slate-800/85 active:bg-indigo-600 hover:bg-slate-755 text-slate-100 rounded-xl flex items-center justify-center transition border-none cursor-pointer"
          title="Вниз"
        >
          <i class="bi bi-chevron-down text-[18px]"></i>
        </button>
        <button
          @click="moveRight"
          class="h-12 bg-slate-800/85 active:bg-indigo-600 hover:bg-slate-750 text-slate-100 rounded-xl flex items-center justify-center transition border-none cursor-pointer"
          title="Вправо"
        >
          <i class="bi bi-chevron-right text-[18px]"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      score: 0,
      linesCleared: 0,
      level: 1,
      gameOver: false,
      hasStarted: false,
      grid: [],
      rows: 20,
      cols: 10,
      blockSize: 24, // Matches 240 width / 10 cols
      currentPiece: null,
      currentX: 0,
      currentY: 0,
      gameInterval: null,
      colors: [
        null,
        "#6366f1", // Jackson Indigo
        "#ef4444", // Rose
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#06b6d4", // Cyan
        "#ec4899", // Pink
        "#a855f7"  // Purple
      ],
      shapes: [
        [],
        [[1, 1, 1, 1]], // I-shape
        [[2, 0, 0], [2, 2, 2]], // J-shape
        [[0, 0, 3], [3, 3, 3]], // L-shape
        [[4, 4], [4, 4]], // O-shape
        [[0, 5, 5], [5, 5, 0]], // S-shape
        [[0, 6, 0], [6, 6, 6]], // T-shape
        [[7, 7, 0], [0, 7, 7]]  // Z-shape
      ]
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
      const canvas = this.$refs.tetrisCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0c1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = "rgba(71, 85, 105, 0.15)";
      ctx.lineWidth = 0.5;
      for (let r = 0; r <= this.rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * this.blockSize);
        ctx.lineTo(canvas.width, r * this.blockSize);
        ctx.stroke();
      }
      for (let c = 0; c <= this.cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * this.blockSize, 0);
        ctx.lineTo(c * this.blockSize, canvas.height);
        ctx.stroke();
      }
    },
    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.linesCleared = 0;
      this.level = 1;
      
      // Clear matrix layout grid
      this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      
      this.spawnPiece();
      this.startLoop();
    },
    restartGame() {
      this.startGame();
    },
    startLoop() {
      if (this.gameInterval) clearInterval(this.gameInterval);
      const speed = Math.max(100, 800 - (this.level - 1) * 80);
      this.gameInterval = setInterval(() => {
        this.moveDown();
      }, speed);
    },
    spawnPiece() {
      const type = Math.floor(Math.random() * 7) + 1;
      this.currentPiece = this.shapes[type];
      
      // Start near the middle-top coordinates
      this.currentX = Math.floor((this.cols - this.currentPiece[0].length) / 2);
      this.currentY = 0;
      
      if (this.checkCollision(this.currentX, this.currentY, this.currentPiece)) {
        this.endGame();
      }
    },
    checkCollision(x, y, piece) {
      for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
          if (piece[r][c] !== 0) {
            const nextX = x + c;
            const nextY = y + r;
            
            // Beyond left/right bounds
            if (nextX < 0 || nextX >= this.cols) return true;
            // Floor bound
            if (nextY >= this.rows) return true;
            // Intersect filled blocks
            if (nextY >= 0 && this.grid[nextY][nextX] !== 0) return true;
          }
        }
      }
      return false;
    },
    moveLeft() {
      if (!this.hasStarted || this.gameOver) return;
      if (!this.checkCollision(this.currentX - 1, this.currentY, this.currentPiece)) {
        this.currentX--;
        this.draw();
      }
    },
    moveRight() {
      if (!this.hasStarted || this.gameOver) return;
      if (!this.checkCollision(this.currentX + 1, this.currentY, this.currentPiece)) {
        this.currentX++;
        this.draw();
      }
    },
    rotate() {
      if (!this.hasStarted || this.gameOver) return;
      
      // Transpose & Reverse to rotate matrix
      const rotated = Array.from({ length: this.currentPiece[0].length }, () => Array(this.currentPiece.length).fill(0));
      for (let r = 0; r < this.currentPiece.length; r++) {
        for (let c = 0; c < this.currentPiece[r].length; c++) {
          rotated[c][this.currentPiece.length - 1 - r] = this.currentPiece[r][c];
        }
      }
      
      // Wall kick logic: shift x-position slightly if block collides with walls when rotating
      let originalX = this.currentX;
      let offset = 0;
      
      if (this.checkCollision(this.currentX, this.currentY, rotated)) {
        // Try shifting left/right by 1 cell
        if (!this.checkCollision(this.currentX - 1, this.currentY, rotated)) {
          this.currentX--;
        } else if (!this.checkCollision(this.currentX + 1, this.currentY, rotated)) {
          this.currentX++;
        } else {
          return; // Skip rotation
        }
      }
      
      this.currentPiece = rotated;
      this.draw();
    },
    moveDown() {
      if (!this.hasStarted || this.gameOver) return;
      
      if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
        this.currentY++;
        this.draw();
      } else {
        this.lockPiece();
      }
    },
    hardDrop() {
      if (!this.hasStarted || this.gameOver) return;
      
      while (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
        this.currentY++;
      }
      this.lockPiece();
    },
    lockPiece() {
      for (let r = 0; r < this.currentPiece.length; r++) {
        for (let c = 0; c < this.currentPiece[r].length; c++) {
          if (this.currentPiece[r][c] !== 0) {
            this.grid[this.currentY + r][this.currentX + c] = this.currentPiece[r][c];
          }
        }
      }
      
      this.clearLines();
      this.spawnPiece();
      this.draw();
    },
    clearLines() {
      let lines = 0;
      
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r].every(val => val !== 0)) {
          // Remove row, inject empty at top
          this.grid.splice(r, 1);
          this.grid.unshift(Array(this.cols).fill(0));
          lines++;
          r++; // Check same row index again because array changed sizes
        }
      }
      
      if (lines > 0) {
        this.linesCleared += lines;
        // Scoring calculation rules: 1 line = 100, 2 lines = 300, 3 lines = 500, 4 lines (Tetris!) = 800
        const scoresTable = [0, 100, 300, 500, 800];
        this.score += scoresTable[lines] * this.level;
        
        // Level up for each 10 lines
        this.level = Math.floor(this.linesCleared / 10) + 1;
        this.startLoop();
      }
    },
    draw() {
      const canvas = this.$refs.tetrisCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      
      // Clean background
      ctx.fillStyle = "#0a0f1d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw subtle background grid lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.05)";
      ctx.lineWidth = 0.5;
      for (let r = 0; r <= this.rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * this.blockSize);
        ctx.lineTo(canvas.width, r * this.blockSize);
        ctx.stroke();
      }
      for (let c = 0; c <= this.cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * this.blockSize, 0);
        ctx.lineTo(c * this.blockSize, canvas.height);
        ctx.stroke();
      }
      
      // Draw grid locked blocks
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c] !== 0) {
            this.drawBlock(ctx, c, r, this.grid[r][c]);
          }
        }
      }
      
      // Draw falling piece
      if (this.currentPiece) {
        // Draw ghost / helper indicator of where the block will fall
        let ghostY = this.currentY;
        while (!this.checkCollision(this.currentX, ghostY + 1, this.currentPiece)) {
          ghostY++;
        }
        
        // Draw Ghost
        for (let r = 0; r < this.currentPiece.length; r++) {
          for (let c = 0; c < this.currentPiece[r].length; c++) {
            if (this.currentPiece[r][c] !== 0) {
              const x = (this.currentX + c) * this.blockSize;
              const y = (ghostY + r) * this.blockSize;
              ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
              ctx.lineWidth = 1.5;
              ctx.strokeRect(x + 2, y + 2, this.blockSize - 4, this.blockSize - 4);
            }
          }
        }
        
        // Draw active piece
        for (let r = 0; r < this.currentPiece.length; r++) {
          for (let c = 0; c < this.currentPiece[r].length; c++) {
            if (this.currentPiece[r][c] !== 0) {
              this.drawBlock(ctx, this.currentX + c, this.currentY + r, this.currentPiece[r][c]);
            }
          }
        }
      }
    },
    drawBlock(ctx, x, y, colorIdx) {
      const bx = x * this.blockSize;
      const by = y * this.blockSize;
      const size = this.blockSize;
      
      // Block base body
      ctx.fillStyle = this.colors[colorIdx];
      ctx.beginPath();
      ctx.roundRect(bx + 1, by + 1, size - 2, size - 2, 4);
      ctx.fill();
      
      // Soft Highlight overlay for retro block styling
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(bx + 2, by + 2, size - 4, 3);
      ctx.fillRect(bx + 2, by + 2, 3, size - 4);
      
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(bx + size - 4, by + 2, 2, size - 4);
      ctx.fillRect(bx + 2, by + size - 4, size - 4, 2);
    },
    endGame() {
      this.gameOver = true;
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
      }
    },
    handleKeyDown(event) {
      if (!this.hasStarted || this.gameOver) return;
      
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        this.moveLeft();
        event.preventDefault();
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        this.moveRight();
        event.preventDefault();
      } else if (event.code === "ArrowUp" || event.code === "Up" || event.code === "KeyW") {
        this.rotate();
        event.preventDefault();
      } else if (event.code === "ArrowDown" || event.code === "KeyS") {
        this.moveDown();
        event.preventDefault();
      } else if (event.code === "Space") {
        this.hardDrop();
        event.preventDefault();
      }
    }
  }
};
</script>
