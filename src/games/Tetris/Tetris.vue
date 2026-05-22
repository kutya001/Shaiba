<template>
  <div
    class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Game Header: Score, Lines, Level -->
    <div class="w-full grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-inner mb-2 text-center">
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

    <!-- Active Area: Main Tetris Viewport Expanded -->
    <div class="flex-grow w-full max-w-[320px] flex items-center justify-center relative my-1">
      <canvas
        ref="tetrisCanvas"
        class="border-2 border-slate-850 rounded-2xl bg-slate-900/40 shadow-2xl w-full"
        width="280"
        height="560"
        style="max-height: 52vh; aspect-ratio: 10/20;"
      ></canvas>

      <!-- Game Over Modal overlay -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20"
      >
        <div class="w-14 h-14 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4">
          <i class="bi bi-exclamation-triangle-fill text-2xl"></i>
        </div>
        <h2 class="text-xl font-black text-white mb-1 tracking-tight font-heading uppercase">
          Игра окончена
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-4">
          Счёт: <span class="text-emerald-400 font-bold font-mono">{{ score }}</span> | Линии: <span class="text-indigo-400 font-bold font-mono">{{ linesCleared }}</span>
        </p>
        <button
          @click="restartGame"
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md cursor-pointer active:scale-95 animate-pulse"
        >
          Начать заново
        </button>
      </div>

      <!-- Play / Pause Overlay -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20"
      >
        <div class="w-14 h-14 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center text-indigo-400 mb-4">
          <i class="bi bi-grid-3x3-gap-fill text-2xl animate-spin" style="animation-duration: 6s"></i>
        </div>
        <h2 class="text-base font-black text-white mb-1 font-heading uppercase tracking-wide">
          Тетрис Про
        </h2>
        <p class="text-[10px] font-semibold text-slate-400 max-w-[200px] mb-5 leading-relaxed">
          Бескнопочное управление жестами! <br />
          <span class="text-indigo-400">Касание</span> — Повернуть фигуру <br />
          <span class="text-indigo-400">Свайп влево/вправо</span> — Движение <br />
          <span class="text-indigo-400">Ведение вниз медленно</span> — Быстрый спуск <br />
          <span class="text-indigo-400">Резкий свайп вниз</span> — Бросить (Drop)
        </p>
        <button
          @click="startGame"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md cursor-pointer active:scale-95"
        >
          ПОЕХАЛИ!
        </button>
      </div>
    </div>

    <!-- Instructions banner info -->
    <div class="w-full max-w-[320px] py-2 px-3 bg-slate-900 border border-slate-800/60 rounded-2xl text-center text-slate-400 text-[10px] font-semibold leading-normal shrink-0">
      <i class="bi bi-hand-index-thumb text-indigo-400 mr-1 text-xs"></i> 
      Управляйте <span class="text-slate-200">Свайпами по экрану</span> или стрелками клавиатуры. ТАП — поворот.
    </div>
  </div>
</template>

<script>
import { playSound } from "../../utils/audioHelper";

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
      blockSize: 28, // Matches 280 width / 10 cols
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
      ],

      // Interaction State
      touchStart: { x: 0, y: 0, time: 0 },
      touchLast: { x: 0, y: 0 },
      isSwipeAction: false
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
      ctx.fillStyle = "#0a0f1d";
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
      playSound.levelUp();
    },
    restartGame() {
      this.startGame();
    },
    startLoop() {
      if (this.gameInterval) clearInterval(this.gameInterval);
      const speed = Math.max(100, 800 - (this.level - 1) * 80);
      this.gameInterval = setInterval(() => {
        this.moveDown(true); // game step auto descend
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
        playSound.tick();
      }
    },
    moveRight() {
      if (!this.hasStarted || this.gameOver) return;
      if (!this.checkCollision(this.currentX + 1, this.currentY, this.currentPiece)) {
        this.currentX++;
        this.draw();
        playSound.tick();
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
      playSound.rotate();
    },
    moveDown(isAuto = false) {
      if (!this.hasStarted || this.gameOver) return;
      
      if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
        this.currentY++;
        this.draw();
        if (!isAuto) playSound.tick();
      } else {
        this.lockPiece();
      }
    },
    hardDrop() {
      if (!this.hasStarted || this.gameOver) return;
      
      let cellsDropped = 0;
      while (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
        this.currentY++;
        cellsDropped++;
      }
      this.lockPiece();
      playSound.score(); // crisp landing sound
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

        // Level clearing rewarding chime
        playSound.levelUp();
      }
    },
    draw() {
      const canvas = this.$refs.tetrisCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      
      // Clean background
      ctx.fillStyle = "#0c1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw subtle background grid lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
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
      
      // Draw grid locked blocks (No gaps to look completely cohesive/solid!)
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
        
        // Draw Ghost Shape indicators
        for (let r = 0; r < this.currentPiece.length; r++) {
          for (let c = 0; c < this.currentPiece[r].length; c++) {
            if (this.currentPiece[r][c] !== 0) {
              const x = (this.currentX + c) * this.blockSize;
              const y = (ghostY + r) * this.blockSize;
              ctx.strokeStyle = "rgba(99, 102, 241, 0.22)";
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, this.blockSize, this.blockSize);
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
      
      // Block base body - perfectly fitted and solid!
      ctx.fillStyle = this.colors[colorIdx];
      ctx.fillRect(bx, by, size, size);
      
      // Sleek sleek inner neon glow highlights
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillRect(bx, by, size, 2);
      ctx.fillRect(bx, by, 2, size);
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(bx + size - 2, by, 2, size);
      ctx.fillRect(bx, by + size - 2, size, 2);
    },
    endGame() {
      this.gameOver = true;
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
      }
      playSound.gameOver();
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
    },

    // Vue touch gesture controls mapping
    onTouchStart(e) {
      if (!this.hasStarted || this.gameOver) return;
      const touch = e.touches[0];
      this.touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      this.touchLast = {
        x: touch.clientX,
        y: touch.clientY
      };
      this.isSwipeAction = false;
    },
    onTouchMove(e) {
      if (!this.hasStarted || this.gameOver) return;
      if (e.cancelable) e.preventDefault();
      
      const touch = e.touches[0];
      const totalDx = touch.clientX - this.touchStart.x;
      const totalDy = touch.clientY - this.touchStart.y;
      
      // Columns shift controls left/right
      if (Math.abs(totalDx) > 30) {
        this.isSwipeAction = true;
        if (totalDx > 0) {
          this.moveRight();
        } else {
          this.moveLeft();
        }
        // Advance starting pointer so subsequent slide moves it again
        this.touchStart.x = touch.clientX;
      }
      
      // Move down slowly
      if (totalDy > 25) {
        this.isSwipeAction = true;
        this.moveDown();
        this.touchStart.y = touch.clientY;
      }
      
      this.touchLast.x = touch.clientX;
      this.touchLast.y = touch.clientY;
    },
    onTouchEnd(e) {
      if (!this.hasStarted || this.gameOver) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;
      const deltaTime = Date.now() - this.touchStart.time;
      
      // Quick swipe down = HARD DROP
      if (deltaY > 60 && deltaTime < 200) {
        this.hardDrop();
        return;
      }
      
      // TAP = ROTATE
      const totalDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (totalDist < 12 && deltaTime < 220 && !this.isSwipeAction) {
        this.rotate();
      }
    }
  }
};
</script>

<style scoped>
/* Key animations for Tetris */
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
