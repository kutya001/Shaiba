<template>
  <div
    class="flex flex-col items-center justify-between h-full text-white p-4 select-none relative overflow-hidden transition-colors duration-300"
    :class="getContainerClass()"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="w-full flex justify-between items-center bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 py-3 shadow-lg z-10">
      <div class="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60 shadow-inner">
        <div>
          <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Счёт</span>
          <span class="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono leading-none">{{ score }}</span>
        </div>
      </div>

      <div class="text-center cursor-pointer active:scale-95 transition-transform" @click="cycleTheme">
        <span class="block text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none animate-pulse-glow mb-0.5">Супер-2048</span>
        <span class="text-[8px] font-bold text-emerald-400 font-sans leading-none block border border-emerald-500/30 rounded px-1.5 py-0.5 mt-0.5 uppercase bg-emerald-950/20">
          {{ themeNames[currentTheme] }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60 shadow-inner text-right">
        <div>
          <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Рекорд</span>
          <span class="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300 font-mono leading-none">{{ highscore }}</span>
        </div>
      </div>
    </div>

    <div ref="gridContainer" class="flex-grow w-full max-w-[340px] flex items-center justify-center relative my-1 z-10 shrink-0">
      <div class="relative w-full aspect-square bg-slate-950/80 border border-slate-800 rounded-3xl p-3 shadow-2xl overflow-hidden">
        <div class="grid grid-cols-4 grid-rows-4 gap-2.5 h-full w-full">
          <div
            v-for="n in 16"
            :key="'bg-' + n"
            class="bg-slate-900/30 rounded-xl border border-slate-800/30 shadow-inner"
          ></div>
        </div>

        <div class="absolute inset-0 p-3 pointer-events-none">
          <div class="relative w-full h-full overflow-hidden">
            <div
              v-for="tile in activeRenderTiles"
              :key="tile.id"
              class="absolute transition-transform duration-150 ease-out will-change-transform"
              :style="{
                width: 'calc(25% - 7.5px)',
                height: 'calc(25% - 7.5px)',
                transform: `translate3d(calc(${tile.c * 100}% + ${tile.c * 2.5}px), calc(${tile.r * 100}% + ${tile.r * 2.5}px), 0)`
              }"
            >
              <div
                class="w-full h-full rounded-xl font-black flex flex-col items-center justify-center shadow-md select-none transition-colors duration-200"
                :class="[
                  getTileClass(tile.val),
                  tile.pop ? 'animate-tile-pop' : '',
                  tile.isNew ? 'animate-tile-spawn' : ''
                ]"
              >
                <span 
                  class="text-xl md:text-2xl leading-none font-bold tracking-tight font-sans block text-center transition-transform duration-70ms"
                  :class="tile.val >= 1024 ? 'scale-90' : ''"
                >
                  {{ tile.val }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <canvas ref="particleCanvas" class="absolute inset-0 pointer-events-none z-15"></canvas>
      </div>

      <div
        v-if="hasWon && !continuePlaying"
        class="absolute inset-0 bg-indigo-950/80 backdrop-blur-lg rounded-3xl flex flex-col items-center justify-center p-6 text-center z-25 animate-fade-in"
      >
        <div class="relative w-14 h-14 bg-amber-500/10 border border-amber-500/25 rounded-full flex items-center justify-center text-amber-400 mb-4 animate-bounce">
          <i class="bi bi-star-fill text-2xl"></i>
        </div>
        <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 mb-1 tracking-tight uppercase">
          ВЫ СДЕЛАЛИ 2048!
        </h2>
        <p class="text-[11px] font-semibold text-slate-300 max-w-[220px] mb-6 leading-relaxed">
          Легендарная цель достигнута. Желаете продолжить устанавливать мировые рекорды?
        </p>

        <div class="flex gap-3 w-full max-w-[220px] justify-center text-center">
          <button
            @click="continuePlaying = true"
            class="flex-1 py-2.5 bg-slate-900 border border-slate-800 hover:text-white text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
          >
            Дальше
          </button>
          <button
            @click="restartGame"
            class="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border-none cursor-pointer shadow"
          >
            Сброс
          </button>
        </div>
      </div>

      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/85 backdrop-blur-lg rounded-3xl flex flex-col items-center justify-center p-6 text-center z-25 animate-fade-in"
      >
        <div class="relative w-14 h-14 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <i class="bi bi-x-octagon text-3xl"></i>
        </div>
        <h2 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-1 tracking-wide uppercase">
          ГЕЙМ ОВЕР!
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-6 leading-normal">
          Достигнутый результат:<br>
          <span class="text-emerald-400 font-bold font-mono text-base leading-normal">{{ score }} очков</span>.
        </p>
        <button
          @click="restartGame"
          class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-600 hover:scale-105 active:scale-95 text-white rounded-xl font-extrabold text-[10px] uppercase tracking-widest transition-all duration-200 border-none shadow-md cursor-pointer"
        >
          Играть снова
        </button>
      </div>
    </div>

    <div
      v-if="pressProgress > 0"
      class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none"
    >
      <div class="bg-slate-950/95 border border-slate-800 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl max-w-[200px] text-center">
        <div class="relative w-20 h-20 flex items-center justify-center">
          <svg class="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="44" cy="44" r="32" class="stroke-slate-900" stroke-width="4.5" fill="transparent"/>
            <circle cx="44" cy="44" r="32" class="stroke-cyan-500 transition-all duration-75" stroke-width="4.5" fill="transparent"
              :stroke-dasharray="2 * Math.PI * 32"
              :stroke-dashoffset="2 * Math.PI * 32 * (1 - pressProgress)"
            />
          </svg>
          <div class="text-[12px] font-black text-cyan-400 font-mono">
            {{ Math.round(pressProgress * 100) }}%
          </div>
        </div>
        <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-normal">
          УДЕРЖИВАЙТЕ ДЛЯ СБРОСА
        </div>
      </div>
    </div>

    <div class="w-full max-w-[320px] py-3 px-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl text-center text-slate-400 text-[10px] font-bold leading-normal shrink-0 mt-2 space-y-1 z-10">
      <div class="flex items-center justify-center gap-1.5">
        <i class="bi bi-hand-index-thumb text-cyan-400"></i>
        <span>Проведите <span class="text-cyan-400">1 пальцем</span> для сдвига плиток</span>
      </div>
      <div class="flex items-center justify-center gap-1.5 text-slate-500 font-medium">
        <i class="bi bi-arrow-counterclockwise text-emerald-400 text-xs"></i>
        <span>Коснитесь <span class="text-emerald-400">2 пальцами</span> и проведите влево для Undo</span>
      </div>
      <div class="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
        <i class="bi bi-fingerprint text-indigo-400 text-xs"></i>
        <span>Зажмите экран на <span class="text-indigo-400">2 секунды</span> для сброса</span>
      </div>
    </div>
  </div>
</template>

<script>
import { playSound } from "../../utils/audioHelper";

export default {
  data() {
    return {
      // Game State
      tiles: [], // list of smooth moving objects: { id, val, r, c, merged, pop, isNew }
      score: 0,
      highscore: Number(localStorage.getItem("game_2048_highscore")) || 0,
      gameOver: false,
      hasWon: false,
      continuePlaying: false,
      
      // Theme Config Engine
      currentTheme: localStorage.getItem("game_2048_theme") || "cyberpunk",
      themeNames: {
        cyberpunk: "Киберпанк",
        emerald: "Изумруд",
        sunset: "Закат",
        monochrome: "Монохром"
      },
      
      // Control Engine Mechanics
      tileIdCounter: 1, 
      isMovingPhase: false, 
      
      // Undo Stack
      history: [], // serialized historical states copy (max limit 12)
      
      // Swipe Tracking state
      touchStart: { x: 0, y: 0 },
      isSwipeTrackActive: false,
      
      // 2 Finger Undo Swipe Gesture state
      twoFingerSwipeStart: null,
      isTwoFingersActive: false,
      
      // Radial Hold Progressive state
      pressProgress: 0,
      pressInterval: null,
      isHoldingPress: false,
      
      // Particle list mapping
      particles: [],
      animationFrameId: null
    };
  },
  computed: {
    activeRenderTiles() {
      return this.tiles;
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    
    // Load local storage session backup
    this.restoreStateFromLocalStorage();
    
    // Setup graphic high-dpi overlays canvas loop
    this.setupHighDPICanvas();
    this.startDrawLoop();
    
    window.addEventListener("resize", this.setupHighDPICanvas);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.setupHighDPICanvas);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.pressInterval) {
      clearInterval(this.pressInterval);
    }
  },
  methods: {
    vibrate(ms) {
      if (navigator.vibrate) {
        try {
          navigator.vibrate(ms);
        } catch (_) {}
      }
    },
    cycleTheme() {
      const themes = ["cyberpunk", "emerald", "sunset", "monochrome"];
      const currentIdx = themes.indexOf(this.currentTheme);
      this.currentTheme = themes[(currentIdx + 1) % themes.length];
      localStorage.setItem("game_2048_theme", this.currentTheme);
      this.vibrate(15);
    },
    getContainerClass() {
      switch (this.currentTheme) {
        case "emerald": return "bg-zinc-950 text-white";
        case "sunset": return "bg-neutral-950 text-white";
        case "monochrome": return "bg-stone-950 text-stone-100";
        default: return "bg-slate-950 text-white";
      }
    },
    setupHighDPICanvas() {
      const canvas = this.$refs.particleCanvas;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    },
    startDrawLoop() {
      const loop = () => {
        this.updateAndDrawParticles();
        this.animationFrameId = requestAnimationFrame(loop);
      };
      this.animationFrameId = requestAnimationFrame(loop);
    },
    triggerFusionSplash(r, c, mergedValue) {
      let color = "#ffffff";
      
      if (this.currentTheme === "monochrome") {
        color = mergedValue >= 64 ? "#ffffff" : "#a3a3a3";
      } else if (this.currentTheme === "emerald") {
        if (mergedValue <= 16) color = "#10b981";
        else if (mergedValue <= 64) color = "#14b8a6";
        else if (mergedValue <= 512) color = "#06b6d4";
        else color = "#34d399";
      } else if (this.currentTheme === "sunset") {
        if (mergedValue <= 16) color = "#f43f5e";
        else if (mergedValue <= 64) color = "#f97316";
        else if (mergedValue <= 512) color = "#ef4444";
        else color = "#facc15";
      } else {
        if (mergedValue <= 16) color = "#06b6d4";
        else if (mergedValue <= 64) color = "#fb923c";
        else if (mergedValue <= 512) color = "#a855f7";
        else color = "#fbbf24";
      }
      
      const canvas = this.$refs.particleCanvas;
      if (!canvas) return;
      
      const wCell = canvas.width / 4;
      const hCell = canvas.height / 4;
      const ox = c * wCell + wCell / 2;
      const oy = r * hCell + hCell / 2;
      
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.0;
        this.particles.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          size: 1.5 + Math.random() * 2.5,
          opacity: 1.0,
          life: 18 + Math.floor(Math.random() * 10),
          maxLife: 28
        });
      }
    },
    updateAndDrawParticles() {
      const canvas = this.$refs.particleCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.opacity = Math.max(0, p.life / p.maxLife);
        
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      this.particles = this.particles.filter(p => p.life > 0);
    },
    restartGame() {
      this.tiles = [];
      this.score = 0;
      this.gameOver = false;
      this.hasWon = false;
      this.continuePlaying = false;
      this.history = [];
      this.tileIdCounter = 1;
      
      this.addRandomTile();
      this.addRandomTile();
      this.saveStateToLocalStorage();
      playSound.levelUp();
      this.vibrate(20);
    },
    addRandomTile() {
      const gridState = Array(4).fill(0).map(() => Array(4).fill(0));
      this.tiles.forEach(t => {
        if (!t.merged) {
          gridState[t.r][t.c] = t.val;
        }
      });
      
      const emptyCells = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (gridState[r][c] === 0) {
            emptyCells.push({ r, c });
          }
        }
      }
      
      if (emptyCells.length > 0) {
        const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const val = Math.random() < 0.9 ? 2 : 4;
        this.tiles.push({
          id: this.tileIdCounter++,
          val: val,
          r: rand.r,
          c: rand.c,
          merged: false,
          pop: false,
          isNew: true
        });
      }
    },
    getTileClass(val) {
      if (!val) return "bg-transparent";
      
      switch (this.currentTheme) {
        case "emerald":
          switch (val) {
            case 2: return "bg-zinc-900 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/5";
            case 4: return "bg-zinc-900 border border-teal-500/30 text-teal-400 shadow-teal-500/5";
            case 8: return "bg-teal-950/80 border border-teal-400/40 text-teal-300 shadow-teal-500/10";
            case 16: return "bg-lime-950/80 border border-lime-500/40 text-lime-400 shadow-lime-500/10";
            case 32: return "bg-emerald-950/80 border border-emerald-500/55 text-emerald-300 shadow-emerald-500/15";
            case 64: return "bg-green-950/80 border border-green-500/55 text-green-300 shadow-green-500/15";
            case 128: return "bg-cyan-950 border border-cyan-400/60 text-cyan-300 shadow-inner";
            case 256: return "bg-sky-900 border border-sky-400/70 text-sky-200 shadow-md";
            case 512: return "bg-teal-900 border border-emerald-400 text-teal-100 font-bold";
            case 1024: return "bg-gradient-to-br from-teal-600 to-emerald-700 border border-teal-300 text-white font-extrabold";
            case 2048: return "bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white text-zinc-950 font-black animate-pulse-glow";
            default: return "bg-gradient-to-br from-green-600 to-emerald-900 border-2 border-emerald-300 text-white font-black";
          }
        case "sunset":
          switch (val) {
            case 2: return "bg-neutral-900 border border-rose-500/30 text-rose-400";
            case 4: return "bg-neutral-900 border border-pink-500/30 text-pink-400";
            case 8: return "bg-red-950/80 border border-red-400/40 text-red-300";
            case 16: return "bg-orange-950/80 border border-orange-500/40 text-orange-400";
            case 32: return "bg-amber-950/80 border border-amber-500/55 text-amber-400 font-bold";
            case 64: return "bg-yellow-950/80 border border-yellow-500/55 text-yellow-400 font-bold";
            case 128: return "bg-rose-900 border border-rose-400 text-rose-100 shadow-inner";
            case 256: return "bg-pink-900 border border-pink-400 text-pink-100 shadow-md";
            case 512: return "bg-orange-900 border border-orange-400 text-orange-100 font-extrabold";
            case 1024: return "bg-gradient-to-br from-red-600 to-orange-600 border border-yellow-400 text-white font-extrabold";
            case 2048: return "bg-gradient-to-br from-amber-400 to-rose-500 border-2 border-white text-neutral-950 font-black animate-pulse-glow";
            default: return "bg-gradient-to-br from-red-700 to-pink-900 border-2 border-white text-white font-black";
          }
        case "monochrome":
          switch (val) {
            case 2: return "bg-stone-900 border border-stone-700 text-stone-400";
            case 4: return "bg-stone-800 border border-stone-600 text-stone-300";
            case 8: return "bg-stone-700 border border-stone-500 text-stone-200";
            case 16: return "bg-stone-600 border border-stone-400 text-stone-100";
            case 32: return "bg-stone-500 border border-stone-300 text-white";
            case 64: return "bg-stone-400 border border-stone-200 text-stone-950";
            case 128: return "bg-stone-300 border border-stone-100 text-stone-950";
            case 256: return "bg-stone-200 border border-stone-400 text-stone-950 shadow-sm";
            case 512: return "bg-stone-100 border border-stone-500 text-stone-950 font-bold";
            case 1024: return "bg-white border border-stone-600 text-stone-950 font-extrabold";
            case 2048: return "bg-gradient-to-br from-white to-stone-300 border-2 border-stone-950 text-stone-950 font-black";
            default: return "bg-stone-950 border-2 border-white text-white font-black";
          }
        default: // cyberpunk
          switch (val) {
            case 2: return "bg-slate-900 border border-cyan-500/30 text-cyan-400 shadow-cyan-500/5";
            case 4: return "bg-slate-900 border border-teal-500/30 text-teal-400 shadow-teal-500/5";
            case 8: return "bg-indigo-950/80 border border-indigo-400/40 text-indigo-300 shadow-indigo-500/10";
            case 16: return "bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-amber-500/10";
            case 32: return "bg-orange-950/80 border border-orange-500/55 text-orange-400 shadow-orange-500/15 font-bold";
            case 64: return "bg-pink-950/80 border border-pink-500/55 text-pink-400 shadow-pink-500/15 font-bold";
            case 128: return "bg-violet-950 border border-violet-400/60 text-violet-300 shadow-[0_0_12px_rgba(168,85,247,0.25)] font-bold";
            case 256: return "bg-violet-900 border border-fuchsia-400/70 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.3)] font-bold hover:brightness-110";
            case 512: return "bg-fuchsia-950 border border-pink-500 text-pink-300 shadow-[0_0_18px_rgba(236,72,153,0.35)] font-extrabold";
            case 1024: return "bg-gradient-to-br from-yellow-600/90 to-amber-700/90 border border-yellow-400 text-yellow-300 shadow-[0_0_22px_rgba(234,179,8,0.4)] font-extrabold";
            case 2048: return "bg-gradient-to-br from-yellow-500 to-amber-600 border-2 border-white text-slate-950 shadow-[0_0_28px_rgba(234,179,8,0.65)] font-black animate-pulse-glow";
            default: return "bg-gradient-to-br from-red-650 to-pink-700 border-2 border-white text-white shadow-2xl font-black";
          }
      }
    },
    handleKeyDown(e) {
      if (this.gameOver || this.isMovingPhase) return;
      let moved = false;
      
      if (["ArrowUp", "KeyW"].includes(e.key)) {
        moved = this.move("UP");
      } else if (["ArrowDown", "KeyS"].includes(e.key)) {
        moved = this.move("DOWN");
      } else if (["ArrowLeft", "KeyA"].includes(e.key)) {
        moved = this.move("LEFT");
      } else if (["ArrowRight", "KeyD"].includes(e.key)) {
        moved = this.move("RIGHT");
      }
      
      if (moved) {
        e.preventDefault();
      }
    },
    onTouchStart(e) {
      if (this.gameOver) return;
      if (!e || !e.touches) return;
      
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        this.twoFingerSwipeStart = (t1.clientX + t2.clientX) / 2;
        this.isTwoFingersActive = true;
        this.resetHoldingTimer();
        return;
      }
      
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.touchStart = { x: touch.clientX, y: touch.clientY };
        this.isSwipeTrackActive = true;
        this.startHoldingCountdown();
      }
    },
    onTouchMove(e) {
      if (!e) return;
      if (e.cancelable) e.preventDefault();
      
      if (this.isTwoFingersActive && e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const avgX = (t1.clientX + t2.clientX) / 2;
        
        if (this.twoFingerSwipeStart !== null) {
          const deltaX = avgX - this.twoFingerSwipeStart;
          if (deltaX < -50) { 
            this.triggerUndo();
            this.twoFingerSwipeStart = null; 
            this.isTwoFingersActive = false;
          }
        }
        return;
      }
      
      if (this.isHoldingPress && e.touches.length === 1) {
        const touch = e.touches[0];
        const dist = Math.hypot(touch.clientX - this.touchStart.x, touch.clientY - this.touchStart.y);
        if (dist > 16) {
          this.resetHoldingTimer();
        }
      }
    },
    onTouchEnd(e) {
      this.resetHoldingTimer();
      this.isTwoFingersActive = false;
      this.twoFingerSwipeStart = null;
      
      if (!this.isSwipeTrackActive || this.isMovingPhase || this.gameOver) return;
      this.isSwipeTrackActive = false;
      
      if (!e || !e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      
      const dx = touch.clientX - this.touchStart.x;
      const dy = touch.clientY - this.touchStart.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      
      const distanceThreshold = 30; 
      if (Math.max(absX, absY) > distanceThreshold) {
        if (absX > absY) {
          const deflection = absY / absX;
          if (deflection > 0.466) return; 
          
          if (dx > 0) this.move("RIGHT");
          else this.move("LEFT");
        } else {
          const deflection = absX / absY;
          if (deflection > 0.466) return; 
          
          if (dy > 0) this.move("DOWN");
          else this.move("UP");
        }
      }
    },
    startHoldingCountdown() {
      this.resetHoldingTimer();
      this.isHoldingPress = true;
      let durationMs = 2000;
      let start = performance.now();
      
      this.pressInterval = setInterval(() => {
        const elapsed = performance.now() - start;
        this.pressProgress = Math.min(1.0, elapsed / durationMs);
        
        if (this.pressProgress >= 1.0) {
          clearInterval(this.pressInterval);
          this.pressInterval = null;
          this.pressProgress = 0;
          this.isHoldingPress = false;
          this.restartGame();
        }
      }, 35);
    },
    resetHoldingTimer() {
      if (this.pressInterval) {
        clearInterval(this.pressInterval);
        this.pressInterval = null;
      }
      this.pressProgress = 0;
      this.isHoldingPress = false;
    },
    triggerUndo() {
      if (this.history.length === 0) {
        this.vibrate(30); 
        return;
      }
      
      const prev = JSON.parse(this.history.pop());
      this.tiles = prev.tiles;
      this.score = prev.score;
      this.gameOver = prev.gameOver;
      this.hasWon = prev.hasWon;
      this.continuePlaying = prev.continuePlaying ?? false;
      
      this.vibrate([10, 30, 10]);
      playSound.tick();
      this.saveStateToLocalStorage();
    },
    move(dir) {
      if (this.isMovingPhase || this.gameOver) return false;
      
      const gridRef = Array(4).fill(null).map(() => Array(4).fill(null));
      
      this.tiles = this.tiles.filter(t => !t.merged);
      this.tiles.forEach(t => {
        gridRef[t.r][t.c] = t;
        t.pop = false;
        t.isNew = false;
      });
      
      const saveSnapshotBeforeMove = JSON.stringify({
        tiles: this.tiles.map(t => ({ ...t })),
        score: this.score,
        gameOver: this.gameOver,
        hasWon: this.hasWon,
        continuePlaying: this.continuePlaying
      });
      
      let changed = false;
      let maxMergedVal = 0;
      
      if (dir === "LEFT" || dir === "RIGHT") {
        for (let r = 0; r < 4; r++) {
          let line = [];
          for (let c = 0; c < 4; c++) {
            line.push(gridRef[r][c]);
          }
          let active = line.filter(t => t !== null);
          if (dir === "RIGHT") active.reverse();
          
          let nextLine = [];
          let skip = false;
          for (let i = 0; i < active.length; i++) {
            if (skip) {
              skip = false;
              continue;
            }
            let current = active[i];
            let next = active[i + 1];
            
            if (next && current.val === next.val) {
              const mergedVal = current.val * 2;
              current.targetVal = mergedVal;
              current.targetR = r;
              current.targetC = dir === "LEFT" ? nextLine.length : (3 - nextLine.length);
              
              next.merged = true;
              next.targetR = r;
              next.targetC = dir === "LEFT" ? nextLine.length : (3 - nextLine.length);
              
              current.pop = true;
              
              if (mergedVal > maxMergedVal) maxMergedVal = mergedVal;
              this.score += mergedVal;
              this.triggerFusionSplash(current.targetR, current.targetC, mergedVal);
              
              nextLine.push(current);
              skip = true;
            } else {
              current.targetR = r;
              current.targetC = dir === "LEFT" ? nextLine.length : (3 - nextLine.length);
              nextLine.push(current);
            }
          }
          active.forEach(t => {
            if (t.targetR !== t.r || t.targetC !== t.c || t.merged) {
              changed = true;
            }
          });
        }
      } else {
        for (let c = 0; c < 4; c++) {
          let line = [];
          for (let r = 0; r < 4; r++) {
            line.push(gridRef[r][c]);
          }
          let active = line.filter(t => t !== null);
          if (dir === "DOWN") active.reverse();
          
          let nextLine = [];
          let skip = false;
          for (let i = 0; i < active.length; i++) {
            if (skip) {
              skip = false;
              continue;
            }
            let current = active[i];
            let next = active[i + 1];
            
            if (next && current.val === next.val) {
              const mergedVal = current.val * 2;
              current.targetVal = mergedVal;
              current.targetR = dir === "UP" ? nextLine.length : (3 - nextLine.length);
              current.targetC = c;
              
              next.merged = true;
              next.targetR = dir === "UP" ? nextLine.length : (3 - nextLine.length);
              next.targetC = c;
              
              current.pop = true;
              
              if (mergedVal > maxMergedVal) maxMergedVal = mergedVal;
              this.score += mergedVal;
              this.triggerFusionSplash(current.targetR, current.targetC, mergedVal);
              
              nextLine.push(current);
              skip = true;
            } else {
              current.targetR = dir === "UP" ? nextLine.length : (3 - nextLine.length);
              current.targetC = c;
              nextLine.push(current);
            }
          }
          active.forEach(t => {
            if (t.targetR !== t.r || t.targetC !== t.c || t.merged) {
              changed = true;
            }
          });
        }
      }
      
      if (changed) {
        this.isMovingPhase = true;
        
        this.history.push(saveSnapshotBeforeMove);
        if (this.history.length > 12) this.history.shift();
        
        this.tiles.forEach(t => {
          if (t.targetR !== undefined) t.r = t.targetR;
          if (t.targetC !== undefined) t.c = t.targetC;
          delete t.targetR;
          delete t.targetC;
        });
        
        playSound.tick();
        
        setTimeout(() => {
          this.tiles = this.tiles.filter(t => !t.merged);
          this.tiles.forEach(t => {
            if (t.targetVal) {
              t.val = t.targetVal;
              delete t.targetVal;
              
              if (t.val === 2048 && !this.continuePlaying) {
                this.hasWon = true;
                playSound.levelUp();
              }
            }
          });
          
          this.addRandomTile();
          this.checkGameOver();
          this.isMovingPhase = false;
          
          if (maxMergedVal > 0) {
            this.playMergeHaptic(maxMergedVal);
          } else {
            this.vibrate(6); 
          }
          
          this.saveStateToLocalStorage();
        }, 150);
        
        return true;
      }
      return false;
    },
    playMergeHaptic(val) {
      if (val <= 16) {
        this.vibrate(8); 
      } else if (val <= 128) {
        this.vibrate(15); 
      } else if (val <= 512) {
        this.vibrate([20, 10, 15]); 
      } else {
        this.vibrate([100, 30, 120, 30, 150]);
      }
    },
    checkGameOver() {
      const gridState = Array(4).fill(0).map(() => Array(4).fill(0));
      this.tiles.forEach(t => {
        if (!t.merged) {
          gridState[t.r][t.c] = t.val;
        }
      });
      
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (gridState[r][c] === 0) return; 
          if (r < 3 && gridState[r][c] === gridState[r + 1][c]) return; 
          if (c < 3 && gridState[r][c] === gridState[r][c + 1]) return; 
        }
      }
      this.gameOver = true;
      playSound.gameOver();
      this.vibrate([100, 50, 120]);
    },
    saveStateToLocalStorage() {
      localStorage.setItem("game_2048_highscore", this.highscore);
      localStorage.setItem("game_2048_theme", this.currentTheme);
      localStorage.setItem("game_2048_state", JSON.stringify({
        tiles: this.tiles.map(t => ({ ...t, pop: false, isNew: false })),
        score: this.score,
        gameOver: this.gameOver,
        hasWon: this.hasWon,
        continuePlaying: this.continuePlaying,
        tileIdCounter: this.tileIdCounter
      }));
    },
    restoreStateFromLocalStorage() {
      const backup = localStorage.getItem("game_2048_state");
      if (backup) {
        try {
          const state = JSON.parse(backup);
          this.tiles = state.tiles;
          this.score = state.score;
          this.gameOver = state.gameOver;
          this.hasWon = state.hasWon;
          this.continuePlaying = state.continuePlaying;
          this.tileIdCounter = state.tileIdCounter || 1;
        } catch (_) {
          this.restartGame();
        }
      } else {
        this.restartGame();
      }
    }
  }
};
</script>

<style scoped>
.animate-pulse-glow {
  animation: pulseGlow 2.5s infinite ease-in-out;
}
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(234, 179, 8, 0.45);
    filter: brightness(1);
    opacity: 0.95;
  }
  50% {
    box-shadow: 0 0 22px rgba(234, 179, 8, 0.75);
    filter: brightness(1.2);
    opacity: 1;
  }
}

.animate-tile-pop {
  animation: tilePop 150ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
@keyframes tilePop {
  0% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.animate-tile-spawn {
  animation: tileSpawn 140ms cubic-bezier(0.2, 1, 0.5, 1) forwards;
}
@keyframes tileSpawn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; backdrop-filter: blur(0px); transform: scale(0.97); }
  to { opacity: 1; backdrop-filter: blur(12px); transform: scale(1); }
}
</style>