<template>
  <div
    v-if="store.showGamesLobby"
    class="fixed inset-0 bg-slate-950 z-[99999] flex flex-col font-sans text-white select-none overflow-hidden animate-fade-in"
  >
    <!-- Top Stats Panel Bar (Cross-saving on cookie, cache, LocalStorage) -->
    <header class="w-full bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between shadow-lg">
      <!-- Top Left: Arrow Back Action -->
      <div class="flex items-center gap-3">
        <button
          @click="goBack"
          class="h-10 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl flex items-center gap-2 transition-all font-bold text-xs border-none cursor-pointer"
          id="btn-game-container-back"
        >
          <i class="bi bi-arrow-left text-sm font-black"></i>
          <span>Назад</span>
        </button>
        
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Развлечения</span>
          <h1 class="text-xs font-semibold text-slate-200 m-0">Игры Автосервиса (ERP)</h1>
        </div>
      </div>

      <!-- Top Right: Play Info Card (Profile, Who plays, Time) -->
      <div class="bg-slate-955 border border-indigo-500/15 rounded-xl px-3.5 py-1.5 flex items-center gap-3 shadow-inner">
        <div class="text-right flex flex-col justify-center">
          <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Профиль</span>
          <span class="text-[10px] font-extrabold text-slate-200 leading-none">@{{ user?.Username || 'Гость' }}</span>
        </div>
        <div class="w-px h-6 bg-slate-800"></div>
        <div class="text-right flex flex-col justify-center">
          <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Кто играет</span>
          <span class="text-[10px] font-extrabold text-indigo-400 leading-none truncate max-w-[100px]">{{ user?.Name || 'Аноним' }}</span>
        </div>
        <div class="w-px h-6 bg-slate-800"></div>
        <div class="text-center bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 min-w-[70px]">
          <i class="bi bi-clock-history text-cyan-400 text-xs animate-spin" style="animation-duration: 4s;"></i>
          <span class="text-[11px] font-extrabold font-mono text-cyan-400 leading-none">
            {{ formattedPlaytime }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Workspace Container -->
    <main class="flex-grow w-full overflow-y-auto relative flex flex-col items-center p-4">
      <!-- 1. Games Directory Selector Lobby grid -->
      <div v-if="!store.activeGameId" class="w-full max-w-4xl py-6 animate-fade-in">
        <div class="text-center mb-8">
          <span class="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-[9px] uppercase tracking-widest rounded-full">
            Досуг в перерывах
          </span>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2 font-heading">
            Выберите мини-игру
          </h2>
          <p class="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Отдохните от работы с клиентами и погрузитесь в классические захватывающие аркады, адаптированные под мобильный телефон!
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
          <!-- Game 1: Tetris -->
          <div
            @click="selectGame('tetris')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-indigo-600/30 rounded-3xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 group flex flex-col justify-between h-[180px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-16 h-16 bg-indigo-600/5 rounded-full filter blur-xl group-hover:bg-indigo-600/10 transition"></div>
            <div>
              <div class="w-11 h-11 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 text-xl mb-4 group-hover:scale-110 transition">
                <i class="bi bi-grid-3x3-gap-fill"></i>
              </div>
              <h3 class="text-base font-black tracking-tight text-slate-100 group-hover:text-indigo-400 transition m-0">Тетрис</h3>
              <p class="text-xs text-slate-400 mt-1 lines-2 leading-relaxed font-semibold">Классическая головоломка с падающими фигурами.</p>
            </div>
            <div class="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500 mt-4">
              <span>Соло</span>
              <span class="group-hover:text-indigo-400 transition flex items-center gap-1">Играть <i class="bi bi-arrow-right leading-none"></i></span>
            </div>
          </div>

          <!-- Game 2: Tic Tac Toe -->
          <div
            @click="selectGame('tictactoe')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-rose-600/30 rounded-3xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 group flex flex-col justify-between h-[180px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-16 h-16 bg-rose-600/5 rounded-full filter blur-xl group-hover:bg-rose-600/10 transition"></div>
            <div>
              <div class="w-11 h-11 bg-rose-600/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 text-xl mb-4 group-hover:scale-110 transition">
                <i class="bi bi-grid-3x3"></i>
              </div>
              <h3 class="text-base font-black tracking-tight text-slate-100 group-hover:text-rose-400 transition m-0">Крестики-Нолики</h3>
              <p class="text-xs text-slate-400 mt-1 lines-2 leading-relaxed font-semibold">Режимы против компьютера (AI) или против друга.</p>
            </div>
            <div class="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500 mt-4">
              <span>1 или 2 игрока</span>
              <span class="group-hover:text-rose-400 transition flex items-center gap-1">Играть <i class="bi bi-arrow-right leading-none"></i></span>
            </div>
          </div>

          <!-- Game 3: Snake -->
          <div
            @click="selectGame('snake')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-emerald-600/30 rounded-3xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 group flex flex-col justify-between h-[180px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-16 h-16 bg-emerald-600/5 rounded-full filter blur-xl group-hover:bg-emerald-600/10 transition"></div>
            <div>
              <div class="w-11 h-11 bg-emerald-600/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-xl mb-4 group-hover:scale-110 transition">
                <i class="bi bi-activity animate-pulse"></i>
              </div>
              <h3 class="text-base font-black tracking-tight text-slate-100 group-hover:text-emerald-400 transition m-0">Змейка</h3>
              <p class="text-xs text-slate-400 mt-1 lines-2 leading-relaxed font-semibold">Управляйте хвостом, съедайте пищу и побивайте рекорды.</p>
            </div>
            <div class="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500 mt-4">
              <span>Соло</span>
              <span class="group-hover:text-emerald-400 transition flex items-center gap-1">Играть <i class="bi bi-arrow-right leading-none"></i></span>
            </div>
          </div>

          <!-- Game 4: Hill Climb Motor -->
          <div
            @click="selectGame('hillclimb')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-teal-600/30 rounded-3xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 group flex flex-col justify-between h-[180px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-16 h-16 bg-teal-600/5 rounded-full filter blur-xl group-hover:bg-teal-600/10 transition"></div>
            <div>
              <div class="w-11 h-11 bg-teal-600/10 border border-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 text-xl mb-4 group-hover:scale-110 transition">
                <i class="bi bi-bicycle"></i>
              </div>
              <h3 class="text-base font-black tracking-tight text-slate-100 group-hover:text-teal-400 transition m-0">Hill Climb Moto</h3>
              <p class="text-xs text-slate-400 mt-1 lines-2 leading-relaxed font-semibold">2D Холмы, баланс наклона мотоцикла, сбор монет и баков с бензином.</p>
            </div>
            <div class="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500 mt-4">
              <span>Физика холмов</span>
              <span class="group-hover:text-teal-400 transition flex items-center gap-1">Играть <i class="bi bi-arrow-right leading-none"></i></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Active Game Container view -->
      <div v-else class="w-full max-w-lg h-full flex flex-col justify-between items-center relative animate-scale-up">
        <div class="w-full flex-grow relative bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <!-- Nested active games router -->
          <div class="flex-grow">
            <Tetris v-if="store.activeGameId === 'tetris'" />
            <TicTacToe v-else-if="store.activeGameId === 'tictactoe'" />
            <Snake v-else-if="store.activeGameId === 'snake'" />
            <HillClimb v-else-if="store.activeGameId === 'hillclimb'" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import Tetris from "./Tetris/Tetris.vue";
import TicTacToe from "./TicTacToe/TicTacToe.vue";
import Snake from "./Snake/Snake.vue";
import HillClimb from "./HillClimb/HillClimb.vue";

export default {
  components: {
    Tetris,
    TicTacToe,
    Snake,
    HillClimb
  },
  data() {
    return {
      playtimeSeconds: Number(localStorage.getItem("game_playtime_seconds")) || 0,
      timerInterval: null
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    user() {
      return this.store.user;
    },
    formattedPlaytime() {
      const hrs = Math.floor(this.playtimeSeconds / 3600);
      const mins = Math.floor((this.playtimeSeconds % 3600) / 60);
      const secs = this.playtimeSeconds % 60;
      
      const pad = (num) => String(num).padStart(2, "0");
      if (hrs > 0) {
        return `${hrs}:${pad(mins)}:${pad(secs)}`;
      }
      return `${pad(mins)}:${pad(secs)}`;
    }
  },
  watch: {
    // Start/Stop persistent timer logic when lobby is toggled on/off
    "store.showGamesLobby"(newVal) {
      if (newVal) {
        this.startSessionTimer();
      } else {
        this.stopSessionTimer();
      }
    }
  },
  mounted() {
    if (this.store.showGamesLobby) {
      this.startSessionTimer();
    }
  },
  beforeUnmount() {
    this.stopSessionTimer();
  },
  methods: {
    selectGame(gameId) {
      this.store.setActiveGameId(gameId);
    },
    goBack() {
      if (this.store.activeGameId) {
        // If inside a game, go back to lobby
        this.store.setActiveGameId(null);
      } else {
        // If inside lobby, close games overlay
        this.store.toggleGamesLobby(false);
      }
    },
    startSessionTimer() {
      this.stopSessionTimer();
      this.timerInterval = setInterval(() => {
        this.playtimeSeconds++;
        this.persistPlaytimeInfo();
      }, 1000);
    },
    stopSessionTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    persistPlaytimeInfo() {
      const username = this.user?.Username || "guest";
      const fullName = this.user?.Name || "anonymous";
      const totalTimeStr = String(this.playtimeSeconds);

      // 1. Persist to Local Storage
      localStorage.setItem("game_playtime_seconds", totalTimeStr);
      localStorage.setItem("game_last_player_username", username);
      localStorage.setItem("game_last_player_fullname", fullName);

      // 2. Persist to Cookies
      document.cookie = `game_playtime_seconds=${encodeURIComponent(totalTimeStr)};path=/;max-age=31536000`;
      document.cookie = `game_player_username=${encodeURIComponent(username)};path=/;max-age=31536000`;
      document.cookie = `game_player_fullname=${encodeURIComponent(fullName)};path=/;max-age=31536000`;

      // 3. Persist into the Cache Storage API
      if ("caches" in window) {
        const urlToCache = "/games/session-history-api";
        const customResponse = new Response(
          JSON.stringify({
            username: username,
            fullName: fullName,
            playtimeSeconds: this.playtimeSeconds,
            lastSavedAt: new Date().toISOString()
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "X-Cache-Generator": "AutoService-ERP-Games-Core"
            }
          }
        );
        caches.open("games-data-cache").then((cache) => {
          cache.put(urlToCache, customResponse);
        }).catch(err => {
          console.debug("Cache write skipped", err);
        });
      }
    }
  }
};
</script>

<style scoped>
/* Key animations for gaming container */
.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes scaleUp {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
