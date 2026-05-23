<template>
  <div class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative">
    <!-- Screen statistics: Coins, Fuel, Distance -->
    <div class="w-full space-y-1.5 mb-2">
      <!-- Fuel and Distance indicators -->
      <div class="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-inner text-center">
        <div>
          <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Дистанция</span>
          <span class="text-sm font-extrabold font-mono text-cyan-400">{{ Math.floor(distance) }}м</span>
        </div>
        <div>
          <span class="block text-[8px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Монеты</span>
          <span class="text-sm font-extrabold font-mono text-amber-400">
            <i class="bi bi-coin text-amber-550 mr-1"></i>{{ coins }}
          </span>
        </div>
        <div>
          <span class="block text-[8px] font-black text-rose-550 uppercase tracking-widest mb-0.5">Рекорд</span>
          <span class="text-sm font-extrabold font-mono text-indigo-400">{{ highscore }}м</span>
        </div>
      </div>

      <!-- Fuel bar progression -->
      <div class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
        <i class="bi bi-fuel-pump-fill text-rose-500 text-xs animate-pulse"></i>
        <div class="flex-grow bg-slate-950 rounded-lg h-2.5 overflow-hidden border border-slate-800 p-[1px]">
          <div
            class="h-full rounded-md transition-all duration-105"
            :class="fuel > 30 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-red-500 animate-pulse'"
            :style="{ width: fuel + '%' }"
          ></div>
        </div>
        <span class="text-[8px] font-black font-mono" :class="fuel > 30 ? 'text-emerald-400' : 'text-red-500 font-bold'">
          {{ Math.round(fuel) }}%
        </span>
      </div>
    </div>

    <!-- Active Physics drawing Canvas wrapper -->
    <div class="flex-grow w-full max-w-lg flex items-center justify-center relative my-1">
      <canvas
        ref="physicsCanvas"
        class="border-2 border-slate-850 rounded-3xl bg-sky-950/15 shadow-2xl w-full"
        width="480"
        height="260"
        style="aspect-ratio: 48/26;"
      ></canvas>

      <!-- Game Over overlay panel -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20"
      >
        <div class="w-14 h-14 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-400 mb-3 animate-bounce">
          <i class="bi bi-fire text-2xl"></i>
        </div>
        <h2 class="text-xl font-black text-white mb-1 tracking-tight font-heading uppercase">
          {{ crashReason || 'АВАРИЯ!' }}
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-4">
          Дистанция: <span class="text-cyan-400 font-bold font-mono">{{ Math.floor(distance) }}м</span> | Монеточки: <span class="text-amber-400 font-bold font-mono">{{ coins }}</span>
        </p>
        <button
          @click="restartGame"
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md cursor-pointer active:scale-95"
        >
          Попробовать снова
        </button>
      </div>

      <!-- Welcome controls overlay screen -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20"
      >
        <div class="w-14 h-14 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center text-indigo-450 mb-3 animate-pulse">
          <i class="bi bi-speedometer2 text-2xl"></i>
        </div>
        <h2 class="text-base font-black text-white mb-2 font-heading uppercase tracking-wide">
          Hill Climb Moto
        </h2>
        <p class="text-[10px] font-semibold text-slate-400 max-w-[220px] mb-4 leading-normal">
          Управляйте скоростью и балансируйте байк на крутых холмах. Собирайте монеты и красный бензин!
        </p>
        <button
          @click="startGame"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md cursor-pointer active:scale-95"
        >
          ПОЕХАЛИ!
        </button>
      </div>
    </div>

    <!-- Moto Controls: BRAKE & GAS button panels optimized for both hand thumbs -->
    <div class="w-full shrink-0 grid grid-cols-2 gap-4 mt-2 select-none">
      <!-- LEFTHAND: BRAKE / ROTATE LEFT -->
      <button
        @mousedown="setBrake(true)"
        @mouseup="setBrake(false)"
        @mouseleave="setBrake(false)"
        @touchstart.prevent="setBrake(true)"
        @touchend.prevent="setBrake(false)"
        type="button"
        class="h-14 bg-slate-900 border-2 border-red-500/20 active:bg-red-500/20 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition cursor-pointer"
      >
        <span class="text-[11px] font-black uppercase tracking-wider text-red-400">Тормоз</span>
        <span class="text-[8px] font-bold text-slate-500 uppercase"><i class="bi bi-chevron-bar-left"></i> Назад/В воздухе влево</span>
      </button>

      <!-- RIGHTHAND: GAS / ROTATE RIGHT -->
      <button
        @mousedown="setGas(true)"
        @mouseup="setGas(false)"
        @mouseleave="setGas(false)"
        @touchstart.prevent="setGas(true)"
        @touchend.prevent="setGas(false)"
        type="button"
        class="h-14 bg-slate-900 border-2 border-emerald-500/20 active:bg-emerald-500/20 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition cursor-pointer"
      >
        <span class="text-[11px] font-black uppercase tracking-wider text-emerald-400">Вперед / ГАЗ</span>
        <span class="text-[8px] font-bold text-slate-500 uppercase">Вперед/В воздухе вправо <i class="bi bi-chevron-bar-right"></i></span>
      </button>
    </div>
  </div>
</template>

<script>
import { playSound } from "../../utils/audioHelper";
import { useMainStore } from "../../store";

export default {
  data() {
    return {
      distance: 0,
      coins: 0,
      fuel: 100,
      highscore: Number(localStorage.getItem("game_hillclimb_highscore")) || 0,
      gameOver: false,
      hasStarted: false,
      crashReason: "",
      
      // Controls pressed states
      isGasPressed: false,
      isBrakePressed: false,

      // Bike physics variables
      bike: {
        x: 60,
        y: 120,
        vx: 0,
        vy: 0,
        angle: 0,          // Angle of chassis
        angularVelocity: 0,
        length: 32,        // Distance between axles
        height: 16,        // Suspension offset
      },
      
      // Procedural elements lists
      coinsList: [],
      fuelsList: [],
      animationFrameId: null,
      engineSoundCounter: 0
    };
  },
  computed: {
    store() {
      return useMainStore();
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.drawInitial();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  },
  methods: {
    setGas(val) {
      this.isGasPressed = val;
    },
    setBrake(val) {
      this.isBrakePressed = val;
    },
    drawInitial() {
      const canvas = this.$refs.physicsCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 10) {
        ctx.lineTo(x, this.getTerrainY(x));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fill();
    },
    getTerrainY(x) {
      if (x < 60) return 170; // secure starting flat slope landing area
      
      // Multi-sine hills with progressive elevation slopes
      let h = 180;
      h += Math.sin(x * 0.006) * 55;
      h += Math.sin(x * 0.018) * 16;
      h += Math.cos(x * 0.0025) * 22;
      return h;
    },
    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.distance = 0;
      this.store.updateSessionScore(0);
      this.coins = 0;
      this.fuel = 100;
      this.crashReason = "";
      
      this.bike = {
        x: 60,
        y: 110,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
        length: 32,
        height: 16,
      };

      this.generateSectors();

      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.tick();
      playSound.levelUp();
    },
    restartGame() {
      this.startGame();
    },
    generateSectors() {
      this.coinsList = [];
      this.fuelsList = [];
      
      // Spawn procedural targets beautifully
      for (let x = 160; x < 60000; x += 110) {
        if (x % 550 === 0) {
          this.fuelsList.push({ x: x, y: this.getTerrainY(x) - 22, collected: false });
        } else {
          this.coinsList.push({ x: x, y: this.getTerrainY(x) - 15, collected: false });
        }
      }
    },
    tick() {
      if (this.gameOver) return;

      this.updatePhysics();
      this.draw();

      this.animationFrameId = requestAnimationFrame(this.tick);
    },
    updatePhysics() {
      // 1. Drain Fuel level
      this.fuel -= 0.075;
      if (this.fuel <= 0) {
        this.fuel = 0;
        this.endGame("Закончился бензин!");
        return;
      }

      // Play soft engine chugging sound over periods while Gas is pressed
      if (this.isGasPressed) {
        this.engineSoundCounter++;
        if (this.engineSoundCounter % 15 === 0) {
          playSound.tick(); // throttle rhythm effect
        }
      }

      // 2. Air resistance / gravity
      const gravity = 0.14; 
      this.bike.vy += gravity;

      // 3. User input application forces
      const gasForce = 0.18;
      const tiltRate = 0.007;
      
      // Determine axle terrain contact status
      const backX = this.bike.x - (this.bike.length / 2) * Math.cos(this.bike.angle);
      const backY = this.bike.y - (this.bike.length / 2) * Math.sin(this.bike.angle);
      const frontX = this.bike.x + (this.bike.length / 2) * Math.cos(this.bike.angle);
      const frontY = this.bike.y + (this.bike.length / 2) * Math.sin(this.bike.angle);

      const terrBackY = this.getTerrainY(backX);
      const terrFrontY = this.getTerrainY(frontX);

      const backOnGround = backY >= terrBackY - 9;
      const frontOnGround = frontY >= terrFrontY - 9;
      const eitherContact = backOnGround || frontOnGround;

      if (this.isGasPressed) {
        if (eitherContact) {
          // Drive forwards on ground
          this.bike.vx += gasForce * Math.cos(this.bike.angle);
          this.bike.vy += gasForce * Math.sin(this.bike.angle);
        }
        // Balance leaning rotation torque
        this.bike.angularVelocity += tiltRate;
      }
      
      if (this.isBrakePressed) {
        if (eitherContact) {
          this.bike.vx *= 0.94; // brakes on terrain
        } else {
          // Counter balancing rotation torque in mid-air
          this.bike.angularVelocity -= tiltRate;
        }
      }

      // Air resistance decays
      this.bike.vx *= 0.99;
      this.bike.vy *= 0.99;
      this.bike.angularVelocity *= 0.93; // Rotational friction

      // Apply speeds
      this.bike.x += this.bike.vx;
      this.bike.y += this.bike.vy;
      this.bike.angle += this.bike.angularVelocity;

      // Solve collision & bounce offsets
      let wheelCollisionOccured = false;

      // Back Suspension contact solver
      if (backY >= terrBackY - 9) {
        wheelCollisionOccured = true;
        const depthBack = backY - (terrBackY - 9);
        this.bike.y -= depthBack * 0.45;
        this.bike.vy -= depthBack * 0.12;
        
        // Add driving momentum following landscape slope
        const slope = Math.atan2(terrBackY - this.getTerrainY(backX - 4), 4);
        if (this.isGasPressed) {
          this.bike.vx += Math.cos(slope) * 0.11;
        }
      }

      // Front steering contact solver
      if (frontY >= terrFrontY - 9) {
        wheelCollisionOccured = true;
        const depthFront = frontY - (terrFrontY - 9);
        this.bike.y -= depthFront * 0.45;
        this.bike.vy -= depthFront * 0.12;
      }

      // Orient to terrain if wheels are firmly sitting
      if (backOnGround && frontOnGround) {
        const targetRoadAngle = Math.atan2(terrFrontY - terrBackY, this.bike.length);
        this.bike.angle = this.bike.angle * 0.65 + targetRoadAngle * 0.35;
        this.bike.angularVelocity *= 0.55;
      }

      // 4. Update distance metrage scale
      const currentRun = this.bike.x / 10;
      if (currentRun > this.distance) {
        this.distance = currentRun;
        this.store.updateSessionScore(Math.floor(this.distance));
        if (this.distance > this.highscore) {
          this.highscore = Math.floor(this.distance);
          localStorage.setItem("game_hillclimb_highscore", this.highscore);
        }
      }

      // 5. Crash assessment: bike overturned checks
      const deg = Math.abs(this.bike.angle * 57.29) % 360;
      if ((deg > 115 && deg < 245) && wheelCollisionOccured) {
        this.endGame("Мотоцикл перевернулся!");
        return;
      }

      // Center frame collision bounds
      const coreGroundY = this.getTerrainY(this.bike.x);
      if (this.bike.y >= coreGroundY - 3) {
        this.endGame("Удар шлемом о землю!");
        return;
      }

      // 6. Overlapping items trigger points
      this.coinsList.forEach(coin => {
        if (!coin.collected && Math.abs(this.bike.x - coin.x) < 22 && Math.abs(this.bike.y - coin.y) < 24) {
          coin.collected = true;
          this.coins++;
          playSound.score(); // ding coin chime
        }
      });

      this.fuelsList.forEach(fuelCan => {
        if (!fuelCan.collected && Math.abs(this.bike.x - fuelCan.x) < 22 && Math.abs(this.bike.y - fuelCan.y) < 24) {
          fuelCan.collected = true;
          this.fuel = Math.min(100, this.fuel + 55);
          playSound.levelUp(); // heavy power charge sound
        }
      });
    },
    draw() {
      const canvas = this.$refs.physicsCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // Fill dark ambient sky back
      ctx.fillStyle = "#0c1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Smooth smooth camera follow with leading focus window offsets
      const cameraX = this.bike.x - 140;
      ctx.translate(-cameraX, 0);

      // Draw procedural mountains curves
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      const startX = Math.max(0, cameraX - 40);
      const endX = cameraX + canvas.width + 40;
      
      ctx.moveTo(startX, canvas.height);
      for (let tx = startX; tx <= endX; tx += 6) {
        ctx.lineTo(tx, this.getTerrainY(tx));
      }
      ctx.lineTo(endX, canvas.height);
      ctx.fill();

      // Draw energetic neon violet line across hill surfaces
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let tx = startX; tx <= endX; tx += 6) {
        if (tx === startX) ctx.moveTo(tx, this.getTerrainY(tx));
        else ctx.lineTo(tx, this.getTerrainY(tx));
      }
      ctx.stroke();

      // Coin pickups
      ctx.shadowBlur = 6;
      ctx.lineWidth = 1;
      this.coinsList.forEach(coin => {
        if (!coin.collected && coin.x > cameraX - 25 && coin.x < cameraX + canvas.width + 25) {
          ctx.strokeStyle = "#fbbf24";
          ctx.shadowColor = "#fbbf24";
          ctx.fillStyle = "#fbbf24";
          
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      });

      // Refueling fuel targets
      this.fuelsList.forEach(fuelCan => {
        if (!fuelCan.collected && fuelCan.x > cameraX - 25 && fuelCan.x < cameraX + canvas.width + 25) {
          ctx.shadowColor = "#f43f5e";
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(fuelCan.x - 5, fuelCan.y - 7, 10, 13);
          
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(fuelCan.x - 3, fuelCan.y - 9, 6, 2);
          
          ctx.fillStyle = "#ffffff";
          ctx.font = "black 5px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("F", fuelCan.x, fuelCan.y + 1);
        }
      });
      ctx.shadowBlur = 0; // standard wheel elements render

      // Draw Motorcycle vehicle chassis components
      ctx.save();
      ctx.translate(this.bike.x, this.bike.y);
      ctx.rotate(this.bike.angle);

      // Suspension links
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-this.bike.length / 2, 4);
      ctx.moveTo(0, 0);
      ctx.lineTo(this.bike.length / 2, 4);
      ctx.stroke();

      // Chassis center bar
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 5.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-11, -3);
      ctx.lineTo(11, -3);
      ctx.stroke();

      // Motor head lamp glow
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.arc(10, -5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Rider visual body helmet
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(0, -17, 4.5, 0, Math.PI*2);
      ctx.fill();

      // Driver back protector spine
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(-3, -5);
      ctx.stroke();

      // Back tire wheel rolling
      ctx.save();
      ctx.translate(-this.bike.length / 2, 4);
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3.5;
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
      ctx.restore();

      // Front tire wheel rolling
      ctx.save();
      ctx.translate(this.bike.length / 2, 4);
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3.5;
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore center coordinates

      ctx.restore(); // Restore translation camera state
    },
    endGame(reason) {
      this.gameOver = true;
      this.crashReason = reason || "Авария!";
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      playSound.gameOver();
    },
    handleKeyDown(event) {
      if (!this.hasStarted || this.gameOver) return;
      if (event.code === "ArrowRight" || event.code === "KeyD" || event.code === "Space") {
        this.isGasPressed = true;
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        this.isBrakePressed = true;
      }
    },
    handleKeyUp(event) {
      if (event.code === "ArrowRight" || event.code === "KeyD" || event.code === "Space") {
        this.isGasPressed = false;
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        this.isBrakePressed = false;
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
