<template>
  <div
    v-if="store.showGamesLobby"
    class="fixed inset-0 bg-slate-950 z-[99999] flex flex-col font-sans text-white select-none overflow-hidden animate-fade-in"
  >
    <!-- Top Stats Panel Bar (Cross-saving on cookie, cache, LocalStorage) -->
    <header class="w-full bg-slate-900 border-b border-slate-800 px-3 py-2 shrink-0 flex items-center justify-between shadow-lg">
      <!-- Top Left: Arrow Back Action - compact icon only -->
      <div class="flex items-center gap-2">
        <button
          @click="goBack"
          class="h-9 w-9 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl flex items-center justify-center transition-all font-bold border-none cursor-pointer"
          id="btn-game-container-back"
          title="Назад"
        >
          <i class="bi bi-arrow-left text-lg font-black animate-pulse"></i>
        </button>
        
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Развлечения</span>
          <h1 class="text-xs font-semibold text-slate-200 m-0 leading-none">Игры ERP</h1>
        </div>
      </div>

      <!-- Top Right: Play Info Card (Profile, Who plays, Time) - very compact -->
      <div class="bg-slate-950/60 border border-indigo-500/15 rounded-xl px-2 py-1 flex items-center gap-2 shadow-inner">
        <div class="text-right flex flex-col justify-center leading-none">
          <span class="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Профиль</span>
          <span class="text-[9px] font-extrabold text-slate-300">@{{ user?.Username || 'Гость' }}</span>
        </div>
        <div class="w-px h-5 bg-slate-800"></div>
        <div class="text-right flex flex-col justify-center leading-none">
          <span class="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Играет</span>
          <span class="text-[9px] font-extrabold text-indigo-400 truncate max-w-[80px]">{{ user?.Name || 'Аноним' }}</span>
        </div>
        <div class="w-px h-5 bg-slate-800"></div>
        <div class="text-center bg-slate-900/50 px-1.5 py-0.5 rounded-lg border border-slate-800 flex items-center gap-1 min-w-[55px]">
          <i class="bi bi-clock-history text-cyan-400 text-[10px] animate-spin" style="animation-duration: 4s;"></i>
          <span class="text-[10px] font-extrabold font-mono text-cyan-400 leading-none">
            {{ formattedPlaytime }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Workspace Container -->
    <main class="flex-grow w-full overflow-y-auto relative flex flex-col items-center p-3">
      <!-- 1. Games Directory Selector Lobby grid - compact layout -->
      <div v-if="!store.activeGameId" class="w-full max-w-4xl py-2 sm:py-4 animate-fade-in">
        <div class="text-center mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-black tracking-tight text-white m-0 font-heading">
            Игротека ERP
          </h2>
          <p class="text-[10px] sm:text-xs text-slate-400 max-w-md mx-auto mt-1 leading-snug">
            Отвлекитесь от работы за кассой и клиентами! Реактивный досуг в единой космической стилистике.
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 px-1.5">
          <!-- Game 1: Tetris -->
          <div
            @click="selectGame('tetris')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-indigo-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[115px] sm:h-[130px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-indigo-600/5 rounded-full filter blur-md group-hover:bg-indigo-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-indigo-600/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-grid-3x3-gap-fill"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-indigo-400 transition m-0">Тетрис</h3>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-snug font-semibold line-clamp-2">Падающие фигуры и свайпы</p>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Соло</span>
              <span class="group-hover:text-indigo-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- Game 2: Tic Tac Toe -->
          <div
            @click="selectGame('tictactoe')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-rose-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[115px] sm:h-[130px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-rose-600/5 rounded-full filter blur-md group-hover:bg-rose-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-rose-600/10 border border-rose-500/20 rounded-lg flex items-center justify-center text-rose-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-grid-3x3"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-rose-400 transition m-0">Крестики</h3>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-snug font-semibold line-clamp-2">Против AI или соседа</p>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Дуэль</span>
              <span class="group-hover:text-rose-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- Game 3: Snake -->
          <div
            @click="selectGame('snake')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-emerald-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[115px] sm:h-[130px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-emerald-600/5 rounded-full filter blur-md group-hover:bg-emerald-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-emerald-600/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-activity animate-pulse"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-emerald-400 transition m-0">Змейка</h3>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-snug font-semibold line-clamp-2">Собирайте детальки</p>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Аркада</span>
              <span class="group-hover:text-emerald-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- Game 4: Hill Climb Motor -->
          <div
            @click="selectGame('hillclimb')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-teal-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[115px] sm:h-[130px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-teal-600/5 rounded-full filter blur-md group-hover:bg-teal-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-teal-600/10 border border-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-bicycle"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-teal-400 transition m-0">Мотоциклист</h3>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-snug font-semibold line-clamp-2">Реалистичные холмы и баланс</p>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Физика</span>
              <span class="group-hover:text-teal-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- NEW Game 5: 2048 -->
          <div
            @click="selectGame('game2048')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-amber-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[115px] sm:h-[130px] shadow-lg relative overflow-hidden grid-col"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-amber-600/5 rounded-full filter blur-md group-hover:bg-amber-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-amber-600/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-plus-square-fill"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-amber-400 transition m-0">2048</h3>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-snug font-semibold line-clamp-2">Складывайте числа свайпами</p>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Числа</span>
              <span class="group-hover:text-amber-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- NEW Game 6: Block Blast -->
          <div
            @click="selectGame('blockblast')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-orange-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[115px] sm:h-[130px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-orange-600/5 rounded-full filter blur-md group-hover:bg-orange-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-orange-600/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-orange-450 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <span class="material-symbols-outlined text-[16px] text-orange-400 leading-none">local_fire_department</span>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-orange-400 transition m-0">Block Blast</h3>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-snug font-semibold line-clamp-2">Размещайте блоки и копите серии</p>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Интеллект</span>
              <span class="group-hover:text-orange-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
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
            <Game2048 v-else-if="store.activeGameId === 'game2048'" />
            <BlockBlast v-else-if="store.activeGameId === 'blockblast'" />
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
import Game2048 from "./Game2048/Game2048.vue";
import BlockBlast from "./BlockBlast/BlockBlast.vue";

export default {
  components: {
    Tetris,
    TicTacToe,
    Snake,
    HillClimb,
    Game2048,
    BlockBlast
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
