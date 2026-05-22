<template>
  <div class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none">
    <!-- Game Header: Mode Selection and Scoreboard -->
    <div class="w-full space-y-3 mb-2">
      <!-- Mode Toggle Switch -->
      <div class="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
        <button
          type="button"
          @click="selectMode('AI')"
          class="flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer border-none"
          :class="gameMode === 'AI' ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-slate-400 hover:text-white'"
        >
          <i class="bi bi-cpu text-xs mr-1"></i> Против ПК
        </button>
        <button
          type="button"
          @click="selectMode('PVP')"
          class="flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer border-none"
          :class="gameMode === 'PVP' ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-slate-400 hover:text-white'"
        >
          <i class="bi bi-people text-xs mr-1"></i> 2 Игрока
        </button>
      </div>

      <!-- Turn & Score indicators -->
      <div class="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-inner">
        <div class="text-center">
          <span class="block text-[8px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Крестики (X)</span>
          <span class="text-base font-extrabold font-mono text-rose-400">{{ scores.X }}</span>
        </div>
        <div class="text-center flex flex-col justify-center items-center">
          <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ход</span>
          <span
            v-if="!winner && !isCat"
            class="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
            :class="currentPlayer === 'X' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'"
          >
            Игрок {{ currentPlayer }}
          </span>
          <span v-else class="text-[10px] font-bold text-slate-450 uppercase">Конец</span>
        </div>
        <div class="text-center">
          <span class="block text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-0.5">Нолики (O)</span>
          <span class="text-base font-extrabold font-mono text-cyan-400">{{ scores.O }}</span>
        </div>
      </div>
    </div>

    <!-- The 3x3 Grid Board -->
    <div class="flex-grow w-full max-w-[340px] flex items-center justify-center relative my-3">
      <div class="w-full aspect-square grid grid-cols-3 grid-rows-3 gap-3 bg-slate-950 p-1.5 rounded-3xl border-2 border-slate-800 shadow-2xl relative">
        <button
          v-for="(cell, idx) in board"
          :key="idx"
          @click="makeMove(idx)"
          type="button"
          class="bg-slate-900 border border-slate-800/80 rounded-2xl flex items-center justify-center transition-all duration-200 outline-none cursor-pointer focus:outline-none relative hover:border-slate-700/80"
          :class="{
            'scale-95': cell !== '',
            'bg-slate-900/40 pointer-events-none': cell !== '' || winner || isCat,
            'shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/20': cell === 'X',
            'shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/20': cell === 'O',
            'opacity-40': winnerCombination && !winnerCombination.includes(idx)
          }"
        >
          <!-- Animated SVG icons for smooth visual feel -->
          <!-- Cross 'X' inside button -->
          <svg
            v-if="cell === 'X'"
            class="w-3/5 h-3/5 text-rose-500 stroke-rose-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" class="animate-draw-x1"></line>
            <line x1="6" y1="6" x2="18" y2="18" class="animate-draw-x2"></line>
          </svg>

          <!-- Nought 'O' inside button -->
          <svg
            v-else-if="cell === 'O'"
            class="w-3/5 h-3/5 text-cyan-400 stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="9" class="animate-draw-o"></circle>
          </svg>
        </button>

        <!-- Overlay on Win or Tie -->
        <div
          v-if="winner || isCat"
          class="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20"
        >
          <!-- Win states -->
          <template v-if="winner">
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-2xl border"
              :class="winner === 'X' ? 'bg-rose-500/10 text-rose-500 border-rose-500/25 shadow-lg shadow-rose-950/40' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 shadow-lg shadow-cyan-950/40'"
            >
              <i v-if="winner === 'X'" class="bi bi-x-lg font-black"></i>
              <i v-else class="bi bi-circle font-black"></i>
            </div>
            <h2 class="text-xl font-black text-white mb-1 tracking-tight font-heading">
              ПОБЕДА!
            </h2>
            <p class="text-xs font-bold text-slate-400 mb-5">
              Игрок <span :class="winner === 'X' ? 'text-rose-400' : 'text-cyan-400'">"{{ winner }}"</span> выиграл этот раунд
            </p>
          </template>

          <!-- Tie state -->
          <template v-else-if="isCat">
            <div class="w-14 h-14 bg-slate-800/50 border border-slate-700/50 rounded-full flex items-center justify-center mb-4 text-slate-400 text-xl">
              <i class="bi bi-hand-thumbs-up"></i>
            </div>
            <h2 class="text-xl font-black text-white mb-1 tracking-tight font-heading">
              НИЧЬЯ!
            </h2>
            <p class="text-xs font-bold text-slate-400 mb-5">
              Оба игрока показали отличный результат
            </p>
          </template>

          <button
            @click="resetBoard"
            class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md shadow-indigo-500/35 cursor-pointer active:scale-95"
          >
            Играть дальше
          </button>
        </div>
      </div>
    </div>

    <!-- Play actions footer -->
    <div class="w-full shrink-0 flex gap-3 mt-1.5 select-none">
      <button
        @click="clearScores"
        type="button"
        class="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-450 hover:text-white rounded-2xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
      >
        <i class="bi bi-eraser-fill text-xs text-rose-400"></i> Сбросить счёт
      </button>

      <button
        @click="resetBoard"
        v-if="!winner && !isCat"
        type="button"
        class="flex-1 py-3 bg-teal-650/10 border border-teal-500/30 text-teal-400 hover:text-white rounded-2xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
      >
        <i class="bi bi-arrow-counterclockwise text-xs"></i> Начать заново
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      gameMode: "AI", // 'AI' vs 'PVP'
      board: Array(9).fill(""),
      currentPlayer: "X",
      winner: null,
      winnerCombination: null,
      isCat: false,
      isAiThinking: false,
      scores: {
        X: Number(localStorage.getItem("game_tictactoe_scores_x")) || 0,
        O: Number(localStorage.getItem("game_tictactoe_scores_o")) || 0,
      },
      winningCombos: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
      ]
    };
  },
  methods: {
    selectMode(mode) {
      this.gameMode = mode;
      this.resetBoard();
      this.clearScores();
    },
    makeMove(idx) {
      if (this.board[idx] !== "" || this.winner || this.isCat || this.isAiThinking) return;

      this.board[idx] = this.currentPlayer;
      this.checkState();

      if (!this.winner && !this.isCat) {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        
        if (this.gameMode === "AI" && this.currentPlayer === "O") {
          this.triggerAiMove();
        }
      }
    },
    triggerAiMove() {
      this.isAiThinking = true;
      setTimeout(() => {
        const bestMove = this.getBestMove();
        if (bestMove !== null && bestMove !== undefined) {
          this.board[bestMove] = "O";
          this.checkState();
          if (!this.winner && !this.isCat) {
            this.currentPlayer = "X";
          }
        }
        this.isAiThinking = false;
      }, 500); // Tiny artificial timeout for polish
    },
    getBestMove() {
      // 1. Win if possible
      for (let combo of this.winningCombos) {
        let countO = 0;
        let emptyIdx = -1;
        for (let idx of combo) {
          if (this.board[idx] === "O") countO++;
          else if (this.board[idx] === "") emptyIdx = idx;
        }
        if (countO === 2 && emptyIdx !== -1) return emptyIdx;
      }

      // 2. Block opposing wins
      for (let combo of this.winningCombos) {
        let countX = 0;
        let emptyIdx = -1;
        for (let idx of combo) {
          if (this.board[idx] === "X") countX++;
          else if (this.board[idx] === "") emptyIdx = idx;
        }
        if (countX === 2 && emptyIdx !== -1) return emptyIdx;
      }

      // 3. Take Center
      if (this.board[4] === "") return 4;

      // 4. Take corners
      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter(idx => this.board[idx] === "");
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }

      // 5. Take any empty
      const emptySectors = [];
      this.board.forEach((val, idx) => {
        if (val === "") emptySectors.push(idx);
      });
      if (emptySectors.length > 0) {
        return emptySectors[Math.floor(Math.random() * emptySectors.length)];
      }

      return null;
    },
    checkState() {
      // Check Winners
      for (let combo of this.winningCombos) {
        const [a, b, c] = combo;
        if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
          this.winner = this.board[a];
          this.winnerCombination = combo;
          this.scores[this.winner]++;
          this.persistScores();
          return;
        }
      }

      // Check Ties
      if (this.board.every(cell => cell !== "")) {
        this.isCat = true;
      }
    },
    resetBoard() {
      this.board = Array(9).fill("");
      this.currentPlayer = "X";
      this.winner = null;
      this.winnerCombination = null;
      this.isCat = false;
      this.isAiThinking = false;
    },
    clearScores() {
      this.scores.X = 0;
      this.scores.O = 0;
      this.persistScores();
    },
    persistScores() {
      localStorage.setItem("game_tictactoe_scores_x", this.scores.X);
      localStorage.setItem("game_tictactoe_scores_o", this.scores.O);
    }
  }
};
</script>

<style scoped>
/* Animated draw paths for vector feel */
.animate-draw-x1 {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: drawLine 0.18s forwards ease-out;
}
.animate-draw-x2 {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: drawLine 0.18s forwards ease-out 0.12s;
}
.animate-draw-o {
  stroke-dasharray: 58;
  stroke-dashoffset: 58;
  animation: drawLine 0.28s forwards ease-in-out;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
