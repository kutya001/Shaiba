<template>
  <div class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
    <!-- Game Stats Panel -->
    <div class="w-full space-y-2 mb-2">
      <div class="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-inner text-center">
        <div>
          <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Счет</span>
          <span class="text-base font-extrabold font-mono text-cyan-400">{{ score }}</span>
        </div>
        <div>
          <span class="block text-[8px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Рекорд</span>
          <span class="text-base font-extrabold font-mono text-amber-400">
            <i class="bi bi-trophy-fill text-amber-500 mr-1"></i>{{ highscore }}
          </span>
        </div>
        <div>
          <span class="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Лимит</span>
          <span class="text-base font-extrabold font-mono text-indigo-400">2048</span>
        </div>
      </div>
    </div>

    <!-- Active Grid Arena -->
    <div class="flex-grow w-full max-w-sm flex items-center justify-center relative my-1">
      <div class="relative w-full aspect-square bg-slate-900 border-2 border-slate-800 rounded-3xl p-3 grid grid-cols-4 grid-rows-4 gap-2 shadow-2xl">
        <!-- Grid Cells Background -->
        <div v-for="n in 16" :key="'bg-' + n" class="bg-slate-950/60 rounded-xl border border-slate-800/40"></div>

        <!-- Float actual tiles overlay -->
        <div class="absolute inset-0 p-3 grid grid-cols-4 grid-rows-4 gap-2 z-10">
          <div
            v-for="(row, rIndex) in grid"
            :key="'row-' + rIndex"
            class="contents"
          >
            <div
              v-for="(item, cIndex) in row"
              :key="'cell-' + rIndex + '-' + cIndex"
              class="relative flex items-center justify-center rounded-xl font-black transition-all duration-150 transform text-lg md:text-xl overflow-hidden shadow-md"
              :class="getTileClass(item)"
              :style="item > 0 ? 'animation: popTile 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' : ''"
            >
              <span v-if="item > 0">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Over overlay panel -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20"
      >
        <div class="w-14 h-14 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <i class="bi bi-exclamation-triangle-fill text-2xl"></i>
        </div>
        <h2 class="text-xl font-black text-white mb-1 tracking-tight font-heading uppercase">
          Конец игры!
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-4">
          Вы набрали: <span class="text-cyan-400 font-bold font-mono">{{ score }}</span> очков
        </p>
        <button
          @click="restartGame"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md cursor-pointer active:scale-95"
        >
          Попробовать снова
        </button>
      </div>

      <!-- Won overlay panel -->
      <div
        v-if="hasWon && !continuePlaying"
        class="absolute inset-0 bg-indigo-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20"
      >
        <div class="w-14 h-14 bg-amber-500/10 border border-amber-500/25 rounded-full flex items-center justify-center text-amber-400 mb-4 animate-bounce">
          <i class="bi bi-star-fill text-2xl"></i>
        </div>
        <h2 class="text-xl font-black text-white mb-1 tracking-tight font-heading uppercase">
          Победа! 2048!
        </h2>
        <p class="text-xs font-semibold text-slate-300 mb-4 leading-relaxed">
          Поздравляем! Вы собрали легендарную плашку 2048!
        </p>
        <div class="flex gap-2 w-full max-w-[240px]">
          <button
            @click="continuePlaying = true"
            class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-[10px] transition border-none cursor-pointer"
          >
            Продолжить
          </button>
          <button
            @click="restartGame"
            class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] transition border-none cursor-pointer shadow"
          >
            Сначала
          </button>
        </div>
      </div>
    </div>

    <!-- Instructions banner -->
    <div class="w-full py-2 px-3 bg-slate-900 border border-slate-800/60 rounded-2xl text-center text-slate-400 text-[10px] font-semibold leading-relaxed shrink-0">
      <i class="bi bi-hand-index-thumb text-indigo-400 mr-1 text-xs"></i> 
      Используйте <span class="text-slate-200">Свайпы</span> на экране или <span class="text-slate-200">Стрелки клавиатуры</span> для управления.
    </div>
  </div>
</template>

<script>
import { playSound } from "../../utils/audioHelper";

export default {
  data() {
    return {
      grid: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      score: 0,
      highscore: Number(localStorage.getItem("game_2048_highscore")) || 0,
      gameOver: false,
      hasWon: false,
      continuePlaying: false,
      touchStart: { x: 0, y: 0 },
    };
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    this.restartGame();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    restartGame() {
      this.grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      this.score = 0;
      this.gameOver = false;
      this.hasWon = false;
      this.continuePlaying = false;
      this.addRandomTile();
      this.addRandomTile();
    },
    addRandomTile() {
      const emptyCells = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (this.grid[r][c] === 0) {
            emptyCells.push({ r, c });
          }
        }
      }
      if (emptyCells.length > 0) {
        const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[rand.r][rand.c] = Math.random() < 0.9 ? 2 : 4;
      }
    },
    getTileClass(val) {
      if (!val) return "bg-transparent";
      switch (val) {
        case 2: return "bg-slate-800 text-cyan-400 border border-cyan-500/20";
        case 4: return "bg-slate-800 text-teal-400 border border-teal-500/20";
        case 8: return "bg-indigo-950 text-indigo-400 border border-indigo-500/40";
        case 16: return "bg-indigo-900 text-indigo-300 border border-indigo-400/50";
        case 32: return "bg-violet-950 text-violet-400 border border-violet-500/40 font-extrabold";
        case 64: return "bg-violet-900 text-violet-300 border border-violet-400/55 font-extrabold";
        case 128: return "bg-pink-950 text-pink-400 border border-pink-500/50 shadow-inner font-extrabold text-base";
        case 256: return "bg-pink-900 text-pink-300 border border-pink-400/60 shadow font-extrabold text-base";
        case 512: return "bg-emerald-950 text-emerald-400 border border-emerald-500/60 shadow-md font-extrabold text-base";
        case 1024: return "bg-amber-950/90 text-amber-400 border border-amber-500/70 shadow-lg font-extrabold text-sm";
        case 2048: return "bg-amber-500 text-slate-950 border-2 border-white shadow-xl font-extrabold text-sm animate-pulse";
        default: return "bg-red-900 text-white border border-red-500 shadow-2xl font-black text-xs";
      }
    },
    handleKeyDown(e) {
      if (this.gameOver) return;
      let moved = false;
      if (e.key === "ArrowUp" || e.key === "KeyW") {
        moved = this.moveUp();
      } else if (e.key === "ArrowDown" || e.key === "KeyS") {
        moved = this.moveDown();
      } else if (e.key === "ArrowLeft" || e.key === "KeyA") {
        moved = this.moveLeft();
      } else if (e.key === "ArrowRight" || e.key === "KeyD") {
        moved = this.moveRight();
      }

      if (moved) {
        e.preventDefault();
        playSound.tick();
        this.addRandomTile();
        this.checkGameOver();
      }
    },
    onTouchStart(e) {
      if (this.gameOver) return;
      this.touchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    },
    onTouchMove(e) {
      // Prevent screen bouncing on touch swipe
      if (e.cancelable) e.preventDefault();
    },
    onTouchEnd(e) {
      if (this.gameOver) return;
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      let moved = false;
      if (Math.max(absX, absY) > 30) {
        if (absX > absY) {
          if (dx > 0) {
            moved = this.moveRight();
          } else {
            moved = this.moveLeft();
          }
        } else {
          if (dy > 0) {
            moved = this.moveDown();
          } else {
            moved = this.moveUp();
          }
        }
      }

      if (moved) {
        playSound.tick();
        this.addRandomTile();
        this.checkGameOver();
      }
    },
    moveLeft() {
      return this.slideAndMerge((row) => this.mergeLine(row));
    },
    moveRight() {
      return this.slideAndMerge((row) => {
        const rev = [...row].reverse();
        const merged = this.mergeLine(rev);
        return merged.reverse();
      });
    },
    moveUp() {
      return this.slideAndMergeCol((col) => this.mergeLine(col));
    },
    moveDown() {
      return this.slideAndMergeCol((col) => {
        const rev = [...col].reverse();
        const merged = this.mergeLine(rev);
        return merged.reverse();
      });
    },
    slideAndMerge(rowTransformer) {
      let changed = false;
      const nextGrid = [];
      for (let r = 0; r < 4; r++) {
        const transformed = rowTransformer(this.grid[r]);
        if (JSON.stringify(transformed) !== JSON.stringify(this.grid[r])) {
          changed = true;
        }
        nextGrid.push(transformed);
      }
      this.grid = nextGrid;
      return changed;
    },
    slideAndMergeCol(colTransformer) {
      let changed = false;
      const nextGrid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      for (let c = 0; c < 4; c++) {
        const col = [this.grid[0][c], this.grid[1][c], this.grid[2][c], this.grid[3][c]];
        const transformed = colTransformer(col);
        if (JSON.stringify(transformed) !== JSON.stringify(col)) {
          changed = true;
        }
        for (let r = 0; r < 4; r++) {
          nextGrid[r][c] = transformed[r];
        }
      }
      this.grid = nextGrid;
      return changed;
    },
    mergeLine(line) {
      // 1. Filter zeros out
      let numbers = line.filter((v) => v !== 0);
      let merged = [];
      let i = 0;
      while (i < numbers.length) {
        if (i + 1 < numbers.length && numbers[i] === numbers[i + 1]) {
          // Double score combo
          const doubleVal = numbers[i] * 2;
          merged.push(doubleVal);
          this.score += doubleVal;
          i += 2;

          // Sound effects match chime
          playSound.score();

          // High score monitoring
          if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem("game_2048_highscore", this.highscore);
          }

          if (doubleVal === 2048) {
            this.hasWon = true;
            playSound.levelUp();
          }
        } else {
          merged.push(numbers[i]);
          i++;
        }
      }
      // Fill remaining spots with 0
      while (merged.length < 4) {
        merged.push(0);
      }
      return merged;
    },
    checkGameOver() {
      // Match moves check
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (this.grid[r][c] === 0) return; // empty spots exist
          if (r < 3 && this.grid[r][c] === this.grid[r + 1][c]) return; // valid vertical merge
          if (c < 3 && this.grid[r][c] === this.grid[r][c + 1]) return; // valid horizontal merge
        }
      }
      // Game over fully satisfied
      this.gameOver = true;
      playSound.gameOver();
    },
  },
};
</script>

<style scoped>
@keyframes popTile {
  0% {
    transform: scale(0.85);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
